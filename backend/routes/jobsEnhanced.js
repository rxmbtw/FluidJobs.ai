const express = require('express');
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/job-descriptions');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for disk storage
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `JD_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      cb(null, uniqueName);
    }
  }),
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
      SELECT 
        j.*,
        a.account_name,
        ad.name as created_by_admin_name
      FROM jobs_enhanced j
      LEFT JOIN accounts a ON j.account_id = a.account_id
      LEFT JOIN admin ad ON j.created_by_admin_id = ad.id
      WHERE j.status = 'Published' OR j.status = 'active'
      ORDER BY j.created_at DESC;
    `);
    
    // Map to expected format (frontend expects GCP schema)
    const jobs = result.rows.map(job => ({
      job_id: job.id,
      job_title: job.title,
      company: job.company || 'FluidJobs.ai',
      job_type: job.job_type,
      job_domain: 'Technology',
      locations: job.location,
      min_salary: job.salary_range ? parseInt(job.salary_range.split(' - ')[0]) : null,
      max_salary: job.salary_range ? parseInt(job.salary_range.split(' - ')[1]) : null,
      skills: job.requirements || [],
      job_description: job.description,
      status: job.status,
      created_at: job.created_at || job.posted_date,
      jd_attachment_name: job.jd_pdf_url
    }));
    
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all accounts (MUST be before /:id route)
router.get('/accounts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM accounts ORDER BY account_name');
    res.json({ success: true, accounts: result.rows });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all jobs with attachments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        j.*,
        COUNT(ja.id) as attachment_count
      FROM jobs_enhanced j
      LEFT JOIN job_attachments ja ON j.id = ja.job_id
      WHERE j.status = 'Published' OR j.status = 'active'
      GROUP BY j.id
      ORDER BY j.created_at DESC
      LIMIT 10;
    `);
    
    const jobs = result.rows.map(job => ({
      id: job.id.toString(),
      title: job.title,
      company: job.company || 'FluidJobs.ai',
      type: job.job_type,
      industry: job.job_domain,
      salary: job.min_salary && job.max_salary ? 
        `₹${(job.min_salary/100000).toFixed(1)}L - ₹${(job.max_salary/100000).toFixed(1)}L` : 
        'Competitive',
      location: job.location || 'Remote',
      postedDate: new Date(job.created_at || job.posted_date).toLocaleDateString(),
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
        `Rs.${(job.min_salary/100000).toFixed(1)}L-Rs.${(job.max_salary/100000).toFixed(1)}L` : 
        'Competitive',
      postedDate: new Date(job.created_at).toLocaleDateString(),
      about_organisation: job.about_organisation,
      website: job.website,
      registration_opening_date: job.registration_opening_date,
      registration_closing_date: job.registration_closing_date,
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

// Upload JD file to VPS filesystem
router.post('/upload-jd', upload.single('jdFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/job-descriptions/${req.file.filename}`;
    console.log('✅ JD uploaded to VPS:', fileUrl);
    
    res.json({ 
      success: true, 
      filename: fileUrl,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading JD:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Extract text from PDF and generate job description using Gemini
router.post('/generate-jd-from-pdf', upload.single('jdFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    // Extract text from PDF using pdf-parse v2 API
    const parser = new PDFParse({ data: fs.readFileSync(req.file.path) });
    const pdfData = await parser.getText();
    const extractedText = pdfData.text;
    
    console.log('📄 Extracted text length:', extractedText.length);
    
    // Generate job description using Gemini
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      return res.json({
        success: true,
        jobDescription: extractedText,
        message: 'Gemini API not configured. Returning extracted text.'
      });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a professional HR assistant. Convert the following job description text into a well-formatted, professional job description. 

Format it with:
- Clear sections (Overview, Key Responsibilities, Requirements, What We Offer)
- Bullet points for lists
- Professional tone
- Remove any unnecessary information

Job Description Text:
${extractedText}

Provide only the formatted job description without any additional commentary.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedDescription = response.text();
    
    console.log('✅ Job description generated');
    
    res.json({
      success: true,
      jobDescription: generatedDescription,
      extractedText: extractedText
    });
    
  } catch (error) {
    console.error('Error generating JD from PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update job
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const jobData = req.body;
    
    // Convert skills to array if it's a string
    const skillsArray = Array.isArray(jobData.skills) ? jobData.skills : [jobData.skills];
    
    // Convert locations to array if it's a string
    let locationsArray;
    if (Array.isArray(jobData.locations)) {
      locationsArray = jobData.locations;
    } else if (typeof jobData.locations === 'string') {
      // Split by comma and trim whitespace
      locationsArray = jobData.locations.split(',').map(loc => loc.trim());
    } else {
      locationsArray = [jobData.locations];
    }
    
    const result = await pool.query(`
      UPDATE jobs_enhanced SET
        job_title = $1,
        job_type = $2,
        job_domain = $3,
        locations = $4,
        min_salary = $5,
        max_salary = $6,
        skills = $7,
        job_description = $8,
        about_organisation = $9,
        website = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE job_id = $11
      RETURNING *;
    `, [
      jobData.job_title,
      jobData.job_type,
      jobData.job_domain,
      locationsArray,
      jobData.min_salary || 600000,
      jobData.max_salary || 1500000,
      skillsArray,
      jobData.job_description,
      jobData.about_organisation,
      jobData.website,
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json({ 
      success: true, 
      job: result.rows[0],
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
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
        contact_person, job_close_days, closing_date, status,
        account_id, created_by_admin_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 'Published', $29, $30)
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
      jobData.contact_person, jobData.job_close_days, closingDate,
      jobData.account_id, jobData.created_by_admin_id
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