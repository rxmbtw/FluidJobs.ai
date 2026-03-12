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

// Submit an edit request for a job (used by recruiters)
router.post('/edit-request', authenticateToken, async (req, res) => {
  try {
    const { job_id, changes_json } = req.body;
    const requested_by = req.user.id;

    if (!job_id || !changes_json) {
      return res.status(400).json({ success: false, error: 'job_id and changes_json are required' });
    }

    // Fetch current job data to store as original_values
    const jobResult = await pool.query('SELECT * FROM jobs_enhanced WHERE id = $1', [job_id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    const originalJob = jobResult.rows[0];

    const result = await pool.query(
      `INSERT INTO job_edit_requests (job_id, requested_by, changes_json, original_values_json, status, created_at) 
       VALUES ($1, $2, $3, $4, 'pending', NOW()) 
       RETURNING id`,
      [job_id, requested_by, JSON.stringify(changes_json), JSON.stringify(originalJob)]
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

// Get user's own edit requests
router.get('/edit-requests/my-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        jer.*,
        j.title as job_title,
        u.name as requested_by_name,
        r.name as reviewed_by_name
      FROM job_edit_requests jer
      JOIN jobs_enhanced j ON jer.job_id = j.id
      JOIN users u ON jer.requested_by = u.id
      LEFT JOIN users r ON jer.reviewed_by = r.id
      WHERE jer.requested_by = $1
      ORDER BY jer.created_at DESC
    `, [userId]);

    res.json({ success: true, requests: result.rows });
  } catch (error) {
    console.error('Error fetching user edit requests:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get pending edit requests (Admin/SuperAdmin only)
router.get('/edit-requests/pending', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    if (!['Admin', 'SuperAdmin'].includes(userRole)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT 
        jer.*,
        j.title as job_title,
        u.name as requested_by_name,
        u.email as requested_by_email
      FROM job_edit_requests jer
      JOIN jobs_enhanced j ON jer.job_id = j.id
      JOIN users u ON jer.requested_by = u.id
      WHERE jer.status = 'pending'
      ORDER BY jer.created_at ASC
    `);

    res.json({ success: true, requests: result.rows });
  } catch (error) {
    console.error('Error fetching pending edit requests:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Approve edit request (Admin/SuperAdmin only)
router.post('/edit-requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const reviewerId = req.user.id;
    const userRole = req.user.role;
    const { review_notes } = req.body;

    if (!['Admin', 'SuperAdmin'].includes(userRole)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const requestResult = await pool.query(
      'SELECT * FROM job_edit_requests WHERE id = $1',
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Edit request not found' });
    }

    const editRequest = requestResult.rows[0];

    if (editRequest.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Request already processed' });
    }

    // Apply changes to job
    const changes = editRequest.changes_json;
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(changes).forEach(key => {
      updateFields.push(`${key} = $${paramIndex}`);
      updateValues.push(changes[key]);
      paramIndex++;
    });

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(editRequest.job_id);

    await pool.query(
      `UPDATE jobs_enhanced SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      updateValues
    );

    await pool.query(
      `UPDATE job_edit_requests 
       SET status = 'approved', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, review_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [reviewerId, review_notes, requestId]
    );

    await logAudit(reviewerId, req.user.name, 'JOB_EDIT_APPROVED', `Approved edit request ${requestId} for job ${editRequest.job_id}`, 'job', editRequest.job_id, req);

    res.json({ success: true, message: 'Edit request approved and changes applied' });
  } catch (error) {
    console.error('Error approving edit request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Reject edit request (Admin/SuperAdmin only)
router.post('/edit-requests/:id/reject', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const reviewerId = req.user.id;
    const userRole = req.user.role;
    const { review_notes } = req.body;

    if (!['Admin', 'SuperAdmin'].includes(userRole)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const requestResult = await pool.query(
      'SELECT * FROM job_edit_requests WHERE id = $1',
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Edit request not found' });
    }

    const editRequest = requestResult.rows[0];

    if (editRequest.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Request already processed' });
    }

    await pool.query(
      `UPDATE job_edit_requests 
       SET status = 'rejected', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, review_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [reviewerId, review_notes, requestId]
    );

    await logAudit(reviewerId, req.user.name, 'JOB_EDIT_REJECTED', `Rejected edit request ${requestId} for job ${editRequest.job_id}`, 'job', editRequest.job_id, req);

    res.json({ success: true, message: 'Edit request rejected' });
  } catch (error) {
    console.error('Error rejecting edit request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update job cover image
router.patch('/update-image/:id', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const { selected_image, cover_image_id } = req.body;

    console.log('📝 Update image request:', { jobId, selected_image, cover_image_id });

    if (!selected_image) {
      return res.status(400).json({ success: false, error: 'selected_image is required' });
    }

    await pool.query(
      'UPDATE jobs_enhanced SET selected_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [selected_image, jobId]
    );

    await logAudit(req.user.id, req.user.name, 'JOB_IMAGE_UPDATED', `Updated cover image for job ID: ${jobId}`, 'job', jobId, req);

    console.log('✅ Image updated successfully for job', jobId);
    res.json({ success: true, message: 'Image updated successfully' });
  } catch (error) {
    console.error('Error updating job image:', error);
    res.status(500).json({ success: false, error: 'Failed to update job image' });
  }
});

// Direct update job (used by Admin/SuperAdmin - no approval needed)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const changes = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only Admin, SuperAdmin, and HR can directly update jobs
    if (!['Admin', 'SuperAdmin', 'HR'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only Admin, SuperAdmin, or HR can directly update jobs' 
      });
    }

    // Prepare arrays
    const skillsArray = Array.isArray(changes.skills) ? changes.skills :
      (typeof changes.skills === 'string' ? changes.skills.split(',').map(s => s.trim()) : []);

    const locationsArray = Array.isArray(changes.locations) ? changes.locations :
      (typeof changes.locations === 'string' ? changes.locations.split(',').map(s => s.trim()) : []);

    const requirementsArray = Array.isArray(changes.requirements) ? changes.requirements :
      (typeof changes.requirements === 'string' ? [changes.requirements] : []);

    // Extract salary values
    const minSalary = changes.salary ? changes.salary.min : (changes.min_salary || changes.minSalary || null);
    const maxSalary = changes.salary ? changes.salary.max : (changes.max_salary || changes.maxSalary || null);
    const showSalary = changes.salary ? changes.salary.showToCandidate : (changes.show_salary_to_candidate ?? changes.showSalaryToCandidate ?? true);

    // Update the job
    const result = await pool.query(`
      UPDATE jobs_enhanced SET
        title = COALESCE($1, title),
        job_type = COALESCE($2, job_type),
        job_domain = COALESCE($3, job_domain),
        locations = COALESCE($4, locations),
        min_salary = COALESCE($5, min_salary),
        max_salary = COALESCE($6, max_salary),
        skills = COALESCE($7, skills),
        description = COALESCE($8, description),
        mode_of_job = COALESCE($9, mode_of_job),
        min_experience = COALESCE($10, min_experience),
        max_experience = COALESCE($11, max_experience),
        show_salary_to_candidate = COALESCE($12, show_salary_to_candidate),
        registration_opening_date = COALESCE($13, registration_opening_date),
        registration_closing_date = COALESCE($14, registration_closing_date),
        no_of_openings = COALESCE($15, no_of_openings),
        primary_recruiter_id = COALESCE($16, primary_recruiter_id),
        requirements = COALESCE($17, requirements),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      RETURNING id
    `, [
      changes.title || null,
      changes.type || changes.job_type || null,
      changes.domain || changes.job_domain || null,
      locationsArray.length > 0 ? locationsArray : null,
      minSalary,
      maxSalary,
      skillsArray.length > 0 ? skillsArray : null,
      changes.description || null,
      changes.modeOfJob || changes.mode_of_job || null,
      changes.minExperience || changes.min_experience || null,
      changes.maxExperience || changes.max_experience || null,
      showSalary,
      changes.registrationOpeningDate || changes.registration_opening_date || null,
      changes.registrationClosingDate || changes.registration_closing_date || null,
      changes.numberOfOpenings || changes.no_of_openings || null,
      changes.primaryRecruiterId || changes.primary_recruiter_id || null,
      requirementsArray.length > 0 ? requirementsArray : null,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Log the update
    await logAudit(userId, 'UPDATE', 'jobs_enhanced', id, { changes });

    res.json({
      success: true,
      message: 'Job updated successfully',
      jobId: id
    });
  } catch (error) {
    console.error('Error updating job:', error);
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
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') THEN j.id END) as active_jobs,
            COUNT(DISTINCT c.candidate_id) as active_candidates,
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= NOW() - INTERVAL '7 days' THEN j.id END) as jobs_last_7_days,
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= NOW() - INTERVAL '14 days' AND j.created_at < NOW() - INTERVAL '7 days' THEN j.id END) as jobs_previous_7_days,
            COUNT(DISTINCT CASE WHEN c.created_at >= $2 AND c.created_at <= $3 THEN c.candidate_id END) as filtered_candidates,
            COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_last_7_days,
            COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '14 days' AND c.created_at < NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_previous_7_days
          FROM account_users au
          JOIN accounts a ON au.account_id = a.account_id
          LEFT JOIN jobs_enhanced j ON j.account_id = a.account_id ${dateFilter}
          LEFT JOIN candidates c ON 1=1
          WHERE au.user_id = $1
        `;
        params.unshift(userId);
      } else {
        query = `
          SELECT 
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') THEN j.id END) as active_jobs,
            COUNT(DISTINCT c.candidate_id) as active_candidates,
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= NOW() - INTERVAL '7 days' THEN j.id END) as jobs_last_7_days,
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= NOW() - INTERVAL '14 days' AND j.created_at < NOW() - INTERVAL '7 days' THEN j.id END) as jobs_previous_7_days,
            COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_last_7_days,
            COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '14 days' AND c.created_at < NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_previous_7_days
          FROM account_users au
          JOIN accounts a ON au.account_id = a.account_id
          LEFT JOIN jobs_enhanced j ON j.account_id = a.account_id
          LEFT JOIN candidates c ON 1=1
          WHERE au.user_id = $1
        `;
        params = [userId];
      }
    } else {
      // No authentication - get global stats
      if (startDate && endDate) {
        query = `
          SELECT 
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= $1 AND j.created_at <= $2 THEN j.id END) as active_jobs,
            COUNT(DISTINCT CASE WHEN c.created_at >= $1 AND c.created_at <= $2 THEN c.candidate_id END) as active_candidates,
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= NOW() - INTERVAL '7 days' THEN j.id END) as jobs_last_7_days,
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= NOW() - INTERVAL '14 days' AND j.created_at < NOW() - INTERVAL '7 days' THEN j.id END) as jobs_previous_7_days,
            COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_last_7_days,
            COUNT(DISTINCT CASE WHEN c.created_at >= NOW() - INTERVAL '14 days' AND c.created_at < NOW() - INTERVAL '7 days' THEN c.candidate_id END) as candidates_previous_7_days
          FROM jobs_enhanced j
          CROSS JOIN candidates c
        `;
      } else {
        query = `
          SELECT 
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') THEN j.id END) as active_jobs,
            COUNT(DISTINCT c.candidate_id) as active_candidates,
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= NOW() - INTERVAL '7 days' THEN j.id END) as jobs_last_7_days,
            COUNT(DISTINCT CASE WHEN j.status IN ('Published', 'active') AND j.created_at >= NOW() - INTERVAL '14 days' AND j.created_at < NOW() - INTERVAL '7 days' THEN j.id END) as jobs_previous_7_days,
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
        ad.name as created_by_user_name
      FROM jobs_enhanced j
      LEFT JOIN accounts a ON j.account_id = a.account_id
      LEFT JOIN users ad ON j.created_by_user_id = ad.id
      WHERE j.status NOT IN ('rejected', 'deleted')
    `;

    const params = [];

    // Role-based filtering
    // SuperAdmin sees all jobs (check role in users table)
    let isSuperAdmin = req.user.role === 'SuperAdmin' || req.user.role === 'superadmin';

    if (!isSuperAdmin) {
      const userId = req.user.id || req.user.adminId;
      query += ` AND j.account_id IN (SELECT account_id FROM account_users WHERE user_id = $1) `;
      params.push(userId);
    }

    query += ` ORDER BY j.created_at DESC;`;

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
        `₹${(job.min_salary / 100000).toFixed(1)}L - ₹${(job.max_salary / 100000).toFixed(1)}L` :
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
      experienceRange: job.min_experience && job.max_experience ? `${job.min_experience}-${job.max_experience} years` : null,
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
      WHERE j.status = 'Published' OR j.status = 'active'
      ORDER BY j.created_at DESC;
    `);

    const jobs = result.rows.map(job => ({
      id: job.id.toString(),
      title: job.title,
      company: job.company || 'FluidJobs.ai',
      jobType: job.job_type,
      ctc: job.min_salary && job.max_salary ?
        `₹${(job.min_salary / 100000).toFixed(1)}L - ₹${(job.max_salary / 100000).toFixed(1)}L` :
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
      experienceRange: job.min_experience && job.max_experience ? `${job.min_experience}-${job.max_experience} years` : null,
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
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.adminId || req.user.id;
    const isSuperAdmin = req.user.role === 'SuperAdmin' || req.user.role === 'superadmin';

    let query = `
      SELECT 
        j.id,
        j.title,
        j.status,
        j.created_at
      FROM jobs_enhanced j
      WHERE (j.status = 'Published' OR j.status = 'active')
    `;

    const params = [];

    // Filter by assigned accounts for non-SuperAdmin users
    if (!isSuperAdmin) {
      query += ` AND j.account_id IN (SELECT account_id FROM account_users WHERE user_id = $1)`;
      params.push(userId);
    }

    query += ` ORDER BY j.created_at DESC`;

    const result = await pool.query(query, params);

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

// Get closed jobs for admin dashboard
router.get('/closed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.adminId || req.user.id;
    const isSuperAdmin = req.user.role === 'SuperAdmin' || req.user.role === 'superadmin';

    let query = `
      SELECT 
        j.id,
        j.title,
        j.status,
        j.created_at,
        j.unpublish_reason
      FROM jobs_enhanced j
      WHERE j.status IN ('closed', 'unpublished', 'rejected')
    `;

    const params = [];

    // Filter by assigned accounts for non-SuperAdmin users
    if (!isSuperAdmin) {
      query += ` AND j.account_id IN (SELECT account_id FROM account_users WHERE user_id = $1)`;
      params.push(userId);
    }

    query += ` ORDER BY j.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ success: true, jobs: result.rows });
  } catch (error) {
    console.error('Error fetching closed jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if job title already exists (MUST be before /:id route)
router.get('/check-title', async (req, res) => {
  try {
    const { title, exclude_job_id } = req.query;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let query = 'SELECT id, title FROM jobs_enhanced WHERE LOWER(title) = LOWER($1)';
    const params = [title];

    if (exclude_job_id) {
      query += ' AND id != $2';
      params.push(exclude_job_id);
    }

    const result = await pool.query(query, params);
    
    res.json({
      exists: result.rows.length > 0,
      jobs: result.rows
    });
  } catch (error) {
    console.error('Error checking job title:', error);
    res.status(500).json({ error: 'Failed to check job title' });
  }
});

// Get job activity log
router.get('/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT jal.*, u.name as performed_by_name
      FROM job_activity_log jal
      LEFT JOIN users u ON jal.performed_by = u.id
      WHERE jal.job_id = $1
      ORDER BY jal.created_at DESC
    `, [id]);
    
    res.json({ success: true, activities: result.rows });
  } catch (error) {
    console.error('Error fetching job activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update job stages (MUST be before /:id route)
router.patch('/update-stages/:id', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    // Accept both 'stages' and 'interview_stages' for compatibility
    const stages = req.body.stages || req.body.interview_stages;

    console.log('📝 Update stages request:', { jobId, stages, bodyKeys: Object.keys(req.body) });

    if (!stages || !Array.isArray(stages)) {
      console.log('❌ Invalid stages:', { stages, isArray: Array.isArray(stages) });
      return res.status(400).json({ error: 'Stages array is required' });
    }

    // interview_stages is a PostgreSQL ARRAY type, not JSONB
    // Convert to PostgreSQL array format
    await pool.query(
      'UPDATE jobs_enhanced SET interview_stages = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [stages, jobId]  // pg library handles array conversion automatically
    );

    await logAudit(req.user.id, req.user.name, 'JOB_STAGES_UPDATED', `Updated stages for job ID: ${jobId}`, 'job', jobId, req);

    console.log('✅ Stages updated successfully for job', jobId);
    res.json({ success: true, message: 'Stages updated successfully' });
  } catch (error) {
    console.error('Error updating job stages:', error);
    res.status(500).json({ error: 'Failed to update job stages' });
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

    // Get attachments - wrapped in try-catch to not break if table doesn't exist
    let attachments = [];
    try {
      const attachmentsResult = await pool.query(`
        SELECT id as attachment_id, file_name as original_name, file_url as file_path, file_type, uploaded_at
        FROM job_attachments 
        WHERE job_id = $1
        ORDER BY uploaded_at DESC;
      `, [id]);
      attachments = attachmentsResult.rows;
    } catch (attachmentError) {
      console.warn('Could not fetch job attachments:', attachmentError.message);
      // Continue without attachments
    }

    res.json({
      id: job.id.toString(),
      title: job.title,
      company: job.company || 'FluidJobs.ai',
      jobType: job.job_type,
      ctc: job.min_salary && job.max_salary ?
        `₹${(job.min_salary / 100000).toFixed(1)}L - ₹${(job.max_salary / 100000).toFixed(1)}L` :
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
      experienceRange: job.min_experience && job.max_experience ? `${job.min_experience}-${job.max_experience} years` : null,
      selectedImage: job.selected_image,
      showSalaryToCandidate: job.show_salary_to_candidate,
      registrationOpeningDate: job.registration_opening_date,
      registrationClosingDate: job.registration_closing_date,
      minSalary: job.min_salary,
      maxSalary: job.max_salary,
      // Legacy fields for backward compatibility
      type: job.job_type,
      salary: job.min_salary && job.max_salary ?
        `₹${(job.min_salary / 100000).toFixed(1)}L - ₹${(job.max_salary / 100000).toFixed(1)}L` :
        'Competitive',
      experience: `${job.min_experience}-${job.max_experience} years`,
      employmentType: job.job_type,
      salaryRange: job.min_salary && job.max_salary ?
        `Rs.${(job.min_salary / 100000).toFixed(1)}L-Rs.${(job.max_salary / 100000).toFixed(1)}L` :
        'Competitive',
      registration_opening_date: job.registration_opening_date,
      registration_closing_date: job.registration_closing_date,
      attachments: attachments,
      // Add all job fields for JobSettings
      job_domain: job.job_domain,
      job_type: job.job_type,
      locations: job.locations,
      mode_of_job: job.mode_of_job,
      min_experience: job.min_experience,
      max_experience: job.max_experience,
      min_salary: job.min_salary,
      max_salary: job.max_salary,
      show_salary_to_candidate: job.show_salary_to_candidate,
      no_of_openings: job.no_of_openings,
      requirements: job.requirements,
      status: job.status
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

    await logAudit(req.body.userId, req.body.userName || 'User', 'FILE_UPLOAD', `Uploaded JD file: ${req.file.originalname}`, 'file', null, req);

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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
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
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    await logAudit(jobData.userId, jobData.userName || 'User', 'JOB_UPDATED', `Updated job: ${jobData.job_title}`, 'job', id, req);

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
        title, company, location, description, requirements,
        salary_range, job_type, experience_level, no_of_openings, status,
        posted_date, created_at, account_id, created_by_user_id,
        job_domain, mode_of_job, min_experience, max_experience,
        min_salary, max_salary, show_salary_to_candidate, skills, locations,
        selected_image, jd_attachment_name, registration_opening_date, registration_closing_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW(), NOW(), $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING id;
    `, [
      jobData.job_title,
      'FluidJobs.ai',
      locationsArray.join(', '),
      jobData.job_description,
      skillsArray,
      `${jobData.min_salary} - ${jobData.max_salary}`,
      jobData.job_type,
      `${jobData.min_experience}-${jobData.max_experience} years`,
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
      jobData.registration_closing_date
    ]);

    // Update account last activity
    if (jobData.account_id) {
      await pool.query('UPDATE accounts SET last_activity_at = NOW() WHERE account_id = $1', [jobData.account_id]);
    }

    // Delete draft if exists
    if (jobData.userId) {
      await pool.query('DELETE FROM job_drafts WHERE user_id = $1', [jobData.userId]);
    }

    await logAudit(jobData.created_by_user_id, jobData.userName || 'User', 'JOB_CREATED', `Created job: ${jobData.job_title}`, 'job', result.rows[0].id, req);

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

module.exports = router;