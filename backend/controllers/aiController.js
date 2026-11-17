const Conversation = require('../models/Conversation');
const Dataset = require('../models/Dataset');
const Analysis = require('../models/Analysis');
const { loadDatasetRows } = require('../services/fileProcessingService');
const {
  chatWithGemini,
  isGeminiConfigured,
  getGeminiModel,
  explainInsightsWithGemini
} = require('../services/geminiService');

// @desc    Send message to Insight AI (dataset-aware chatbot)
// @route   POST /api/ai/chat
// @access  Private
const chat = async (req, res, next) => {
  try {
    const { message, datasetId, conversationId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    // Limit single message length for security
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message exceeds 2,000 character limit.'
      });
    }

    let conversation = null;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: req.user._id
      });
    }

    // Load active dataset context if datasetId is supplied
    let datasetContext = null;
    let targetDatasetId = datasetId || (conversation ? conversation.dataset : null);

    if (targetDatasetId) {
      const dataset = await Dataset.findOne({
        _id: targetDatasetId,
        user: req.user._id
      });

      if (dataset) {
        // Fetch latest analysis if one exists
        const analysis = await Analysis.findOne({
          dataset: dataset._id,
          user: req.user._id
        }).sort({ createdAt: -1 });

        let previewRows = dataset.previewData || [];
        if (previewRows.length === 0) {
          try {
            const allRows = loadDatasetRows(dataset.dataPath);
            previewRows = allRows.slice(0, 5);
          } catch (e) {
            // Safe fallback if file read fails
          }
        }

        datasetContext = {
          datasetId: dataset._id,
          datasetName: dataset.originalFilename,
          rowCount: dataset.rowCount,
          columnCount: dataset.columnCount,
          columns: dataset.columns,
          previewRows,
          qualityScore: dataset.qualityScore,
          overview: analysis ? analysis.overview : {},
          numericStats: analysis ? analysis.numericStats : [],
          categoricalStats: analysis ? analysis.categoricalStats : [],
          correlations: analysis ? analysis.correlations : []
        };
      }
    }

    // Build or retrieve conversation history
    const history = conversation ? conversation.messages : [];

    // Call Gemini with grounded context
    const aiResponse = await chatWithGemini({
      message: message.trim(),
      datasetContext,
      history
    });

    // If conversation doesn't exist, create it
    if (!conversation) {
      const generatedTitle =
        message.length > 35 ? `${message.substring(0, 32)}...` : message;

      conversation = new Conversation({
        user: req.user._id,
        dataset: datasetContext ? datasetContext.datasetId : null,
        datasetName: datasetContext ? datasetContext.datasetName : null,
        title: generatedTitle,
        messages: []
      });
    } else if (datasetContext && !conversation.dataset) {
      conversation.dataset = datasetContext.datasetId;
      conversation.datasetName = datasetContext.datasetName;
    }

    // Append user message & assistant reply
    conversation.messages.push({
      sender: 'user',
      text: message.trim(),
      timestamp: new Date()
    });

    conversation.messages.push({
      sender: 'ai',
      text: aiResponse.text,
      timestamp: new Date(),
      suggestedQuestions: aiResponse.suggestedQuestions || []
    });

    await conversation.save();

    return res.status(200).json({
      success: true,
      conversationId: conversation._id,
      title: conversation.title,
      datasetId: conversation.dataset,
      datasetName: conversation.datasetName,
      reply: aiResponse.text,
      suggestedQuestions: aiResponse.suggestedQuestions || [],
      isConfigured: aiResponse.isConfigured
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all conversation threads for logged-in user
// @route   GET /api/ai/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title dataset datasetName updatedAt createdAt messages');

    const formatted = conversations.map((conv) => {
      const lastMsg =
        conv.messages.length > 0
          ? conv.messages[conv.messages.length - 1]
          : null;

      return {
        _id: conv._id,
        title: conv.title,
        dataset: conv.dataset,
        datasetName: conv.datasetName,
        messageCount: conv.messages.length,
        lastMessage: lastMsg ? lastMsg.text.substring(0, 100) : '',
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      conversations: formatted
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get full message thread for a conversation
// @route   GET /api/ai/conversations/:id
// @access  Private
const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.'
      });
    }

    return res.status(200).json({
      success: true,
      conversation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a conversation thread
// @route   DELETE /api/ai/conversations/:id
// @access  Private
const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Gemini configuration status
// @route   GET /api/ai/status
// @access  Private
const getAIStatus = async (req, res) => {
  return res.status(200).json({
    success: true,
    isConfigured: isGeminiConfigured(),
    model: getGeminiModel()
  });
};

module.exports = {
  chat,
  getConversations,
  getConversationById,
  deleteConversation,
  getAIStatus
};
