const pool = require('../config/database');

// UPDATE THIS WITH YOUR ACTUAL PDF FILE NAME
const PDF_FILE_NAME = 'your-pdf-name.pdf'; // Change this to your actual PDF file name

async function updateWithManualPDF() {
  try {
    const publicUrl = `https://storage.googleapis.com/fluidjobs-storage/job-descriptions/${PDF_FILE_NAME}`;
    
    // Update existing record
    const result = await pool.query(`
      UPDATE job_attachments 
      SET file_path = $1, file_name = $2, original_name = $3
      WHERE job_id = 1 AND attachment_type = 'job_description'
      RETURNING attachment_id;
    `, [publicUrl, PDF_FILE_NAME, `JD - Software Engineer.pdf`]);
    
    if (result.rows.length > 0) {
      console.log('✅ Updated PDF record with your manual upload');
      console.log('📎 Attachment ID:', result.rows[0].attachment_id);
      console.log('🌐 PDF URL:', publicUrl);
      console.log('📋 Test the URL in browser to verify it works');
    } else {
      console.log('❌ No existing record found to update');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateWithManualPDF();