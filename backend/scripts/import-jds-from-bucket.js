const { Storage } = require('@google-cloud/storage');
const pool = require('../config/database');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

async function importJobDescriptions() {
  try {
    const bucketName = 'fluidjobs-storage';
    const prefix = 'job-descriptions/';
    
    console.log('📁 Fetching job descriptions from bucket...\n');
    
    const [files] = await storage.bucket(bucketName).getFiles({ prefix });
    const pdfFiles = files.filter(f => f.name.endsWith('.pdf') && f.name !== prefix);
    
    console.log(`Found ${pdfFiles.length} PDF files\n`);
    
    for (const file of pdfFiles) {
      try {
        console.log(`Processing: ${file.name}`);
        
        // Extract job info from filename
        const jobTitle = extractJobTitle(file.name);
        const jobDescription = `View full job description in the attached PDF file.`;
        const fileUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`
        
        // Insert into database
        const result = await pool.query(`
          INSERT INTO jobs_enhanced (
            job_title, job_description, jd_attachment_name, 
            job_type, status, job_domain, locations, 
            min_experience, max_experience, skills,
            job_close_days, closing_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING job_id;
        `, [
          jobTitle,
          jobDescription,
          fileUrl,
          'Full-time',
          'Published',
          'Technology',
          ['Remote', 'Hybrid'],
          0,
          10,
          [],
          30,
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ]);
        
        console.log(`✅ Imported: ${jobTitle} (ID: ${result.rows[0].job_id})\n`);
        
      } catch (err) {
        console.error(`❌ Error processing ${file.name}:`, err.message);
      }
    }
    
    console.log('\n✅ Import completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function extractJobTitle(filename) {
  // Extract from filename
  return filename.split('/').pop().replace('.pdf', '').replace(/_/g, ' ').replace(/JD \d+ /, '');
}

importJobDescriptions();
