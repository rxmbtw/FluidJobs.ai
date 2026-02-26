const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all applications for a candidate
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.candidateId || req.user.adminId || req.user.id;

    const result = await pool.query(`
      SELECT 
        ja.application_id,
        ja.job_id,
        ja.status,
        ja.applied_at,
        j.title as job_title,
        j.company,
        j.locations,
        j.job_type,
        j.min_salary,
        j.max_salary,
        j.job_domain,
        j.skills,
        j.selected_image,
        j.description
      FROM job_applications ja
      JOIN jobs_enhanced j ON ja.job_id = j.id
      WHERE ja.user_id = $1
      ORDER BY ja.applied_at DESC
    `, [userId]);

    res.json({ success: true, applications: result.rows });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all applications for admin view (enhanced with candidate, job, and account details)
router.get('/admin/list', authenticateToken, async (req, res) => {
  try {
    // Check SuperAdmin status first (this is a separate fast query)
    let isSuperAdmin = req.user.role === 'SuperAdmin' || req.user.role === 'superadmin';

    if (!isSuperAdmin && req.user.email) {
      try {
        const saCheck = await pool.query('SELECT 1 FROM superadmins WHERE LOWER(email) = LOWER($1)', [req.user.email]);
        if (saCheck.rows.length > 0) isSuperAdmin = true;
      } catch (e) {
        // superadmins table might not exist, ignore
        console.warn('superadmins check failed:', e.message);
      }
    }

    // Build query using ONLY verified database columns
    // job_applications: application_id, job_id, candidate_id, user_id, status, applied_at, cover_letter, resume_path
    // candidates: candidate_id, full_name, email, phone_number, created_at, experience_years, current_company, notice_period, expected_ctc, current_ctc, etc.
    // users: id, name, email (admin users — we join if candidate_id links to candidates table first)
    let query;
    const params = [];

    if (isSuperAdmin) {
      // SuperAdmin: get ALL unique candidates (deduplicated using DISTINCT ON most recent application)
      query = `
        SELECT DISTINCT ON (c.candidate_id)
          c.candidate_id as id,
          ja.job_id,
          COALESCE(ja.status, 'Active') as stage,
          COALESCE(ja.applied_at, c.created_at) as date,
          CASE WHEN ja.application_id IS NOT NULL THEN 'Applied' ELSE 'Imported/Manual' END as source,
          c.candidate_id as candidate_id,
          c.full_name as name,
          c.email,
          c.phone_number as phone,
          COALESCE(j.title, 'General Pool') as job_title,
          j.account_id,
          COALESCE(a.account_name, 'N/A') as account_name,
          CASE WHEN ja.application_id IS NOT NULL THEN 'Applied' ELSE 'Manual' END as type,
          COALESCE(c.experience_years, 0) as experience_years,
          c.current_company,
          c.notice_period,
          c.expected_ctc::text as expected_ctc,
          c.current_ctc::text as current_ctc
        FROM candidates c
        LEFT JOIN job_applications ja ON ja.candidate_id = c.candidate_id
        LEFT JOIN jobs_enhanced j ON ja.job_id = j.id
        LEFT JOIN accounts a ON j.account_id = a.account_id
        ORDER BY c.candidate_id, COALESCE(ja.applied_at, c.created_at) DESC
      `;
    } else {
      // Regular admin: filter by account
      const userId = req.user.id || req.user.adminId;
      query = `
        SELECT
          c.candidate_id as id,
          ja.job_id,
          COALESCE(ja.status, 'Active') as stage,
          COALESCE(ja.applied_at, c.created_at) as date,
          CASE WHEN ja.application_id IS NOT NULL THEN 'Applied' ELSE 'Imported/Manual' END as source,
          c.candidate_id as candidate_id,
          c.full_name as name,
          c.email,
          c.phone_number as phone,
          COALESCE(j.title, 'General Pool') as job_title,
          j.account_id,
          COALESCE(a.account_name, 'N/A') as account_name,
          CASE WHEN ja.application_id IS NOT NULL THEN 'Applied' ELSE 'Manual' END as type,
          COALESCE(c.experience_years, 0) as experience_years,
          c.current_company,
          c.notice_period,
          c.expected_ctc::text as expected_ctc,
          c.current_ctc::text as current_ctc
        FROM candidates c
        LEFT JOIN job_applications ja ON ja.candidate_id = c.candidate_id
        LEFT JOIN jobs_enhanced j ON ja.job_id = j.id
        LEFT JOIN accounts a ON j.account_id = a.account_id
        WHERE (j.account_id IN (SELECT account_id FROM account_users WHERE user_id = $1) OR j.account_id IS NULL)
        ORDER BY date DESC
      `;
      params.push(userId);
    }

    const result = await pool.query(query, params);
    res.json({ success: true, applications: result.rows });

  } catch (error) {
    console.error('Error fetching admin applications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Apply for a job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.candidateId || req.user.adminId || req.user.id;
    const { jobId, coverLetter, resumePath } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, error: 'Job ID is required' });
    }

    // Check if job exists and is published
    const jobCheck = await pool.query(
      'SELECT id, status FROM jobs_enhanced WHERE id = $1',
      [jobId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (jobCheck.rows[0].status !== 'Published' && jobCheck.rows[0].status !== 'active') {
      return res.status(400).json({ success: false, error: 'Job is not available for applications' });
    }

    // Check if already applied
    const existingApp = await pool.query(
      'SELECT application_id FROM job_applications WHERE job_id = $1 AND user_id = $2',
      [jobId, userId]
    );

    if (existingApp.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'You have already applied for this job' });
    }

    // Create application
    const result = await pool.query(`
      INSERT INTO job_applications (job_id, candidate_id, user_id, cover_letter, resume_path, status, applied_at)
      VALUES ($1, $2, $2, $3, $4, 'submitted', CURRENT_TIMESTAMP)
      RETURNING application_id, applied_at
    `, [jobId, userId, coverLetter, resumePath]);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.rows[0].application_id,
      appliedAt: result.rows[0].applied_at
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if user has applied for a job
router.get('/check/:jobId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.candidateId || req.user.adminId || req.user.id;
    const { jobId } = req.params;

    const result = await pool.query(
      'SELECT application_id, status, applied_at FROM job_applications WHERE job_id = $1 AND user_id = $2',
      [jobId, userId]
    );

    res.json({
      success: true,
      hasApplied: result.rows.length > 0,
      application: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error checking application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Withdraw application
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.candidateId || req.user.adminId || req.user.id;
    const { jobId } = req.params;

    const result = await pool.query(
      'DELETE FROM job_applications WHERE job_id = $1 AND user_id = $2 RETURNING application_id',
      [jobId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
