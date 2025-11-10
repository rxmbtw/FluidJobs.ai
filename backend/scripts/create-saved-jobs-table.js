const pool = require('../config/database');

async function createSavedJobsTable() {
  try {
    console.log('Creating saved_jobs table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id SERIAL PRIMARY KEY,
        candidate_id VARCHAR(20) NOT NULL,
        job_id INTEGER NOT NULL,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        UNIQUE(candidate_id, job_id)
      )
    `);
    
    console.log('✅ saved_jobs table created successfully');
    
    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate_id ON saved_jobs(candidate_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
    `);
    
    console.log('✅ Indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating saved_jobs table:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createSavedJobsTable()
    .then(() => {
      console.log('✅ Saved jobs table setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createSavedJobsTable };