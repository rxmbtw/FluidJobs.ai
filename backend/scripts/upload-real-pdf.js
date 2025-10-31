const { Storage } = require('@google-cloud/storage');
const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

async function uploadRealPDF() {
  try {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    const bucket = storage.bucket(bucketName);
    
    // Create a simple PDF content
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 50 750 Td (Software Engineer Job Description) Tj ET
endstream endobj
xref 0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000251 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref 295
%%EOF`;
    
    const fileName = `job-descriptions/JD_Software_Engineer_${Date.now()}.pdf`;
    const file = bucket.file(fileName);
    
    // Upload PDF
    await file.save(pdfContent, {
      metadata: {
        contentType: 'application/pdf',
      },
    });
    
    // Make file public
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    console.log('✅ PDF uploaded to:', publicUrl);
    
    // Update database record
    await pool.query(`
      UPDATE job_attachments 
      SET file_path = $1, file_name = $2
      WHERE job_id = 1 AND attachment_type = 'job_description';
    `, [publicUrl, fileName]);
    
    console.log('✅ Database updated with real PDF URL');
    console.log('🌐 Test URL:', publicUrl);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

uploadRealPDF();