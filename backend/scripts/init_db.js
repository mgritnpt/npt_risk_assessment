const fs = require('fs');
const path = require('path');
const { getPool } = require('../src/config/db');

async function runSqlFile(pool, filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Split by GO on its own line (case-insensitive)
  const statements = content
    .split(/^\s*GO\s*$/im)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    // Clean out USE statements since pool is already connected to target DB
    const cleanStmt = statement.replace(/^\s*USE\s+[^\s;]+;?/im, '').trim();
    if (cleanStmt) {
      await pool.request().query(cleanStmt);
    }
  }
}

async function initializeDatabase() {
  console.log('[DB Init] Starting Database Initialization...');

  try {
    // 1. Ensure IT_Apps DB exists using master pool connection
    console.log('[DB Init] Connecting to master database...');
    const masterPool = await getPool('master');
    const sql001Path = path.join(__dirname, '../../database/001_create_database.sql');
    await runSqlFile(masterPool, sql001Path);
    console.log('[DB Init] Step 1 Complete: Database IT_Apps verified/created.');
    await masterPool.close();

    // 2. Connect to IT_Apps DB to run tables script
    console.log('[DB Init] Connecting to IT_Apps database...');
    const dbPool = await getPool('IT_Apps');
    const sql002Path = path.join(__dirname, '../../database/002_create_tables.sql');
    await runSqlFile(dbPool, sql002Path);
    console.log('[DB Init] Step 2 Complete: Database tables created with audit columns.');

    // 3. Seed Master Data
    const sql003Path = path.join(__dirname, '../../database/003_seed_data.sql');
    await runSqlFile(dbPool, sql003Path);
    console.log('[DB Init] Step 3 Complete: Master data & sample risks seeded successfully.');

    await dbPool.close();
    console.log('----------------------------------------------------');
    console.log('✅ Database Initialization & Seeding Complete!');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('[DB Init Error]:', err.message || err);
    process.exit(1);
  }
}

initializeDatabase();
