const { Pool } = require('pg');
const pool = new Pool({
    host: '72.60.103.151',
    port: 5432,
    database: 'fluiddb',
    user: 'fluidadmin',
    password: 'admin123'
});

async function checkJobs() {
    try {
        const res = await pool.query('SELECT id, title, company, status, created_at FROM jobs_enhanced ORDER BY created_at DESC');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkJobs();
