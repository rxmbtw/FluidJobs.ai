const { Pool } = require('pg');
require('dotenv').config();

let pool;

function getPool() {
  if (!pool || pool.ended) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1' ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000
    });
    
    pool.on('connect', () => {
      console.log('✅ Connected to PostgreSQL database');
    });
    
    pool.on('error', (err) => {
      console.error('❌ Database pool error:', err.message);
      pool = null;
    });
  }
  return pool;
}

module.exports = getPool();