const pool = require('../config/database');

async function addRegistrationDates() {
  try {
    console.log('Adding registration date columns...');
    
    // Add columns to jobs_enhanced table
    await pool.query(`
      ALTER TABLE jobs_enhanced 
      ADD COLUMN IF NOT EXISTS registration_opening_date DATE,
      ADD COLUMN IF NOT EXISTS registration_closing_date DATE;
    `);
    
    // Add columns to job_drafts table
    await pool.query(`
      ALTER TABLE job_drafts 
      ADD COLUMN IF NOT EXISTS registration_opening_date DATE,
      ADD COLUMN IF NOT EXISTS registration_closing_date DATE;
    `);
    
    console.log('✅ Successfully added registration_opening_date and registration_closing_date columns');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addRegistrationDates();
