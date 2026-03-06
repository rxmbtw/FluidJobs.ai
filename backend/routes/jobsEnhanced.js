const express = require('express');
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logAudit } = require('../middleware/auditLogger');
const { authenticateToken } = require('../middleware/auth');
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

// Get job counts
router.get('/counts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'Published' THEN 1 END) as published_jobs,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
        COUNT(CASE WHEN status IN ('Published', 'active') THEN 1 END) as active_published_jobs,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_jobs,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_jobs
      FROM jobs_enhanced
    `);

    res.json({
      success: true,
      counts: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching job counts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// INTERVIEWER ASSIGNMENTS
// ==========================================
// Get interviewer assignments
router.get('/interviewer-assignments', async (req, res) => {
  try {
    const { job_id, candidate_id, stage_name } = req.query;
    let query = `
      SELECT ia.*, u.name as interviewer_name, u.email as interviewer_email
      FROM interviewer_assignments ia
      JOIN users u ON ia.interviewer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (job_id) { params.push(job_id); query += ` AND ia.job_id = $${params.length}`; }
    if (candidate_id) { params.push(candidate_id); query += ` AND ia.candidate_id = $${params.length}`; }
    if (stage_name) { params.push(stage_name); query += ` AND ia.stage_name = $${params.length}`; }

    const result = await pool.query(query, params);
    res.json({ success: true, assignments: result.rows });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Assign interviewers to a candidate for a specific stage
router.post('/interviewer-assignments', async (req, res) => {
  try {
    const { candidate_id, job_id, stage_name, interviewer_ids, assigned_by } = req.body;

    if (!candidate_id || !job_id || !stage_name || !interviewer_ids || !Array.isArray(interviewer_ids)) {
      return res.status(400).json({ success: false, error: 'Missing required fields or invalid interviewer_ids array' });
    }

    // First delete existing assignments for this candidate and stage (to overwrite if changing)
    await pool.query(
      `DELETE FROM interviewer_assignments WHERE candidate_id = $1 AND stage_name = $2`,
      [candidate_id, stage_name]
    );

    // Then insert the new ones
    if (interviewer_ids.length > 0) {
      const valuesStr = interviewer_ids.map((id, index) =>
        `($1, $2, $3, $${index + 4}, $${interviewer_ids.length + 4})`
      ).join(', ');

      const queryParams = [candidate_id, job_id, stage_name, ...interviewer_ids, assigned_by || null];

      await pool.query(
        `INSERT INTO interviewer_assignments (candidate_id, job_id, stage_name, interviewer_id, assigned_by)
         VALUES ${valuesStr}`,
        queryParams
      );
    }

    res.json({ success: true, message: 'Interviewer assignments updated successfully' });
  } catch (error) {
    console.error('Error saving assignments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if a job title already exists (no auth required — called during form typing)
router.get('/check-title', async (req, res) => {
  try {
    const { title, account_id, exclude_job_id } = req.query;

    if (!title) {
      return res.json({ success: true, exists: false });
    }

    let query = 'SELECT id FROM jobs_enhanced WHERE TRIM(title) ILIKE TRIM($1)';
    let params = [title.trim()];
    let paramCount = 1;

    // Remove account_id scoping so duplicate checks are globally unique
    // if (account_id) { ... }

    if (exclude_job_id) {
      paramCount++;
      query += ` AND id != $${paramCount} `;
      params.push(exclude_job_id);
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      exists: result.rows.length > 0
    });
  } catch (error) {
    console.error('Error checking job title:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Submit an edit request for a job (used by recruiters)
router.post('/edit-request', authenticateToken, async (req, res) => {
  try {
    const { job_id, changes_json } = req.body;
    const requested_by = req.user.id;

    if (!job_id || !changes_json) {
      return res.status(400).json({ success: false, error: 'job_id and changes_json are required' });
    }

    const result = await pool.query(
      `INSERT INTO job_edit_requests(job_id, requested_by, changes_json, status, created_at)
      VALUES($1, $2, $3, 'pending', NOW()) 
       RETURNING id`,
      [job_id, requested_by, JSON.stringify(changes_json)]
    );

    res.json({
      success: true,
      message: 'Edit request submitted successfully',
      requestId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error submitting edit request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get stats (user-specific if authenticated)
router.get('/stats', (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = 'AND j.created_at >= $2 AND j.created_at <= $3';
      params = [startDate, endDate];
    }

    let query;

    if (req.user) {
      // User is authenticated - get user-specific stats
      const userId = req.user.adminId || req.user.id;

      if (startDate && endDate) {
        query = `
      SELECT
      COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') THEN j.id END) as active_jobs,
        COUNT(DISTINCT c.candidate_id) as active_candidates,
        COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= NOW() - INTERVAL '7 days' THEN j.id END) as jobs_last_7_days,
        COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= NOW() - INTERVAL '14 days' AND j.created_at < NOW() - INTERVAL '7 days' THEN j.id END) as jobs_previous_7_days,
        COUNT(DISTINCT CASE WHEN c.created_at >= $2 AND c.created_at <= $3 THEN c.candidate_id END) as filtered_candidates,
        COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_last_7_days,
        COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '14 days' AND c.created_at < NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_previous_7_days
          FROM account_users au
          JOIN accounts a ON au.account_id = a.account_id
          LEFT JOIN jobs_enhanced j ON j.account_id = a.account_id ${dateFilter}
          LEFT JOIN candidates c ON 1 = 1
          WHERE au.user_id = $1
        `;
        params.unshift(userId);
      } else {
        query = `
      SELECT
      COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') THEN j.id END) as active_jobs,
        COUNT(DISTINCT c.candidate_id) as active_candidates,
        COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= NOW() - INTERVAL '7 days' THEN j.id END) as jobs_last_7_days,
        COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= NOW() - INTERVAL '14 days' AND j.created_at < NOW() - INTERVAL '7 days' THEN j.id END) as jobs_previous_7_days,
        COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_last_7_days,
        COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '14 days' AND c.created_at < NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_previous_7_days
          FROM account_users au
          JOIN accounts a ON au.account_id = a.account_id
          LEFT JOIN jobs_enhanced j ON j.account_id = a.account_id
          LEFT JOIN candidates c ON 1 = 1
          WHERE au.user_id = $1
        `;
        params = [userId];
      }
    } else {
      // No authentication - get global stats
      if (startDate && endDate) {
        query = `
      SELECT
      COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= $1 AND j.created_at <= $2 THEN j.id END) as active_jobs,
        COUNT(DISTINCT CASE WHEN c.created_at >= $1 AND c.created_at <= $2 THEN c.candidate_id END) as active_candidates,
        COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= NOW() - INTERVAL '7 days' THEN j.id END) as jobs_last_7_days,
        COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= NOW() - INTERVAL '14 days' AND j.created_at < NOW() - INTERVAL '7 days' THEN j.id END) as jobs_previous_7_days,
        COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_last_7_days,
        COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '14 days' AND c.created_at < NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_previous_7_days
          FROM jobs_enhanced j
          CROSS JOIN candidates c
        `;
      } else {
        query = `
      SELECT
      COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') THEN j.id END) as active_jobs,
        COUNT(DISTINCT c.candidate_id) as active_candidates,
        COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= NOW() - INTERVAL '7 days' THEN j.id END) as jobs_last_7_days,
        COUNT(DISTINCT CASE WHEN j.status IN('Published', 'active') AND j.created_at >= NOW() - INTERVAL '14 days' AND j.created_at < NOW() - INTERVAL '7 days' THEN j.id END) as jobs_previous_7_days,
        COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_last_7_days,
        COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '14 days' AND c.created_at < NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_previous_7_days
          FROM jobs_enhanced j
          CROSS JOIN candidates c
        `;
      }
    }

    const result = await pool.query(query, params);
    const stats = result.rows[0];

    // Calculate changes
    const jobs_change = parseInt(stats.jobs_last_7_days) - parseInt(stats.jobs_previous_7_days);
    const candidates_change = parseInt(stats.candidates_last_7_days) - parseInt(stats.candidates_previous_7_days);

    res.json({
      active_jobs: parseInt(stats.active_jobs) || 0,
      active_candidates: parseInt(stats.filtered_candidates || stats.active_candidates) || 0,
      jobs_change,
      candidates_change
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs (Role-based access)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT
      j.*,
        a.account_name,
        ad.name as created_by_user_name,
        su.name as status_updated_by_name
      FROM jobs_enhanced j
      LEFT JOIN accounts a ON j.account_id = a.account_id
      LEFT JOIN users ad ON j.created_by_user_id = ad.id
      LEFT JOIN users su ON j.status_updated_by = su.id
      WHERE j.status NOT IN('rejected', 'deleted')
    `;

    const params = [];

    // Role-based filtering
    // SuperAdmin sees all jobs (check role OR email in superadmins table)
    let isSuperAdmin = req.user.role === 'SuperAdmin' || req.user.role === 'superadmin';

    if (!isSuperAdmin && req.user.email) {
      // Fallback: Check if email exists in superadmins table
      const superAdminCheck = await pool.query('SELECT 1 FROM superadmins WHERE LOWER(email) = LOWER($1)', [req.user.email]);
      if (superAdminCheck.rows.length > 0) {
        isSuperAdmin = true;
      }
    }

    if (!isSuperAdmin) {
      const userId = req.user.id || req.user.adminId;
      query += ` AND j.account_id IN(SELECT account_id FROM account_users WHERE user_id = $1) `;
      params.push(userId);
    }

    query += ` ORDER BY j.created_at DESC; `;

    const result = await pool.query(query, params);

    // Map to expected format
    const jobs = result.rows.map(job => ({
      job_id: job.id,
      job_title: job.title,
      company: job.company || 'FluidJobs.ai',
      job_type: job.job_type,
      job_domain: job.job_domain,
      locations: job.locations,
      mode_of_job: job.mode_of_job,
      min_experience: job.min_experience,
      max_experience: job.max_experience,
      min_salary: job.min_salary,
      max_salary: job.max_salary,
      show_salary_to_candidate: job.show_salary_to_candidate,
      skills: job.skills || [],
      job_description: job.description,
      selected_image: job.selected_image,
      jd_attachment_name: job.jd_attachment_name,
      registration_opening_date: job.registration_opening_date,
      registration_closing_date: job.registration_closing_date,
      number_of_openings: job.no_of_openings,
      status: job.status,
      status_reason: job.status_reason,
      status_updated_at: job.status_updated_at,
      status_updated_by_name: job.status_updated_by_name,
      created_at: job.created_at,
      account_name: job.account_name,
      created_by_user_name: job.created_by_user_name
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
      jobType: job.job_type,
      ctc: job.min_salary && job.max_salary ?
        `₹${(job.min_salary / 100000).toFixed(1)} L - ₹${(job.max_salary / 100000).toFixed(1)} L` :
        'Competitive',
      industry: job.job_domain,
      location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations || 'Remote',
      description: job.description,
      skills: Array.isArray(job.skills) ? job.skills : [],
      postedDate: new Date(job.created_at || job.posted_date).toLocaleDateString(),
      isEligible: true,
      registrationDeadline: job.registration_closing_date ? new Date(job.registration_closing_date).toLocaleDateString() : null,
      attachmentCount: parseInt(job.attachment_count) || 0,
      // Additional fields from job creation form
      modeOfJob: job.mode_of_job,
      noOfOpenings: job.no_of_openings,
      minExperience: job.min_experience,
      maxExperience: job.max_experience,
      experienceRange: job.min_experience && job.max_experience ? `${job.min_experience} -${job.max_experience} years` : null,
      selectedImage: job.selected_image,
      showSalaryToCandidate: job.show_salary_to_candidate,
      registrationOpeningDate: job.registration_opening_date,
      registrationClosingDate: job.registration_closing_date,
      minSalary: job.min_salary,
      maxSalary: job.max_salary
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get published jobs for candidates
router.get('/published', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      j.id,
        j.title,
        j.company,
        j.job_type,
        j.job_domain,
        j.locations,
        j.mode_of_job,
        j.min_experience,
        j.max_experience,
        j.min_salary,
        j.max_salary,
        j.show_salary_to_candidate,
        j.skills,
        j.description,
        j.selected_image,
        j.created_at,
        j.registration_opening_date,
        j.registration_closing_date,
        j.no_of_openings
      FROM jobs_enhanced j
      WHERE LOWER(j.status) IN('published', 'active')
      ORDER BY j.created_at DESC;
      `);

    const jobs = result.rows.map(job => ({
      id: job.id.toString(),
      title: job.title,
      company: job.company || 'FluidJobs.ai',
      jobType: job.job_type,
      ctc: job.min_salary && job.max_salary ?
        `₹${(job.min_salary / 100000).toFixed(1)} L - ₹${(job.max_salary / 100000).toFixed(1)} L` :
        'Competitive',
      industry: job.job_domain,
      location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations || 'Remote',
      description: job.description,
      skills: Array.isArray(job.skills) ? job.skills : [],
      postedDate: new Date(job.created_at).toLocaleDateString(),
      // Additional fields from job creation form
      modeOfJob: job.mode_of_job,
      noOfOpenings: job.no_of_openings,
      minExperience: job.min_experience,
      maxExperience: job.max_experience,
      experienceRange: job.min_experience && job.max_experience ? `${job.min_experience} -${job.max_experience} years` : null,
      selectedImage: job.selected_image,
      showSalaryToCandidate: job.show_salary_to_candidate,
      registrationOpeningDate: job.registration_opening_date,
      registrationClosingDate: job.registration_closing_date,
      minSalary: job.min_salary,
      maxSalary: job.max_salary
    }));

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching published jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active jobs for admin dashboard
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      j.id,
        j.title,
        j.status,
        j.created_at
      FROM jobs_enhanced j
      WHERE j.status = 'Published' OR j.status = 'active'
      ORDER BY j.created_at DESC;
      `);

    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get images already used by jobs for a given account (to prevent duplicate image use)
router.get('/account-used-images', async (req, res) => {
  try {
    const { account_id } = req.query;
    if (!account_id) return res.json({ usedImages: [] });
    const result = await pool.query(
      `SELECT selected_image FROM jobs_enhanced WHERE account_id = $1 AND selected_image IS NOT NULL AND selected_image != ''`,
      [account_id]
    );
    res.json({ usedImages: result.rows.map(r => r.selected_image) });
  } catch (error) {
    res.status(500).json({ usedImages: [] });
  }
});

// Get closed jobs (status = 'Closed')
router.get('/closed', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, company, location, status, created_at, account_id,
        no_of_openings, job_type, selected_image
       FROM jobs_enhanced
       WHERE status = 'Closed'
       ORDER BY updated_at DESC NULLS LAST, created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    console.error('Error fetching closed jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active jobs (status = 'Active' or 'active')
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, company, location, status, created_at, account_id,
        no_of_openings, job_type, selected_image
       FROM jobs_enhanced
       WHERE LOWER(status) = 'active'
       ORDER BY updated_at DESC NULLS LAST, created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Get job by ID with attachments
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const jobResult = await pool.query(`
      SELECT * FROM jobs_enhanced WHERE id = $1;
      `, [id]);

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobResult.rows[0];

    // Get attachments
    const attachmentsResult = await pool.query(`
      SELECT id, file_name, file_url, file_type, uploaded_at
      FROM job_attachments 
      WHERE job_id = $1
      ORDER BY uploaded_at DESC;
      `, [id]);

    res.json({
      id: job.id.toString(),
      title: job.title,
      company: job.company || 'FluidJobs.ai',
      jobType: job.job_type,
      ctc: job.min_salary && job.max_salary ?
        `₹${(job.min_salary / 100000).toFixed(1)} L - ₹${(job.max_salary / 100000).toFixed(1)} L` :
        'Competitive',
      industry: job.job_domain,
      location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations,
      description: job.description,
      skills: Array.isArray(job.skills) ? job.skills : [],
      postedDate: new Date(job.created_at).toLocaleDateString(),
      // Additional fields from job creation form
      modeOfJob: job.mode_of_job,
      noOfOpenings: job.no_of_openings,
      minExperience: job.min_experience,
      maxExperience: job.max_experience,
      experienceRange: job.min_experience && job.max_experience ? `${job.min_experience} -${job.max_experience} years` : null,
      selectedImage: job.selected_image,
      showSalaryToCandidate: job.show_salary_to_candidate,
      registrationOpeningDate: job.registration_opening_date,
      registrationClosingDate: job.registration_closing_date,
      minSalary: job.min_salary,
      maxSalary: job.max_salary,
      status: job.status,
      // Legacy fields for backward compatibility
      type: job.job_type,
      salary: job.min_salary && job.max_salary ?
        `₹${(job.min_salary / 100000).toFixed(1)} L - ₹${(job.max_salary / 100000).toFixed(1)} L` :
        'Competitive',
      experience: `${job.min_experience} -${job.max_experience} years`,
      employmentType: job.job_type,
      salaryRange: job.min_salary && job.max_salary ?
        `Rs.${(job.min_salary / 100000).toFixed(1)} L - Rs.${(job.max_salary / 100000).toFixed(1)} L` :
        'Competitive',
      registration_opening_date: job.registration_opening_date,
      registration_closing_date: job.registration_closing_date,
      attachments: attachmentsResult.rows,
      interview_stages: job.hiring_process || [],
      hiring_process: job.hiring_process || [],
      stages: job.hiring_process || [],
      // Team & Recruiters
      team_assignments: job.team_assignments || {},
      primary_recruiter_id: job.primary_recruiter_id || null
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Update hiring stages for a job (called from JobSettings)
router.patch('/update-stages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { interview_stages } = req.body;
    if (!Array.isArray(interview_stages)) {
      return res.status(400).json({ error: 'interview_stages must be an array' });
    }
    await pool.query(
      `UPDATE jobs_enhanced SET hiring_process = $1 WHERE id = $2`,
      [JSON.stringify(interview_stages), id]
    );
    res.json({ success: true, message: 'Hiring stages updated' });
  } catch (error) {
    console.error('Error updating stages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save team assignments for a job (called from JobSettings)
router.patch('/:id/team', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { team_assignments, primary_recruiter_id } = req.body;

    if (team_assignments !== undefined && typeof team_assignments !== 'object') {
      return res.status(400).json({ success: false, error: 'team_assignments must be an object' });
    }

    // Validate primaryRecruiterId if provided
    if (primary_recruiter_id) {
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [primary_recruiter_id]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'primary_recruiter_id references unknown user' });
      }
    }

    await pool.query(
      `UPDATE jobs_enhanced
         SET team_assignments       = $1,
             primary_recruiter_id   = $2,
             updated_at             = NOW()
       WHERE id = $3`,
      [
        JSON.stringify(team_assignments || {}),
        primary_recruiter_id || null,
        id
      ]
    );

    res.json({ success: true, message: 'Team assignments saved' });
  } catch (error) {
    console.error('[team patch] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update cover image for a job (called from JobSettings)
router.patch('/update-image/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { selected_image } = req.body;
    await pool.query(
      `UPDATE jobs_enhanced SET selected_image = $1 WHERE id = $2`,
      [selected_image || null, id]
    );
    res.json({ success: true, message: 'Image updated' });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: error.message });
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
        INSERT INTO job_drafts(
        user_id, job_title, job_domain, job_type, locations, mode_of_job,
        min_experience, max_experience, skills, min_salary, max_salary,
        show_salary_to_candidate, job_description, selected_image,
        eligible_courses, eligibility_criteria, selection_process, other_details,
        registration_schedule, registration_opening_date, registration_closing_date,
        about_organisation, website, industry, organisation_size, contact_person,
        job_close_days, current_step
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
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

    const fileUrl = `/ uploads / job - descriptions / ${req.file.filename} `;
    console.log('✅ JD uploaded to VPS:', fileUrl);

    await logAudit(req.body.userId, req.body.userName || 'User', 'FILE_UPLOAD', `Uploaded JD file: ${req.file.originalname} `, 'file', null, req);

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

    const prompt = `You are a professional HR assistant.Convert the following job description text into a well - formatted, professional job description. 

Format it with:
      - Clear sections(Overview, Key Responsibilities, Requirements, What We Offer)
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

// Update job status (publish/unpublish)
router.put('/update-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, unpublish_reason } = req.body;

    await pool.query(
      'UPDATE jobs_enhanced SET status = $1, unpublish_reason = $2 WHERE id = $3',
      [status, unpublish_reason, id]
    );

    res.json({
      success: true,
      message: 'Job status updated successfully'
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Patch: update ONLY the hiring_process (stages) for a job — does not touch other fields
router.patch('/update-stages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { interview_stages } = req.body;

    if (!interview_stages) {
      return res.status(400).json({ success: false, error: 'interview_stages is required' });
    }

    const result = await pool.query(
      `UPDATE jobs_enhanced
         SET hiring_process = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, hiring_process`,
      [JSON.stringify(interview_stages), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.json({
      success: true,
      hiring_process: result.rows[0].hiring_process,
      message: 'Hiring stages updated successfully'
    });
  } catch (error) {
    console.error('Error updating hiring stages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update job
router.put('/update/:id', async (req, res) => {

  try {
    const { id } = req.params;
    const jobData = req.body;

    // --- Backend duplicate title guard ---
    if (jobData.job_title) {
      const titleCheck = await pool.query(
        'SELECT id FROM jobs_enhanced WHERE TRIM(LOWER(title)) = TRIM(LOWER($1)) AND id != $2',
        [jobData.job_title, id]
      );
      if (titleCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'A job with this title already exists. Please choose a unique title.'
        });
      }
    }
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

    // Check if cover_image_id changed to update usage stats
    if (jobData.cover_image_id) {
      const oldImageRes = await pool.query('SELECT cover_image_id FROM jobs_enhanced WHERE id = $1', [id]);
      const oldImageId = oldImageRes.rows[0]?.cover_image_id;

      if (oldImageId !== jobData.cover_image_id) {
        // Decrease usage of old image
        if (oldImageId) {
          await pool.query('UPDATE job_cover_images SET used_count = GREATEST(used_count - 1, 0), is_used = CASE WHEN GREATEST(used_count - 1, 0) > 0 THEN true ELSE false END WHERE id = $1', [oldImageId]);
        }
        // Increase usage of new image
        await pool.query('UPDATE job_cover_images SET used_count = used_count + 1, is_used = true WHERE id = $1', [jobData.cover_image_id]);
      }
    }

    const result = await pool.query(`
      UPDATE jobs_enhanced SET
      title = $1,
        job_type = $2,
        job_domain = $3,
        locations = $4,
        min_salary = $5,
        max_salary = $6,
        skills = $7,
        description = $8,
        mode_of_job = $9,
        min_experience = $10,
        max_experience = $11,
        show_salary_to_candidate = $12,
        registration_opening_date = $13,
        registration_closing_date = $14,
        no_of_openings = $15,
        hiring_process = $16,
        cover_image_id = COALESCE($17, cover_image_id),
        selected_image = COALESCE($18, selected_image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *;
      `, [
      jobData.job_title,
      jobData.job_type,
      jobData.job_domain,
      locationsArray,
      jobData.min_salary,
      jobData.max_salary,
      skillsArray,
      jobData.job_description,
      jobData.mode_of_job,
      jobData.min_experience,
      jobData.max_experience,
      jobData.show_salary_to_candidate,
      jobData.registration_opening_date,
      jobData.registration_closing_date,
      jobData.no_of_openings,
      JSON.stringify(jobData.interview_stages || []),
      jobData.cover_image_id || null,
      jobData.selected_image || null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    await logAudit(jobData.userId, jobData.userName || 'User', 'JOB_UPDATED', `Updated job: ${jobData.job_title} `, 'job', id, req);

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

    // --- Backend duplicate title guard (Global Uniqueness) ---
    if (jobData.job_title) {
      let titleCheckQuery = 'SELECT id FROM jobs_enhanced WHERE TRIM(LOWER(title)) = TRIM(LOWER($1))';
      const titleCheckParams = [jobData.job_title];

      const titleCheck = await pool.query(titleCheckQuery, titleCheckParams);
      if (titleCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'A job with this title already exists. Please choose a unique title.'
        });
      }
    }

    // Calculate closing date
    const closingDate = new Date();
    closingDate.setDate(closingDate.getDate() + (jobData.job_close_days || 30));

    // Convert arrays to PostgreSQL array format
    const locationsArray = Array.isArray(jobData.locations) ? jobData.locations : [jobData.locations];
    const skillsArray = Array.isArray(jobData.skills) ? jobData.skills : [jobData.skills];

    const result = await pool.query(`
      INSERT INTO jobs_enhanced(
        title, company, location, description, requirements,
        salary_range, job_type, experience_level, no_of_openings, status,
        posted_date, created_at, account_id, created_by_user_id,
        job_domain, mode_of_job, min_experience, max_experience,
        min_salary, max_salary, show_salary_to_candidate, skills, locations,
        selected_image, jd_attachment_name, registration_opening_date, registration_closing_date, hiring_process, cover_image_id
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW(), NOW(), $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING id;
      `, [
      jobData.job_title,
      'FluidJobs.ai',
      locationsArray.join(', '),
      jobData.job_description,
      skillsArray,
      `${jobData.min_salary} - ${jobData.max_salary} `,
      jobData.job_type,
      `${jobData.min_experience} -${jobData.max_experience} years`,
      jobData.no_of_openings || 1,
      jobData.account_id,
      jobData.created_by_user_id,
      jobData.job_domain,
      jobData.mode_of_job,
      jobData.min_experience,
      jobData.max_experience,
      jobData.min_salary,
      jobData.max_salary,
      jobData.show_salary_to_candidate,
      skillsArray,
      locationsArray,
      jobData.selected_image,
      jobData.jd_attachment_name,
      jobData.registration_opening_date,
      jobData.registration_closing_date,
      JSON.stringify(jobData.interview_stages || []),
      jobData.cover_image_id || null
    ]);

    // Flag the image as used
    if (jobData.cover_image_id) {
      await pool.query('UPDATE job_cover_images SET used_count = used_count + 1, is_used = true WHERE id = $1', [jobData.cover_image_id]);
    }

    // Update account last activity
    if (jobData.account_id) {
      await pool.query('UPDATE accounts SET last_activity_at = NOW() WHERE account_id = $1', [jobData.account_id]);
    }

    // Delete draft if exists
    if (jobData.userId) {
      await pool.query('DELETE FROM job_drafts WHERE user_id = $1', [jobData.userId]);
    }

    await logAudit(jobData.created_by_user_id, jobData.userName || 'User', 'JOB_CREATED', `Created job: ${jobData.job_title} `, 'job', result.rows[0].id, req);

    res.json({
      success: true,
      jobId: result.rows[0].id,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- JOB STATUS ENHANCEMENTS ---

// Get active candidates count for a job
router.get('/:id/active-candidates-count', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    // Count applications that are not rejected or withdrawn
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM job_applications 
       WHERE job_id = $1 AND status NOT IN('rejected', 'withdrawn')`,
      [jobId]
    );
    res.json({ success: true, count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching active candidates count:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update Job Status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const jobId = req.params.id;
    const { status, reason, isReactivation } = req.body;
    const userId = req.user.id || req.user.adminId || req.user.userId || 0;
    const userRole = (req.user.role || '').toLowerCase();

    // Verify role (only admin/superadmin can change status)
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to change job status' });
    }

    if (!['Active', 'Paused', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    if ((status === 'Paused' || status === 'Closed') && !reason) {
      return res.status(400).json({ success: false, error: 'Reason is required for Pausing or Closing a job' });
    }

    await client.query('BEGIN');

    // Update job status
    await client.query(`
      UPDATE jobs_enhanced 
      SET status = $1, status_reason = $2, status_updated_at = NOW(), status_updated_by = $3 
      WHERE id = $4
        `, [status, reason || null, userId, jobId]);

    // Determine action for log
    let action = status; // 'Active', 'Paused', 'Closed'
    if (status === 'Active' && isReactivation) {
      action = 'Re-activated';
    }

    // Insert into activity log
    await client.query(`
      INSERT INTO job_activity_log(job_id, action, performed_by, reason, created_at)
      VALUES($1, $2, $3, $4, NOW())
    `, [jobId, action, userId, reason || null]);

    await client.query('COMMIT');

    // Log audit
    await logAudit(userId, req.user.name || 'Admin', 'JOB_STATUS_CHANGED', `Job ${jobId} status changed to ${status} `, 'job', jobId, req).catch(e => console.error('Audit log failed:', e));

    res.json({ success: true, message: `Job status updated to ${status} ` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating job status:', error);
    res.status(500).json({ success: false, error: error.message || error.toString() });
  } finally {
    client.release();
  }
});

// Get Job Activity Log
router.get('/:id/activity', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const result = await pool.query(`
      SELECT l.*, COALESCE(u.name, sa.name) as name 
      FROM job_activity_log l
      LEFT JOIN users u ON l.performed_by = u.id
      LEFT JOIN superadmins sa ON l.performed_by = sa.id
      WHERE l.job_id = $1
      ORDER BY l.created_at DESC
        `, [jobId]);

    const formattedLog = result.rows.map(row => ({
      id: row.id,
      action: row.action,
      reason: row.reason,
      createdAt: row.created_at,
      performedBy: row.name || 'System'
    }));

    res.json({ success: true, activity: formattedLog });
  } catch (error) {
    console.error('Error fetching job activity log:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;