const pool = require('../config/database');

async function addNoOfOpeningsColumn() {
  try {
    await pool.query(`
      ALTER TABLE jobs_enhanced 
      ADD COLUMN IF NOT EXISTS no_of_openings INTEGER DEFAULT 1;
    `);
    
    console.log('✅ no_of_openings column added to jobs_enhanced successfully');
    
    // Try to add to job_drafts if it exists
    try {
      await pool.query(`
        ALTER TABLE job_drafts 
        ADD COLUMN IF NOT EXISTS no_of_openings INTEGER DEFAULT 1;
      `);
      console.log('✅ no_of_openings column added to job_drafts successfully');
    } catch (err) {
      console.log('ℹ️  job_drafts table does not exist, skipping');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addNoOfOpeningsColumn();
