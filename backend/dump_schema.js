require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),  // Fixed!
    database: process.env.DB_NAME,
});

pool.query(`
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('job_applications', 'stage_history', 'candidate_feedback', 'interviewer_assignments')
ORDER BY table_name, ordinal_position
`).then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    pool.end();
}).catch(e => { console.error(e); pool.end(); });
