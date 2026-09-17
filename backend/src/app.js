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

// Start Server & Connect DB
connectDB()
  .then(async () => {
    await autoInitDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database. Starting server in offline mode...', err.message);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Server running in OFFLINE mode on http://0.0.0.0:${PORT}`);
    });
  });

module.exports = app;
