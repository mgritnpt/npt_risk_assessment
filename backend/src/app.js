const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { autoInitDatabase } = require('./config/initDb');
const masterRoutes = require('./routes/masterRoutes');
const riskRoutes = require('./routes/riskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'], limit: '50mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/master', masterRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), service: 'IT Risk Assessment API' });
});

// Express Error Handling Middleware to ensure no request ever hangs without a response
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Route Error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ (Internal Server Error): ' + (err.message || 'Unknown error'),
      error: err.message || 'Unknown server error'
    });
  }
});

// Prevent process crashes on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Server immediately so port 5001 is listening right away (prevents Nginx 502 Bad Gateway)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

// Keep-Alive tuning for Nginx reverse proxy stability
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Connect to Database & Auto-Init Schema asynchronously
connectDB()
  .then(async () => {
    try {
      await autoInitDatabase();
      console.log('✅ Database initialization complete.');
    } catch (e) {
      console.error('⚠️ Database initialization warning:', e.message);
    }
  })
  .catch((err) => {
    console.error('⚠️ Database connection failed. Server running with fallback handlers:', err.message);
  });

module.exports = app;
