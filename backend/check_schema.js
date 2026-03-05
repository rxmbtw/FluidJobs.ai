const { Pool } = require('pg');
const pool = new Pool({ host: '72.60.103.151', port: 5432, database: 'fluiddb', user: 'fluidadmin', password: 'admin123' });

async function checkSchema() {
    // Check jobs_enhanced columns
    const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'jobs_enhanced' ORDER BY ordinal_position`);
    console.log('jobs_enhanced columns:', cols.rows.map(r => r.column_name));

    // Check job_applications columns
    const appCols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'job_applications' ORDER BY ordinal_position`);
    console.log('job_applications columns:', appCols.rows.map(r => r.column_name));

    // Show hiring process fields in sample job
    const job = await pool.query('SELECT id, title, hiring_process, stages, interview_stages FROM jobs_enhanced LIMIT 3');
    console.log('sample jobs:', JSON.stringify(job.rows, null, 2));
    await pool.end();
}
checkSchema().catch(e => { console.error(e.message); process.exit(1); });
