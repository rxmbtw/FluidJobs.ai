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

async function getJobDetails() {
  try {
    const result = await pool.query(`
      SELECT job_id, job_title, job_domain, job_type, locations, mode_of_job,
             min_experience, max_experience, skills, job_description, selected_image
      FROM jobs_enhanced 
      WHERE job_id BETWEEN 15 AND 24
      ORDER BY job_id ASC
    `);
    
    console.log(JSON.stringify(result.rows, null, 2));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getJobDetails();
