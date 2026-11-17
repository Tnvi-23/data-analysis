const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
      required: true,
      index: true
    },
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    filename: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      default: null
    },
    pdfUrl: {
      type: String,
      required: true
    },
    cloudinaryUrl: {
      type: String,
      default: null
    },
    cloudinaryPublicId: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    },
    fileFormat: {
      type: String,
      default: 'pdf'
    },
    storageType: {
      type: String,
      enum: ['cloudinary', 'local'],
      default: 'local'
    },
    fileSize: {
      type: Number,
      required: true
    },
    generationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'processing'],
      default: 'completed'
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ user: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
