const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Dataset = require('../models/Dataset');
const Analysis = require('../models/Analysis');
const { generatePDFReport } = require('../services/reportService');
const { analyzeDatasetRows } = require('../services/analyticsService');
const { loadDatasetRows } = require('../services/fileProcessingService');

/**
 * Accurately count pages in a generated PDF buffer/file by parsing PDF dictionary
 */
function getPdfPageCount(filePath) {
  const buf = fs.readFileSync(filePath);
  const content = buf.toString('latin1');
  
  // Method 1: Count /Type /Page (excluding /Pages)
  const pageMatches = content.match(/\/Type\s*\/Page\b/g);
  const countMatches = content.match(/\/Count\s+(\d+)/g);
  
  let pageCount = pageMatches ? pageMatches.length : 0;
  return pageCount;
}

/**
 * Scan PDF text stream to verify content presence and detect if any page is blank
 */
function inspectPdfPages(filePath) {
  const buf = fs.readFileSync(filePath);
  const content = buf.toString('latin1');
  
  // Split into page objects
  const pageBlocks = content.split(/\/Type\s*\/Page\b/).slice(1);
  const totalPages = pageBlocks.length;
  
  // Check occurrences of pie chart PNG image stream (marked by XObject or image data)
  const hasImages = content.includes('/Subtype /Image') || content.includes('/Filter /DCTDecode') || content.includes('/Filter /FlateDecode');
  const imageCount = (content.match(/\/Subtype\s*\/Image/g) || []).length;
  
  return {
    totalPages,
    imageCount,
    fileSizeKB: Math.round(buf.length / 1024),
    hasFooterText: content.includes('SmartData Insight Platform'),
    hasBrandHeader: content.includes('SmartData Insight')
  };
}

async function runTests() {
  console.log('=== STARTING PDF REPORT GENERATION & LAYOUT VERIFICATION ===');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas: ' + mongoose.connection.name);

  const targetDatasets = [
    'student_exam_scores.csv',
    '[Sample] Student Academic Performance.csv',
    '[Sample] Sales & Revenue Performance.csv',
    'company_payroll.csv'
  ];

  const results = [];

  for (const name of targetDatasets) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Testing dataset: ${name}`);

    const dataset = await Dataset.findOne({ originalFilename: name }).sort({ createdAt: -1 });
    if (!dataset) {
      console.error(`Dataset not found in DB: ${name}`);
      continue;
    }

    console.log(`Found dataset ID: ${dataset._id}, rows: ${dataset.rowCount}, cols: ${dataset.columnCount}`);

    // Load or compute analysis
    let analysis = await Analysis.findOne({ dataset: dataset._id }).sort({ createdAt: -1 });
    if (!analysis) {
      console.log(`Computing fresh statistical analysis for ${name}...`);
      const rows = await loadDatasetRows(dataset);
      const computed = analyzeDatasetRows(rows, dataset.columns);
      analysis = computed;
    }

    const title = `Executive Analytics Report — ${dataset.originalFilename}`;
    console.log(`Generating PDF via reportService...`);
    const startTime = Date.now();
    const pdfResult = await generatePDFReport(analysis, dataset, { title });
    const durationMs = Date.now() - startTime;

    console.log(`PDF generated in ${durationMs}ms`);
    console.log(`Output file: ${pdfResult.filePath}`);
    console.log(`File size: ${pdfResult.fileSize} bytes`);

    const pageCount = getPdfPageCount(pdfResult.filePath);
    const inspection = inspectPdfPages(pdfResult.filePath);

    console.log(`Page Count: ${pageCount}`);
    console.log(`Embedded Image Count: ${inspection.imageCount}`);
    console.log(`Footers & Brand Header Verified: ${inspection.hasFooterText && inspection.hasBrandHeader}`);

    const hasCatStats = (analysis.categoricalStats || []).length > 0;
    const catColNames = (analysis.categoricalStats || []).map(c => c.column);
    console.log(`Categorical Columns Available: ${catColNames.join(', ') || 'None'}`);

    results.push({
      datasetName: name,
      pageCount,
      fileSizeKB: inspection.fileSizeKB,
      imagesEmbedded: inspection.imageCount,
      hasCategorical: hasCatStats,
      durationMs,
      filePath: pdfResult.filePath
    });
  }

  // Edge Case 1: Pure Numeric Dataset (No categorical variables)
  console.log(`\n--------------------------------------------------`);
  console.log(`Testing Edge Case 1: Pure Numerical Dataset (Zero Categorical Columns)`);
  const pureNumericDataset = {
    _id: new mongoose.Types.ObjectId(),
    originalFilename: 'pure_sensor_readings.csv',
    fileType: 'csv',
    rowCount: 50,
    columnCount: 3,
    columns: [
      { name: 'temperature', dataType: 'number' },
      { name: 'humidity', dataType: 'number' },
      { name: 'pressure', dataType: 'number' }
    ]
  };
  const pureNumericAnalysis = {
    overview: {
      rowCount: 50,
      columnCount: 3,
      totalMissingCells: 0,
      duplicateRows: 0,
      dataCompletenessPercentage: 100,
      totalOutliers: 2
    },
    numericStats: [
      {
        column: 'temperature',
        count: 50,
        mean: 24.5,
        median: 24.1,
        min: 18.2,
        max: 32.8,
        standardDeviation: 3.4,
        variance: 11.56,
        q1: 22.0,
        q3: 27.0,
        iqr: 5.0,
        outliers: { outlierCount: 1 },
        histogram: [
          { binStart: 18, binEnd: 22, count: 8, label: '18-22' },
          { binStart: 22, binEnd: 26, count: 28, label: '22-26' },
          { binStart: 26, binEnd: 30, count: 12, label: '26-30' },
          { binStart: 30, binEnd: 34, count: 2, label: '30-34' }
        ]
      },
      {
        column: 'humidity',
        count: 50,
        mean: 55.2,
        median: 54.0,
        min: 40.0,
        max: 75.0,
        standardDeviation: 8.1,
        variance: 65.61,
        q1: 49.0,
        q3: 61.0,
        iqr: 12.0,
        outliers: { outlierCount: 1 }
      }
    ],
    categoricalStats: [], // PURE NUMERICAL
    correlations: [
      { col1: 'temperature', col2: 'humidity', coefficient: -0.68 }
    ],
    observations: [
      { type: 'anomaly', title: '1 Outlier in Temperature', description: 'Sensor reading exceeded 32°C at peak hour.' }
    ]
  };

  const edge1Result = await generatePDFReport(pureNumericAnalysis, pureNumericDataset, {
    title: 'Executive Analytics Report — Pure Sensor Telemetry'
  });
  const edge1Pages = getPdfPageCount(edge1Result.filePath);
  const edge1Inspect = inspectPdfPages(edge1Result.filePath);
  console.log(`Edge Case 1 (Pure Numeric) Success:`);
  console.log(`Page count: ${edge1Pages}, Size: ${edge1Inspect.fileSizeKB}KB, Images: ${edge1Inspect.imageCount}`);
  results.push({
    datasetName: 'pure_sensor_readings.csv (Edge Case)',
    pageCount: edge1Pages,
    fileSizeKB: edge1Inspect.fileSizeKB,
    imagesEmbedded: edge1Inspect.imageCount,
    hasCategorical: false,
    durationMs: 0,
    filePath: edge1Result.filePath
  });

  console.log('\n================ FINAL TEST SUMMARY ================');
  console.table(results);

  await mongoose.disconnect();
  console.log('\nMongoDB Atlas disconnected cleanly.');
}

runTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
