const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  chat,
  getConversations,
  getConversationById,
  deleteConversation,
  getAIStatus
} = require('../controllers/aiController');

// All AI routes require authentication
router.use(protect);

router.post('/chat', chat);
router.get('/status', getAIStatus);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);
router.delete('/conversations/:id', deleteConversation);

module.exports = router;
