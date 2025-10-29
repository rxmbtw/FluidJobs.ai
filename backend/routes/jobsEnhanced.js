const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for JD file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/job-descriptions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'JD-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Save job draft
router.post('/draft', async (req, res) => {
  try {
    const {
      userId = 'anonymous',
      currentStep,
      jobData
    } = req.body;

    const {
      job_title, job_domain, job_type, locations, mode_of_job,
      min_experience, max_experience, skills, min_salary, max_salary,
      show_salary_to_candidate, job_description, selected_image,
      jd_attachment_name, eligible_courses, eligibility_criteria,
      selection_process, other_details, job_close_days
    } = jobData;

    // Check if draft exists for this user
    const existingDraft = await pool.query(
      'SELECT draft_id FROM job_drafts WHERE user_id = $1',
      [userId]
    );

    let query, values;
    
    if (existingDraft.rows.length > 0) {
      // Update existing draft
      query = `
        UPDATE job_drafts SET 
          job_title = $2, job_domain = $3, job_type = $4, locations = $5,
          mode_of_job = $6, min_experience = $7, max_experience = $8, skills = $9,
          min_salary = $10, max_salary = $11, show_salary_to_candidate = $12,
          job_description = $13, selected_image = $14, jd_attachment_name = $15,
          eligible_courses = $16, eligibility_criteria = $17, selection_process = $18,
          other_details = $19, job_close_days = $20, current_step = $21,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING draft_id
      `;
      values = [
        userId, job_title, job_domain, job_type, locations,
        mode_of_job, min_experience, max_experience, skills,
        min_salary, max_salary, show_salary_to_candidate,
        job_description, selected_image, jd_attachment_name,
        eligible_courses, eligibility_criteria, selection_process,
        other_details, job_close_days, currentStep
      ];
    } else {
      // Create new draft
      query = `
        INSERT INTO job_drafts (
          user_id, job_title, job_domain, job_type, locations, mode_of_job,
          min_experience, max_experience, skills, min_salary, max_salary,
          show_salary_to_candidate, job_description, selected_image,
          jd_attachment_name, eligible_courses, eligibility_criteria,
          selection_process, other_details, job_close_days, current_step
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING draft_id
      `;
      values = [
        userId, job_title, job_domain, job_type, locations,
        mode_of_job, min_experience, max_experience, skills,
        min_salary, max_salary, show_salary_to_candidate,
        job_description, selected_image, jd_attachment_name,
        eligible_courses, eligibility_criteria, selection_process,
        other_details, job_close_days, currentStep
      ];
    }

    const result = await pool.query(query, values);
    res.json({ success: true, draftId: result.rows[0].draft_id });
  } catch (error) {
    console.error('Error saving job draft:', error);
    res.status(500).json({ error: 'Failed to save job draft' });
  }
});

// Get job draft
router.get('/draft/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM job_drafts WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, draft: result.rows[0] });
    } else {
      res.json({ success: true, draft: null });
    }
  } catch (error) {
    console.error('Error fetching job draft:', error);
    res.status(500).json({ error: 'Failed to fetch job draft' });
  }
});

// Upload JD file
router.post('/upload-jd', upload.single('jdFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({ 
      success: true, 
      filename: req.file.filename,
      originalName: req.file.originalname 
    });
  } catch (error) {
    console.error('Error uploading JD file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Create job (final submission)
router.post('/create', async (req, res) => {
  try {
    const {
      job_title, job_domain, job_type, locations, mode_of_job,
      min_experience, max_experience, skills, min_salary, max_salary,
      show_salary_to_candidate, job_description, selected_image,
      jd_attachment_name, eligible_courses, eligibility_criteria,
      selection_process, other_details, job_close_days
    } = req.body;

    // Calculate closing date
    const closingDate = new Date();
    closingDate.setDate(closingDate.getDate() + (job_close_days || 30));

    const query = `
      INSERT INTO jobs_enhanced (
        job_title, job_domain, job_type, locations, mode_of_job,
        min_experience, max_experience, skills, min_salary, max_salary,
        show_salary_to_candidate, job_description, selected_image,
        jd_attachment_name, eligible_courses, eligibility_criteria,
        selection_process, other_details, job_close_days, closing_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING job_id
    `;

    const values = [
      job_title, job_domain, job_type, locations, mode_of_job,
      min_experience, max_experience, skills, min_salary, max_salary,
      show_salary_to_candidate, job_description, selected_image,
      jd_attachment_name, eligible_courses, eligibility_criteria,
      selection_process, other_details, job_close_days, closingDate
    ];

    const result = await pool.query(query, values);
    
    // Clean up draft after successful job creation
    if (req.body.userId) {
      await pool.query('DELETE FROM job_drafts WHERE user_id = $1', [req.body.userId]);
    }

    res.json({ 
      success: true, 
      jobId: result.rows[0].job_id,
      message: 'Job created successfully!' 
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get all jobs
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        job_id, job_title, job_domain, job_type, locations, mode_of_job,
        min_experience, max_experience, min_salary, max_salary,
        status, published_date, closing_date, selected_image
      FROM jobs_enhanced 
      ORDER BY created_at DESC
    `);

    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job details
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM jobs_enhanced WHERE job_id = $1',
      [jobId]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, job: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

module.exports = router;