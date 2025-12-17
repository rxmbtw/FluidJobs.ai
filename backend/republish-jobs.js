const pool = require('./config/database');

async function republish() {
  try {
    await pool.query("UPDATE jobs_enhanced SET status = 'Published' WHERE status = 'unpublished'");
    await pool.query("DELETE FROM unpublish_requests WHERE status = 'pending'");
    console.log('✅ Jobs republished and unpublish requests cleared');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

republish();
