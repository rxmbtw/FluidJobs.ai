const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../config/database');
const { logAudit } = require('../middleware/auditLogger');

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

// Update SuperAdmin Profile
router.put('/profile', async (req, res) => {
  try {
    const { id, name, email, currentPassword, newPassword, profilePicture } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'SuperAdmin ID is required' });
    }

    // Get current admin data
    const adminResult = await pool.query('SELECT * FROM superadmins WHERE id = $1', [id]);
    if (adminResult.rows.length === 0) {
      return res.status(404).json({ error: 'SuperAdmin not found' });
    }
    
    const admin = adminResult.rows[0];

    // Check if email is being changed and if it already exists
    if (email && email !== admin.email) {
      const emailCheck = await pool.query('SELECT id FROM superadmins WHERE LOWER(email) = LOWER($1) AND id != $2', [email, id]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set new password' });
      }
      
      const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }
    }

    // Build update query
    let updateFields = [];
    let updateValues = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }

    if (email) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(email);
      paramCount++;
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.push(`password_hash = $${paramCount}`);
      updateValues.push(hashedPassword);
      paramCount++;
    }

    if (profilePicture) {
      updateFields.push(`profile_picture = $${paramCount}`);
      updateValues.push(profilePicture);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);
    const updateQuery = `UPDATE superadmins SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, profile_picture`;
    
    const result = await pool.query(
      'UPDATE superadmins SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, profile_picture',
      updateValues
    );
    
    await logAudit(id, result.rows[0].name, 'PROFILE_UPDATED', `Profile updated for: ${result.rows[0].name}`, 'superadmin', id, req);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// SuperAdmin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM superadmins WHERE LOWER(email) = LOWER($1)', [email]);
    if (result.rows.length === 0) {
      await logAudit(null, email, 'LOGIN_FAILED', `Failed login attempt for ${email}`, null, null, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!validPassword) {
      await logAudit(admin.id, admin.name, 'LOGIN_FAILED', `Failed login attempt for ${email}`, null, null, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    await logAudit(admin.id, admin.name, 'LOGIN', `SuperAdmin logged in: ${admin.email}`, 'superadmin', admin.id, req);
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at >= $1 AND created_at <= $2';
      params = [startDate, endDate];
    }
    
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status = 'pending' ${dateFilter ? 'AND created_at >= $1 AND created_at <= $2' : ''}) as pending_approvals,
        (SELECT COUNT(*) FROM accounts WHERE status = 'Active' ${dateFilter ? 'AND created_at >= $1 AND created_at <= $2' : ''}) as active_accounts,
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status NOT IN ('rejected', 'closed', 'deleted') ${dateFilter ? 'AND created_at >= $1 AND created_at <= $2' : ''}) as active_jobs,
        (SELECT COUNT(*) FROM candidates ${dateFilter}) as active_candidates,
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status IN ('closed', 'rejected') ${dateFilter ? 'AND created_at >= $1 AND created_at <= $2' : ''}) as closed_positions,
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status NOT IN ('rejected', 'closed', 'deleted') AND created_at >= NOW() - INTERVAL '7 days') as jobs_last_7_days,
        (SELECT COUNT(*) FROM jobs_enhanced WHERE status NOT IN ('rejected', 'closed', 'deleted') AND created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as jobs_previous_7_days,
        (SELECT COUNT(*) FROM candidates WHERE created_at >= NOW() - INTERVAL '7 days') as candidates_last_7_days,
        (SELECT COUNT(*) FROM candidates WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as candidates_previous_7_days
    `, params);
    
    const result = stats.rows[0];
    result.total_pending_approvals = parseInt(result.pending_approvals);
    result.jobs_change = parseInt(result.jobs_last_7_days) - parseInt(result.jobs_previous_7_days);
    result.candidates_change = parseInt(result.candidates_last_7_days) - parseInt(result.candidates_previous_7_days);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pending Approvals (Jobs + Candidate Restrictions)
router.get('/pending-approvals', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = ['pending'];
    
    if (startDate && endDate) {
      dateFilter = 'AND j.created_at >= $2 AND j.created_at <= $3';
      params.push(startDate, endDate);
    }
    
    // Get pending job approvals
    const jobsResult = await pool.query(
      `SELECT j.*, u.name as created_by_name, 'job' as approval_type
       FROM jobs_enhanced j 
       LEFT JOIN users u ON j.created_by_user_id = u.id 
       WHERE j.status = $1 ${dateFilter}
       ORDER BY j.created_at DESC`,
      params
    );
    
    // Reset params for candidate restrictions
    params = ['pending'];
    if (startDate && endDate) {
      dateFilter = 'AND created_at >= $2 AND created_at <= $3';
      params.push(startDate, endDate);
    } else {
      dateFilter = '';
    }
    
    // Get pending candidate restriction approvals
    const candidateResult = await pool.query(
      `SELECT *, 'candidate_restriction' as approval_type
       FROM candidate_restriction_approvals 
       WHERE status = $1 ${dateFilter}
       ORDER BY created_at DESC`,
      params
    );
    
    // Combine and sort by created_at
    const combined = [...jobsResult.rows, ...candidateResult.rows]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20); // Limit to 20 most recent
    
    res.json(combined);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Approved Jobs and Candidate Restrictions
router.get('/approved-jobs', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = 'AND j.created_at >= $1 AND j.created_at <= $2';
      params.push(startDate, endDate);
    }
    
    // Get all active jobs as approved
    const jobsResult = await pool.query(
      `SELECT j.*, u.name as created_by_name, 'job' as approval_type,
              COALESCE(j.approved_at, j.created_at) as approved_at
       FROM jobs_enhanced j 
       LEFT JOIN users u ON j.created_by_user_id = u.id 
       WHERE j.status NOT IN ('pending', 'rejected', 'deleted') ${dateFilter}
       ORDER BY COALESCE(j.approved_at, j.created_at) DESC`,
      params
    );
    
    // Get approved candidate restrictions
    const candidateResult = await pool.query(
      `SELECT cra.*, 
              COALESCE(ru.name, sa_req.name, cra.requested_by_name) as requested_by_username,
              COALESCE(sa_app.name, au.name, cra.approved_by_name) as approved_by_username,
              'candidate_restriction' as approval_type
       FROM candidate_restriction_approvals cra
       LEFT JOIN users ru ON cra.requested_by_user_id = ru.id
       LEFT JOIN superadmins sa_req ON cra.requested_by_user_id = sa_req.id
       LEFT JOIN users au ON cra.approved_by_user_id = au.id
       LEFT JOIN superadmins sa_app ON cra.approved_by_user_id = sa_app.id
       WHERE cra.status IN ('approved', 'unrestricted')
       ORDER BY COALESCE(cra.approved_at, cra.created_at) DESC`
    );
    
    const combined = [...jobsResult.rows, ...candidateResult.rows]
      .sort((a, b) => new Date(b.approved_at || b.created_at) - new Date(a.approved_at || a.created_at));
    
    res.json(combined);
  } catch (error) {
    console.error('Error fetching approved jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Rejected Jobs and Candidate Restrictions
router.get('/rejected-jobs', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = ['rejected'];
    
    if (startDate && endDate) {
      dateFilter = 'AND j.approved_at >= $2 AND j.approved_at <= $3';
      params.push(startDate, endDate);
    }
    
    // Get rejected jobs
    const jobsResult = await pool.query(
      `SELECT j.*, u.name as created_by_name, j.rejection_reason, 'job' as approval_type
       FROM jobs_enhanced j 
       LEFT JOIN users u ON j.created_by_user_id = u.id 
       WHERE j.status = $1 AND j.approved_at IS NOT NULL ${dateFilter}
       ORDER BY j.approved_at DESC`,
      params
    );
    
    // Reset params for candidate restrictions
    params = ['rejected'];
    if (startDate && endDate) {
      dateFilter = 'AND approved_at >= $2 AND approved_at <= $3';
      params.push(startDate, endDate);
    } else {
      dateFilter = '';
    }
    
    // Get rejected candidate restrictions
    const candidateResult = await pool.query(
      `SELECT *, 'candidate_restriction' as approval_type
       FROM candidate_restriction_approvals 
       WHERE status = $1 AND approved_at IS NOT NULL ${dateFilter}
       ORDER BY approved_at DESC`,
      params
    );
    
    // Combine and sort by approved_at (rejection date)
    const combined = [...jobsResult.rows, ...candidateResult.rows]
      .sort((a, b) => new Date(b.approved_at || b.created_at) - new Date(a.approved_at || a.created_at));
    
    res.json(combined);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Job
router.post('/approve-job/:id', async (req, res) => {
  try {
    const jobResult = await pool.query('SELECT title FROM jobs_enhanced WHERE id = $1', [req.params.id]);
    await pool.query('UPDATE jobs_enhanced SET status = $1, approved_at = NOW(), is_republish = false WHERE id = $2', ['Published', req.params.id]);
    await logAudit(null, 'SuperAdmin', 'JOB_APPROVED', `Approved job: ${jobResult.rows[0]?.title}`, 'job', req.params.id, req);
    res.json({ message: 'Job approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject Job
router.post('/reject-job/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    const jobResult = await pool.query('SELECT title FROM jobs_enhanced WHERE id = $1', [req.params.id]);
    
    await pool.query(
      'UPDATE jobs_enhanced SET status = $1, approved_at = NOW(), rejection_reason = $2 WHERE id = $3', 
      ['rejected', reason || null, req.params.id]
    );
    
    await logAudit(null, 'SuperAdmin', 'JOB_REJECTED', `Rejected job: ${jobResult.rows[0]?.title}${reason ? ` - Reason: ${reason}` : ''}`, 'job', req.params.id, req);
    res.json({ message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Candidate Restriction Request
router.post('/candidate-restrictions', async (req, res) => {
  try {
    const { 
      candidate_id, 
      candidate_name, 
      requested_by_user_id, 
      requested_by_name, 
      requested_by_role, 
      restriction_reason 
    } = req.body;
    
    if (!candidate_id || !candidate_name || !requested_by_user_id || !restriction_reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // If SuperAdmin is restricting, auto-approve and create approval record
    if (requested_by_role === 'SuperAdmin') {
      // Create approval record with same user as requester and approver
      const approvalResult = await pool.query(
        `INSERT INTO candidate_restriction_approvals (
          candidate_id, candidate_name, requested_by_user_id, 
          requested_by_name, requested_by_role, restriction_reason,
          status, approved_by_user_id, approved_by_name, approved_by_role, approved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'approved', $3, $4, $5, NOW()) RETURNING id`,
        [candidate_id, candidate_name, requested_by_user_id, requested_by_name, requested_by_role, restriction_reason]
      );
      
      // Directly restrict the candidate
      await pool.query(
        `INSERT INTO candidate_restrictions (candidate_id, user_id, reason, is_active, restricted_at)
         VALUES ($1, $2, $3, true, NOW())`,
        [candidate_id, requested_by_user_id, restriction_reason]
      );
      
      await logAudit(requested_by_user_id, requested_by_name, 'CANDIDATE_RESTRICTED', 
        `Restricted candidate: ${candidate_name} - Reason: ${restriction_reason}`, 'candidate', candidate_id, req);
      
      return res.json({ 
        success: true, 
        message: 'Candidate restricted successfully',
        auto_approved: true,
        approval_id: approvalResult.rows[0].id
      });
    }
    
    // For Admin users, create approval request
    const result = await pool.query(
      `INSERT INTO candidate_restriction_approvals (
        candidate_id, candidate_name, requested_by_user_id, 
        requested_by_name, requested_by_role, restriction_reason
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [candidate_id, candidate_name, requested_by_user_id, requested_by_name, requested_by_role, restriction_reason]
    );
    
    await logAudit(requested_by_user_id, requested_by_name, 'CANDIDATE_RESTRICTION_REQUESTED', 
      `Requested restriction for candidate: ${candidate_name}`, 'candidate', candidate_id, req);
    
    res.json({ 
      success: true, 
      message: 'Candidate restriction request submitted for approval',
      approval_id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error creating candidate restriction request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Pending Candidate Restriction Approvals
router.get('/pending-candidate-restrictions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM candidate_restriction_approvals 
       WHERE status = 'pending' 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Candidate Restriction
router.post('/approve-candidate-restriction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the approval request
    const approvalResult = await pool.query(
      'SELECT * FROM candidate_restriction_approvals WHERE id = $1',
      [id]
    );
    
    if (approvalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }
    
    const approval = approvalResult.rows[0];
    
    // Get actual SuperAdmin info from session/token
    const superAdminResult = await pool.query('SELECT id, name FROM superadmins LIMIT 1');
    const superAdmin = superAdminResult.rows[0] || { id: 1, name: 'D Sodhi' };
    
    // Update approval status with actual SuperAdmin info
    await pool.query(
      `UPDATE candidate_restriction_approvals 
       SET status = 'approved', approved_by_user_id = $1, approved_by_name = $2, approved_by_role = $3, approved_at = NOW() 
       WHERE id = $4`,
      [superAdmin.id, superAdmin.name, 'SuperAdmin', id]
    );
    
    // Actually restrict the candidate
    await pool.query(
      `INSERT INTO candidate_restrictions (candidate_id, user_id, reason, is_active, restricted_at)
       VALUES ($1, $2, $3, true, NOW())`,
      [approval.candidate_id, approval.requested_by_user_id, approval.restriction_reason]
    );
    
    await logAudit(superAdmin.id, superAdmin.name, 'CANDIDATE_RESTRICTION_APPROVED', 
      `Approved restriction for candidate: ${approval.candidate_name}`, 'candidate', approval.candidate_id, req);
    
    res.json({ message: 'Candidate restriction approved' });
  } catch (error) {
    console.error('Error approving candidate restriction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject Candidate Restriction
router.post('/reject-candidate-restriction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get the approval request
    const approvalResult = await pool.query(
      'SELECT * FROM candidate_restriction_approvals WHERE id = $1',
      [id]
    );
    
    if (approvalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }
    
    const approval = approvalResult.rows[0];
    
    // Get actual SuperAdmin info from session/token
    const superAdminResult = await pool.query('SELECT id, name FROM superadmins LIMIT 1');
    const superAdmin = superAdminResult.rows[0] || { id: 1, name: 'D Sodhi' };
    
    // Update approval status with actual SuperAdmin info
    await pool.query(
      `UPDATE candidate_restriction_approvals 
       SET status = 'rejected', approved_by_user_id = $1, approved_by_name = $2, approved_by_role = $3,
           approved_at = NOW(), rejection_reason = $4 
       WHERE id = $5`,
      [superAdmin.id, superAdmin.name, 'SuperAdmin', reason || null, id]
    );
    
    await logAudit(superAdmin.id, superAdmin.name, 'CANDIDATE_RESTRICTION_REJECTED', 
      `Rejected restriction for candidate: ${approval.candidate_name}${reason ? ` - Reason: ${reason}` : ''}`, 'candidate', approval.candidate_id, req);
    
    res.json({ message: 'Candidate restriction rejected' });
  } catch (error) {
    console.error('Error rejecting candidate restriction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unrestrict Candidate
router.post('/unrestrict-candidate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, unrestricted_by_user_id, unrestricted_by_name, unrestricted_by_role } = req.body;
    
    // Get the original restriction approval
    const approvalResult = await pool.query(
      'SELECT * FROM candidate_restriction_approvals WHERE candidate_id = $1 AND status = $2 ORDER BY approved_at DESC LIMIT 1',
      [id, 'approved']
    );
    
    if (approvalResult.rows.length === 0) {
      return res.status(404).json({ error: 'No approved restriction found for this candidate' });
    }
    
    const originalApproval = approvalResult.rows[0];
    
    // Get actual user info
    const userResult = unrestricted_by_role === 'SuperAdmin' 
      ? await pool.query('SELECT id, name FROM superadmins WHERE id = $1', [unrestricted_by_user_id])
      : await pool.query('SELECT id, name FROM users WHERE id = $1', [unrestricted_by_user_id]);
    
    const user = userResult.rows[0] || { id: unrestricted_by_user_id, name: unrestricted_by_name };
    
    // Update the approval record with unrestriction info
    await pool.query(
      `UPDATE candidate_restriction_approvals 
       SET status = 'unrestricted', unrestricted_by_user_id = $1, unrestricted_by_name = $2, 
           unrestricted_by_role = $3, unrestricted_at = NOW(), unrestriction_reason = $4
       WHERE id = $5`,
      [user.id, user.name, unrestricted_by_role, reason, originalApproval.id]
    );
    
    // Deactivate the restriction
    await pool.query(
      `UPDATE candidate_restrictions SET is_active = false WHERE candidate_id = $1 AND is_active = true`,
      [id]
    );
    
    await logAudit(user.id, user.name, 'CANDIDATE_UNRESTRICTED', 
      `Unrestricted candidate: ${originalApproval.candidate_name} - Reason: ${reason}`, 'candidate', id, req);
    
    res.json({ message: 'Candidate unrestricted successfully' });
  } catch (error) {
    console.error('Error unrestricting candidate:', error);
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
    
    await logAudit(null, 'SuperAdmin', 'USER_UPDATED', `Updated user: ${name} (${email})`, 'user', id, req);
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
    
    await pool.query(
      'INSERT INTO ai_policies (type, file_name, file_path, uploaded_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (type) DO UPDATE SET file_name = $2, file_path = $3, uploaded_at = NOW()',
      [type, fileName, filePath]
    );
    
    await logAudit(null, 'SuperAdmin', 'POLICY_UPLOADED', `Uploaded ${type} policy: ${fileName}`, 'policy', type, req);
    
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
        a.locations,
        a.created_at,
        COUNT(DISTINCT CASE WHEN j.status = 'Published' THEN j.id END) as active_jobs,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email)) 
          FILTER (WHERE u.id IS NOT NULL), '[]') as assigned_users
      FROM accounts a
      LEFT JOIN jobs_enhanced j ON j.account_id = a.account_id
      LEFT JOIN account_users au ON au.account_id = a.account_id
      LEFT JOIN users u ON u.id = au.user_id
      GROUP BY a.account_id, a.account_name, a.status, a.locations, a.created_at
      ORDER BY a.created_at DESC
    `);
    
    const accounts = result.rows.map(row => ({
      id: row.account_id,
      name: row.account_name,
      status: row.status || 'Active',
      locations: row.locations || null,
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
    await logAudit(null, 'SuperAdmin', 'ACCOUNT_UPDATED', `Updated account: ${name}`, 'account', id, req);
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
    
    const accountsResult = await pool.query(
      'SELECT a.account_name FROM account_users au JOIN accounts a ON au.account_id = a.account_id WHERE au.user_id = $1',
      [id]
    );
    
    await pool.query(`
      UPDATE account_users 
      SET user_id = $1 
      WHERE user_id = $2
    `, [targetUserId, id]);
    
    const accountNames = accountsResult.rows.map(r => r.account_name).join(', ');
    await logAudit(null, 'SuperAdmin', 'ACCOUNTS_TRANSFERRED', `Transferred accounts (${accountNames}) from user ${id} to user ${targetUserId}`, 'user', id, req);
    
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

// Delete Account (Soft Delete - Set to Inactive)
router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE accounts SET status = $1 WHERE account_id = $2',
      ['Inactive', id]
    );
    
    await logAudit(null, 'SuperAdmin', 'ACCOUNT_DELETED', `Account set to inactive: ${id}`, 'account', id, req);
    
    res.json({ message: 'Account set to inactive successfully' });
  } catch (error) {
    console.error('Error updating account status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (will fail if user has accounts and not transferred)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [id]);
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    await logAudit(null, 'SuperAdmin', 'USER_DELETED', `Deleted user: ${userResult.rows[0]?.name} (${userResult.rows[0]?.email})`, 'user', id, req);
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
    await logAudit(null, 'SuperAdmin', 'ACCOUNT_CREATED', `Created account: ${name}`, 'account', accountId, req);
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
    
    const result = await pool.query(
      'INSERT INTO users (name, email, role, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [name, email, role, hashedPassword]
    );
    
    await logAudit(null, 'SuperAdmin', 'USER_CREATED', `Created user: ${name} (${email}) with role ${role}`, 'user', result.rows[0].id, req);
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

// Create Job by SuperAdmin (auto-approved)
router.post('/create-job', async (req, res) => {
  try {
    const {
      job_title,
      job_domain,
      job_type,
      locations,
      mode_of_job,
      min_experience,
      max_experience,
      skills,
      min_salary,
      max_salary,
      show_salary_to_candidate,
      job_description,
      selected_image,
      jd_attachment_name,
      registration_opening_date,
      registration_closing_date,
      no_of_openings,
      account_id,
      created_by_user_id
    } = req.body;

    const accountResult = await pool.query('SELECT account_name FROM accounts WHERE account_id = $1', [account_id]);
    const company = accountResult.rows[0]?.account_name || 'Company';

    const salary_range = `${min_salary}-${max_salary}`;
    const experience_level = `${min_experience}-${max_experience} years`;

    let finalUserId = created_by_user_id;
    if (!finalUserId) {
      const userResult = await pool.query(
        'SELECT user_id FROM account_users WHERE account_id = $1 LIMIT 1',
        [account_id]
      );
      finalUserId = userResult.rows[0]?.user_id || null;
    }

    const result = await pool.query(
      `INSERT INTO jobs_enhanced (
        title, company, location, description, job_type,
        salary_range, experience_level, jd_pdf_url,
        job_domain, mode_of_job, min_experience, max_experience,
        skills, min_salary, max_salary, show_salary_to_candidate,
        locations, selected_image, jd_attachment_name,
        registration_opening_date, registration_closing_date,
        no_of_openings, account_id, created_by_user_id,
        status, approved_at, created_at, posted_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, 'Published', NOW(), NOW(), NOW()
      ) RETURNING id`,
      [
        job_title, company, Array.isArray(locations) ? locations[0] : locations,
        job_description, job_type, salary_range, experience_level,
        jd_attachment_name, job_domain, mode_of_job, min_experience,
        max_experience, skills, min_salary, max_salary,
        show_salary_to_candidate, locations, selected_image,
        jd_attachment_name, registration_opening_date,
        registration_closing_date, no_of_openings, account_id,
        finalUserId
      ]
    );

    await logAudit(null, 'SuperAdmin', 'JOB_CREATED', `Created and published job: ${job_title} for account ${company}`, 'job', result.rows[0].id, req);

    res.json({
      success: true,
      message: 'Job created and published successfully',
      jobId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { search, actionType, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM audit_logs WHERE 1=1';
    let params = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (user_name ILIKE $${paramCount} OR action_description ILIKE $${paramCount})`;
      countQuery += ` AND (user_name ILIKE $${paramCount} OR action_description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (actionType) {
      query += ` AND action_type = $${paramCount}`;
      countQuery += ` AND action_type = $${paramCount}`;
      params.push(actionType);
      paramCount++;
    }
    
    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      countQuery += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      countQuery += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const [logs, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);
    
    res.json({
      logs: logs.rows,
      total: parseInt(count.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(count.rows[0].count / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export Audit Logs
router.get('/audit-logs/export', async (req, res) => {
  try {
    const { startDate, endDate, actionType } = req.query;
    
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    let params = [];
    let paramCount = 1;
    
    if (actionType) {
      query += ` AND action_type = $${paramCount}`;
      params.push(actionType);
      paramCount++;
    }
    
    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ logs: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Audit Settings
router.get('/audit-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM audit_settings LIMIT 1');
    res.json(result.rows[0] || { retention_days: 90, auto_purge_enabled: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Audit Settings
router.put('/audit-settings', async (req, res) => {
  try {
    const { retention_days, auto_purge_enabled } = req.body;
    
    await pool.query(
      'UPDATE audit_settings SET retention_days = $1, auto_purge_enabled = $2, updated_at = NOW()',
      [retention_days, auto_purge_enabled]
    );
    
    await logAudit(null, 'SuperAdmin', 'AUDIT_SETTINGS_UPDATED', `Updated audit settings: retention=${retention_days} days, auto_purge=${auto_purge_enabled}`, 'settings', null, req);
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purge Old Logs
router.delete('/audit-logs/purge', async (req, res) => {
  try {
    const { days } = req.query;
    const retentionDays = parseInt(days) || 90;
    
    const result = await pool.query(
      `DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '${retentionDays} days' RETURNING id`
    );
    
    res.json({ 
      message: 'Logs purged successfully',
      deleted: result.rowCount 
    });
  } catch (error) {
    console.error('Error purging logs:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
