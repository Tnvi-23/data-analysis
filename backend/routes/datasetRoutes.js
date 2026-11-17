const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/auth');
const {
  uploadDataset,
  getDatasets,
  getDatasetById,
  getDatasetData,
  getDatasetIntelligence,
  getSampleDatasets,
  loadSampleDataset,
  deleteDataset
} = require('../controllers/datasetController');
const {
  getDatasetAudit,
  previewClean,
  cleanDataset,
  undoClean
} = require('../controllers/cleaningController');
const {
  analyzeDataset,
  getDatasetInsights,
  compareDatasets,
  explainDatasetAnalysis
} = require('../controllers/analysisController');

// All dataset routes require authentication
router.use(protect);

// Sample datasets routes
router.get('/samples', getSampleDatasets);
router.post('/samples/:sampleKey/load', loadSampleDataset);

// Dataset comparison
router.post('/compare', compareDatasets);

// Core dataset CRUD
router.post('/upload', upload.single('file'), uploadDataset);
router.get('/', getDatasets);
router.get('/:id', getDatasetById);
router.get('/:id/data', getDatasetData);

// Intelligence & Profiling
router.get('/:id/intelligence', getDatasetIntelligence);
router.get('/:id/audit', getDatasetAudit);

// Cleaning operations
router.post('/:id/clean/preview', previewClean);
router.post('/:id/clean', cleanDataset);
router.post('/:id/clean/undo', undoClean);

// Statistical Analysis & Automated Insights
router.post('/:id/analyze', analyzeDataset);
router.post('/:id/explain', explainDatasetAnalysis);
router.get('/:id/insights', getDatasetInsights);

router.delete('/:id', deleteDataset);

module.exports = router;
