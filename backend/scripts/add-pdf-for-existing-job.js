const pool = require('../config/database');

// CHANGE THESE VALUES FOR YOUR JOB
const JOB_ID = 1; // Replace with your actual job ID
const PDF_FILE_NAME = 'Software_Engineer_JD.pdf'; // Your actual PDF file name

async function addPDFForJob() {
  try {
    const result = await pool.query(`
      INSERT INTO job_attachments (
        job_id, file_name, original_name, file_path, 
        file_size, file_type, attachment_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING attachment_id;
    `, [
      JOB_ID,
      PDF_FILE_NAME,
      `JD - ${PDF_FILE_NAME}`,
      `/uploads/job-descriptions/${PDF_FILE_NAME}`,
      0, // Update with actual file size
      'application/pdf',
      'job_description'
    ]);
    
    console.log(`✅ PDF attachment added for Job ID ${JOB_ID}`);
    console.log(`📎 Attachment ID: ${result.rows[0].attachment_id}`);
    console.log(`📁 Place your PDF file at: backend/uploads/job-descriptions/${PDF_FILE_NAME}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addPDFForJob();