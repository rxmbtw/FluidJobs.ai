const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

async function migrate() {
  try {
    console.log('🔄 Adding registration date columns...');
    
    await pool.query(`
      ALTER TABLE jobs_enhanced 
      ADD COLUMN IF NOT EXISTS registration_opening_date DATE,
      ADD COLUMN IF NOT EXISTS registration_closing_date DATE;
    `);
    console.log('✅ jobs_enhanced table updated');
    
    await pool.query(`
      ALTER TABLE job_drafts 
      ADD COLUMN IF NOT EXISTS registration_opening_date DATE,
      ADD COLUMN IF NOT EXISTS registration_closing_date DATE;
    `);
    console.log('✅ job_drafts table updated');
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

migrate();
