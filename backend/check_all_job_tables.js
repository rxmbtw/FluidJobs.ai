const pool = require('./config/database');

async function checkAllJobTables() {
  try {
    // Check what job-related tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%job%'
      ORDER BY table_name
    `);
    
    console.log('Job-related tables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check jobs_enhanced table specifically
    console.log('\n=== JOBS_ENHANCED TABLE ===');
    const jobsEnhancedCount = await pool.query('SELECT COUNT(*) as total FROM jobs_enhanced');
    console.log(`Total jobs in jobs_enhanced: ${jobsEnhancedCount.rows[0].total}`);
    
    if (jobsEnhancedCount.rows[0].total > 0) {
      const jobs = await pool.query('SELECT id, title, company, status, created_at FROM jobs_enhanced LIMIT 5');
      console.log('\nSample jobs from jobs_enhanced:');
      jobs.rows.forEach(job => {
        console.log(`ID: ${job.id}, Title: ${job.title}, Status: ${job.status}, Created: ${job.created_at}`);
      });
    }
    
    // Check regular jobs table
    console.log('\n=== JOBS TABLE ===');
    const jobsCount = await pool.query('SELECT COUNT(*) as total FROM jobs');
    console.log(`Total jobs in jobs: ${jobsCount.rows[0].total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAllJobTables();