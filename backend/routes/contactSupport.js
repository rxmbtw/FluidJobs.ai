const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Submit contact support request
router.post('/submit', authenticateToken, async (req, res) => {
  const { name, email, subject, message } = req.body;
  const candidateId = req.user.candidateId;

  try {
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await pool.query(
      `INSERT INTO contact_support (candidate_id, name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [candidateId, name, email, subject, message]
    );

    res.status(201).json({
      message: 'Support request submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting contact support:', error);
    res.status(500).json({ error: 'Failed to submit support request' });
  }
});

// Get all support requests for a candidate
router.get('/my-requests', authenticateToken, async (req, res) => {
  const candidateId = req.user.candidateId;

  try {
    const result = await pool.query(
      `SELECT * FROM contact_support 
       WHERE candidate_id = $1 
       ORDER BY created_at DESC`,
      [candidateId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching support requests:', error);
    res.status(500).json({ error: 'Failed to fetch support requests' });
  }
});

module.exports = router;
