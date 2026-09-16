const fs = require('fs');
const path = require('path');
const { getPool, connectDB } = require('./db');

async function autoInitDatabase() {
  try {
    // 1. Connect to master database to ensure IT_Apps exists
    try {
      const masterPool = await getPool('master');
      await masterPool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'IT_Apps')
        BEGIN
          CREATE DATABASE IT_Apps;
        END
      `);
      await masterPool.close();
    } catch (e) {
      console.log('Master DB check skipped:', e.message);
    }

    // 2. Connect to IT_Apps database
    const pool = await connectDB();

    // Check if RiskHeader table exists
    const checkTable = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RiskHeader'
    `);

    if (checkTable.recordset.length === 0) {
      console.log('🔄 Initializing database tables and seed data...');

      const sqlDir = path.join(__dirname, '../../../database');
      const createTablesSql = fs.readFileSync(path.join(sqlDir, '002_create_tables.sql'), 'utf8');
      const seedDataSql = fs.readFileSync(path.join(sqlDir, '003_seed_data.sql'), 'utf8');

      // Helper to split T-SQL by GO
      const runSqlBatches = async (sqlScript) => {
        const batches = sqlScript.split(/^\s*GO\s*$/im);
        for (const batch of batches) {
          const trimmed = batch.trim();
          if (trimmed) {
            await pool.request().query(trimmed);
          }
        }
      };

      await runSqlBatches(createTablesSql);
      await runSqlBatches(seedDataSql);
      console.log('✅ Database tables and seed data initialized successfully!');
    }
  } catch (err) {
    console.error('⚠️ Database auto-initialization error (continuing...):', err.message);
  }
}

module.exports = { autoInitDatabase };
