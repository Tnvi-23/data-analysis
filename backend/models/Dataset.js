const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    dataType: {
      type: String,
      enum: ['number', 'string', 'date', 'boolean', 'mixed'],
      default: 'string'
    },
    sampleValues: [mongoose.Schema.Types.Mixed]
  },
  { _id: false }
);

const cleaningHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    description: String,
    affectedRows: {
      type: Number,
      default: 0
    },
    affectedColumns: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const datasetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true
    },
    storedFilename: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['csv', 'xlsx', 'xls'],
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    rowCount: {
      type: Number,
      required: true,
      default: 0
    },
    columnCount: {
      type: Number,
      required: true,
      default: 0
    },
    columns: [columnSchema],
    previewData: [mongoose.Schema.Types.Mixed],
    dataPath: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ready', 'processing', 'failed', 'cleaned'],
      default: 'ready'
    },
    version: {
      type: Number,
      default: 1
    },
    previousDataPath: {
      type: String,
      default: null
    },
    qualityScore: {
      type: Number,
      default: null
    },
    cleaningHistory: [cleaningHistorySchema]
  },
  {
    timestamps: true
  }
);

// Helpful index for fast user dataset listings
datasetSchema.index({ user: 1, createdAt: -1 });

const Dataset = mongoose.model('Dataset', datasetSchema);

module.exports = Dataset;
