const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all saved jobs for a candidate
router.get('/', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    
    console.log('=== GET SAVED JOBS ===');
    console.log('Candidate ID:', candidateId);
    
    const result = await pool.query(`
      SELECT 
        sj.saved_job_id,
        sj.job_id,
        sj.saved_at,
        j.id,
        j.title,
        j.description,
        j.locations,
        j.job_type,
        j.job_domain,
        j.skills,
        j.min_salary,
        j.max_salary,
        j.selected_image,
        j.created_at
      FROM saved_jobs sj
      JOIN jobs_enhanced j ON sj.job_id = j.id
      WHERE sj.candidate_id = $1 AND (j.status = 'Published' OR j.status = 'active')
      ORDER BY sj.saved_at DESC
    `, [candidateId]);
    
    console.log('Found saved jobs:', result.rows.length);
    res.json({ success: true, savedJobs: result.rows });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch saved jobs' });
  }
});

// Save a job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    const { job_id, jobId } = req.body;
    const finalJobId = job_id || jobId;
    
    console.log('=== BACKEND SAVE JOB ===');
    console.log('Candidate ID:', candidateId);
    console.log('Job ID from request:', { job_id, jobId, finalJobId });
    
    if (!finalJobId) {
      console.error('No job ID provided');
      return res.status(400).json({ success: false, error: 'Job ID is required' });
    }
    
    // Check if job exists
    const jobCheck = await pool.query(
      'SELECT id FROM jobs_enhanced WHERE id = $1',
      [finalJobId]
    );
    
    if (jobCheck.rows.length === 0) {
      console.error('Job not found:', finalJobId);
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Check if job is already saved
    const existingResult = await pool.query(
      'SELECT saved_job_id FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2',
      [candidateId, finalJobId]
    );
    
    if (existingResult.rows.length > 0) {
      console.log('Job already saved');
      return res.status(400).json({ success: false, error: 'Job already saved' });
    }
    
    // Save the job
    const result = await pool.query(
      'INSERT INTO saved_jobs (candidate_id, job_id, saved_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING saved_job_id',
      [candidateId, finalJobId]
    );
    
    console.log('Job saved successfully:', result.rows[0]);
    res.json({ success: true, message: 'Job saved successfully', savedJobId: result.rows[0].saved_job_id });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to save job' });
  }
});

// Remove a saved job
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    const { jobId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2 RETURNING saved_job_id',
      [candidateId, jobId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Saved job not found' });
    }
    
    res.json({ message: 'Job removed from saved jobs' });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ error: 'Failed to remove saved job' });
  }
});

// Check if a job is saved
router.get('/check/:jobId', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    const { jobId } = req.params;
    
    const result = await pool.query(
      'SELECT saved_job_id FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2',
      [candidateId, jobId]
    );
    
    res.json({ isSaved: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking saved job:', error);
    res.status(500).json({ error: 'Failed to check saved job status' });
  }
});

module.exports = router;