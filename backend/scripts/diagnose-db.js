/**
 * Safe Database Storage Diagnostic Script for SmartData Insight
 *
 * Checks connected database, collections, document counts, and model integrity
 * WITHOUT exposing any private user information (e.g. passwords, emails, tokens).
 */
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');
const Analysis = require('../models/Analysis');

async function runDiagnostic() {
  console.log('====================================================');
  console.log(' SMARTDATA INSIGHT — DATABASE STORAGE DIAGNOSTIC');
  console.log('====================================================\n');

  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is missing from backend/.env');
    process.exit(1);
  }

  // Sanitize URI for display (mask password and user credentials)
  const sanitizedUri = process.env.MONGODB_URI.replace(
    /\/\/(.*?):(.*?)@/,
    '//***:***@'
  );
  console.log(`[Config] Connection URI: ${sanitizedUri}`);

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  const currentDbName = mongoose.connection.name;
  console.log(`[Status] Connected successfully to database: "${currentDbName}"`);

  // Check cluster databases if permissions allow
  try {
    const admin = mongoose.connection.db.admin();
    const dbsInfo = await admin.listDatabases();
    console.log(
      `[Cluster] Databases available on cluster:`,
      dbsInfo.databases.map((db) => `${db.name} (${(db.sizeOnDisk / 1024).toFixed(1)} KB)`)
    );
  } catch (err) {
    console.log(`[Cluster] Note: admin.listDatabases not permitted (${err.message})`);
  }

  // List collections in the currently connected database
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name).sort();
  console.log(`\n[Collections] Found ${collectionNames.length} collections in "${currentDbName}":`);
  collectionNames.forEach((name) => console.log(`  - ${name}`));

  // Document Counts per collection (raw DB query)
  console.log('\n[Raw Collection Record Counts]:');
  for (const name of collectionNames) {
    const count = await mongoose.connection.db.collection(name).countDocuments();
    console.log(`  - ${name.padEnd(20)}: ${count} documents`);
  }

  // Model Verification & Storage Checks (Safe anonymized summaries)
  console.log('\n====================================================');
  console.log(' MODEL VERIFICATION & ACTUAL STORAGE AUDIT');
  console.log('====================================================');

  // 1. User Model
  const userCount = await User.countDocuments();
  console.log(`\n1. User Model:`);
  console.log(`   - Model Registered: ${!!User.modelName} (Collection: "${User.collection.name}")`);
  console.log(`   - Total Registered Users: ${userCount}`);
  if (userCount > 0) {
    const users = await User.find().select('createdAt updatedAt').sort({ createdAt: -1 });
    console.log(`   - User Records Present: YES (Found ${users.length} user accounts registered)`);
    console.log(`   - Oldest Account: ${users[users.length - 1]?.createdAt?.toISOString()}`);
    console.log(`   - Newest Account: ${users[0]?.createdAt?.toISOString()}`);
    console.log(`   - Privacy note: Passwords, emails, and personal names are securely masked.`);
  } else {
    console.log(`   - User Records Present: NO (0 users)`);
  }

  // 2. Dataset Model
  const datasetCount = await Dataset.countDocuments();
  console.log(`\n2. Dataset Model:`);
  console.log(`   - Model Registered: ${!!Dataset.modelName} (Collection: "${Dataset.collection.name}")`);
  console.log(`   - Total Uploaded Datasets: ${datasetCount}`);
  if (datasetCount > 0) {
    const datasets = await Dataset.find()
      .select('originalFilename fileType rowCount columnCount qualityScore status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log(`   - Dataset Records Present: YES (Listing recent 5 datasets):`);
    datasets.forEach((d, idx) => {
      console.log(
        `     [${idx + 1}] "${d.originalFilename}" (${d.fileType}) — ${d.rowCount} rows, ${d.columnCount} cols, Quality: ${d.qualityScore ?? 'N/A'}, Status: ${d.status}`
      );
    });
  } else {
    console.log(`   - Dataset Records Present: NO (0 uploaded datasets)`);
  }

  // 3. Report Model
  const reportCount = await Report.countDocuments();
  console.log(`\n3. Report Model:`);
  console.log(`   - Model Registered: ${!!Report.modelName} (Collection: "${Report.collection.name}")`);
  console.log(`   - Total Generated Reports: ${reportCount}`);
  if (reportCount > 0) {
    const reports = await Report.find()
      .select('title fileFormat storageType fileSize status generationDate createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log(`   - Report Records Present: YES (Listing recent 5 reports):`);
    reports.forEach((r, idx) => {
      console.log(
        `     [${idx + 1}] "${r.title}" — Format: ${r.fileFormat}, Storage: ${r.storageType}, Size: ${r.fileSize} B, Status: ${r.status}`
      );
    });
  } else {
    console.log(`   - Report Records Present: NO (0 generated reports)`);
  }

  // 4. Conversation Model (AI Insights Chat)
  const conversationCount = await Conversation.countDocuments();
  console.log(`\n4. AI Conversation Model:`);
  console.log(`   - Model Registered: ${!!Conversation.modelName} (Collection: "${Conversation.collection.name}")`);
  console.log(`   - Total AI Conversations: ${conversationCount}`);
  if (conversationCount > 0) {
    const convos = await Conversation.find()
      .select('title datasetName messages createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5);
    console.log(`   - Conversation Records Present: YES (Listing recent 5 conversations):`);
    convos.forEach((c, idx) => {
      console.log(
        `     [${idx + 1}] "${c.title}" — Dataset: ${c.datasetName || 'None'}, Messages: ${c.messages?.length || 0}, Updated: ${c.updatedAt?.toISOString()}`
      );
    });
  } else {
    console.log(`   - Conversation Records Present: NO (0 conversations)`);
  }

  // 5. Analysis Model
  const analysisCount = await Analysis.countDocuments();
  console.log(`\n5. Analysis Model (Statistical Models):`);
  console.log(`   - Model Registered: ${!!Analysis.modelName} (Collection: "${Analysis.collection.name}")`);
  console.log(`   - Total Statistical Analyses: ${analysisCount}`);

  // Expected vs Existing Collections Audit
  const EXPECTED_COLLECTIONS = [
    { name: 'users', model: 'User' },
    { name: 'datasets', model: 'Dataset' },
    { name: 'reports', model: 'Report' },
    { name: 'conversations', model: 'Conversation' },
    { name: 'analyses', model: 'Analysis' }
  ];

  console.log('\n====================================================');
  console.log(' AUDIT: EXPECTED VS EXISTING COLLECTIONS');
  console.log('====================================================');
  const existingSet = new Set(collectionNames);
  let allPresent = true;

  EXPECTED_COLLECTIONS.forEach(({ name, model }) => {
    const exists = existingSet.has(name);
    if (exists) {
      console.log(`  ✓ Collection "${name}" [Model: ${model}] is PRESENT.`);
    } else {
      console.log(`  ✗ Collection "${name}" [Model: ${model}] is MISSING.`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log('\n>>> All expected SmartData Insight collections are PRESENT and active in the database!');
  } else {
    console.log('\n>>> Some expected collections are not yet created in the database.');
  }

  // Database Name Check
  console.log('\n====================================================');
  console.log(' DATABASE NAME VERIFICATION');
  console.log('====================================================');
  if (currentDbName === 'smartdata_insight') {
    console.log(`✓ Application is using the designated "smartdata_insight" database.`);
  } else {
    console.log(`! Application is currently connected to "${currentDbName}".`);
    console.log(`  Target specified in requirements: "smartdata_insight".`);
  }

  await mongoose.disconnect();
  console.log('\n[Diagnostic Completed Successfully]');
}

runDiagnostic().catch((err) => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
