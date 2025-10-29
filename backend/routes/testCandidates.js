const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// Get all candidates without authentication
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        candidate_id,
        full_name,
        phone_number,
        email,
        gender,
        marital_status,
        current_company,
        notice_period,
        current_ctc,
        location,
        currently_employed,
        previous_company,
        expected_ctc,
        experience_years,
        resume_link
      FROM candidate.profile
      ORDER BY candidate_id
      LIMIT 10
    `;
    
    const result = await pool.query(query);
    
    res.json({
      status: 'success',
      data: {
        candidates: result.rows,
        total: result.rows.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch candidates',
      error: error.message
    });
  }
});

module.exports = router;