const Dataset = require('../models/Dataset');
const Analysis = require('../models/Analysis');
const Report = require('../models/Report');

// @desc    Get comprehensive dashboard metrics and activity timeline
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Parallel lookups
    const [
      totalDatasets,
      totalAnalyses,
      totalReports,
      recentDatasets,
      recentReports,
      recentAnalyses
    ] = await Promise.all([
      Dataset.countDocuments({ user: userId }),
      Analysis.countDocuments({ user: userId }),
      Report.countDocuments({ user: userId }),
      Dataset.find({ user: userId })
        .select('originalFilename fileType rowCount columnCount qualityScore status createdAt')
        .sort({ createdAt: -1 })
        .limit(6),
      Report.find({ user: userId })
        .select('title filename storageType pdfUrl fileSize createdAt')
        .sort({ createdAt: -1 })
        .limit(6),
      Analysis.find({ user: userId })
        .select('dataset datasetName overview createdAt')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    // Aggregate total rows, columns, and storage size across datasets
    const aggregateMetrics = await Dataset.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalRowsStored: { $sum: '$rowCount' },
          totalColumnsProcessed: { $sum: '$columnCount' },
          totalStorageBytes: { $sum: '$fileSize' },
          avgColumns: { $avg: '$columnCount' },
          avgQualityScore: { $avg: '$qualityScore' }
        }
      }
    ]);

    // File type distribution (CSV vs XLSX)
    const fileTypeCounts = await Dataset.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$fileType', count: { $sum: 1 } } }
    ]);

    const stats = aggregateMetrics[0] || {
      totalRowsStored: 0,
      totalColumnsProcessed: 0,
      totalStorageBytes: 0,
      avgColumns: 0,
      avgQualityScore: 92
    };

    const typeDistribution = fileTypeCounts.map((f) => ({
      name: (f._id || 'csv').toUpperCase(),
      count: f.count
    }));

    // Build unified chronological activity timeline
    const timeline = [];

    recentDatasets.forEach((d) => {
      timeline.push({
        type: 'upload',
        title: `Imported ${d.originalFilename}`,
        description: `${d.rowCount} rows, ${d.columnCount} attributes`,
        timestamp: d.createdAt,
        id: d._id
      });
    });

    recentAnalyses.forEach((a) => {
      timeline.push({
        type: 'analysis',
        title: `Analyzed ${a.datasetName}`,
        description: `Completeness: ${a.overview?.dataCompletenessPercentage || 100}%`,
        timestamp: a.createdAt,
        id: a._id
      });
    });

    recentReports.forEach((r) => {
      timeline.push({
        type: 'report',
        title: `Generated report ${r.title}`,
        description: `Storage: ${r.storageType}`,
        timestamp: r.createdAt,
        id: r._id
      });
    });

    timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDatasets,
          totalAnalyses,
          totalReports,
          totalRowsStored: stats.totalRowsStored,
          totalColumnsProcessed: stats.totalColumnsProcessed,
          totalStorageBytes: stats.totalStorageBytes,
          avgColumns: Number((stats.avgColumns || 0).toFixed(1)),
          avgQualityScore: Number((stats.avgQualityScore || 92).toFixed(1))
        },
        typeDistribution,
        activityTimeline: timeline.slice(0, 8),
        recentDatasets,
        recentReports,
        recentAnalyses
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardData
};
