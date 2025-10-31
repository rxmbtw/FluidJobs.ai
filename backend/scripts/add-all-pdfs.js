const pool = require('../config/database');

const pdfs = [
  { fileName: 'Business_Analyst__Motor_Insurance__4_Years.pdf', jobTitle: 'Business Analyst - Motor Insurance' },
  { fileName: 'Content_Analyst__03_Years.pdf', jobTitle: 'Content Analyst' },
  { fileName: 'Data_Research_Analyst__2_Years.pdf', jobTitle: 'Data Research Analyst' },
  { fileName: 'Frontend_Developer__4_Years.pdf', jobTitle: 'Frontend Developer' },
  { fileName: 'Frontend_Developer__Forex_CFD_Domain__3_Years.pdf', jobTitle: 'Frontend Developer - Forex CFD' },
  { fileName: 'Manager_Talent_Acquisition__6_Years.pdf', jobTitle: 'Manager Talent Acquisition' },
  { fileName: 'Python_Fullstack_Developer__5_Years.pdf', jobTitle: 'Python Fullstack Developer' },
  { fileName: 'QA_Automation_Selenium__2_Years.pdf', jobTitle: 'QA Automation Selenium' },
  { fileName: 'QA_Engineer__Insurance__2_Years.pdf', jobTitle: 'QA Engineer - Insurance' }
];

async function addAllPDFs() {
  try {
    // First create jobs for each PDF
    for (const pdf of pdfs) {
      const publicUrl = `https://storage.googleapis.com/fluidjobs-storage/job-descriptions/${pdf.fileName}`;
      
      // Create job
      const jobResult = await pool.query(`
        INSERT INTO jobs_enhanced (
          job_title, job_domain, job_type, min_experience, max_experience,
          min_salary, max_salary, locations, mode_of_job, skills,
          job_description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING job_id;
      `, [
        pdf.jobTitle,
        'Technology',
        'Full-time',
        2, 6,
        600000, 1500000,
        ['Mumbai', 'Bangalore'],
        'Hybrid',
        ['Professional Skills'],
        `Job description for ${pdf.jobTitle}`,
        'Published'
      ]);
      
      const jobId = jobResult.rows[0].job_id;
      
      // Add PDF attachment
      await pool.query(`
        INSERT INTO job_attachments (
          job_id, file_name, original_name, file_path, 
          file_type, attachment_type
        ) VALUES ($1, $2, $3, $4, $5, $6);
      `, [
        jobId,
        pdf.fileName,
        `JD - ${pdf.jobTitle}.pdf`,
        publicUrl,
        'application/pdf',
        'job_description'
      ]);
      
      console.log(`✅ Added: ${pdf.jobTitle} (Job ID: ${jobId})`);
    }
    
    console.log('\n🎉 All PDFs added successfully!');
    
    // Show summary
    const summary = await pool.query(`
      SELECT j.job_id, j.job_title, ja.original_name, ja.file_path
      FROM jobs_enhanced j
      JOIN job_attachments ja ON j.job_id = ja.job_id
      WHERE ja.attachment_type = 'job_description'
      ORDER BY j.job_id;
    `);
    
    console.log('\n📋 Jobs with PDFs:');
    summary.rows.forEach(row => {
      console.log(`  ${row.job_id}: ${row.job_title}`);
      console.log(`     PDF: ${row.original_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addAllPDFs();