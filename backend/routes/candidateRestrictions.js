const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Restrict candidate
router.post('/restrict', async (req, res) => {
  try {
    const { candidateId, userId, reason, userName, userRole, candidateName } = req.body;

    if (!candidateId || !userId || !reason || !userName || !userRole || !candidateName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If SuperAdmin is restricting, directly restrict without approval
    if (userRole === 'SuperAdmin') {
      const result = await pool.query(
        `INSERT INTO candidate_restrictions (candidate_id, user_id, reason, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING *`,
        [candidateId, userId, reason]
      );

      // Also create an approval record showing it was auto-approved by SuperAdmin
      await pool.query(
        `INSERT INTO candidate_restriction_approvals (
          candidate_id, candidate_name, requested_by_user_id, 
          requested_by_name, requested_by_role, restriction_reason,
          status, approved_by_user_id, approved_by_name, approved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'approved', $3, $4, NOW())`,
        [candidateId, candidateName, userId, userName, userRole, reason]
      );

      return res.json({ 
        success: true, 
        restriction: result.rows[0],
        message: 'Candidate restricted successfully'
      });
    }

    // For Admin users, create approval request
    const result = await pool.query(
      `INSERT INTO candidate_restriction_approvals (
        candidate_id, candidate_name, requested_by_user_id, 
        requested_by_name, requested_by_role, restriction_reason
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [candidateId, candidateName, userId, userName, userRole, reason]
    );

    res.json({ 
      success: true, 
      approval_request: result.rows[0],
      message: 'Restriction request submitted for SuperAdmin approval'
    });
  } catch (error) {
    console.error('Error restricting candidate:', error);
    res.status(500).json({ error: 'Failed to restrict candidate' });
  }
});

// Get restriction status for a candidate
router.get('/status/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const result = await pool.query(
      `SELECT * FROM candidate_restrictions 
       WHERE candidate_id = $1 AND is_active = true
       ORDER BY restricted_at DESC
       LIMIT 1`,
      [candidateId]
    );

    res.json({ 
      isRestricted: result.rows.length > 0,
      restriction: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error getting restriction status:', error);
    res.status(500).json({ error: 'Failed to get restriction status' });
  }
});

// Get restriction history for a candidate
router.get('/history/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const result = await pool.query(
      `SELECT * FROM candidate_restrictions 
       WHERE candidate_id = $1
       ORDER BY restricted_at DESC`,
      [candidateId]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Error getting restriction history:', error);
    res.status(500).json({ error: 'Failed to get restriction history' });
  }
});

// Unrestrict candidate
router.post('/unrestrict', async (req, res) => {
  try {
    const { candidateId, userId, reason, userName, userRole, candidateName } = req.body;

    if (!candidateId || !userId || !reason || !userName || !userRole || !candidateName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Deactivate current restriction
    await pool.query(
      `UPDATE candidate_restrictions 
       SET is_active = false 
       WHERE candidate_id = $1 AND is_active = true`,
      [candidateId]
    );

    // Insert unrestriction record with updated column names
    const result = await pool.query(
      `INSERT INTO candidate_unrestrictions (
        candidate_id, candidate_name, unrestricted_by_user_id, 
        unrestricted_by_name, unrestricted_by_role, unrestriction_reason
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [candidateId, candidateName, userId, userName, userRole, reason]
    );

    res.json({ success: true, unrestriction: result.rows[0] });
  } catch (error) {
    console.error('Error unrestricting candidate:', error);
    res.status(500).json({ error: 'Failed to unrestrict candidate' });
  }
});

module.exports = router;
