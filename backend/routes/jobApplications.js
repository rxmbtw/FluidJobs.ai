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
