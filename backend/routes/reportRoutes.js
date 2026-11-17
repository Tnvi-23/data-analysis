const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReport,
  getUserReports,
  getReportById,
  downloadReport,
  deleteReport
} = require('../controllers/reportController');

// All report endpoints are protected by authentication
router.use(protect);

// Generation endpoints supporting both datasetId and analysisId
router.post('/generate', createReport);
router.post('/generate/:id', createReport);
router.post('/', createReport);

// Retrieval, view, download and delete endpoints
router.get('/', getUserReports);
router.get('/:id', getReportById);
router.get('/:id/download', downloadReport);
router.get('/:id/view', (req, res, next) => {
  req.query.disposition = 'inline';
  return downloadReport(req, res, next);
});
router.delete('/:id', deleteReport);

module.exports = router;
