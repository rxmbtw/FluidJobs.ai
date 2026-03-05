const pool = require('../config/database');

async function cleanUp() {
    console.log('Starting cleanup of TestTitle jobs...');
    try {
        const res = await pool.query("DELETE FROM jobs_enhanced WHERE title LIKE 'TestTitle_%'");
        console.log(`Successfully deleted ${res.rowCount} test jobs.`);
    } catch (err) {
        console.error('Error cleaning up:', err);
    } finally {
        process.exit(0);
    }
}

cleanUp();
