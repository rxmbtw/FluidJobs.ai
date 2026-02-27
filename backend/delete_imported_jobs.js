const { Pool } = require('pg');
const pool = new Pool({
    host: '72.60.103.151',
    port: 5432,
    database: 'fluiddb',
    user: 'fluidadmin',
    password: 'admin123'
});

async function deleteImportedJobs() {
    try {
        const res = await pool.query('DELETE FROM jobs_enhanced WHERE id BETWEEN 2 AND 11 AND company = \'1\'');
        console.log(`Deleted ${res.rowCount} imported jobs.`);
    } catch (err) {
        console.error('Error deleting jobs:', err);
    } finally {
        await pool.end();
    }
}

deleteImportedJobs();
