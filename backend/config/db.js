const mongoose = require('mongoose');
const INITIAL_RETRIES = Number(process.env.MONGO_INITIAL_RETRIES || 5);
const RETRY_BASE_MS = Number(process.env.MONGO_RETRY_BASE_MS || 1000);
const RETRY_MAX_MS = Number(process.env.MONGO_RETRY_MAX_MS || 30000);
let connectionPromise = null;
let lastError;

function classify(error) {
  const message = error?.message || 'unknown error';
  if (/authentication failed|bad auth/i.test(message)) return 'authentication failed';
  if (/ENOTFOUND|querySrv|dns/i.test(message)) return 'DNS/SRV lookup failed';
  if (/timed out|timeout|server selection/i.test(message)) return 'server selection/connection timed out';
  if (/tls|ssl|certificate/i.test(message)) return 'TLS/SSL negotiation failed';
  return message;
}
function errorDetails(error) {
  const reason = error?.reason;
  const reasonSummary = reason && typeof reason === 'object'
    ? Object.fromEntries(Object.entries(reason).slice(0, 8).map(([key, value]) => [key, typeof value === 'object' ? (value?.type || value?.name || String(value)) : value]))
    : reason || error?.cause?.message || null;
  return {
    name: error?.name || 'Error',
    code: error?.code || error?.cause?.code || null,
    message: error?.message || error?.cause?.message || 'unknown error',
    reason: reasonSummary
  };
}
mongoose.connection.on('connected', () => console.log(`MongoDB connected successfully to "${mongoose.connection.name}"`));
mongoose.connection.on('reconnected', () => console.log('MongoDB connection restored by the MongoDB driver'));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected; the MongoDB driver will manage reconnection'));
mongoose.connection.on('error', (error) => { lastError = error; console.error(`MongoDB connection error [${error.name || 'Error'}${error.code ? `/${error.code}` : ''}]: ${classify(error)}`); });

async function connectDB({ initial = true } = {}) {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing from backend/.env');
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2) return connectionPromise;
  if (connectionPromise) return connectionPromise;
  connectionPromise = (async () => {
    const attempts = initial ? INITIAL_RETRIES : 1;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await mongoose.connect(process.env.MONGODB_URI, { dbName: 'smartdata_insight', connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000, maxPoolSize: 10, minPoolSize: 0, retryWrites: true });
      } catch (error) {
        lastError = error;
        console.error(`MongoDB connection attempt ${attempt}/${attempts} failed: ${JSON.stringify({ category: classify(error), ...errorDetails(error) })}`);
        if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, Math.min(RETRY_BASE_MS * (2 ** (attempt - 1)), RETRY_MAX_MS)));
      }
    }
    throw lastError;
  })().finally(() => { connectionPromise = null; });
  return connectionPromise;
}
async function closeDB() { if (mongoose.connection.readyState !== 0) await mongoose.disconnect(); }
function isDatabaseReady() { return mongoose.connection.readyState === 1; }
function getDatabaseStatus() { return { connected: isDatabaseReady(), state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown', name: isDatabaseReady() ? mongoose.connection.name : null }; }
module.exports = connectDB;
module.exports.closeDB = closeDB;
module.exports.isDatabaseReady = isDatabaseReady;
module.exports.getDatabaseStatus = getDatabaseStatus;
