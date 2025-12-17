const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get shortlisted candidates for a job
router.get('/shortlisted/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await pool.query(
      `SELECT jsc.*, c.full_name as name, c.email, c.phone_number as phone, 
              c.experience_years as experience, c.current_company as currentCompany,
              c.gender, c.location, c.current_ctc as currentSalary, 
              c.expected_ctc as expectedSalary, c.notice_period as noticePeriod,
              c.marital_status as maritalStatus, c.resume_link as resumeUrl,
              c.currently_employed as currentlyEmployed
       FROM job_shortlisted_candidates jsc
       JOIN candidates c ON jsc.candidate_id = c.candidate_id
       WHERE jsc.job_id = $1
       ORDER BY jsc.shortlisted_at DESC`,
      [jobId]
    );
    res.json({ candidates: result.rows });
  } catch (error) {
    console.error('Error fetching shortlisted candidates:', error);
    res.status(500).json({ error: 'Failed to fetch shortlisted candidates' });
  }
});

// Get selected candidates for a job
router.get('/selected/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await pool.query(
      `SELECT jsc.*, c.full_name as name, c.email, c.phone_number as phone,
              c.experience_years as experience, c.current_company as currentCompany,
              c.gender, c.location, c.current_ctc as currentSalary,
              c.expected_ctc as expectedSalary, c.notice_period as noticePeriod,
              c.marital_status as maritalStatus, c.resume_link as resumeUrl,
              c.currently_employed as currentlyEmployed
       FROM job_selected_candidates jsc
       JOIN candidates c ON jsc.candidate_id = c.candidate_id
       WHERE jsc.job_id = $1
       ORDER BY jsc.selected_at DESC`,
      [jobId]
    );
    res.json({ candidates: result.rows });
  } catch (error) {
    console.error('Error fetching selected candidates:', error);
    res.status(500).json({ error: 'Failed to fetch selected candidates' });
  }
});

// Add candidate to shortlisted
router.post('/shortlist', async (req, res) => {
  try {
    const { jobId, candidateId } = req.body;
    await pool.query(
      `INSERT INTO job_shortlisted_candidates (job_id, candidate_id)
       VALUES ($1, $2)
       ON CONFLICT (job_id, candidate_id) DO NOTHING`,
      [jobId, candidateId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error shortlisting candidate:', error);
    res.status(500).json({ error: 'Failed to shortlist candidate' });
  }
});

// Remove candidate from shortlisted
router.delete('/shortlist/:jobId/:candidateId', async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    await pool.query(
      `DELETE FROM job_shortlisted_candidates 
       WHERE job_id = $1 AND candidate_id = $2`,
      [jobId, candidateId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from shortlist:', error);
    res.status(500).json({ error: 'Failed to remove from shortlist' });
  }
});

// Add candidate to selected
router.post('/select', async (req, res) => {
  try {
    const { jobId, candidateId } = req.body;
    
    // Remove from shortlisted and add to selected
    await pool.query('BEGIN');
    await pool.query(
      `DELETE FROM job_shortlisted_candidates 
       WHERE job_id = $1 AND candidate_id = $2`,
      [jobId, candidateId]
    );
    await pool.query(
      `INSERT INTO job_selected_candidates (job_id, candidate_id)
       VALUES ($1, $2)
       ON CONFLICT (job_id, candidate_id) DO NOTHING`,
      [jobId, candidateId]
    );
    await pool.query('COMMIT');
    
    res.json({ success: true });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error selecting candidate:', error);
    res.status(500).json({ error: 'Failed to select candidate' });
  }
});

// Remove candidate from selected (move back to shortlisted)
router.delete('/select/:jobId/:candidateId', async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    
    // Remove from selected and add back to shortlisted
    await pool.query('BEGIN');
    await pool.query(
      `DELETE FROM job_selected_candidates 
       WHERE job_id = $1 AND candidate_id = $2`,
      [jobId, candidateId]
    );
    await pool.query(
      `INSERT INTO job_shortlisted_candidates (job_id, candidate_id)
       VALUES ($1, $2)
       ON CONFLICT (job_id, candidate_id) DO NOTHING`,
      [jobId, candidateId]
    );
    await pool.query('COMMIT');
    
    res.json({ success: true });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error unselecting candidate:', error);
    res.status(500).json({ error: 'Failed to unselect candidate' });
  }
});

module.exports = router;
