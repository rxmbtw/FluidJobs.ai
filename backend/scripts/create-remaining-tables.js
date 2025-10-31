const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createRemainingTables() {
  try {
    // Create saved_jobs table
    const savedJobsSQL = fs.readFileSync(path.join(__dirname, '../config/16_saved_jobs.sql'), 'utf8');
    await pool.query(savedJobsSQL);
    console.log('✅ Saved jobs table created');
    
    console.log('🎉 Database is now complete for full application functionality!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createRemainingTables();