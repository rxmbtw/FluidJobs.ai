const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Get all jobs with attachments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        j.*,
        COUNT(ja.attachment_id) as attachment_count
      FROM jobs_enhanced j
      LEFT JOIN job_attachments ja ON j.job_id = ja.job_id
      WHERE j.status = 'Published'
      GROUP BY j.job_id
      ORDER BY j.created_at DESC;
    `);
    
    const jobs = result.rows.map(job => ({
      id: job.job_id.toString(),
      title: job.job_title,
      company: 'FluidJobs.ai',
      type: job.job_type,
      industry: job.job_domain,
      salary: job.min_salary && job.max_salary ? 
        `₹${(job.min_salary/100000).toFixed(1)}L - ₹${(job.max_salary/100000).toFixed(1)}L` : 
        'Competitive',
      location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations,
      postedDate: new Date(job.created_at).toLocaleDateString(),
      isEligible: true,
      registrationDeadline: job.closing_date ? new Date(job.closing_date).toLocaleDateString() : null,
      attachmentCount: parseInt(job.attachment_count) || 0
    }));
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get job by ID with attachments
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobResult = await pool.query(`
      SELECT * FROM jobs_enhanced WHERE job_id = $1;
    `, [id]);
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobResult.rows[0];
    
    // Get attachments
    const attachmentsResult = await pool.query(`
      SELECT attachment_id, original_name, file_path, file_type, attachment_type, uploaded_at
      FROM job_attachments 
      WHERE job_id = $1
      ORDER BY uploaded_at DESC;
    `, [id]);
    
    res.json({
      id: job.job_id.toString(),
      title: job.job_title,
      company: 'FluidJobs.ai',
      type: job.job_type,
      industry: job.job_domain,
      salary: job.min_salary && job.max_salary ? 
        `₹${(job.min_salary/100000).toFixed(1)}L - ₹${(job.max_salary/100000).toFixed(1)}L` : 
        'Competitive',
      location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations,
      description: job.job_description,
      skills: Array.isArray(job.skills) ? job.skills : [],
      experience: `${job.min_experience}-${job.max_experience} years`,
      employmentType: job.job_type,
      salaryRange: job.min_salary && job.max_salary ? 
        `₹${(job.min_salary/100000).toFixed(1)}L - ₹${(job.max_salary/100000).toFixed(1)}L` : 
        'Competitive',
      attachments: attachmentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

module.exports = router;