const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get candidate's job statuses (shortlisted/selected)
router.get('/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    // Get shortlisted jobs
    const shortlistedResult = await pool.query(
      `SELECT j.id as job_id, j.title as job_title, 'shortlisted' as status
       FROM job_shortlisted_candidates jsc
       JOIN jobs_enhanced j ON jsc.job_id = j.id
       WHERE jsc.candidate_id = $1`,
      [candidateId]
    );
    
    // Get selected jobs
    const selectedResult = await pool.query(
      `SELECT j.id as job_id, j.title as job_title, 'selected' as status
       FROM job_selected_candidates jsc
       JOIN jobs_enhanced j ON jsc.job_id = j.id
       WHERE jsc.candidate_id = $1`,
      [candidateId]
    );
    
    const statuses = [
      ...shortlistedResult.rows,
      ...selectedResult.rows
    ];
    
    res.json({ statuses });
  } catch (error) {
    console.error('Error fetching candidate job statuses:', error);
    res.status(500).json({ error: 'Failed to fetch candidate job statuses' });
  }
});

module.exports = router;
