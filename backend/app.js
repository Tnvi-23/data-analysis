const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const { isDatabaseReady, getDatabaseStatus } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(helmet());
app.set('trust proxy', 1);

// Allow the deployed frontend plus local development origins. Keep credentials
// enabled because authentication uses HTTP-only cookies; never use '*'.
const configuredOrigins = [process.env.CLIENT_URLS, process.env.CLIENT_URL]
  .filter(Boolean).flatMap((value) => value.split(','));
const allowedOrigins = [...new Set([
  'http://localhost:5173',
  'https://stirring-panda-bd0c1b.netlify.app',
  ...configuredOrigins
].map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean))];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body and Cookie Parsers (placed before routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Base health endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SmartData Insight API'
  });
});

app.get('/api/health', (req, res) => {
  const mongodb = getDatabaseStatus();
  res.status(mongodb.connected ? 200 : 503).json({ success: mongodb.connected, backend: 'running', mongodb, uptimeSeconds: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  if (!isDatabaseReady()) return res.status(503).json({ success: false, message: 'Database temporarily unavailable. Please retry shortly.' });
  next();
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
