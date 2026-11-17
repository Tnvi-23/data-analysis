const fs = require('fs');
const mongoose = require('mongoose');
const Analysis = require('../models/Analysis');
const Dataset = require('../models/Dataset');
const { loadDatasetRows } = require('../services/fileProcessingService');
const { analyzeDatasetRows } = require('../services/analyticsService');
const { explainInsightsWithGemini, isGeminiConfigured } = require('../services/geminiService');
const { auditDataset } = require('../services/dataCleaningService');

// @desc    Run statistical analysis on a dataset
// @route   POST /api/datasets/:id/analyze
// @access  Private
const analyzeDataset = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dataset ID provided.'
      });
    }

    const dataset = await Dataset.findOne({
      _id: id,
      user: req.user._id
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or access denied.'
      });
    }

    if (!dataset.dataPath || !fs.existsSync(dataset.dataPath)) {
      return res.status(404).json({
        success: false,
        message: 'Dataset source data file is missing from server storage.'
      });
    }

    const rows = loadDatasetRows(dataset.dataPath);

    // Compute comprehensive statistical distributions (fast, deterministic math)
    const stats = analyzeDatasetRows(rows, dataset.columns);

    // Compute quality score and update dataset
    try {
      const audit = auditDataset(rows, dataset.columns.map((c) => c.name));
      dataset.qualityScore = audit.qualityScore;
      await dataset.save();
    } catch (auditErr) {
      console.warn('[Analysis] Audit update skipped:', auditErr.message);
    }

    // Optional on-demand Gemini commentary (strictly non-blocking, max 2.5s timeout)
    let aiSummary = null;
    let aiQuotaExceeded = false;
    let aiMessage = null;

    if (req.body?.explainWithAi && isGeminiConfigured()) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI_TIMEOUT')), 2500)
        );
        aiSummary = await Promise.race([
          explainInsightsWithGemini({
            datasetName: dataset.originalFilename,
            statsSummary: stats.overview,
            observations: stats.observations
          }),
          timeoutPromise
        ]);
      } catch (aiErr) {
        if (aiErr.message?.includes('429') || aiErr.message?.includes('RESOURCE_EXHAUSTED')) {
          aiQuotaExceeded = true;
          aiMessage = 'Gemini Free Tier rate limit reached (HTTP 429). Statistical analysis is 100% computed.';
        } else {
          aiMessage = `AI explanation skipped: ${aiErr.message}`;
        }
      }
    }

    // Upsert canonical analysis record in MongoDB (preserves one fresh record per dataset)
    const analysis = await Analysis.findOneAndUpdate(
      { dataset: dataset._id, user: req.user._id },
      {
        dataset: dataset._id,
        user: req.user._id,
        datasetName: dataset.originalFilename,
        overview: stats.overview,
        numericStats: stats.numericStats,
        categoricalStats: stats.categoricalStats,
        correlations: stats.correlations,
        chartSummaries: stats.chartSummaries,
        observations: stats.observations,
        aiExecutiveSummary: aiSummary || undefined
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Statistical analysis completed successfully',
      analysis,
      aiQuotaExceeded,
      aiMessage
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get analysis by ID
// @route   GET /api/analysis/:id
// @access  Private
const getAnalysisById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid analysis ID provided.'
      });
    }

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      analysis
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all analyses for current user
// @route   GET /api/analysis
// @access  Private
const getAllAnalyses = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .select('dataset datasetName overview createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: analyses.length,
      analyses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get analysis for a specific dataset (returns existing or dynamically computes if missing)
// @route   GET /api/analysis/dataset/:datasetId
// @access  Private
const getAnalysesByDataset = async (req, res, next) => {
  try {
    const { datasetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(datasetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dataset ID provided.'
      });
    }

    let analysis = await Analysis.findOne({
      dataset: datasetId,
      user: req.user._id
    }).sort({ createdAt: -1 });

    // If no analysis exists yet, compute dynamically from dataset rows
    if (!analysis) {
      const dataset = await Dataset.findOne({
        _id: datasetId,
        user: req.user._id
      });

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message: 'Dataset not found or access denied.'
        });
      }

      if (dataset.dataPath && fs.existsSync(dataset.dataPath)) {
        const rows = loadDatasetRows(dataset.dataPath);
        const stats = analyzeDatasetRows(rows, dataset.columns);

        analysis = await Analysis.findOneAndUpdate(
          { dataset: dataset._id, user: req.user._id },
          {
            dataset: dataset._id,
            user: req.user._id,
            datasetName: dataset.originalFilename,
            overview: stats.overview,
            numericStats: stats.numericStats,
            categoricalStats: stats.categoricalStats,
            correlations: stats.correlations,
            chartSummaries: stats.chartSummaries,
            observations: stats.observations,
            aiExecutiveSummary: null
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
      }
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found and could not auto-compute from source file.'
      });
    }

    return res.status(200).json({
      success: true,
      count: 1,
      analysis,
      analyses: [analysis]
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Explain statistical insights with Gemini on-demand (non-blocking with 4s timeout)
// @route   POST /api/datasets/:id/explain
// @access  Private
const explainDatasetAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dataset ID provided.'
      });
    }

    const dataset = await Dataset.findOne({
      _id: id,
      user: req.user._id
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.'
      });
    }

    let analysis = await Analysis.findOne({
      dataset: dataset._id,
      user: req.user._id
    });

    if (!analysis && dataset.dataPath && fs.existsSync(dataset.dataPath)) {
      const rows = loadDatasetRows(dataset.dataPath);
      const stats = analyzeDatasetRows(rows, dataset.columns);
      analysis = await Analysis.findOneAndUpdate(
        { dataset: dataset._id, user: req.user._id },
        {
          dataset: dataset._id,
          user: req.user._id,
          datasetName: dataset.originalFilename,
          overview: stats.overview,
          numericStats: stats.numericStats,
          categoricalStats: stats.categoricalStats,
          correlations: stats.correlations,
          chartSummaries: stats.chartSummaries,
          observations: stats.observations
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    if (!analysis) {
      return res.status(400).json({
        success: false,
        message: 'Statistical analysis must be computed before generating AI commentary.'
      });
    }

    if (!isGeminiConfigured()) {
      return res.status(200).json({
        success: true,
        aiConfigured: false,
        aiMessage: 'Gemini API key is not configured in backend/.env. Statistical analysis remains fully functional.'
      });
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), 4000)
      );

      const aiSummary = await Promise.race([
        explainInsightsWithGemini({
          datasetName: dataset.originalFilename,
          statsSummary: analysis.overview,
          observations: analysis.observations || []
        }),
        timeoutPromise
      ]);

      if (aiSummary) {
        analysis.aiExecutiveSummary = aiSummary;
        await analysis.save();

        return res.status(200).json({
          success: true,
          aiExecutiveSummary: aiSummary
        });
      }

      return res.status(200).json({
        success: true,
        aiQuotaExceeded: true,
        aiMessage: 'AI commentary could not be generated. Statistical analysis is 100% computed.'
      });
    } catch (aiErr) {
      const isQuota =
        aiErr.status === 429 ||
        aiErr.message?.includes('429') ||
        aiErr.message?.includes('RESOURCE_EXHAUSTED');

      const isTimeout = aiErr.message === 'AI_TIMEOUT';

      return res.status(200).json({
        success: true,
        aiQuotaExceeded: isQuota,
        aiMessage: isQuota
          ? 'Gemini Free Tier rate limit reached (HTTP 429). Statistical analysis is unaffected.'
          : isTimeout
          ? 'Gemini service timed out. Statistical analysis is 100% computed and verified.'
          : `AI service notice: ${aiErr.message}`
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get automated observations and insights for a dataset
// @route   GET /api/datasets/:id/insights
// @access  Private
const getDatasetInsights = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.'
      });
    }

    let analysis = await Analysis.findOne({
      dataset: dataset._id,
      user: req.user._id
    }).sort({ createdAt: -1 });

    if (!analysis && dataset.dataPath && fs.existsSync(dataset.dataPath)) {
      const rows = loadDatasetRows(dataset.dataPath);
      const stats = analyzeDatasetRows(rows, dataset.columns);
      return res.status(200).json({
        success: true,
        dataset: {
          _id: dataset._id,
          name: dataset.originalFilename,
          rowCount: dataset.rowCount,
          columnCount: dataset.columnCount
        },
        observations: stats.observations,
        overview: stats.overview,
        numericStats: stats.numericStats,
        correlations: stats.correlations,
        aiExecutiveSummary: null
      });
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No insights available for this dataset.'
      });
    }

    return res.status(200).json({
      success: true,
      dataset: {
        _id: dataset._id,
        name: dataset.originalFilename,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount
      },
      observations: analysis.observations || [],
      overview: analysis.overview,
      numericStats: analysis.numericStats,
      correlations: analysis.correlations,
      aiExecutiveSummary: analysis.aiExecutiveSummary
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Compare two datasets side-by-side
// @route   POST /api/datasets/compare
// @access  Private
const compareDatasets = async (req, res, next) => {
  try {
    const { datasetId1, datasetId2 } = req.body;

    if (!datasetId1 || !datasetId2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both datasetId1 and datasetId2 for comparison.'
      });
    }

    const [dataset1, dataset2] = await Promise.all([
      Dataset.findOne({ _id: datasetId1, user: req.user._id }),
      Dataset.findOne({ _id: datasetId2, user: req.user._id })
    ]);

    if (!dataset1 || !dataset2) {
      return res.status(404).json({
        success: false,
        message: 'One or both datasets could not be found or access is denied.'
      });
    }

    const rows1 = loadDatasetRows(dataset1.dataPath);
    const rows2 = loadDatasetRows(dataset2.dataPath);

    const audit1 = auditDataset(rows1, dataset1.columns.map((c) => c.name));
    const audit2 = auditDataset(rows2, dataset2.columns.map((c) => c.name));

    const cols1 = dataset1.columns.map((c) => c.name);
    const cols2 = dataset2.columns.map((c) => c.name);

    const commonColumns = cols1.filter((c) => cols2.includes(c));
    const uniqueToFirst = cols1.filter((c) => !cols2.includes(c));
    const uniqueToSecond = cols2.filter((c) => !cols1.includes(c));

    const numComparison = [];
    for (const colName of commonColumns) {
      const colMeta1 = dataset1.columns.find((c) => c.name === colName);
      const colMeta2 = dataset2.columns.find((c) => c.name === colName);

      if (colMeta1?.dataType === 'number' || colMeta2?.dataType === 'number') {
        const vals1 = rows1.map((r) => Number(r[colName])).filter((n) => !isNaN(n));
        const vals2 = rows2.map((r) => Number(r[colName])).filter((n) => !isNaN(n));

        const avg1 = vals1.length > 0 ? vals1.reduce((a, b) => a + b, 0) / vals1.length : 0;
        const avg2 = vals2.length > 0 ? vals2.reduce((a, b) => a + b, 0) / vals2.length : 0;

        numComparison.push({
          column: colName,
          dataset1Mean: Number(avg1.toFixed(2)),
          dataset2Mean: Number(avg2.toFixed(2)),
          meanDifference: Number((avg2 - avg1).toFixed(2))
        });
      }
    }

    const unionCols = new Set([...cols1, ...cols2]);
    const similarityIndex = Number(((commonColumns.length / (unionCols.size || 1)) * 100).toFixed(1));

    return res.status(200).json({
      success: true,
      comparison: {
        dataset1: {
          _id: dataset1._id,
          name: dataset1.originalFilename,
          rowCount: dataset1.rowCount,
          columnCount: dataset1.columnCount,
          fileSize: dataset1.fileSize,
          qualityScore: audit1.qualityScore,
          qualityGrade: audit1.qualityGrade,
          missingCells: audit1.totalMissingCells,
          duplicateRows: audit1.duplicateRowCount,
          columns: dataset1.columns
        },
        dataset2: {
          _id: dataset2._id,
          name: dataset2.originalFilename,
          rowCount: dataset2.rowCount,
          columnCount: dataset2.columnCount,
          fileSize: dataset2.fileSize,
          qualityScore: audit2.qualityScore,
          qualityGrade: audit2.qualityGrade,
          missingCells: audit2.totalMissingCells,
          duplicateRows: audit2.duplicateRowCount,
          columns: dataset2.columns
        },
        schemaComparison: {
          commonColumns,
          uniqueToFirst,
          uniqueToSecond,
          similarityIndex
        },
        numericComparison: numComparison
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeDataset,
  getAnalysisById,
  getAllAnalyses,
  getAnalysesByDataset,
  explainDatasetAnalysis,
  getDatasetInsights,
  compareDatasets
};
