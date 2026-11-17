const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'ai', 'system'],
      required: true,
      default: 'user'
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    suggestedQuestions: [String]
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      default: null
    },
    datasetName: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: 'New Insight Conversation',
      trim: true
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
