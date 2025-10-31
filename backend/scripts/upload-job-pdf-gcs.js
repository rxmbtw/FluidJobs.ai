const { uploadJobPDF } = require('../config/storage');
const pool = require('../config/database');
const fs = require('fs');

// MODIFY THESE VALUES
const LOCAL_PDF_PATH = 'd:\\FluidJobs.ai\\backend\\uploads\\job-descriptions\\sample-job-description.pdf'; // Change this path
const JOB_ID = 1; // Change to your job ID
const JOB_TITLE = 'Software Engineer'; // Change to your job title

async function uploadPDFToGCS() {
  try {
    // Check if file exists
    if (!fs.existsSync(LOCAL_PDF_PATH)) {
      console.log('❌ PDF file not found at:', LOCAL_PDF_PATH);
      return;
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(LOCAL_PDF_PATH);
    const fileName = LOCAL_PDF_PATH.split('\\').pop();
    
    const mockFile = {
      buffer: fileBuffer,
      originalname: fileName,
      mimetype: 'application/pdf',
      size: fileBuffer.length
    };
    
    // Upload to GCS
    const { publicUrl, fileName: gcsFileName } = await uploadJobPDF(mockFile, JOB_ID, JOB_TITLE);
    
    // Save to database
    const result = await pool.query(`
      INSERT INTO job_attachments (
        job_id, file_name, original_name, file_path, 
        file_size, file_type, attachment_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING attachment_id;
    `, [
      JOB_ID,
      gcsFileName,
      `JD - ${JOB_TITLE}.pdf`,
      publicUrl,
      mockFile.size,
      'application/pdf',
      'job_description'
    ]);
    
    console.log('✅ PDF uploaded successfully!');
    console.log('📎 Attachment ID:', result.rows[0].attachment_id);
    console.log('🌐 Public URL:', publicUrl);
    console.log('📋 All developers can now access this PDF via the application');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

uploadPDFToGCS();