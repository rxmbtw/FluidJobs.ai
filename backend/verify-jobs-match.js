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

// Jobs from JobOpenings.tsx hardcoded array
const frontendJobs = [
  { jobId: "15", title: "Business Analyst | Motor Insurance" },
  { jobId: "16", title: "Content Analyst" },
  { jobId: "17", title: "Data Research Analyst" },
  { jobId: "18", title: "Frontend Developer" },
  { jobId: "19", title: "Frontend Developer | Forex CFD Domain" },
  { jobId: "20", title: "Data Analyst - Fresher" },
  { jobId: "21", title: "Manager Talent Acquisition" },
  { jobId: "22", title: "Python Fullstack Developer" },
  { jobId: "23", title: "QA Automation Selenium" },
  { jobId: "24", title: "QA Engineer | Insurance" }
];

async function verifyJobsMatch() {
  try {
    console.log('=== VERIFICATION: Frontend Jobs vs Database Jobs ===\n');
    
    // Get jobs from database
    const result = await pool.query(`
      SELECT job_id, job_title, jd_attachment_name
      FROM jobs_enhanced 
      WHERE job_id BETWEEN 15 AND 24
      ORDER BY job_id ASC
    `);
    
    console.log('Database Jobs (IDs 15-24):\n');
    result.rows.forEach(job => {
      console.log(`ID: ${job.job_id} | Title: ${job.job_title}`);
      console.log(`PDF: ${job.jd_attachment_name ? '✅ YES' : '❌ NO'}\n`);
    });
    
    console.log('\n=== COMPARISON ===\n');
    
    let allMatch = true;
    
    frontendJobs.forEach(frontendJob => {
      const dbJob = result.rows.find(db => db.job_id.toString() === frontendJob.jobId);
      
      if (!dbJob) {
        console.log(`❌ MISSING: Job ID ${frontendJob.jobId} not found in database`);
        allMatch = false;
      } else {
        const titleMatch = dbJob.job_title.includes(frontendJob.title.split('|')[0].trim()) || 
                          frontendJob.title.includes(dbJob.job_title.split(' ')[0]);
        const hasPDF = dbJob.jd_attachment_name && dbJob.jd_attachment_name.trim() !== '';
        
        if (titleMatch && hasPDF) {
          console.log(`✅ MATCH: ID ${frontendJob.jobId}`);
          console.log(`   Frontend: ${frontendJob.title}`);
          console.log(`   Database: ${dbJob.job_title}`);
          console.log(`   PDF: YES\n`);
        } else {
          console.log(`⚠️  MISMATCH: ID ${frontendJob.jobId}`);
          console.log(`   Frontend: ${frontendJob.title}`);
          console.log(`   Database: ${dbJob.job_title}`);
          console.log(`   PDF: ${hasPDF ? 'YES' : 'NO'}\n`);
          allMatch = false;
        }
      }
    });
    
    console.log('\n=== RESULT ===');
    if (allMatch) {
      console.log('✅ ALL JOBS MATCH! Frontend and database are in sync.');
    } else {
      console.log('❌ MISMATCH DETECTED! Some jobs do not match.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyJobsMatch();
