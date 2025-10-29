const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addOrgFields() {
  try {
    console.log('Adding organization fields to jobs_enhanced table...');
    
    const alterQueries = [
      'ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS registration_schedule VARCHAR(255)',
      'ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS about_organisation TEXT',
      'ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS website VARCHAR(255)',
      'ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS industry VARCHAR(100)',
      'ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS organisation_size VARCHAR(50)',
      'ALTER TABLE jobs_enhanced ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255)'
    ];
    
    for (const query of alterQueries) {
      await pool.query(query);
    }
    
    console.log('✅ Organization fields added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding organization fields:', error.message);
  } finally {
    await pool.end();
  }
}

addOrgFields();