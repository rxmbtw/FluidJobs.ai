const pool = require('./config/database');

async function debug() {
  try {
    console.log('Unpublish requests:');
    const ur = await pool.query('SELECT * FROM unpublish_requests WHERE status = $1', ['pending']);
    console.log(ur.rows);
    
    console.log('\nJobs with matching IDs:');
    if (ur.rows.length > 0) {
      const jobIds = ur.rows.map(r => r.job_id);
      const jobs = await pool.query('SELECT id, title FROM jobs_enhanced WHERE id = ANY($1)', [jobIds]);
      console.log(jobs.rows);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debug();
