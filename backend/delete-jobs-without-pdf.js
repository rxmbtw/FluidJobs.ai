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

async function deleteJobsWithoutPDF() {
  try {
    const result = await pool.query(`
      DELETE FROM jobs_enhanced 
      WHERE jd_attachment_name IS NULL OR jd_attachment_name = ''
      RETURNING job_id, job_title
    `);
    
    console.log(`✅ Deleted ${result.rowCount} jobs without JD PDF\n`);
    
    result.rows.forEach(job => {
      console.log(`Deleted - ID: ${job.job_id} | Title: ${job.job_title}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteJobsWithoutPDF();
