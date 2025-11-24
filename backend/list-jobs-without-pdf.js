const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function listJobsWithoutPDF() {
  try {
    const result = await pool.query(`
      SELECT job_id, job_title
      FROM jobs_enhanced 
      WHERE jd_attachment_name IS NULL OR jd_attachment_name = ''
      ORDER BY job_id ASC
    `);
    
    console.log(`Jobs without JD PDF: ${result.rowCount}\n`);
    
    result.rows.forEach(job => {
      console.log(`ID: ${job.job_id} | Title: ${job.job_title}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listJobsWithoutPDF();
