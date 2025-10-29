const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
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

async function setupEnhancedJobs() {
  try {
    console.log('Connecting to Google Cloud SQL...');
    
    // Test connection first
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to database at:', testResult.rows[0].now);
    
    console.log('Setting up enhanced jobs tables...');
    
    const schemaPath = path.join(__dirname, '../config/enhanced_jobs_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Enhanced jobs tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up enhanced jobs tables:', error.message);
  } finally {
    await pool.end();
  }
}

setupEnhancedJobs();