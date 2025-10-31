const { Storage } = require('@google-cloud/storage');
const pool = require('../config/database');
const path = require('path');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

async function uploadPDFToBucket(localFilePath, jobId, jobTitle) {
  try {
    const fileName = `job-descriptions/JD_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    
    // Upload to bucket
    await bucket.upload(localFilePath, {
      destination: fileName,
      metadata: {
        contentType: 'application/pdf'
      }
    });
    
    const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${fileName}`;
    
    // Add to database
    const result = await pool.query(`
      INSERT INTO job_attachments (
        job_id, file_name, original_name, file_path, 
        file_type, attachment_type
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING attachment_id;
    `, [
      jobId,
      fileName,
      `JD - ${jobTitle}.pdf`,
      publicUrl,
      'application/pdf',
      'job_description'
    ]);
    
    console.log(`✅ PDF uploaded to bucket: ${publicUrl}`);
    console.log(`📎 Database record ID: ${result.rows[0].attachment_id}`);
    
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Upload error:', error.message);
  }
}

// Example usage - modify these values
const LOCAL_PDF_PATH = 'C:\\path\\to\\your\\file.pdf'; // Change this
const JOB_ID = 1; // Change this
const JOB_TITLE = 'Software Engineer'; // Change this

uploadPDFToBucket(LOCAL_PDF_PATH, JOB_ID, JOB_TITLE)
  .then(() => pool.end());