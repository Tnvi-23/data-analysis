const { inferDataType } = require('./fileProcessingService');

/**
 * Calculate mean of numeric array
 */
const calculateMean = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return Number((sum / numbers.length).toFixed(4));
};

/**
 * Calculate median of numeric array
 */
const calculateMedian = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(4));
};

/**
 * Calculate mode (most frequent value) of array
 */
const calculateMode = (values) => {
  if (!values || values.length === 0) return null;
  const counts = {};
  let maxCount = 0;
  let mode = values[0];
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
    if (counts[v] > maxCount) {
      maxCount = counts[v];
      mode = v;
    }
  }
  return mode;
};

/**
 * Check if a cell value is considered missing
 */
const isMissing = (val) => {
  return (
    val === null ||
    val === undefined ||
    val === '' ||
    val === 'NA' ||
    val === 'N/A' ||
    val === 'null' ||
    val === 'undefined' ||
    val === 'NaN'
  );
};

/**
 * Calculate comprehensive Data Quality Score (0–100) and actionable recommendations
 */
const calculateQualityScore = ({ totalRows, columnCount, totalMissingCells, duplicateRowCount, missingByColumn }) => {
  const totalCells = totalRows * (columnCount || 1);
  if (totalCells === 0) return { score: 100, grade: 'A', recommendations: [] };

  const missingPct = (totalMissingCells / totalCells) * 100;
  const duplicatePct = totalRows > 0 ? (duplicateRowCount / totalRows) * 100 : 0;

  // Penalties
  const missingPenalty = Math.min(45, missingPct * 1.5);
  const duplicatePenalty = Math.min(35, duplicatePct * 2.0);

  const rawScore = 100 - missingPenalty - duplicatePenalty;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let grade = 'A';
  if (score < 50) grade = 'D';
  else if (score < 70) grade = 'C';
  else if (score < 85) grade = 'B';

  const recommendations = [];

  if (duplicateRowCount > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Remove Duplicate Records',
      description: `Detected ${duplicateRowCount} duplicate row(s) (${duplicatePct.toFixed(1)}% of dataset). Dropping duplicates will prevent model bias.`
    });
  }

  if (totalMissingCells > 0) {
    const highMissingCols = Object.entries(missingByColumn)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([col, count]) => `${col} (${count})`);

    recommendations.push({
      priority: 'high',
      title: 'Impute Missing Values',
      description: `Detected ${totalMissingCells} missing cell(s) across columns: ${highMissingCols.slice(0, 3).join(', ')}. Use median or mean imputation for numeric features.`
    });
  }

  if (duplicateRowCount === 0 && totalMissingCells === 0) {
    recommendations.push({
      priority: 'low',
      title: 'Dataset Integrity Verified',
      description: 'Zero duplicates or empty cells detected. Schema completeness is optimal for descriptive modeling and visualization.'
    });
  }

  return {
    score,
    grade,
    metrics: {
      completenessPercentage: Number((100 - missingPct).toFixed(1)),
      duplicatePercentage: Number(duplicatePct.toFixed(1)),
      totalMissingCells,
      duplicateRowCount
    },
    recommendations
  };
};

/**
 * Audit dataset for anomalies: missing values, duplicates, and column metrics
 */
const auditDataset = (rows, columnNames) => {
  const totalRows = rows.length;
  const missingByColumn = {};
  const uniqueCountByColumn = {};
  let totalMissingCells = 0;

  for (const col of columnNames) {
    missingByColumn[col] = 0;
    uniqueCountByColumn[col] = new Set();
  }

  const seenRows = new Set();
  let duplicateRowCount = 0;

  for (let i = 0; i < totalRows; i++) {
    const row = rows[i];
    const rowKey = JSON.stringify(row);

    if (seenRows.has(rowKey)) {
      duplicateRowCount++;
    } else {
      seenRows.add(rowKey);
    }

    for (const col of columnNames) {
      const val = row[col];
      if (isMissing(val)) {
        missingByColumn[col]++;
        totalMissingCells++;
      } else {
        uniqueCountByColumn[col].add(String(val).trim());
      }
    }
  }

  const formattedUniques = {};
  for (const col of columnNames) {
    formattedUniques[col] = uniqueCountByColumn[col].size;
  }

  const quality = calculateQualityScore({
    totalRows,
    columnCount: columnNames.length,
    totalMissingCells,
    duplicateRowCount,
    missingByColumn
  });

  return {
    totalRows,
    duplicateRowCount,
    totalMissingCells,
    missingByColumn,
    uniqueCountByColumn: formattedUniques,
    qualityScore: quality.score,
    qualityGrade: quality.grade,
    qualityMetrics: quality.metrics,
    recommendations: quality.recommendations
  };
};

/**
 * Execute cleaning pipeline based on requested operations
 */
const cleanData = (originalRows, operations = {}) => {
  let rows = JSON.parse(JSON.stringify(originalRows));
  const beforeRowCount = rows.length;
  const actionsApplied = [];
  let valuesModifiedCount = 0;

  // Step 1: Remove duplicates
  if (operations.removeDuplicates) {
    const seen = new Set();
    const uniqueRows = [];
    for (const row of rows) {
      const key = JSON.stringify(row);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRows.push(row);
      }
    }
    const removedDups = rows.length - uniqueRows.length;
    rows = uniqueRows;
    if (removedDups > 0) {
      actionsApplied.push({
        action: 'remove_duplicates',
        description: `Removed ${removedDups} duplicate row(s)`,
        affectedRows: removedDups,
        affectedColumns: []
      });
    }
  }

  // Step 2: Drop unwanted columns
  if (Array.isArray(operations.dropColumns) && operations.dropColumns.length > 0) {
    const colsToDrop = new Set(operations.dropColumns);
    for (const row of rows) {
      for (const col of colsToDrop) {
        delete row[col];
      }
    }
    actionsApplied.push({
      action: 'drop_columns',
      description: `Dropped columns: ${operations.dropColumns.join(', ')}`,
      affectedRows: 0,
      affectedColumns: operations.dropColumns
    });
  }

  // Step 3: Rename columns
  if (Array.isArray(operations.renameColumns) && operations.renameColumns.length > 0) {
    const renameList = [];
    for (const item of operations.renameColumns) {
      const { from, to } = item;
      if (from && to && from !== to) {
        renameList.push(`${from} → ${to}`);
        for (const row of rows) {
          if (row[from] !== undefined) {
            row[to] = row[from];
            delete row[from];
          }
        }
      }
    }
    if (renameList.length > 0) {
      actionsApplied.push({
        action: 'rename_columns',
        description: `Renamed columns: ${renameList.join(', ')}`,
        affectedRows: rows.length,
        affectedColumns: operations.renameColumns.map((r) => r.from)
      });
    }
  }

  // Step 4: Handle missing values
  if (operations.handleMissing && operations.handleMissing.strategy) {
    const { strategy, columns: targetCols = [], customValue = null } = operations.handleMissing;
    const currentCols = Object.keys(rows[0] || {});
    const colsToProcess =
      targetCols.length > 0
        ? targetCols.filter((c) => currentCols.includes(c))
        : currentCols;

    if (strategy === 'drop_rows') {
      const initialCount = rows.length;
      rows = rows.filter((row) => {
        return !colsToProcess.some((col) => isMissing(row[col]));
      });
      const droppedCount = initialCount - rows.length;
      actionsApplied.push({
        action: 'drop_missing_rows',
        description: `Dropped ${droppedCount} row(s) containing missing values in columns: ${colsToProcess.join(', ')}`,
        affectedRows: droppedCount,
        affectedColumns: colsToProcess
      });
    } else if (['fill_mean', 'fill_median', 'fill_mode', 'fill_custom'].includes(strategy)) {
      let filledCells = 0;

      for (const col of colsToProcess) {
        const validValues = [];
        for (const row of rows) {
          if (!isMissing(row[col])) {
            validValues.push(row[col]);
          }
        }

        let replacementValue = customValue;

        if (strategy === 'fill_mean') {
          const numValues = validValues.map(Number).filter((n) => !isNaN(n));
          replacementValue = calculateMean(numValues);
        } else if (strategy === 'fill_median') {
          const numValues = validValues.map(Number).filter((n) => !isNaN(n));
          replacementValue = calculateMedian(numValues);
        } else if (strategy === 'fill_mode') {
          replacementValue = calculateMode(validValues);
        }

        if (replacementValue !== undefined) {
          for (const row of rows) {
            if (isMissing(row[col])) {
              row[col] = replacementValue;
              filledCells++;
              valuesModifiedCount++;
            }
          }
        }
      }

      actionsApplied.push({
        action: strategy,
        description: `Filled missing values using ${strategy} across columns: ${colsToProcess.join(', ')} (cells affected: ${filledCells})`,
        affectedRows: filledCells,
        affectedColumns: colsToProcess
      });
    }
  }

  // Step 5: Filter rows
  if (Array.isArray(operations.filterRows) && operations.filterRows.length > 0) {
    const startCount = rows.length;
    for (const filter of operations.filterRows) {
      const { column, operator, value } = filter;
      if (!column || !operator) continue;

      rows = rows.filter((row) => {
        const cell = row[column];
        if (operator === 'eq') return String(cell) === String(value);
        if (operator === 'neq') return String(cell) !== String(value);
        if (operator === 'gt') return Number(cell) > Number(value);
        if (operator === 'gte') return Number(cell) >= Number(value);
        if (operator === 'lt') return Number(cell) < Number(value);
        if (operator === 'lte') return Number(cell) <= Number(value);
        if (operator === 'contains') return String(cell).toLowerCase().includes(String(value).toLowerCase());
        return true;
      });
    }
    const filteredOut = startCount - rows.length;
    if (filteredOut > 0) {
      actionsApplied.push({
        action: 'filter_rows',
        description: `Filtered out ${filteredOut} row(s) based on condition`,
        affectedRows: filteredOut,
        affectedColumns: operations.filterRows.map((f) => f.column)
      });
    }
  }

  // Step 6: Sort records
  if (operations.sortRecords && operations.sortRecords.column) {
    const { column, direction = 'asc' } = operations.sortRecords;
    const isAsc = direction === 'asc';
    rows.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return isAsc ? numA - numB : numB - numA;
      }
      return isAsc
        ? String(valA || '').localeCompare(String(valB || ''))
        : String(valB || '').localeCompare(String(valA || ''));
    });
    actionsApplied.push({
      action: 'sort_records',
      description: `Sorted rows by ${column} (${direction.toUpperCase()})`,
      affectedRows: rows.length,
      affectedColumns: [column]
    });
  }

  // Step 7: Type conversions
  if (Array.isArray(operations.typeConversions) && operations.typeConversions.length > 0) {
    const convertedCols = [];
    for (const conv of operations.typeConversions) {
      const { column, targetType } = conv;
      if (!column || !targetType) continue;

      for (const row of rows) {
        if (row[column] !== null && row[column] !== undefined && row[column] !== '') {
          if (targetType === 'number') {
            const num = Number(row[column]);
            if (!isNaN(num)) row[column] = num;
          } else if (targetType === 'string') {
            row[column] = String(row[column]);
          } else if (targetType === 'boolean') {
            const s = String(row[column]).toLowerCase().trim();
            row[column] = s === 'true' || s === '1' || s === 'yes';
          }
        }
      }
      convertedCols.push(`${column} -> ${targetType}`);
    }

    if (convertedCols.length > 0) {
      actionsApplied.push({
        action: 'type_conversion',
        description: `Converted data types: ${convertedCols.join(', ')}`,
        affectedRows: rows.length,
        affectedColumns: operations.typeConversions.map((c) => c.column)
      });
    }
  }

  const afterRowCount = rows.length;

  // Re-detect columns and schemas
  const newColumnNames = Object.keys(rows[0] || {});
  const newColumns = newColumnNames.map((colName) => {
    const sampleValues = [];
    const colValues = [];
    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][colName];
      colValues.push(val);
      if (sampleValues.length < 5 && val !== null && val !== undefined && val !== '') {
        sampleValues.push(val);
      }
    }
    return {
      name: colName,
      dataType: inferDataType(colValues),
      sampleValues
    };
  });

  return {
    cleanedRows: rows,
    beforeRowCount,
    afterRowCount,
    rowsRemoved: beforeRowCount - afterRowCount,
    valuesModifiedCount,
    columns: newColumns,
    actionsApplied
  };
};

module.exports = {
  auditDataset,
  cleanData,
  calculateQualityScore,
  calculateMean,
  calculateMedian,
  calculateMode,
  isMissing
};
