const { Storage } = require('@google-cloud/storage');
const pool = require('../config/database');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

async function cleanupAndKeep10Jobs() {
  try {
    const bucketName = 'fluidjobs-storage';
    const prefix = 'job-descriptions/';
    
    console.log('📁 Fetching job descriptions from bucket...\n');
    
    // Get files from bucket
    const [files] = await storage.bucket(bucketName).getFiles({ prefix });
    const pdfFiles = files.filter(f => f.name.endsWith('.pdf') && f.name !== prefix);
    
    console.log(`Found ${pdfFiles.length} PDF files in bucket\n`);
    
    // Get bucket file URLs
    const bucketFileUrls = pdfFiles.map(file => 
      `https://storage.googleapis.com/${bucketName}/${file.name}`
    );
    
    console.log('🗑️  Deleting jobs not in bucket...\n');
    
    // Delete all jobs that don't have matching bucket files
    const deleteResult = await pool.query(`
      DELETE FROM jobs_enhanced 
      WHERE jd_attachment_name IS NULL 
         OR jd_attachment_name NOT LIKE 'https://storage.googleapis.com/fluidjobs-storage/job-descriptions/%'
         OR jd_attachment_name NOT IN (${bucketFileUrls.map((_, i) => `$${i + 1}`).join(',')})
      RETURNING job_id, job_title;
    `, bucketFileUrls);
    
    console.log(`✅ Deleted ${deleteResult.rows.length} jobs not in bucket\n`);
    
    // Get remaining jobs count
    const countResult = await pool.query('SELECT COUNT(*) FROM jobs_enhanced WHERE status = \'Published\'');
    const currentCount = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Current job count: ${currentCount}\n`);
    
    if (currentCount > 10) {
      console.log('🗑️  Keeping only the first 10 jobs...\n');
      
      // Keep only 10 jobs (the most recent ones)
      await pool.query(`
        DELETE FROM jobs_enhanced 
        WHERE job_id NOT IN (
          SELECT job_id FROM jobs_enhanced 
          WHERE status = 'Published' 
          ORDER BY created_at DESC 
          LIMIT 10
        );
      `);
      
      console.log('✅ Kept only 10 jobs\n');
    }
    
    // Show final count
    const finalResult = await pool.query(`
      SELECT job_id, job_title, jd_attachment_name 
      FROM jobs_enhanced 
      WHERE status = 'Published' 
      ORDER BY created_at DESC;
    `);
    
    console.log(`\n✅ Final job count: ${finalResult.rows.length}\n`);
    console.log('Jobs in database:');
    finalResult.rows.forEach((job, i) => {
      console.log(`${i + 1}. ${job.job_title}`);
    });
    
    console.log('\n✅ Cleanup completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupAndKeep10Jobs();
