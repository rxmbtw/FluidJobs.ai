const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function uploadJobPDF() {
  try {
    // First, let's see what jobs exist
    const jobsResult = await pool.query(`
      SELECT job_id, job_title, status 
      FROM jobs_enhanced 
      WHERE status = 'Published' 
      ORDER BY job_id;
    `);
    
    console.log('📋 Available Jobs:');
    jobsResult.rows.forEach(job => {
      console.log(`  ID: ${job.job_id} - ${job.job_title}`);
    });
    
    if (jobsResult.rows.length === 0) {
      console.log('❌ No published jobs found. Create a job first.');
      return;
    }
    
    // Example: Upload PDF for first job
    const jobId = jobsResult.rows[0].job_id;
    const jobTitle = jobsResult.rows[0].job_title;
    
    // Insert PDF attachment record
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
      `JD_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      `JD - ${jobTitle}.pdf`,
      `/uploads/job-descriptions/JD_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      0, // You'll update this with actual file size
      'application/pdf',
      'job_description'
    ]);
    
    console.log(`✅ PDF attachment record created with ID: ${result.rows[0].attachment_id}`);
    console.log(`📁 Upload your PDF to: backend/uploads/job-descriptions/`);
    console.log(`📝 File name should be: JD_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

uploadJobPDF();