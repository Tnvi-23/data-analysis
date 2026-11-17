const mongoose = require('mongoose');

const numericStatSchema = new mongoose.Schema(
  {
    column: { type: String, required: true },
    count: Number,
    missing: Number,
    sum: Number,
    mean: Number,
    median: Number,
    mode: mongoose.Schema.Types.Mixed,
    standardDeviation: Number,
    variance: Number,
    min: Number,
    max: Number,
    range: Number,
    q1: Number,
    q3: Number,
    iqr: Number,
    outliers: {
      lowerBound: Number,
      upperBound: Number,
      outlierCount: Number,
      outlierPercentage: Number,
      sampleOutliers: [Number]
    },
    histogram: [
      {
        binStart: Number,
        binEnd: Number,
        count: Number,
        label: String
      }
    ]
  },
  { _id: false }
);

const categoricalStatSchema = new mongoose.Schema(
  {
    column: { type: String, required: true },
    totalCount: Number,
    uniqueCount: Number,
    missing: Number,
    mostCommon: {
      value: mongoose.Schema.Types.Mixed,
      count: Number
    },
    leastCommon: {
      value: mongoose.Schema.Types.Mixed,
      count: Number
    },
    topValues: [
      {
        value: mongoose.Schema.Types.Mixed,
        count: Number,
        percentage: Number
      }
    ]
  },
  { _id: false }
);

const observationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['anomaly', 'correlation', 'quality', 'distribution', 'general'] },
    title: String,
    description: String,
    column: String,
    impact: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    datasetName: {
      type: String,
      required: true
    },
    overview: {
      rowCount: { type: Number, required: true },
      columnCount: { type: Number, required: true },
      totalMissingCells: { type: Number, default: 0 },
      duplicateRows: { type: Number, default: 0 },
      dataCompletenessPercentage: { type: Number, default: 100 },
      totalOutliers: { type: Number, default: 0 }
    },
    numericStats: [numericStatSchema],
    categoricalStats: [categoricalStatSchema],
    correlations: [
      {
        col1: String,
        col2: String,
        coefficient: Number
      }
    ],
    chartSummaries: {
      type: mongoose.Schema.Types.Mixed
    },
    observations: [observationSchema],
    aiExecutiveSummary: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

analysisSchema.index({ user: 1, createdAt: -1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
