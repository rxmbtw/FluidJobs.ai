const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Get all saved jobs for a candidate
router.get('/', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    
    const result = await pool.query(`
      SELECT 
        sj.saved_job_id as id,
        sj.job_id,
        sj.candidate_id,
        sj.saved_at,
        j.job_title,
        'FluidJobs.ai' as company_name,
        j.locations as location,
        j.job_type,
        CASE 
          WHEN j.min_salary IS NOT NULL AND j.max_salary IS NOT NULL 
          THEN CONCAT('₹', (j.min_salary/100000)::numeric(10,1), 'L - ₹', (j.max_salary/100000)::numeric(10,1), 'L')
          ELSE 'Competitive'
        END as salary_range
      FROM saved_jobs sj
      JOIN jobs_enhanced j ON sj.job_id = j.job_id
      WHERE sj.candidate_id = $1
      ORDER BY sj.saved_at DESC
    `, [candidateId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// Save a job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    const { jobId } = req.body;
    
    // Check if job is already saved
    const existingResult = await pool.query(
      'SELECT saved_job_id FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2',
      [candidateId, jobId]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Job already saved' });
    }
    
    // Save the job
    await pool.query(
      'INSERT INTO saved_jobs (candidate_id, job_id, saved_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
      [candidateId, jobId]
    );
    
    res.json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ error: 'Failed to save job' });
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