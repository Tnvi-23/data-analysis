const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');

const dataDir = path.join(__dirname, '..', 'uploads', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Infer the predominant data type of a column
 */
const inferDataType = (values) => {
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'string';

  let numberCount = 0;
  let booleanCount = 0;
  let dateCount = 0;
  let stringCount = 0;

  for (const val of nonNullValues) {
    if (typeof val === 'number') {
      numberCount++;
      continue;
    }
    if (typeof val === 'boolean') {
      booleanCount++;
      continue;
    }

    const str = String(val).trim();

    // Check boolean string
    if (str.toLowerCase() === 'true' || str.toLowerCase() === 'false') {
      booleanCount++;
      continue;
    }

    // Check numeric
    if (!isNaN(Number(str)) && str !== '') {
      numberCount++;
      continue;
    }

    // Check date format (e.g. YYYY-MM-DD or parseable valid date with year > 1900)
    const parsedDate = Date.parse(str);
    if (!isNaN(parsedDate) && /[\d]{4}[-/][\d]{1,2}[-/][\d]{1,2}/.test(str)) {
      dateCount++;
      continue;
    }

    stringCount++;
  }

  const total = nonNullValues.length;
  if (numberCount / total > 0.7) return 'number';
  if (booleanCount / total > 0.7) return 'boolean';
  if (dateCount / total > 0.7) return 'date';
  return 'string';
};

/**
 * Parse CSV file into an array of objects
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

/**
 * Parse Excel file (.xlsx, .xls) into an array of objects
 */
const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel workbook contains no sheets');
  }
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, { defval: null });
  return rows;
};

/**
 * Process uploaded file, inspect schema, save data, and clean up temp file
 */
const processUploadedFile = async (file) => {
  const tempPath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();
  const fileType = ext === '.csv' ? 'csv' : 'xlsx';

  try {
    let rows = [];

    if (fileType === 'csv') {
      rows = await parseCSV(tempPath);
    } else {
      rows = parseExcel(tempPath);
    }

    if (!rows || rows.length === 0) {
      throw new Error('The uploaded file is empty or does not contain any valid data rows.');
    }

    // Extract headers / column names
    const columnNames = Object.keys(rows[0] || {}).map((c) => c.trim()).filter(Boolean);

    if (columnNames.length === 0) {
      throw new Error('No valid column headers found in the uploaded file.');
    }

    // Normalize rows to have consistent trimmed keys and infer types
    const columns = columnNames.map((colName) => {
      const sampleValues = [];
      const colValues = [];

      for (let i = 0; i < rows.length; i++) {
        const val = rows[i][colName];
        colValues.push(val);
        if (sampleValues.length < 5 && val !== null && val !== undefined && val !== '') {
          sampleValues.push(val);
        }
      }

      const dataType = inferDataType(colValues);

      return {
        name: colName,
        dataType,
        sampleValues
      };
    });

    // Save parsed dataset to uploads/data
    const storedFilename = `dataset-${Date.now()}-${Math.round(Math.random() * 1e9)}.json`;
    const dataPath = path.join(dataDir, storedFilename);

    fs.writeFileSync(dataPath, JSON.stringify(rows));

    // Cleanup temp uploaded file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    return {
      storedFilename,
      dataPath,
      fileType,
      fileSize: file.size,
      rowCount: rows.length,
      columnCount: columns.length,
      columns,
      previewData: rows.slice(0, 10)
    };
  } catch (err) {
    // Ensure temp file is cleaned up on error
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupErr) {
        // Ignore secondary unlink error
      }
    }
    throw err;
  }
};

/**
 * Load dataset rows from disk (supports stored JSON, CSV, Excel, dataset doc, and previewData fallback)
 */
const loadDatasetRows = (datasetOrPath) => {
  let resolvedPath = null;
  let previewFallback = null;

  if (typeof datasetOrPath === 'string') {
    resolvedPath = datasetOrPath;
  } else if (datasetOrPath && typeof datasetOrPath === 'object') {
    resolvedPath = datasetOrPath.dataPath;
    previewFallback = datasetOrPath.previewData;

    // Check if storedFilename exists in uploads/data
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      if (datasetOrPath.storedFilename) {
        const altPath = path.join(dataDir, datasetOrPath.storedFilename);
        if (fs.existsSync(altPath)) resolvedPath = altPath;
      }
    }

    // Check sample-datasets folder
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      if (datasetOrPath.originalFilename) {
        const samplePath = path.join(__dirname, '..', '..', 'sample-datasets', datasetOrPath.originalFilename);
        if (fs.existsSync(samplePath)) resolvedPath = samplePath;
      }
    }
  }

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    if (Array.isArray(previewFallback) && previewFallback.length > 0) {
      return previewFallback;
    }
    throw new Error('Dataset file not found on disk: ' + (resolvedPath || 'unknown path'));
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls') {
    return parseExcel(resolvedPath);
  }
  const content = fs.readFileSync(resolvedPath, 'utf8');
  const trimmed = content.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return JSON.parse(content);
  }
  // Fallback for raw CSV text files
  const workbook = xlsx.read(content, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { defval: null });
};

/**
 * Save updated dataset rows to disk
 */
const saveDatasetRows = (dataPath, rows) => {
  fs.writeFileSync(dataPath, JSON.stringify(rows));
};

/**
 * Delete dataset file from disk
 */
const deleteDatasetFile = (dataPath) => {
  if (fs.existsSync(dataPath)) {
    try {
      fs.unlinkSync(dataPath);
    } catch (err) {
      console.error('Error deleting dataset file:', err.message);
    }
  }
};

module.exports = {
  processUploadedFile,
  loadDatasetRows,
  saveDatasetRows,
  deleteDatasetFile,
  inferDataType
};
