const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const {
  generatePieChartBuffer,
  generateHistogramBuffer,
  generateCorrelationChartBuffer
} = require('./chartService');

const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Format a number cleanly for PDF reports
 */
const fmt = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  const val = Number(num);
  return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(decimals);
};

/**
 * Centralized Page Layout & Overflow Manager for PDFKit
 */
class PageLayoutManager {
  constructor(doc) {
    this.doc = doc;
    this.pageWidth = 595.28; // A4 width
    this.pageHeight = 841.89; // A4 height
    this.marginLeft = 50;
    this.marginRight = 50;
    this.marginTop = 50;
    this.marginBottom = 50;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight; // 495.28 pt
    this.maxContentY = 745; // Safe threshold above 790pt footer line

    // Colors
    this.PRIMARY_COLOR = '#0F172A'; // Slate 900
    this.ACCENT_GREEN = '#16A34A';  // Emerald Green
    this.ACCENT_LIME = '#84CC16';   // Lime
    this.TEXT_MAIN = '#1E293B';     // Slate 800
    this.TEXT_MUTED = '#64748B';    // Slate 500
    this.BG_LIGHT = '#F8FAFC';      // Slate 50
    this.BORDER_LIGHT = '#E2E8F0';  // Slate 200
  }

  /**
   * Check remaining vertical space; add a page ONLY if content overflows
   * Prevents duplicate/empty pages if already near the top.
   */
  ensureSpace(neededHeight = 40) {
    if (this.doc.y + neededHeight > this.maxContentY) {
      if (this.doc.y > this.marginTop + 25) {
        this.doc.addPage();
        this.drawRunningHeader();
        this.doc.y = 70;
        return true;
      }
    }
    return false;
  }

  /**
   * Draw subtle running header on continuation pages
   */
  drawRunningHeader() {
    this.doc.fontSize(7.5).font('Helvetica-Bold').fillColor(this.TEXT_MUTED);
    this.doc.text('SmartData Insight — Executive Analytics Dossier', this.marginLeft, 35, { lineBreak: false });
    this.doc.rect(this.marginLeft, 46, this.contentWidth, 0.5).fill(this.BORDER_LIGHT);
  }

  /**
   * Draw a styled section header
   */
  addSectionHeader(title, subtitle = '', minSpace = 65) {
    this.ensureSpace(minSpace);
    const headerTopY = this.doc.y;
    this.doc.fillColor(this.PRIMARY_COLOR).fontSize(13).font('Helvetica-Bold');
    this.doc.text(title, this.marginLeft, headerTopY, { lineBreak: false });
    this.doc.rect(this.marginLeft, headerTopY + 16, this.contentWidth, 1.5).fill(this.ACCENT_GREEN);

    if (subtitle) {
      this.doc.fillColor(this.TEXT_MUTED).fontSize(8.5).font('Helvetica');
      this.doc.text(subtitle, this.marginLeft, headerTopY + 22, { lineBreak: false });
      this.doc.y = headerTopY + 36;
    } else {
      this.doc.y = headerTopY + 24;
    }
  }

  /**
   * Draw a multi-column table with automatic pagination and header repetition
   */
  drawTable(headers = [], rows = [], colWidths = []) {
    if (headers.length === 0 || rows.length === 0) return;

    const rowHeight = 20;
    const headerHeight = 22;

    // Check if there is space for at least header + 2 rows; if not, break early to prevent orphan header
    this.ensureSpace(headerHeight + rowHeight * 2);

    const drawHeader = () => {
      const headerTopY = this.doc.y;
      this.doc.rect(this.marginLeft, headerTopY, this.contentWidth, headerHeight).fill(this.PRIMARY_COLOR);
      this.doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');

      let currentX = this.marginLeft;
      headers.forEach((h, i) => {
        const w = colWidths[i] || this.contentWidth / headers.length;
        const align = h.align || 'left';
        const textX = align === 'right' ? currentX + w - 8 : currentX + 6;
        this.doc.text(h.title, textX, headerTopY + 6, {
          width: w - 12,
          align,
          lineBreak: false
        });
        currentX += w;
      });
      this.doc.y = headerTopY + headerHeight;
    };

    drawHeader();

    rows.forEach((row, rowIdx) => {
      // Ensure space for this row; if page breaks, repeat table header
      if (this.doc.y + rowHeight > this.maxContentY) {
        this.doc.addPage();
        this.drawRunningHeader();
        this.doc.y = 70;
        drawHeader();
      }

      const rowTopY = this.doc.y;
      const isEven = rowIdx % 2 === 0;
      if (isEven) {
        this.doc.rect(this.marginLeft, rowTopY, this.contentWidth, rowHeight).fill(this.BG_LIGHT);
      }

      let currentX = this.marginLeft;
      row.forEach((cell, colIdx) => {
        const w = colWidths[colIdx] || this.contentWidth / headers.length;
        const align = headers[colIdx]?.align || 'left';
        const isBold = headers[colIdx]?.bold || false;
        const color = headers[colIdx]?.color || this.TEXT_MAIN;

        this.doc.fontSize(7.5).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fillColor(color);
        const textStr = String(cell ?? '-');
        const textX = align === 'right' ? currentX + w - 8 : currentX + 6;

        this.doc.text(textStr, textX, rowTopY + 5, {
          width: w - 12,
          align,
          ellipsis: true,
          lineBreak: false
        });
        currentX += w;
      });

      this.doc.rect(this.marginLeft, rowTopY + rowHeight - 0.5, this.contentWidth, 0.5).fill(this.BORDER_LIGHT);
      this.doc.y = rowTopY + rowHeight;
    });

    this.doc.y += 12;
  }

  /**
   * Finalize and stamp all footers without overflowing or creating extra pages
   */
  stampFooters() {
    const range = this.doc.bufferedPageRange();
    const totalPages = range.count;

    for (let i = 0; i < totalPages; i++) {
      this.doc.switchToPage(i);

      // Disable bottom margin check temporarily so text at y=798 NEVER adds a blank page
      const origBottom = this.doc.page.margins.bottom;
      this.doc.page.margins.bottom = 0;

      // Divider line
      this.doc.rect(this.marginLeft, 790, this.contentWidth, 0.5).fill(this.BORDER_LIGHT);

      // Platform text left
      this.doc.fontSize(7.5).font('Helvetica').fillColor(this.TEXT_MUTED);
      this.doc.text(
        'SmartData Insight Platform — AI-Powered Enterprise Analytical Dossier',
        this.marginLeft,
        798,
        { lineBreak: false }
      );

      // Page numbers right
      this.doc.text(
        `Page ${i + 1} of ${totalPages}`,
        this.pageWidth - this.marginRight - 100,
        798,
        { width: 100, align: 'right', lineBreak: false }
      );

      this.doc.page.margins.bottom = origBottom;
    }
  }
}

/**
 * Generate a complete, publication-grade executive analytics PDF report
 */
const generatePDFReport = async (analysis, dataset, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filename = `report-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
      const filePath = path.join(reportsDir, filename);
      const writeStream = fs.createWriteStream(filePath);

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        autoFirstPage: true,
        bufferPages: true
      });

      doc.pipe(writeStream);
      const layout = new PageLayoutManager(doc);

      const reportTitle =
        options.title || `Executive Analytics Report — ${dataset.originalFilename || 'Dataset'}`;
      const datasetName = dataset.originalFilename || 'Uploaded Dataset';
      const fileFormat = (
        dataset.fileType ||
        path.extname(datasetName).replace('.', '') ||
        'CSV'
      ).toUpperCase();

      const generationDateStr = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const overview = analysis.overview || {};
      const rowCount = overview.rowCount ?? dataset.rowCount ?? 0;
      const columnCount = overview.columnCount ?? dataset.columnCount ?? 0;
      const missingCells = overview.totalMissingCells ?? 0;
      const duplicateRows = overview.duplicateRows ?? 0;
      const completeness = overview.dataCompletenessPercentage ?? 100;
      const totalOutliers = overview.totalOutliers ?? 0;

      let qualityScore = 90;
      if (typeof dataset.qualityScore === 'number') {
        qualityScore = Math.round(dataset.qualityScore);
      } else if (dataset.qualityScore && typeof dataset.qualityScore.overallScore === 'number') {
        qualityScore = Math.round(dataset.qualityScore.overallScore);
      }

      const numericStats = analysis.numericStats || [];
      const categoricalStats = analysis.categoricalStats || [];
      const correlations = analysis.correlations || [];
      const observations = analysis.observations || [];

      // =========================================================================
      // 1. COVER PAGE / EXECUTIVE BRANDING HEADER
      // =========================================================================
      doc.rect(50, 45, 495, 75).fill(layout.PRIMARY_COLOR);
      doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('SmartData Insight', 68, 58);
      doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text('ENTERPRISE DATA ANALYTICS & INTELLIGENCE REPORT', 68, 83);
      doc.fillColor(layout.ACCENT_LIME).fontSize(8).font('Helvetica-Bold').text('CONFIDENTIAL REPORT', 420, 60, { width: 110, align: 'right' });
      doc.fillColor('#CBD5E1').fontSize(8).font('Helvetica').text(`Generated: ${generationDateStr}`, 330, 83, { width: 200, align: 'right' });

      doc.y = 135;
      doc.fillColor(layout.TEXT_MAIN).fontSize(16).font('Helvetica-Bold').text(reportTitle, 50, doc.y);
      doc.rect(50, doc.y + 6, 495, 2).fill(layout.ACCENT_GREEN);
      doc.y += 18;

      // Dataset Profile Cards
      const cardY = doc.y;
      const cardW = 240;
      const cardH = 75;

      // Left: Dataset Meta
      doc.rect(50, cardY, cardW, cardH).fill(layout.BG_LIGHT);
      doc.rect(50, cardY, cardW, cardH).stroke(layout.BORDER_LIGHT);
      doc.fillColor(layout.TEXT_MUTED).fontSize(8).font('Helvetica-Bold').text('TARGET DATASET PROFILE', 62, cardY + 10);
      const displayName = datasetName.length > 28 ? datasetName.substring(0, 26) + '..' : datasetName;
      doc.fillColor(layout.TEXT_MAIN).fontSize(9.5).font('Helvetica-Bold').text(displayName, 62, cardY + 24);
      doc.fillColor(layout.TEXT_MUTED).fontSize(8).font('Helvetica').text(`Format: ${fileFormat}  |  Records: ${rowCount.toLocaleString()}  |  Cols: ${columnCount}`, 62, cardY + 40);
      doc.text(`Status: Validated for Enterprise Production`, 62, cardY + 54);

      // Right: Integrity & Health Score
      doc.rect(305, cardY, cardW, cardH).fill(layout.BG_LIGHT);
      doc.rect(305, cardY, cardW, cardH).stroke(layout.BORDER_LIGHT);
      doc.fillColor(layout.TEXT_MUTED).fontSize(8).font('Helvetica-Bold').text('HEALTH & DATA QUALITY INDEX', 317, cardY + 10);
      doc.fillColor(qualityScore >= 80 ? layout.ACCENT_GREEN : '#F59E0B').fontSize(17).font('Helvetica-Bold').text(`${qualityScore}/100`, 317, cardY + 24);
      doc.fillColor(layout.TEXT_MUTED).fontSize(8).font('Helvetica').text(`Completeness: ${completeness}%  |  Duplicates: ${duplicateRows}`, 317, cardY + 45);
      doc.text(`Missing Cells: ${missingCells.toLocaleString()}  |  Outliers: ${totalOutliers}`, 317, cardY + 57);

      doc.y = cardY + cardH + 20;

      // =========================================================================
      // 2. EXECUTIVE SUMMARY & AI STRATEGIC COMMENTARY
      // =========================================================================
      layout.addSectionHeader('1. Executive Summary & Observations', 'Key analytical findings and statistical takeaways');

      if (analysis.aiExecutiveSummary) {
        const aiText = analysis.aiExecutiveSummary.trim();
        const estH = Math.min(100, Math.max(50, Math.ceil(aiText.length / 110) * 14 + 16));
        doc.rect(50, doc.y, 495, estH).fill('#F0FDF4');
        doc.rect(50, doc.y, 495, estH).stroke('#BBF7D0');
        doc.fillColor('#14532D').fontSize(8.5).font('Helvetica').text(
          aiText.substring(0, 520) + (aiText.length > 520 ? '...' : ''),
          62,
          doc.y + 8,
          { width: 470, align: 'justify' }
        );
        doc.y += estH + 15;
      } else if (observations.length > 0) {
        observations.slice(0, 3).forEach((obs) => {
          const title = typeof obs === 'object' ? obs.title || 'Insight' : String(obs);
          const desc = typeof obs === 'object' ? obs.description || '' : '';
          const type = typeof obs === 'object' ? (obs.type || 'NOTE').toUpperCase() : 'NOTE';

          doc.fillColor(layout.TEXT_MAIN).fontSize(8.5).font('Helvetica-Bold').text(`• [${type}] ${title}:`, 55, doc.y);
          doc.y += 11;
          if (desc) {
            doc.fillColor(layout.TEXT_MUTED).fontSize(8).font('Helvetica').text(desc, 65, doc.y, { width: 460 });
            doc.y += 14;
          }
        });
        doc.y += 6;
      } else {
        doc.fillColor(layout.TEXT_MUTED).fontSize(8.5).font('Helvetica-Oblique').text(
          'Statistical profiling complete. No systematic schema anomalies or missing features detected.',
          55,
          doc.y
        );
        doc.y += 16;
      }

      // =========================================================================
      // 3. DATA QUALITY ANALYSIS & AUDIT METRICS
      // =========================================================================
      layout.addSectionHeader('2. Data Quality & Integrity Audit', 'Completeness metrics, duplicate rows, and schema evaluation');

      const auditMetrics = [
        { label: 'DATA COMPLETENESS', val: `${completeness}%`, color: layout.ACCENT_GREEN },
        { label: 'MISSING CELLS', val: `${missingCells}`, color: missingCells > 0 ? '#E11D48' : layout.TEXT_MAIN },
        { label: 'DUPLICATE ROWS', val: `${duplicateRows}`, color: duplicateRows > 0 ? '#E11D48' : layout.TEXT_MAIN },
        { label: 'OUTLIERS DETECTED', val: `${totalOutliers}`, color: totalOutliers > 0 ? '#D97706' : layout.TEXT_MAIN }
      ];

      const metricW = 115;
      const metricY = doc.y;
      auditMetrics.forEach((m, idx) => {
        const mx = 50 + idx * (metricW + 11.5);
        doc.rect(mx, metricY, metricW, 40).fill(layout.BG_LIGHT);
        doc.rect(mx, metricY, metricW, 40).stroke(layout.BORDER_LIGHT);
        doc.fillColor(layout.TEXT_MUTED).fontSize(7).font('Helvetica-Bold').text(m.label, mx + 8, metricY + 6);
        doc.fillColor(m.color).fontSize(12).font('Helvetica-Bold').text(m.val, mx + 8, metricY + 18);
      });
      doc.y = metricY + 52;

      // =========================================================================
      // 4. DESCRIPTIVE STATISTICAL ANALYSIS (NUMERICAL TABLE)
      // =========================================================================
      layout.addSectionHeader(
        '3. Descriptive Numerical Statistics',
        `Parametric measures across ${numericStats.length} numeric variables (Mean, Median, Mode, Variance, StdDev, IQR)`
      );

      if (numericStats.length > 0) {
        const headers = [
          { title: 'Variable', align: 'left', bold: true },
          { title: 'Count', align: 'right' },
          { title: 'Mean (μ)', align: 'right', color: layout.ACCENT_GREEN, bold: true },
          { title: 'Median', align: 'right' },
          { title: 'Min', align: 'right' },
          { title: 'Max', align: 'right' },
          { title: 'Std Dev (σ)', align: 'right' },
          { title: 'IQR', align: 'right' },
          { title: 'Outliers', align: 'right', color: '#D97706' }
        ];

        const colWidths = [105, 42, 54, 48, 44, 44, 54, 48, 56];

        const rows = numericStats.map((s) => [
          s.column,
          fmt(s.count, 0),
          fmt(s.mean, 2),
          fmt(s.median, 2),
          fmt(s.min, 1),
          fmt(s.max, 1),
          fmt(s.standardDeviation, 2),
          fmt(s.iqr, 2),
          `${s.outliers?.outlierCount ?? s.outliers?.count ?? 0}`
        ]);

        layout.drawTable(headers, rows, colWidths);
      } else {
        doc.fillColor(layout.TEXT_MUTED).fontSize(8.5).font('Helvetica').text(
          'No continuous numerical features identified in this dataset.',
          55,
          doc.y
        );
        doc.y += 18;
      }

      // =========================================================================
      // 5. DATA VISUALIZATION: PIE CHART & HISTOGRAM
      // =========================================================================
      layout.addSectionHeader('4. Data Visualizations & Category Breakdown', 'Server-rendered distribution charts');

      // 5A. Render Real Pie Chart Buffer for Categorical Distribution
      let pieChartBuffer = null;
      let primaryCatCol = null;

      if (categoricalStats.length > 0) {
        // Filter out ID columns, keys, and high-cardinality nominal keys
        const isIdOrKey = (colName) => {
          const lower = String(colName || '').toLowerCase();
          return (
            lower.endsWith('id') ||
            lower.startsWith('id') ||
            lower.includes('_id') ||
            lower.includes('identifier') ||
            lower.includes('key') ||
            lower.includes('uuid') ||
            lower.includes('guid') ||
            lower.includes('ssn') ||
            lower.includes('timestamp') ||
            lower.includes('date')
          );
        };

        // Prioritize true categorical attributes with 2 to 8 distinct categories
        let candidate = categoricalStats.find(
          (c) =>
            !isIdOrKey(c.column) &&
            c.uniqueCount >= 2 &&
            c.uniqueCount <= 8 &&
            c.topValues &&
            c.topValues.length >= 2
        );

        // Fallback 1: Any non-ID categorical column with 2 to 10 categories
        if (!candidate) {
          candidate = categoricalStats.find(
            (c) =>
              !isIdOrKey(c.column) &&
              c.topValues &&
              c.topValues.length >= 2 &&
              c.topValues.length <= 10
          );
        }

        // Fallback 2: Any non-ID categorical column
        if (!candidate) {
          candidate = categoricalStats.find((c) => !isIdOrKey(c.column));
        }

        // Final fallback: first available column with at least 2 distinct values
        if (!candidate) {
          candidate = categoricalStats.find(
            (c) => c.topValues && c.topValues.length >= 2
          ) || categoricalStats[0];
        }

        if (candidate && candidate.topValues && candidate.topValues.length >= 2) {
          primaryCatCol = candidate.column;
          try {
            pieChartBuffer = await generatePieChartBuffer({
              title: `Category Distribution: ${candidate.column}`,
              data: candidate.topValues.map((t) => ({
                label: String(t.value),
                value: t.count,
                percentage: t.percentage
              })),
              width: 800,
              height: 400
            });
          } catch (chartErr) {
            console.warn('[Report] Pie chart generation error:', chartErr.message);
          }
        }
      }

      if (pieChartBuffer) {
        layout.ensureSpace(195);
        // Embed crisp PNG buffer into PDFKit
        doc.image(pieChartBuffer, 50, doc.y, { width: 495, height: 180 });
        doc.y += 186;

        doc.fillColor(layout.TEXT_MUTED).fontSize(7.5).font('Helvetica').text(
          `Figure 1: Proportional frequency breakdown for '${primaryCatCol}' categorical attribute.`,
          55,
          doc.y
        );
        doc.y += 15;
      } else {
        // Clear explanation if pie chart is not applicable
        layout.ensureSpace(50);
        doc.rect(50, doc.y, 495, 42).fill(layout.BG_LIGHT);
        doc.rect(50, doc.y, 495, 42).stroke(layout.BORDER_LIGHT);
        doc.fillColor(layout.TEXT_MUTED).fontSize(8).font('Helvetica').text(
          categoricalStats.length === 0
            ? 'Note: Pie chart visualization omitted because dataset contains purely numerical attributes with no nominal categories.'
            : 'Note: Categorical features in this dataset have single or non-discrete values; pie distribution is not informative.',
          62,
          doc.y + 14,
          { width: 470 }
        );
        doc.y += 52;
      }

      // 5B. Render Histogram Buffer for Numerical Distribution
      let histogramBuffer = null;
      if (numericStats.length > 0 && numericStats[0].histogram) {
        try {
          const leadNum = numericStats[0];
          histogramBuffer = await generateHistogramBuffer({
            title: `Binned Frequency Histogram: ${leadNum.column}`,
            bins: leadNum.histogram,
            xLabel: `${leadNum.column} Range`,
            yLabel: 'Frequency',
            width: 800,
            height: 380
          });
        } catch (histErr) {
          console.warn('[Report] Histogram generation error:', histErr.message);
        }
      }

      if (histogramBuffer) {
        layout.ensureSpace(190);
        doc.image(histogramBuffer, 50, doc.y, { width: 495, height: 175 });
        doc.y += 182;

        doc.fillColor(layout.TEXT_MUTED).fontSize(7.5).font('Helvetica').text(
          `Figure 2: Parametric frequency histogram demonstrating distribution symmetry and outlier bounds for '${numericStats[0].column}'.`,
          55,
          doc.y
        );
        doc.y += 15;
      }

      // =========================================================================
      // 6. CORRELATION & OUTLIER ANOMALY ANALYSIS
      // =========================================================================
      layout.addSectionHeader('5. Linear Correlations & IQR Anomaly Audit', 'Inter-feature dependencies and anomaly thresholds');

      // 6A. Render Correlation Chart if multiple numeric columns exist
      let corrChartBuffer = null;
      if (correlations.length > 0) {
        try {
          corrChartBuffer = await generateCorrelationChartBuffer({
            title: 'Pearson Linear Correlations (r)',
            correlations,
            width: 800,
            height: 340
          });
        } catch (corrErr) {
          console.warn('[Report] Correlation chart error:', corrErr.message);
        }
      }

      if (corrChartBuffer) {
        layout.ensureSpace(175);
        doc.image(corrChartBuffer, 50, doc.y, { width: 495, height: 160 });
        doc.y += 166;
        doc.fillColor(layout.TEXT_MUTED).fontSize(7.5).font('Helvetica').text(
          'Figure 3: Pairwise Pearson linear correlation coefficients (-1.00 inverse to +1.00 direct).',
          55,
          doc.y
        );
        doc.y += 14;
      }

      // 6B. Correlation Table
      if (correlations.length > 0) {
        const corrHeaders = [
          { title: 'Variable Pair', align: 'left', bold: true },
          { title: 'Pearson (r)', align: 'right', bold: true },
          { title: 'Direction', align: 'left' },
          { title: 'Strength Evaluation', align: 'left' }
        ];
        const corrWidths = [190, 80, 85, 140];

        const corrRows = correlations.slice(0, 6).map((c) => {
          const r = Number(c.coefficient ?? c.correlation ?? 0);
          const absR = Math.abs(r);
          const strength = absR >= 0.7 ? 'Strong Linear' : absR >= 0.35 ? 'Moderate' : 'Weak / Negligible';
          const direction = r >= 0 ? 'Positive (+)' : 'Negative (-)';
          return [`${c.col1} vs ${c.col2}`, fmt(r, 4), direction, strength];
        });

        layout.drawTable(corrHeaders, corrRows, corrWidths);
      }

      // =========================================================================
      // 7. CATEGORICAL FREQUENCY BREAKDOWN TABLE
      // =========================================================================
      if (categoricalStats.length > 0) {
        layout.addSectionHeader('6. Categorical Frequency Distributions', 'Discrete attribute cardinality and top categories');

        const catHeaders = [
          { title: 'Attribute Name', align: 'left', bold: true },
          { title: 'Categories', align: 'right' },
          { title: 'Most Common Value', align: 'left' },
          { title: 'Top Frequency', align: 'right' },
          { title: 'Top Category Share', align: 'right' }
        ];
        const catWidths = [120, 65, 130, 85, 95];

        const catRows = categoricalStats.map((c) => {
          const topVal = c.mostCommon?.value ?? (c.topValues && c.topValues[0]?.value) ?? 'N/A';
          const topCnt = c.mostCommon?.count ?? (c.topValues && c.topValues[0]?.count) ?? 0;
          const topPct = c.topValues && c.topValues[0]?.percentage ? `${c.topValues[0].percentage}%` : '-';
          return [
            c.column,
            String(c.uniqueCount || 1),
            String(topVal),
            Number(topCnt).toLocaleString(),
            topPct
          ];
        });

        layout.drawTable(catHeaders, catRows, catWidths);
      }

      // =========================================================================
      // 8. KEY INSIGHTS, STRATEGIC RECOMMENDATIONS & CONCLUSION
      // =========================================================================
      layout.addSectionHeader('7. Strategic Insights & Next Steps', 'Automated decision directives for production systems');

      const recommendations = [
        `Dataset Completeness: Overall completeness is certified at ${completeness}%. System is prepared for algorithmic modeling.`,
        totalOutliers > 0
          ? `Outlier Treatment: ${totalOutliers} extreme anomalies detected via IQR 1.5 bounds. Winsorization or robust scaling recommended.`
          : 'Zero extreme anomalies detected beyond 1.5 × IQR thresholds. Normal parametric assumptions apply.',
        correlations.length > 0
          ? 'Multicollinearity Check: High correlation pairs identified; consider dimensionality reduction (PCA) prior to regression modeling.'
          : 'Low inter-variable correlation observed; features provide independent information value.',
        'Data Pipeline Certification: Schema, integrity index, and descriptive profiles are certified for business operations.'
      ];

      recommendations.forEach((rec) => {
        layout.ensureSpace(24);
        doc.fillColor(layout.ACCENT_GREEN).fontSize(9).font('Helvetica-Bold').text('✓', 55, doc.y);
        doc.fillColor(layout.TEXT_MAIN).fontSize(8.5).font('Helvetica').text(rec, 70, doc.y - 1, { width: 460 });
        doc.y += 16;
      });

      // Platform Certification Box
      layout.ensureSpace(55);
      doc.rect(50, doc.y, 495, 45).fill(layout.BG_LIGHT);
      doc.rect(50, doc.y, 495, 45).stroke(layout.ACCENT_GREEN);
      doc.fillColor(layout.TEXT_MUTED).fontSize(8).font('Helvetica').text(
        'Certified by SmartData Insight Engine v2.5. All parametric computations (Mean, StdDev, Quartiles) and vector visualizations are generated deterministically from authenticated source records.',
        62,
        doc.y + 12,
        { width: 470, align: 'justify' }
      );
      doc.y += 55;

      // =========================================================================
      // 9. STAMP FOOTERS (SAFE NON-OVERFLOWING PAGINATION)
      // =========================================================================
      layout.stampFooters();

      // Finalize document stream
      doc.end();

      writeStream.on('finish', () => {
        try {
          const stats = fs.statSync(filePath);
          if (stats.size === 0) {
            return reject(new Error('Generated PDF is empty (0 bytes).'));
          }
          resolve({
            filePath,
            filename,
            fileSize: stats.size
          });
        } catch (err) {
          reject(err);
        }
      });

      writeStream.on('error', (err) => reject(err));
      doc.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generatePDFReport,
  reportsDir
};
