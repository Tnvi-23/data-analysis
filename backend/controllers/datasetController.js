const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const {
  processUploadedFile,
  loadDatasetRows,
  saveDatasetRows,
  deleteDatasetFile
} = require('../services/fileProcessingService');
const { auditDataset } = require('../services/dataCleaningService');

const SAMPLES_METADATA = [
  {
    key: 'sales_performance',
    title: 'Sales & Revenue Performance',
    filename: 'sales_performance.csv',
    description: 'Regional sales metrics across software, cloud, security appliances, and hardware with margins.',
    category: 'Sales & Revenue',
    rowCount: 20,
    columnCount: 9,
    tags: ['Revenue', 'Profit', 'Regional', 'Customer Rating']
  },
  {
    key: 'student_scores',
    title: 'Student Academic Performance',
    filename: 'student_scores.csv',
    description: 'Study hours, attendance rates, exam scores, and pass outcomes for predictive academic analytics.',
    category: 'Education',
    rowCount: 20,
    columnCount: 8,
    tags: ['Study Hours', 'Attendance', 'Exam Scores', 'Outcome']
  },
  {
    key: 'employee_analytics',
    title: 'Employee Retention & Analytics',
    filename: 'employee_analytics.csv',
    description: 'Salary, experience, departmental roles, project counts, and attrition risk indicators.',
    category: 'Human Resources',
    rowCount: 20,
    columnCount: 8,
    tags: ['Salary', 'Experience', 'Performance', 'Attrition']
  },
  {
    key: 'ecommerce_orders',
    title: 'E-Commerce Order Transactions',
    filename: 'ecommerce_orders.csv',
    description: 'Order values, discounts, payment channels, delivery speed, and return rates.',
    category: 'E-Commerce',
    rowCount: 20,
    columnCount: 8,
    tags: ['Order Value', 'Discounts', 'Payment Method', 'Logistics']
  },
  {
    key: 'customer_segmentation',
    title: 'Customer Segmentation & Value',
    filename: 'customer_segmentation.csv',
    description: 'Demographics, annual income, spending propensity, tier assignment, and churn risk.',
    category: 'Marketing',
    rowCount: 20,
    columnCount: 7,
    tags: ['Income', 'Spending Score', 'Tiers', 'Churn']
  },
  {
    key: 'financial_transactions',
    title: 'Financial Transaction Audit',
    filename: 'financial_transactions.csv',
    description: 'Transaction amounts, balances, fraud flags, channel metrics, and risk scoring.',
    category: 'Finance & Risk',
    rowCount: 20,
    columnCount: 7,
    tags: ['Transaction Amount', 'Risk Score', 'Fraud', 'Banking']
  }
];

// @desc    Upload a new CSV or Excel dataset
// @route   POST /api/datasets/upload
// @access  Private
const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a CSV or Excel file.'
      });
    }

    // Process file, extract schema, save parsed rows
    const processed = await processUploadedFile(req.file);

    // Initial quality audit
    const rows = loadDatasetRows(processed.dataPath);
    const audit = auditDataset(rows, processed.columns.map((c) => c.name));

    // Save dataset metadata in MongoDB
    const dataset = await Dataset.create({
      user: req.user._id,
      originalFilename: req.file.originalname,
      storedFilename: processed.storedFilename,
      fileType: processed.fileType,
      fileSize: processed.fileSize,
      rowCount: processed.rowCount,
      columnCount: processed.columnCount,
      columns: processed.columns,
      previewData: processed.previewData,
      dataPath: processed.dataPath,
      status: 'ready',
      qualityScore: audit.qualityScore
    });

    return res.status(201).json({
      success: true,
      message: 'Dataset uploaded and processed successfully',
      dataset
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all datasets for current user
// @route   GET /api/datasets
// @access  Private
const getDatasets = async (req, res, next) => {
  try {
    const datasets = await Dataset.find({ user: req.user._id })
      .select('-dataPath')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: datasets.length,
      datasets
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dataset metadata and preview by ID
// @route   GET /api/datasets/:id
// @access  Private
const getDatasetById = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id
    }).select('-dataPath');

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or you do not have permission to access it.'
      });
    }

    return res.status(200).json({
      success: true,
      dataset
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get full dataset rows with pagination
// @route   GET /api/datasets/:id/data
// @access  Private
const getDatasetData = async (req, res, next) => {
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

    const rows = loadDatasetRows(dataset.dataPath);
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '100', 10);
    const startIndex = (page - 1) * limit;
    const paginatedRows = rows.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      totalRows: rows.length,
      page,
      limit,
      totalPages: Math.ceil(rows.length / limit),
      data: paginatedRows
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Dataset Intelligence Profiling & Quality Score
// @route   GET /api/datasets/:id/intelligence
// @access  Private
const getDatasetIntelligence = async (req, res, next) => {
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

    const rows = loadDatasetRows(dataset.dataPath);
    const colNames = dataset.columns.map((c) => c.name);

    const audit = auditDataset(rows, colNames);

    // Classify column types
    const numericCols = dataset.columns.filter((c) => c.dataType === 'number').map((c) => c.name);
    const categoricalCols = dataset.columns.filter((c) => c.dataType === 'string').map((c) => c.name);
    const dateCols = dataset.columns.filter((c) => c.dataType === 'date').map((c) => c.name);
    const booleanCols = dataset.columns.filter((c) => c.dataType === 'boolean').map((c) => c.name);

    // Sync score on dataset model
    dataset.qualityScore = audit.qualityScore;
    await dataset.save();

    return res.status(200).json({
      success: true,
      intelligence: {
        datasetId: dataset._id,
        name: dataset.originalFilename,
        fileType: dataset.fileType,
        fileSize: dataset.fileSize,
        version: dataset.version,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        qualityScore: audit.qualityScore,
        qualityGrade: audit.qualityGrade,
        qualityMetrics: audit.qualityMetrics,
        recommendations: audit.recommendations,
        typeClassification: {
          numeric: numericCols,
          categorical: categoricalCols,
          date: dateCols,
          boolean: booleanCols
        },
        columnProfiling: dataset.columns.map((col) => ({
          name: col.name,
          dataType: col.dataType,
          missingCount: audit.missingByColumn[col.name] || 0,
          missingPercentage: Number((((audit.missingByColumn[col.name] || 0) / (dataset.rowCount || 1)) * 100).toFixed(1)),
          uniqueCount: audit.uniqueCountByColumn[col.name] || 0,
          sampleValues: col.sampleValues || []
        })),
        previewRows: rows.slice(0, 15)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get sample datasets catalog
// @route   GET /api/datasets/samples
// @access  Public / Private
const getSampleDatasets = (req, res) => {
  return res.status(200).json({
    success: true,
    samples: SAMPLES_METADATA
  });
};

// @desc    Load sample dataset directly into user's workspace
// @route   POST /api/datasets/samples/:sampleKey/load
// @access  Private
const loadSampleDataset = async (req, res, next) => {
  try {
    const { sampleKey } = req.params;
    const sampleMeta = SAMPLES_METADATA.find((s) => s.key === sampleKey);

    if (!sampleMeta) {
      return res.status(404).json({
        success: false,
        message: `Sample dataset '${sampleKey}' not found.`
      });
    }

    const sampleCsvPath = path.join(__dirname, '..', 'sample-datasets', sampleMeta.filename);
    if (!fs.existsSync(sampleCsvPath)) {
      return res.status(404).json({
        success: false,
        message: 'Sample dataset source file is missing from server storage.'
      });
    }

    // Emulate uploaded file object to reuse processUploadedFile
    const tempCopyName = `sample-copy-${Date.now()}-${sampleMeta.filename}`;
    const tempPath = path.join(__dirname, '..', 'uploads', 'temp', tempCopyName);
    fs.copyFileSync(sampleCsvPath, tempPath);

    const stats = fs.statSync(tempPath);
    const mockFile = {
      path: tempPath,
      originalname: sampleMeta.filename,
      size: stats.size
    };

    const processed = await processUploadedFile(mockFile);

    const rows = loadDatasetRows(processed.dataPath);
    const audit = auditDataset(rows, processed.columns.map((c) => c.name));

    const dataset = await Dataset.create({
      user: req.user._id,
      originalFilename: `[Sample] ${sampleMeta.title}.csv`,
      storedFilename: processed.storedFilename,
      fileType: 'csv',
      fileSize: processed.fileSize,
      rowCount: processed.rowCount,
      columnCount: processed.columnCount,
      columns: processed.columns,
      previewData: processed.previewData,
      dataPath: processed.dataPath,
      status: 'ready',
      qualityScore: audit.qualityScore
    });

    return res.status(201).json({
      success: true,
      message: `Sample dataset '${sampleMeta.title}' loaded into your workspace!`,
      dataset
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete dataset and its stored file
// @route   DELETE /api/datasets/:id
// @access  Private
const deleteDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or you do not have permission to delete it.'
      });
    }

    // Delete stored data file
    deleteDatasetFile(dataset.dataPath);
    if (dataset.previousDataPath && fs.existsSync(dataset.previousDataPath)) {
      try {
        fs.unlinkSync(dataset.previousDataPath);
      } catch (e) {}
    }

    // Delete record from MongoDB
    await Dataset.findByIdAndDelete(dataset._id);

    return res.status(200).json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadDataset,
  getDatasets,
  getDatasetById,
  getDatasetData,
  getDatasetIntelligence,
  getSampleDatasets,
  loadSampleDataset,
  deleteDataset
};
