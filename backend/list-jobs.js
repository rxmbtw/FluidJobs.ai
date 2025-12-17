const pool = require('./config/database');

async function listJobs() {
  try {
    const result = await pool.query('SELECT id, title, status FROM jobs_enhanced ORDER BY id');
    console.log('Jobs in jobs_enhanced table:');
    console.table(result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listJobs();
