const express = require('express');
const pool = require('../config/database');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const router = express.Router();

// Google Cloud Storage setup
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.join(__dirname, '../service-account-key.json')
});

const bucket = storage.bucket('fluidjobs-storage');

// Configure multer for memory storage (upload to GCS)
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Get all jobs
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM jobs_enhanced 
      WHERE status = 'Published'
      ORDER BY created_at DESC;
    `);
    
    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// Save job draft
router.post('/draft', async (req, res) => {
  try {
    const { userId, currentStep, jobData } = req.body;
    
    // Check if draft exists
    const existing = await pool.query('SELECT draft_id FROM job_drafts WHERE user_id = $1', [userId]);
    
    if (existing.rows.length > 0) {
      // Update existing draft
      const result = await pool.query(`
        UPDATE job_drafts SET
          job_title = $1, job_domain = $2, job_type = $3, locations = $4,
          mode_of_job = $5, min_experience = $6, max_experience = $7, skills = $8,
          min_salary = $9, max_salary = $10, show_salary_to_candidate = $11,
          job_description = $12, selected_image = $13, eligible_courses = $14,
          eligibility_criteria = $15, selection_process = $16, other_details = $17,
          registration_schedule = $18, registration_opening_date = $19, registration_closing_date = $20,
          about_organisation = $21, website = $22, industry = $23, organisation_size = $24, 
          contact_person = $25, job_close_days = $26, current_step = $27, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $28
        RETURNING draft_id;
      `, [
        jobData.job_title, jobData.job_domain, jobData.job_type, jobData.locations,
        jobData.mode_of_job, jobData.min_experience, jobData.max_experience, jobData.skills,
        jobData.min_salary, jobData.max_salary, jobData.show_salary_to_candidate,
        jobData.job_description, jobData.selected_image, jobData.eligible_courses,
        jobData.eligibility_criteria, jobData.selection_process, jobData.other_details,
        jobData.registration_schedule, jobData.registration_opening_date, jobData.registration_closing_date,
        jobData.about_organisation, jobData.website, jobData.industry, jobData.organisation_size, 
        jobData.contact_person, jobData.job_close_days, currentStep, userId
      ]);
      
      res.json({ success: true, draftId: result.rows[0].draft_id });
    } else {
      // Create new draft
      const result = await pool.query(`
        INSERT INTO job_drafts (
          user_id, job_title, job_domain, job_type, locations, mode_of_job,
          min_experience, max_experience, skills, min_salary, max_salary,
          show_salary_to_candidate, job_description, selected_image,
          eligible_courses, eligibility_criteria, selection_process, other_details,
          registration_schedule, registration_opening_date, registration_closing_date,
          about_organisation, website, industry, organisation_size, contact_person, 
          job_close_days, current_step
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        RETURNING draft_id;
      `, [
        userId, jobData.job_title, jobData.job_domain, jobData.job_type, jobData.locations,
        jobData.mode_of_job, jobData.min_experience, jobData.max_experience, jobData.skills,
        jobData.min_salary, jobData.max_salary, jobData.show_salary_to_candidate,
        jobData.job_description, jobData.selected_image, jobData.eligible_courses,
        jobData.eligibility_criteria, jobData.selection_process, jobData.other_details,
        jobData.registration_schedule, jobData.registration_opening_date, jobData.registration_closing_date,
        jobData.about_organisation, jobData.website, jobData.industry, jobData.organisation_size, 
        jobData.contact_person, jobData.job_close_days, currentStep
      ]);
      
      res.json({ success: true, draftId: result.rows[0].draft_id });
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get job draft
router.get('/draft/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM job_drafts WHERE user_id = $1', [userId]);
    
    if (result.rows.length > 0) {
      res.json({ success: true, draft: result.rows[0] });
    } else {
      res.json({ success: true, draft: null });
    }
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload JD file to Google Cloud Storage
router.post('/upload-jd', upload.single('jdFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const fileName = `job-descriptions/JD_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const file = bucket.file(fileName);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'application/pdf',
      },
      resumable: false
    });
    
    stream.on('error', (error) => {
      console.error('GCS upload error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload to cloud storage' });
    });
    
    stream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/fluidjobs-storage/${fileName}`;
      console.log('✅ JD uploaded to GCS:', publicUrl);
      
      res.json({ 
        success: true, 
        filename: publicUrl,
        originalName: req.file.originalname
      });
    });
    
    stream.end(req.file.buffer);
  } catch (error) {
    console.error('Error uploading JD:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create job
router.post('/create', async (req, res) => {
  try {
    const jobData = req.body;
    
    // Calculate closing date
    const closingDate = new Date();
    closingDate.setDate(closingDate.getDate() + (jobData.job_close_days || 30));
    
    // Convert arrays to PostgreSQL array format
    const locationsArray = Array.isArray(jobData.locations) ? jobData.locations : [jobData.locations];
    const skillsArray = Array.isArray(jobData.skills) ? jobData.skills : [jobData.skills];

    const result = await pool.query(`
      INSERT INTO jobs_enhanced (
        job_title, job_domain, job_type, locations, mode_of_job,
        min_experience, max_experience, skills, min_salary, max_salary,
        show_salary_to_candidate, job_description, selected_image,
        jd_attachment_name, eligible_courses, eligibility_criteria,
        selection_process, other_details, registration_schedule,
        registration_opening_date, registration_closing_date,
        about_organisation, website, industry, organisation_size,
        contact_person, job_close_days, closing_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 'Published')
      RETURNING job_id;
    `, [
      jobData.job_title, jobData.job_domain, jobData.job_type, locationsArray,
      jobData.mode_of_job, jobData.min_experience, jobData.max_experience,
      skillsArray, jobData.min_salary, jobData.max_salary,
      jobData.show_salary_to_candidate, jobData.job_description,
      jobData.selected_image, jobData.jd_attachment_name, jobData.eligible_courses,
      jobData.eligibility_criteria, jobData.selection_process, jobData.other_details,
      jobData.registration_schedule, jobData.registration_opening_date, jobData.registration_closing_date,
      jobData.about_organisation, jobData.website, jobData.industry, jobData.organisation_size, 
      jobData.contact_person, jobData.job_close_days, closingDate
    ]);
    
    // Delete draft if exists
    if (jobData.userId) {
      await pool.query('DELETE FROM job_drafts WHERE user_id = $1', [jobData.userId]);
    }
    
    res.json({ 
      success: true, 
      jobId: result.rows[0].job_id,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;