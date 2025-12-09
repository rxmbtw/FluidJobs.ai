const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/database');

// SuperAdmin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM superadmins WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status = 'pending') as pending_approvals,
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status = 'active') as active_jobs,
        (SELECT COUNT(*) FROM candidates) as active_candidates
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pending Approvals
router.get('/pending-approvals', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs_enhanced WHERE status = $1 ORDER BY created_at DESC LIMIT 10',
      ['pending']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Job
router.post('/approve-job/:id', async (req, res) => {
  try {
    await pool.query('UPDATE jobs_enhanced SET status = $1 WHERE id = $2', ['active', req.params.id]);
    res.json({ message: 'Job approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject Job
router.post('/reject-job/:id', async (req, res) => {
  try {
    await pool.query('UPDATE jobs_enhanced SET status = $1 WHERE id = $2', ['rejected', req.params.id]);
    res.json({ message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Users
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT candidate_id, full_name, email, role, created_at FROM candidates';
    let params = [];
    
    if (search) {
      query += ' WHERE full_name ILIKE $1 OR email ILIKE $1';
      params = [`%${search}%`];
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
