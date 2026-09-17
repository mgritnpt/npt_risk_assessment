const fs = require('fs');
const path = require('path');
const { getPool, connectDB } = require('./db');

async function autoInitDatabase() {
  const dbName = process.env.DB_NAME || 'IT_Apps';
  try {
    // 1. Connect to master database to ensure DB exists
    try {
      const masterPool = await getPool('master');
      await masterPool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
        BEGIN
          CREATE DATABASE [${dbName}];
        END
      `);
      await masterPool.close();
    } catch (e) {
      console.log('Master DB check skipped:', e.message);
    }

    // 2. Connect to target database
    const pool = await connectDB();

    // Check if key views/tables exist and function properly
    let needsInit = false;
    try {
      await pool.request().query(`SELECT TOP 1 RiskID FROM dbo.RiskHeader`);
      await pool.request().query(`SELECT TOP 1 ClauseID FROM dbo.Master_StandardClause`);
      await pool.request().query(`SELECT TOP 1 LogID FROM dbo.AuditLog`);
      await pool.request().query(`SELECT TOP 1 UserID FROM dbo.[User]`);
      
      const checkData = await pool.request().query(`SELECT COUNT(*) AS riskCount FROM dbo.Risk_Register`);
      if (!checkData.recordset || checkData.recordset[0].riskCount === 0) {
        needsInit = true;
      }
    } catch (e) {
      console.log('🔄 Missing or non-functional database objects detected:', e.message);
      needsInit = true;
    }

    if (needsInit) {
      console.log('🔄 Initializing database tables, compatibility views, and seed data...');

      const sqlDir = path.join(__dirname, '../../../database');
      const createTablesSql = fs.readFileSync(path.join(sqlDir, '002_create_tables.sql'), 'utf8');
      const seedDataSql = fs.readFileSync(path.join(sqlDir, '003_seed_data.sql'), 'utf8');

      // Helper to split T-SQL by GO and strip USE statements with detailed batch error reporting
      const runSqlBatches = async (sqlScript, scriptName) => {
        const batches = sqlScript.split(/^\s*GO\s*$/im);
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const cleaned = batch.replace(/^\s*USE\s+[^\s;]+;?/im, '').trim();
          if (cleaned) {
            try {
              await pool.request().query(cleaned);
            } catch (err) {
              console.warn(`⚠️ [${scriptName}] Batch ${i + 1} warning: ${err.message}`);
              console.warn('SQL snippet (first 200 chars):\n', cleaned.substring(0, 200));
            }
          }
        }
      };

      await runSqlBatches(createTablesSql, '002_create_tables.sql');
      await runSqlBatches(seedDataSql, '003_seed_data.sql');
      console.log('✅ Database tables, compatibility views, and seed data initialized successfully!');
    } else {
      console.log('✅ Database schema and seed data verified.');
    }

    // Always ensure Master_Control has at least 1 record to satisfy FK_Risk_Control_Control constraint
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.Master_Control WITH (NOLOCK))
        BEGIN
          INSERT INTO dbo.Master_Control (ControlCode, ControlName, ControlDescription)
          VALUES ('CTL-01', 'Default Control', 'System Default Control');
        END
      `);
    } catch (e) {
      console.warn('⚠️ Master_Control seed check warning:', e.message);
    }
  } catch (err) {
    console.error('⚠️ Database auto-initialization error (continuing...):', err.message);
  }
}

async function resetDatabaseToDefault() {
  const pool = await connectDB();
  const sqlDir = path.join(__dirname, '../../../database');
  const createTablesSql = fs.readFileSync(path.join(sqlDir, '002_create_tables.sql'), 'utf8');
  const seedDataSql = fs.readFileSync(path.join(sqlDir, '003_seed_data.sql'), 'utf8');

  const runSqlBatches = async (sqlScript, scriptName) => {
    const batches = sqlScript.split(/^\s*GO\s*$/im);
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const cleaned = batch.replace(/^\s*USE\s+[^\s;]+;?/im, '').trim();
      if (cleaned) {
        try {
          await pool.request().query(cleaned);
        } catch (err) {
          console.warn(`⚠️ [${scriptName}] Batch ${i + 1} warning: ${err.message}`);
        }
      }
    }
  };

  console.log('🔄 Resetting database tables, compatibility views, and seed data to factory defaults...');
  await runSqlBatches(createTablesSql, '002_create_tables.sql');
  await runSqlBatches(seedDataSql, '003_seed_data.sql');
  console.log('✅ Database reset to factory default completed successfully!');
  return { message: 'Database reset to factory default completed successfully' };
}

module.exports = { autoInitDatabase, resetDatabaseToDefault };
