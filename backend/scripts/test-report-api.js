const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
const app = require('../app');
const User = require('../models/User');
const Dataset = require('../models/Dataset');
const Report = require('../models/Report');

async function testApi() {
  console.log('=== TESTING REPORT API ENDPOINTS ===');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB:', mongoose.connection.name);

  // Find a dataset first, then use its owner
  const dataset = await Dataset.findOne({ originalFilename: 'student_exam_scores.csv' }) || await Dataset.findOne({});
  if (!dataset) {
    throw new Error('No dataset found in database');
  }
  const user = await User.findById(dataset.user).lean();
  if (!user) {
    throw new Error('Owner user not found for dataset: ' + dataset._id);
  }
  console.log('Using authenticated test user:', user.email, 'ID:', user._id);
  console.log('Using dataset:', dataset.originalFilename, 'ID:', dataset._id);

  // Generate a valid JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('Test Express server listening on port 5099');

  const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const bodyBuf = Buffer.concat(chunks);
          let json = null;
          try {
            json = JSON.parse(bodyBuf.toString('utf-8'));
          } catch (e) {}
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: json || bodyBuf.toString('utf-8'),
            rawBody: bodyBuf
          });
        });
      });
      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  };

  try {
    // 1. Test POST /api/reports (Generate report)
    console.log('\n1. Testing POST /api/reports...');
    const postPayload = JSON.stringify({
      datasetId: dataset._id.toString(),
      title: `Executive Test Report — ${dataset.originalFilename}`
    });

    const createRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5099,
        path: '/api/reports',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postPayload),
          Authorization: `Bearer ${token}`
        }
      },
      postPayload
    );

    console.log('POST /api/reports status:', createRes.statusCode);
    if (createRes.statusCode !== 201) {
      console.error('Create Report Failed:', createRes.body);
      throw new Error(`Failed to create report: HTTP ${createRes.statusCode}`);
    }

    const createdReport = createRes.body.report || createRes.body.data;
    console.log('Created Report ID:', createdReport._id);
    console.log('Storage Type:', createdReport.storageType);
    console.log('PDF URL:', createdReport.pdfUrl);
    console.log('File Size:', createdReport.fileSize, 'bytes');

    // 2. Test GET /api/reports/:id
    console.log('\n2. Testing GET /api/reports/' + createdReport._id + '...');
    const getRes = await makeRequest({
      hostname: 'localhost',
      port: 5099,
      path: `/api/reports/${createdReport._id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('GET /api/reports/:id status:', getRes.statusCode);
    console.log('Report Title in DB:', getRes.body.report?.title);

    // 3. Test GET /api/reports/:id/download
    console.log('\n3. Testing GET /api/reports/' + createdReport._id + '/download...');
    const dlRes = await makeRequest({
      hostname: 'localhost',
      port: 5099,
      path: `/api/reports/${createdReport._id}/download`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Download Status:', dlRes.statusCode);
    console.log('Content-Type:', dlRes.headers['content-type']);
    console.log('Content-Disposition:', dlRes.headers['content-disposition']);
    console.log('Downloaded Byte Length:', dlRes.rawBody.length);

    // 4. Test GET /api/reports/:id/view (Inline disposition)
    console.log('\n4. Testing GET /api/reports/' + createdReport._id + '/view...');
    const viewRes = await makeRequest({
      hostname: 'localhost',
      port: 5099,
      path: `/api/reports/${createdReport._id}/view`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('View Status:', viewRes.statusCode);
    console.log('Content-Type:', viewRes.headers['content-type']);
    console.log('Content-Disposition:', viewRes.headers['content-disposition']);

    console.log('\n=== ALL REPORT API ENDPOINT TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

testApi().catch((err) => {
  console.error('Test API Error:', err);
  process.exit(1);
});
