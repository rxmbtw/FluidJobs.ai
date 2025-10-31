const pool = require('../config/database');

async function createSampleJobWithPDF() {
  try {
    // Create a sample job first
    const jobResult = await pool.query(`
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
    
    const jobId = jobResult.rows[0].job_id;
    console.log(`✅ Created job: ${jobResult.rows[0].job_title} (ID: ${jobId})`);
    
    // Add PDF attachment
    const attachmentResult = await pool.query(`
      INSERT INTO job_attachments (
        job_id, file_name, original_name, file_path, 
        file_size, file_type, attachment_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING attachment_id;
    `, [
      jobId,
      `JD_Software_Engineer_${Date.now()}.pdf`,
      'JD - Software Engineer.pdf',
      `/uploads/job-descriptions/JD_Software_Engineer_${Date.now()}.pdf`,
      1024000,
      'application/pdf', 
      'job_description'
    ]);
    
    console.log(`✅ PDF attachment added (ID: ${attachmentResult.rows[0].attachment_id})`);
    
    // Show how frontend will fetch this
    console.log('\n📋 Frontend API Query:');
    console.log(`GET /api/jobs/${jobId}/attachments`);
    
    const fetchQuery = await pool.query(`
      SELECT attachment_id, original_name, file_path, file_type, attachment_type
      FROM job_attachments 
      WHERE job_id = $1 AND attachment_type = 'job_description';
    `, [jobId]);
    
    console.log('\n📎 Attachment Data:');
    console.log(JSON.stringify(fetchQuery.rows, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createSampleJobWithPDF();