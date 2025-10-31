const pool = require('../config/database');

async function addJobPDFManual() {
  try {
    // Check all jobs (including drafts)
    const jobsResult = await pool.query(`
      SELECT job_id, job_title, status 
      FROM jobs_enhanced 
      ORDER BY job_id;
    `);
    
    console.log('📋 All Jobs:');
    jobsResult.rows.forEach(job => {
      console.log(`  ID: ${job.job_id} - ${job.job_title} (${job.status})`);
    });
    
    if (jobsResult.rows.length === 0) {
      console.log('❌ No jobs found.');
      return;
    }
    
    // Add PDF for the first job as example
    const jobId = 1; // Change this to your job ID
    const jobTitle = "Software Engineer"; // Change this to your job title
    
    const result = await pool.query(`
      INSERT INTO job_attachments (
        job_id, 
        file_name, 
        original_name, 
        file_path, 
        file_size, 
        file_type, 
        attachment_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING attachment_id;
    `, [
      jobId,
      `JD_Software_Engineer_${Date.now()}.pdf`,
      `JD - Software Engineer.pdf`,
      `/uploads/job-descriptions/JD_Software_Engineer_${Date.now()}.pdf`,
      1024000, // 1MB example size
      'application/pdf',
      'job_description'
    ]);
    
    console.log(`✅ PDF attachment added for Job ID ${jobId}`);
    console.log(`📎 Attachment ID: ${result.rows[0].attachment_id}`);
    
    // Show how to fetch attachments
    const attachments = await pool.query(`
      SELECT * FROM job_attachments WHERE job_id = $1;
    `, [jobId]);
    
    console.log('\n📋 Job Attachments:');
    attachments.rows.forEach(att => {
      console.log(`  ${att.original_name} - ${att.file_path}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addJobPDFManual();