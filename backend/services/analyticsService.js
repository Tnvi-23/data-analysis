const { isMissing, calculateMode } = require('./dataCleaningService');

/**
 * Safely parse a number; returns null if invalid or blank
 */
const safeNumber = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) || !isFinite(num) ? null : num;
};

/**
 * Calculate percentile from sorted numeric array using standard linear interpolation
 */
const getPercentile = (sorted, p) => {
  if (!sorted || sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return Number((sorted[lower] * (1 - weight) + sorted[upper] * weight).toFixed(4));
};

/**
 * Calculate Pearson correlation coefficient between two numeric arrays
 */
const calculateCorrelation = (xArr, yArr) => {
  const n = xArr.length;
  if (n < 2) return 0;

  const sumX = xArr.reduce((a, b) => a + b, 0);
  const sumY = yArr.reduce((a, b) => a + b, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = xArr[i] - meanX;
    const diffY = yArr[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  const r = numerator / denominator;
  return isNaN(r) || !isFinite(r) ? 0 : Number(r.toFixed(4));
};

/**
 * Generate histogram bins for a numeric array
 */
const generateHistogram = (numbers, numBins = 7) => {
  if (!numbers || numbers.length === 0) return [];

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  if (min === max) {
    return [
      {
        binStart: min,
        binEnd: max,
        count: numbers.length,
        label: `${min}`,
        name: `${min}`,
        range: `${min}`
      }
    ];
  }

  const binWidth = (max - min) / numBins;
  const bins = [];

  for (let i = 0; i < numBins; i++) {
    const bStart = min + i * binWidth;
    const bEnd = i === numBins - 1 ? max : bStart + binWidth;
    const label = `${bStart.toFixed(1)} - ${bEnd.toFixed(1)}`;
    bins.push({
      binStart: Number(bStart.toFixed(2)),
      binEnd: Number(bEnd.toFixed(2)),
      count: 0,
      label,
      name: label,
      range: label
    });
  }

  for (const val of numbers) {
    let placed = false;
    for (let i = 0; i < bins.length; i++) {
      if (i === bins.length - 1) {
        if (val >= bins[i].binStart && val <= bins[i].binEnd) {
          bins[i].count++;
          placed = true;
          break;
        }
      } else {
        if (val >= bins[i].binStart && val < bins[i].binEnd) {
          bins[i].count++;
          placed = true;
          break;
        }
      }
    }
    if (!placed && bins.length > 0) {
      bins[bins.length - 1].count++;
    }
  }

  return bins;
};

/**
 * Detect outliers using Interquartile Range (IQR 1.5) method
 */
const detectOutliers = (sortedNumbers, q1, q3, iqr) => {
  const lowerBound = Number((q1 - 1.5 * iqr).toFixed(4));
  const upperBound = Number((q3 + 1.5 * iqr).toFixed(4));

  const outliers = sortedNumbers.filter((n) => n < lowerBound || n > upperBound);

  return {
    lowerBound,
    upperBound,
    outlierCount: outliers.length,
    count: outliers.length,
    outlierPercentage: Number(((outliers.length / (sortedNumbers.length || 1)) * 100).toFixed(2)),
    percentage: Number(((outliers.length / (sortedNumbers.length || 1)) * 100).toFixed(2)),
    sampleOutliers: outliers.slice(0, 8)
  };
};

/**
 * Perform comprehensive descriptive and statistical analysis on dataset rows
 */
const analyzeDatasetRows = (rows, columnsMetadata = []) => {
  const rowCount = rows.length;
  if (rowCount === 0) {
    throw new Error('Cannot analyze empty dataset.');
  }

  // Derive column list if metadata is not provided
  let columns = columnsMetadata;
  if (!columns || columns.length === 0) {
    columns = Object.keys(rows[0] || {}).map((name) => ({ name, dataType: 'string' }));
  }

  const columnCount = columns.length;
  const totalCells = rowCount * columnCount;
  let totalMissingCells = 0;

  // Track duplicate rows
  const seenRows = new Set();
  let duplicateRows = 0;
  for (const r of rows) {
    const k = JSON.stringify(r);
    if (seenRows.has(k)) duplicateRows++;
    else seenRows.add(k);
  }

  const numericStats = [];
  const categoricalStats = [];
  const numericColumnsMap = {};
  let totalDetectedOutliers = 0;

  for (const col of columns) {
    const colName = col.name;
    const rawValues = rows.map((r) => r[colName]);
    const validNumeric = [];
    const categoricalValues = [];
    let missingInCol = 0;

    for (const val of rawValues) {
      if (isMissing(val)) {
        missingInCol++;
        totalMissingCells++;
      } else {
        const num = safeNumber(val);
        if (num !== null) {
          validNumeric.push(num);
        }
        categoricalValues.push(String(val).trim());
      }
    }

    // Classify as numeric if explicitly marked or >= 70% of non-missing values are numbers
    const nonMissingCount = rawValues.length - missingInCol;
    const isNumericCol =
      col.dataType === 'number' ||
      (nonMissingCount > 0 && validNumeric.length / nonMissingCount >= 0.7);

    if (isNumericCol && validNumeric.length > 0) {
      numericColumnsMap[colName] = rows.map((r) => safeNumber(r[colName]));

      const sorted = [...validNumeric].sort((a, b) => a - b);
      const count = sorted.length;
      const sum = Number(sorted.reduce((a, b) => a + b, 0).toFixed(4));
      const mean = Number((sum / count).toFixed(4));
      const median = getPercentile(sorted, 0.5);
      const mode = calculateMode(sorted);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const range = Number((max - min).toFixed(4));
      const q1 = getPercentile(sorted, 0.25);
      const q3 = getPercentile(sorted, 0.75);
      const iqr = Number((q3 - q1).toFixed(4));

      // Sample variance & standard deviation
      const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count > 1 ? count - 1 : 1);
      const standardDeviation = Number(Math.sqrt(variance).toFixed(4));
      const varianceFormatted = Number(variance.toFixed(4));

      // Outlier detection via IQR 1.5
      const outlierReport = detectOutliers(sorted, q1, q3, iqr);
      totalDetectedOutliers += outlierReport.outlierCount;

      const histogram = generateHistogram(sorted, 7);

      numericStats.push({
        column: colName,
        count,
        missing: missingInCol,
        sum,
        mean,
        median,
        mode,
        standardDeviation,
        variance: varianceFormatted,
        min,
        max,
        range,
        q1,
        q3,
        iqr,
        outliers: outlierReport,
        histogram
      });
    } else {
      // Categorical statistics
      const frequencyMap = {};
      for (const val of categoricalValues) {
        frequencyMap[val] = (frequencyMap[val] || 0) + 1;
      }

      const uniqueKeys = Object.keys(frequencyMap);
      const sortedKeys = uniqueKeys.sort((a, b) => frequencyMap[b] - frequencyMap[a]);

      const topValues = sortedKeys
        .map((k) => ({
          value: k,
          count: frequencyMap[k],
          percentage: Number(((frequencyMap[k] / (categoricalValues.length || 1)) * 100).toFixed(2))
        }))
        .slice(0, 10);

      const mostCommon =
        sortedKeys.length > 0 ? { value: sortedKeys[0], count: frequencyMap[sortedKeys[0]] } : null;
      const leastCommon =
        sortedKeys.length > 0
          ? { value: sortedKeys[sortedKeys.length - 1], count: frequencyMap[sortedKeys[sortedKeys.length - 1]] }
          : null;

      categoricalStats.push({
        column: colName,
        totalCount: categoricalValues.length,
        uniqueCount: uniqueKeys.length,
        missing: missingInCol,
        mostCommon,
        leastCommon,
        topValues
      });
    }
  }

  // Calculate correlations between all numeric column pairs
  const numColNames = Object.keys(numericColumnsMap);
  const correlations = [];

  for (let i = 0; i < numColNames.length; i++) {
    for (let j = i + 1; j < numColNames.length; j++) {
      const col1 = numColNames[i];
      const col2 = numColNames[j];

      const xClean = [];
      const yClean = [];
      for (let k = 0; k < rowCount; k++) {
        const x = numericColumnsMap[col1][k];
        const y = numericColumnsMap[col2][k];
        if (x !== null && y !== null) {
          xClean.push(x);
          yClean.push(y);
        }
      }

      if (xClean.length >= 3) {
        const coefficient = calculateCorrelation(xClean, yClean);
        correlations.push({
          col1,
          col2,
          coefficient,
          correlation: coefficient
        });
      }
    }
  }

  const completionRate =
    totalCells > 0 ? Number((((totalCells - totalMissingCells) / totalCells) * 100).toFixed(2)) : 100;

  // Chart-ready summaries
  const chartSummaries = {
    histograms: numericStats.map((n) => ({
      column: n.column,
      data: n.histogram.map((b) => ({
        name: b.label,
        range: b.label,
        count: b.count
      }))
    })),
    categoricalDistributions: categoricalStats.map((c) => ({
      column: c.column,
      data: c.topValues.map((t) => ({
        name: String(t.value),
        label: String(t.value),
        value: t.count,
        count: t.count,
        percentage: t.percentage
      }))
    })),
    correlations: correlations.map((c) => ({
      pair: `${c.col1} vs ${c.col2}`,
      coefficient: c.coefficient,
      correlation: c.coefficient
    }))
  };

  // Automated analytical observations / insights
  const observations = [];

  // Outlier observations
  numericStats.forEach((n) => {
    if (n.outliers && n.outliers.outlierCount > 0) {
      observations.push({
        type: 'anomaly',
        title: `Outliers detected in ${n.column}`,
        description: `Found ${n.outliers.outlierCount} outlier records outside IQR bounds [${n.outliers.lowerBound}, ${n.outliers.upperBound}] (e.g. ${n.outliers.sampleOutliers.slice(0, 3).join(', ')}).`,
        column: n.column,
        impact: n.outliers.outlierPercentage > 5 ? 'high' : 'medium'
      });
    }
  });

  // Correlation observations
  correlations
    .filter((c) => Math.abs(c.coefficient) >= 0.6)
    .sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))
    .slice(0, 5)
    .forEach((c) => {
      const strength = Math.abs(c.coefficient) >= 0.8 ? 'Strong' : 'Moderate';
      const direction = c.coefficient > 0 ? 'positive' : 'negative';
      observations.push({
        type: 'correlation',
        title: `${strength} correlation: ${c.col1} & ${c.col2}`,
        description: `Attributes exhibit a ${direction} linear relationship (Pearson r = ${c.coefficient}).`,
        column: `${c.col1}, ${c.col2}`,
        impact: 'high'
      });
    });

  // Missing data observations
  if (totalMissingCells > 0) {
    const worstCol = [...numericStats, ...categoricalStats]
      .filter((s) => s.missing > 0)
      .sort((a, b) => b.missing - a.missing)[0];

    if (worstCol) {
      observations.push({
        type: 'quality',
        title: `Missing values in ${worstCol.column}`,
        description: `Attribute contains ${worstCol.missing} null entries (${((worstCol.missing / rowCount) * 100).toFixed(1)}% of rows). Imputation recommended.`,
        column: worstCol.column,
        impact: 'medium'
      });
    }
  }

  // Dominant categorical frequencies
  categoricalStats.forEach((c) => {
    if (c.topValues.length > 0 && c.topValues[0].percentage > 50) {
      observations.push({
        type: 'distribution',
        title: `Dominant category in ${c.column}`,
        description: `Category "${c.topValues[0].value}" accounts for ${c.topValues[0].percentage}% of records (${c.topValues[0].count} rows).`,
        column: c.column,
        impact: 'low'
      });
    }
  });

  return {
    overview: {
      rowCount,
      columnCount,
      totalMissingCells,
      duplicateRows,
      dataCompletenessPercentage: completionRate,
      totalOutliers: totalDetectedOutliers
    },
    numericStats,
    categoricalStats,
    correlations,
    chartSummaries,
    observations
  };
};

module.exports = {
  analyzeDatasetRows,
  calculateCorrelation,
  generateHistogram,
  detectOutliers,
  safeNumber
};
