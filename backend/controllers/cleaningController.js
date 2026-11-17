const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const {
  loadDatasetRows,
  saveDatasetRows
} = require('../services/fileProcessingService');
const {
  auditDataset,
  cleanData
} = require('../services/dataCleaningService');

// @desc    Audit dataset for missing values, duplicates, and anomalies
// @route   GET /api/datasets/:id/audit
// @access  Private
const getDatasetAudit = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or access denied.'
      });
    }

    const rows = loadDatasetRows(dataset.dataPath);
    const columnNames = dataset.columns.map((c) => c.name);

    const audit = auditDataset(rows, columnNames);

    // Sync quality score
    dataset.qualityScore = audit.qualityScore;
    await dataset.save();

    return res.status(200).json({
      success: true,
      datasetId: dataset._id,
      originalFilename: dataset.originalFilename,
      audit
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Preview cleaning operations without persisting changes
// @route   POST /api/datasets/:id/clean/preview
// @access  Private
const previewClean = async (req, res, next) => {
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
    const operations = req.body || {};

    const cleanResult = cleanData(rows, operations);

    return res.status(200).json({
      success: true,
      summary: {
        beforeRowCount: cleanResult.beforeRowCount,
        afterRowCount: cleanResult.afterRowCount,
        rowsRemoved: cleanResult.rowsRemoved,
        valuesModifiedCount: cleanResult.valuesModifiedCount || 0,
        actionsApplied: cleanResult.actionsApplied,
        columns: cleanResult.columns
      },
      previewData: cleanResult.cleanedRows.slice(0, 15)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Execute data cleaning operations on dataset
// @route   POST /api/datasets/:id/clean
// @access  Private
const cleanDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found or access denied.'
      });
    }

    const rows = loadDatasetRows(dataset.dataPath);
    const operations = req.body || {};

    // Create a backup snapshot of current data before overwriting
    const backupFilename = `backup-v${dataset.version}-${dataset.storedFilename}`;
    const backupPath = path.join(path.dirname(dataset.dataPath), backupFilename);
    fs.copyFileSync(dataset.dataPath, backupPath);

    const cleanResult = cleanData(rows, operations);

    // Persist cleaned rows back to file
    saveDatasetRows(dataset.dataPath, cleanResult.cleanedRows);

    // Compute updated audit & quality score
    const updatedAudit = auditDataset(
      cleanResult.cleanedRows,
      cleanResult.columns.map((c) => c.name)
    );

    // Update dataset document in MongoDB
    dataset.previousDataPath = backupPath;
    dataset.rowCount = cleanResult.afterRowCount;
    dataset.columnCount = cleanResult.columns.length;
    dataset.columns = cleanResult.columns;
    dataset.previewData = cleanResult.cleanedRows.slice(0, 15);
    dataset.status = 'cleaned';
    dataset.version += 1;
    dataset.qualityScore = updatedAudit.qualityScore;

    if (cleanResult.actionsApplied.length > 0) {
      dataset.cleaningHistory.push(...cleanResult.actionsApplied);
    }

    await dataset.save();

    return res.status(200).json({
      success: true,
      message: 'Dataset cleaned successfully',
      summary: {
        beforeRowCount: cleanResult.beforeRowCount,
        afterRowCount: cleanResult.afterRowCount,
        rowsRemoved: cleanResult.rowsRemoved,
        valuesModifiedCount: cleanResult.valuesModifiedCount || 0,
        actionsApplied: cleanResult.actionsApplied,
        version: dataset.version,
        qualityScore: dataset.qualityScore
      },
      dataset: {
        _id: dataset._id,
        originalFilename: dataset.originalFilename,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        columns: dataset.columns,
        status: dataset.status,
        version: dataset.version,
        qualityScore: dataset.qualityScore,
        cleaningHistory: dataset.cleaningHistory,
        canUndo: Boolean(dataset.previousDataPath)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Undo the last cleaning operation
// @route   POST /api/datasets/:id/clean/undo
// @access  Private
const undoClean = async (req, res, next) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!dataset || !dataset.previousDataPath || !fs.existsSync(dataset.previousDataPath)) {
      return res.status(400).json({
        success: false,
        message: 'No previous dataset state available to restore.'
      });
    }

    // Restore previous file
    fs.copyFileSync(dataset.previousDataPath, dataset.dataPath);
    try {
      fs.unlinkSync(dataset.previousDataPath);
    } catch (e) {
      // Ignore unlink error
    }

    const restoredRows = loadDatasetRows(dataset.dataPath);
    const restoredColNames = Object.keys(restoredRows[0] || {});

    const audit = auditDataset(restoredRows, restoredColNames);

    dataset.rowCount = restoredRows.length;
    dataset.columnCount = restoredColNames.length;
    dataset.previewData = restoredRows.slice(0, 15);
    dataset.previousDataPath = null;
    dataset.version = Math.max(1, dataset.version - 1);
    dataset.qualityScore = audit.qualityScore;
    if (dataset.version === 1) dataset.status = 'ready';

    dataset.cleaningHistory.push({
      action: 'undo_clean',
      description: `Reverted to version ${dataset.version}`,
      affectedRows: restoredRows.length,
      affectedColumns: restoredColNames,
      timestamp: new Date()
    });

    await dataset.save();

    return res.status(200).json({
      success: true,
      message: 'Previous dataset version restored successfully.',
      dataset
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDatasetAudit,
  previewClean,
  cleanDataset,
  undoClean
};
