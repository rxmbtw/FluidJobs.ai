const pool = require('../config/database');

async function addSamplePDFRecord() {
  try {
    // First create a job if none exists
    let jobResult = await pool.query('SELECT job_id, job_title FROM jobs_enhanced LIMIT 1');
    
    if (jobResult.rows.length === 0) {
      // Create a sample job
      jobResult = await pool.query(`
        INSERT INTO jobs_enhanced (
          job_title, job_domain, job_type, min_experience, max_experience,
          min_salary, max_salary, locations, mode_of_job, skills,
          job_description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING job_id, job_title;
      `, [
        'Software Engineer',
        'Software Development', 
        'Full-time',
        2, 5,
        800000, 1200000,
        ['Bangalore', 'Mumbai'],
        'Hybrid',
        ['JavaScript', 'React', 'Node.js'],
        'We are looking for a skilled Software Engineer...',
        'Published'
      ]);
      console.log('✅ Created sample job');
    }
    
    const jobId = jobResult.rows[0].job_id;
    const jobTitle = jobResult.rows[0].job_title;
    
    // Add PDF record (using a public sample PDF URL for now)
    const samplePDFUrl = 'https://storage.googleapis.com/fluidjobs-storage/job-descriptions/sample-job-description.pdf';
    
    const result = await pool.query(`
      INSERT INTO job_attachments (
        job_id, file_name, original_name, file_path, 
        file_size, file_type, attachment_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING attachment_id;
    `, [
      jobId,
      'sample-job-description.pdf',
      `JD - ${jobTitle}.pdf`,
      samplePDFUrl,
      1024,
      'application/pdf',
      'job_description'
    ]);
    
    console.log('✅ PDF attachment record added!');
    console.log('📎 Attachment ID:', result.rows[0].attachment_id);
    console.log('🆔 Job ID:', jobId);
    console.log('📋 Job Title:', jobTitle);
    console.log('🌐 PDF URL:', samplePDFUrl);
    
    // Test fetching attachments
    const attachments = await pool.query(`
      SELECT * FROM job_attachments WHERE job_id = $1;
    `, [jobId]);
    
    console.log('\n📋 Job Attachments:');
    attachments.rows.forEach(att => {
      console.log(`  - ${att.original_name}`);
      console.log(`    URL: ${att.file_path}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addSamplePDFRecord();