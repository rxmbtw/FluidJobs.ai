const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/policies';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.body.type + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// SuperAdmin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM superadmins WHERE LOWER(email) = LOWER($1)', [email]);
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
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status NOT IN ('rejected', 'closed', 'deleted')) as active_jobs,
        (SELECT COUNT(*) FROM candidates) as active_candidates,
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status NOT IN ('rejected', 'closed', 'deleted') AND created_at >= NOW() - INTERVAL '7 days') as jobs_last_7_days,
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status NOT IN ('rejected', 'closed', 'deleted') AND created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as jobs_previous_7_days,
        (SELECT COUNT(*) FROM candidates WHERE created_at >= NOW() - INTERVAL '7 days') as candidates_last_7_days,
        (SELECT COUNT(*) FROM candidates WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as candidates_previous_7_days
    `);
    
    const result = stats.rows[0];
    result.total_pending_approvals = parseInt(result.pending_approvals);
    result.jobs_change = parseInt(result.jobs_last_7_days) - parseInt(result.jobs_previous_7_days);
    result.candidates_change = parseInt(result.candidates_last_7_days) - parseInt(result.candidates_previous_7_days);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pending Approvals
router.get('/pending-approvals', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.name as created_by_name 
       FROM jobs_enhanced j 
       LEFT JOIN users u ON j.created_by_user_id = u.id 
       WHERE j.status = $1 
       ORDER BY j.created_at DESC LIMIT 10`,
      ['pending']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Approved Jobs
router.get('/approved-jobs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.name as created_by_name 
       FROM jobs_enhanced j 
       LEFT JOIN users u ON j.created_by_user_id = u.id 
       WHERE j.status = $1 AND j.approved_at IS NOT NULL 
       ORDER BY j.approved_at DESC`,
      ['Published']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Rejected Jobs
router.get('/rejected-jobs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.name as created_by_name 
       FROM jobs_enhanced j 
       LEFT JOIN users u ON j.created_by_user_id = u.id 
       WHERE j.status = $1 AND j.approved_at IS NOT NULL 
       ORDER BY j.approved_at DESC`,
      ['rejected']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Job
router.post('/approve-job/:id', async (req, res) => {
  try {
    await pool.query('UPDATE jobs_enhanced SET status = $1, approved_at = NOW(), is_republish = false WHERE id = $2', ['Published', req.params.id]);
    res.json({ message: 'Job approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject Job
router.post('/reject-job/:id', async (req, res) => {
  try {
    await pool.query('UPDATE jobs_enhanced SET status = $1, approved_at = NOW() WHERE id = $2', ['rejected', req.params.id]);
    res.json({ message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Admin Users
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, name, email, role, created_at FROM users';
    let params = [];
    
    if (search) {
      query += ' WHERE name ILIKE $1 OR email ILIKE $1';
      params = [`%${search}%`];
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Admin User
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4',
      [name, email, role, id]
    );
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI Policies
router.get('/policies', async (req, res) => {
  try {
    const result = await pool.query('SELECT type, file_name, uploaded_at FROM ai_policies');
    const policies = {};
    result.rows.forEach(row => {
      policies[row.type] = {
        name: row.file_name,
        uploadedAt: new Date(row.uploaded_at).toLocaleDateString()
      };
    });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Policy
router.post('/upload-policy', upload.single('policy'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { type } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    
    // Store policy info in database
    await pool.query(
      'INSERT INTO ai_policies (type, file_name, file_path, uploaded_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (type) DO UPDATE SET file_name = $2, file_path = $3, uploaded_at = NOW()',
      [type, fileName, filePath]
    );
    
    res.json({ 
      message: 'Policy uploaded successfully',
      fileName: fileName,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get all accounts for SuperAdmin
router.get('/accounts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.account_id,
        a.account_name,
        a.status,
        a.created_at,
        COUNT(DISTINCT CASE WHEN j.status = 'Published' THEN j.id END) as active_jobs,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email)) 
          FILTER (WHERE u.id IS NOT NULL), '[]') as assigned_users
      FROM accounts a
      LEFT JOIN jobs_enhanced j ON j.account_id = a.account_id
      LEFT JOIN account_users au ON au.account_id = a.account_id
      LEFT JOIN users u ON u.id = au.user_id
      GROUP BY a.account_id, a.account_name, a.status, a.created_at
      ORDER BY a.created_at DESC
    `);
    
    const accounts = result.rows.map(row => ({
      id: row.account_id,
      name: row.account_name,
      status: row.status || 'Active',
      activeJobs: parseInt(row.active_jobs) || 0,
      dateCreated: new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      assignedUsers: row.assigned_users
    }));
    
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Account
router.put('/accounts/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { name, status, locations, assignedUsers } = req.body;
    
    await client.query('BEGIN');
    
    await client.query(
      'UPDATE accounts SET account_name = $1, status = $2, locations = $3 WHERE account_id = $4',
      [name, status, locations || null, id]
    );
    
    await client.query('DELETE FROM account_users WHERE account_id = $1', [id]);
    
    if (assignedUsers && assignedUsers.length > 0) {
      for (const userId of assignedUsers) {
        await client.query(
          'INSERT INTO account_users (account_id, user_id) VALUES ($1, $2)',
          [id, userId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Account updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Check if user has assigned accounts before deletion
router.get('/users/:id/accounts', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT a.account_id, a.account_name
      FROM account_users au
      JOIN accounts a ON au.account_id = a.account_id
      WHERE au.user_id = $1
    `, [id]);
    
    res.json({ 
      hasAccounts: result.rows.length > 0,
      accounts: result.rows 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's assigned accounts (for filtering)
router.get('/users/:id/assigned-accounts', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        a.account_id,
        a.account_name,
        a.status,
        COUNT(DISTINCT CASE WHEN j.status = 'Published' THEN j.id END) as active_jobs
      FROM account_users au
      JOIN accounts a ON au.account_id = a.account_id
      LEFT JOIN jobs_enhanced j ON j.account_id = a.account_id
      WHERE au.user_id = $1
      GROUP BY a.account_id, a.account_name, a.status
      ORDER BY a.account_name
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer accounts from one user to another
router.post('/users/:id/transfer-accounts', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetUserId } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }
    
    // Update all account assignments from old user to new user
    await pool.query(`
      UPDATE account_users 
      SET user_id = $1 
      WHERE user_id = $2
    `, [targetUserId, id]);
    
    res.json({ message: 'Accounts transferred successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if account has assigned users before deletion
router.get('/accounts/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role
      FROM account_users au
      JOIN users u ON au.user_id = u.id
      WHERE au.account_id = $1
    `, [id]);
    
    res.json({ 
      hasUsers: result.rows.length > 0,
      users: result.rows 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer users from one account to another
router.post('/accounts/:id/transfer-users', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetAccountId } = req.body;
    
    if (!targetAccountId) {
      return res.status(400).json({ error: 'Target account ID is required' });
    }
    
    await pool.query(`
      UPDATE account_users 
      SET account_id = $1 
      WHERE account_id = $2
    `, [targetAccountId, id]);
    
    res.json({ message: 'Users transferred successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Account
router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM accounts WHERE account_id = $1', [id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (will fail if user has accounts and not transferred)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.code === '23503') {
      res.status(400).json({ error: 'Cannot delete user with assigned accounts. Please transfer accounts first.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Create New Account
router.post('/accounts', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, status, locations, assignedUsers } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Account name is required' });
    }
    
    await client.query('BEGIN');
    
    const result = await client.query(
      'INSERT INTO accounts (account_name, status, locations, created_at) VALUES ($1, $2, $3, NOW()) RETURNING account_id',
      [name, status || 'Active', locations || null]
    );
    
    const accountId = result.rows[0].account_id;
    
    if (assignedUsers && assignedUsers.length > 0) {
      for (const userId of assignedUsers) {
        await client.query(
          'INSERT INTO account_users (account_id, user_id) VALUES ($1, $2)',
          [accountId, userId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Account created successfully', accountId });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Create New User
router.post('/create-user', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }
    
    // Use standard password for all admin users
    const tempPassword = 'Fluid@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await pool.query(
      'INSERT INTO users (name, email, role, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [name, email, role, hashedPassword]
    );
    
    res.json({ 
      message: 'User created successfully',
      tempPassword: tempPassword
    });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
