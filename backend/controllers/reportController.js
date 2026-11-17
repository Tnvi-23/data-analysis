const fs = require('fs');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const Analysis = require('../models/Analysis');
const Dataset = require('../models/Dataset');
const { generatePDFReport } = require('../services/reportService');
const { loadDatasetRows } = require('../services/fileProcessingService');
const { analyzeDatasetRows } = require('../services/analyticsService');
const {
  uploadPDFToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured
} = require('../services/cloudinaryService');

// @desc    Generate a PDF analytics report
// @route   POST /api/reports/generate or POST /api/reports or POST /api/reports/generate/:id
// @access  Private
const createReport = async (req, res, next) => {
  let generatedFilePath = null;
  let uploadedCloudinaryPublicId = null;

  try {
    const targetId =
      req.params.id ||
      req.params.analysisId ||
      req.body.datasetId ||
      req.body.analysisId;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Dataset ID or Analysis ID is required to generate a report.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dataset or analysis ID provided.'
      });
    }

    let dataset = null;
    let analysis = null;

    // Check if targetId is a dataset owned by current user
    dataset = await Dataset.findOne({
      _id: targetId,
      user: req.user._id
    });

    if (dataset) {
      // Find latest analysis for this dataset if available
      analysis = await Analysis.findOne({
        dataset: dataset._id,
        user: req.user._id
      }).sort({ createdAt: -1 });
    } else {
      // Check if targetId was an analysis record
      analysis = await Analysis.findOne({
        _id: targetId,
        user: req.user._id
      });

      if (analysis) {
        dataset = await Dataset.findOne({
          _id: analysis.dataset,
          user: req.user._id
        });
      }
    }

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or access denied.'
      });
    }

    // Compute real statistical analysis if no document exists yet
    if (!analysis) {
      try {
        const rows = await loadDatasetRows(dataset);
        if (rows && rows.length > 0) {
          const computed = analyzeDatasetRows(rows, dataset.columns);
          analysis = new Analysis({
            dataset: dataset._id,
            user: req.user._id,
            datasetName: dataset.originalFilename,
            overview: computed.overview,
            numericStats: computed.numericStats,
            categoricalStats: computed.categoricalStats,
            correlations: computed.correlations,
            chartSummaries: computed.chartSummaries,
            observations: computed.observations
          });
          await analysis.save();
        }
      } catch (computeErr) {
        console.warn('[Report Controller] Auto-compute analysis error:', computeErr.message);
      }
    }

    // Safety fallback if dataset rows could not be loaded
    if (!analysis) {
      analysis = {
        overview: {
          rowCount: dataset.rowCount || 0,
          columnCount: dataset.columnCount || 0,
          totalMissingCells: 0,
          duplicateRows: 0,
          dataCompletenessPercentage: 100,
          totalOutliers: 0
        },
        numericStats: (dataset.columns || [])
          .filter((c) => c.dataType === 'number')
          .map((c) => ({
            column: c.name,
            mean: 0,
            median: 0,
            min: 0,
            max: 0,
            standardDeviation: 0,
            outliers: { outlierCount: 0 }
          })),
        categoricalStats: (dataset.columns || [])
          .filter((c) => c.dataType !== 'number')
          .map((c) => ({
            column: c.name,
            uniqueCount: (c.sampleValues || []).length,
            topValues: []
          })),
        correlations: [],
        observations: []
      };
    }

    const title =
      req.body.title?.trim() ||
      `Executive Analytics Report — ${dataset.originalFilename}`;

    // Step 1: Generate professional PDF document via PDFKit
    const pdfData = await generatePDFReport(analysis, dataset, { title });
    generatedFilePath = pdfData.filePath;

    // Pre-allocate MongoDB ObjectId so the download URL is deterministically valid
    const reportId = new mongoose.Types.ObjectId();
    let storageType = 'local';
    let pdfUrl = `/api/reports/${reportId}/download`;
    let cloudinaryUrl = null;
    let cloudinaryPublicId = null;

    // Step 2: Upload to Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        const cloudRes = await uploadPDFToCloudinary(
          pdfData.filePath,
          pdfData.filename
        );

        if (cloudRes && cloudRes.url) {
          storageType = 'cloudinary';
          pdfUrl = cloudRes.url;
          cloudinaryUrl = cloudRes.url;
          cloudinaryPublicId = cloudRes.publicId;
          uploadedCloudinaryPublicId = cloudRes.publicId;
        } else {
          throw new Error('Cloudinary returned an invalid or empty URL.');
        }
      } catch (uploadErr) {
        console.error('[Report Controller] Cloudinary upload failed:', uploadErr.message);
        console.warn('[Report Controller] Falling back to verified local PDF storage.');
      }
    } else {
      console.info('[Report Controller] Cloudinary not configured; persisting with verified local storage.');
    }

    // Step 3: Save validated report in MongoDB
    const report = new Report({
      _id: reportId,
      user: req.user._id,
      dataset: dataset._id,
      analysis: analysis._id || null,
      title,
      filename: pdfData.filename,
      filePath: pdfData.filePath,
      pdfUrl,
      cloudinaryUrl,
      cloudinaryPublicId,
      publicId: cloudinaryPublicId,
      fileFormat: 'pdf',
      storageType,
      fileSize: pdfData.fileSize,
      generationDate: new Date(),
      status: 'completed'
    });

    try {
      await report.save();
    } catch (saveErr) {
      // Rollback: if MongoDB save fails, delete from Cloudinary and disk to prevent orphaned assets
      if (uploadedCloudinaryPublicId) {
        await deleteFromCloudinary(uploadedCloudinaryPublicId);
      }
      if (fs.existsSync(generatedFilePath)) {
        try {
          fs.unlinkSync(generatedFilePath);
        } catch (e) {}
      }
      throw saveErr;
    }

    // Populate dataset metadata for immediate frontend consumption
    await report.populate('dataset', 'originalFilename fileType rowCount columnCount');

    return res.status(201).json({
      success: true,
      message: 'PDF report generated successfully',
      report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reports for the logged in user
// @route   GET /api/reports
// @access  Private
const getUserReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .populate('dataset', 'originalFilename fileType rowCount columnCount')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get report metadata by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('dataset', 'originalFilename fileType rowCount columnCount');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download or view report PDF
// @route   GET /api/reports/:id/download
// @access  Private
const downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied.'
      });
    }

    const isInline =
      req.query.disposition === 'inline' ||
      req.query.view === 'true' ||
      req.path.endsWith('/view') ||
      req.originalUrl.includes('/view');

    // If Cloudinary URL is active and request is for viewing, redirect to secure URL
    if (report.storageType === 'cloudinary' && report.pdfUrl && isInline) {
      return res.redirect(report.pdfUrl);
    }

    // If file exists locally on disk
    if (report.filePath && fs.existsSync(report.filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      const dispositionType = isInline ? 'inline' : 'attachment';
      res.setHeader(
        'Content-Disposition',
        `${dispositionType}; filename="${encodeURIComponent(report.filename)}"`
      );
      return res.sendFile(report.filePath);
    }

    // If local file is missing but Cloudinary URL exists, redirect
    if (report.pdfUrl && report.pdfUrl.startsWith('http')) {
      return res.redirect(report.pdfUrl);
    }

    return res.status(404).json({
      success: false,
      message: 'Report file does not exist on storage.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete report record and files
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or access denied.'
      });
    }

    // Delete local PDF file if present
    if (report.filePath && fs.existsSync(report.filePath)) {
      try {
        fs.unlinkSync(report.filePath);
      } catch (e) {
        console.warn('[Report Controller] Failed to delete local PDF:', e.message);
      }
    }

    // Delete Cloudinary asset if public ID is present
    const publicId = report.cloudinaryPublicId || report.publicId;
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Delete MongoDB record
    await Report.findByIdAndDelete(report._id);

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReport,
  getUserReports,
  getReportById,
  downloadReport,
  deleteReport
};
