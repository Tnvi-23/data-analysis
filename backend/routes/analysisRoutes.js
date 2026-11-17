const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  analyzeDataset,
  getAnalysisById,
  getAllAnalyses,
  getAnalysesByDataset
} = require('../controllers/analysisController');

router.use(protect);

router.get('/', getAllAnalyses);
router.get('/:id', getAnalysisById);
router.get('/dataset/:datasetId', getAnalysesByDataset);
router.post('/dataset/:id', analyzeDataset);

module.exports = router;
