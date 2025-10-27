const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function updateSchema() {
  try {
    console.log('🔄 Updating profile schema...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../config/profile_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema updates
    await pool.query(schema);
    
    console.log('✅ Profile schema updated successfully!');
    console.log('📋 Added columns: full_name, phone, gender, marital_status, work_status, current_company, notice_period, current_ctc, last_company, previous_ctc, city, work_mode');
    console.log('🔗 Database:', process.env.DB_HOST, process.env.DB_NAME);
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    await pool.end();
  }
}

updateSchema();