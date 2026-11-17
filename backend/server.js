
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

let server;
let shuttingDown = false;
async function startServer() { await connectDB(); server = app.listen(PORT, () => console.log(`SmartData Insight server running on port ${PORT}`)); }
async function shutdown(signal) { if (shuttingDown) return; shuttingDown = true; console.log(`Received ${signal}; shutting down gracefully`); if (server) await new Promise((resolve) => server.close(resolve)); await connectDB.closeDB(); process.exit(0); }
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (error) => console.error('Unhandled promise rejection:', error));
process.on('uncaughtException', (error) => { console.error('Uncaught exception:', error); shutdown('uncaughtException'); });
startServer().catch((error) => { console.error(`MongoDB initial connection could not be established after retries: ${error.message}`); process.exitCode = 1; });
