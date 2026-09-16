const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '*Adm@npt',
  server: process.env.DB_SERVER || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'IT_Apps',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise = null;

const getPool = async (customDbName = null) => {
  const currentConfig = customDbName ? { ...config, database: customDbName } : config;
  try {
    const pool = new sql.ConnectionPool(currentConfig);
    return await pool.connect();
  } catch (err) {
    console.error('SQL Connection Error:', err.message);
    throw err;
  }
};

const connectDB = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log(`[Database] Connected successfully to SQL Server (${config.server}:${config.port}/${config.database})`);
        return pool;
      })
      .catch((err) => {
        console.error('[Database] Connection Failed:', err.message);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

module.exports = {
  sql,
  getPool,
  connectDB,
};
