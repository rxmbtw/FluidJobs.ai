const { Pool } = require('pg');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
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

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, 'service-account-key.json')
});

const bucket = storage.bucket('fluidjobs-storage');

async function investigateJDPDFs() {
  try {
    // 1. Query jobs with JD attachments
    console.log('=== INVESTIGATING JOB DESCRIPTION PDFs ===\n');
    
    const result = await pool.query(`
      SELECT job_id, job_title, jd_attachment_name, created_at
      FROM jobs_enhanced 
      WHERE jd_attachment_name IS NOT NULL AND jd_attachment_name != ''
      ORDER BY created_at DESC
    `);
    
    console.log(`Total jobs in table: 22`);
    console.log(`Jobs with JD PDFs: ${result.rowCount}\n`);
    
    if (result.rowCount === 0) {
      console.log('No jobs found with JD attachments');
      await pool.end();
      return;
    }
    
    console.log('=== JOBS WITH JD ATTACHMENTS ===\n');
    
    for (const job of result.rows) {
      console.log(`Job ID: ${job.job_id}`);
      console.log(`Title: ${job.job_title}`);
      console.log(`JD Attachment: ${job.jd_attachment_name}`);
      console.log(`Created: ${job.created_at}`);
      
      // Check if file exists in GCS bucket
      try {
        const fileName = job.jd_attachment_name.replace('https://storage.googleapis.com/fluidjobs-storage/', '');
        const file = bucket.file(fileName);
        const [exists] = await file.exists();
        
        if (exists) {
          const [metadata] = await file.getMetadata();
          console.log(`✅ PDF EXISTS in bucket`);
          console.log(`   Size: ${(metadata.size / 1024).toFixed(2)} KB`);
          console.log(`   Updated: ${metadata.updated}`);
        } else {
          console.log(`❌ PDF NOT FOUND in bucket`);
        }
      } catch (error) {
        console.log(`⚠️  Error checking file: ${error.message}`);
      }
      
      console.log('---\n');
    }
    
    // 2. List all files in job-descriptions folder
    console.log('\n=== ALL FILES IN job-descriptions/ FOLDER ===\n');
    const [files] = await bucket.getFiles({ prefix: 'job-descriptions/' });
    console.log(`Total files in job-descriptions/: ${files.length}\n`);
    
    files.forEach(file => {
      console.log(`- ${file.name}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

investigateJDPDFs();
