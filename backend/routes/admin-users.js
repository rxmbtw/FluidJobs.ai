const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');
const router = express.Router();
const pool = require('../config/database');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { checkPermission, getUserPermissions, getRolePermissions, setUserPermission } = require('../middleware/permissions');
const { logAudit } = require('../middleware/auditLogger');

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Check if email exists in users table
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email exists in users table (case-insensitive)
    const result = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (Admin can see users below their level)
router.get('/users', checkPermission('view_users'), async (req, res) => {
  try {
    const { search, role } = req.query;
    const currentUserRole = req.user?.role;

    // Define role hierarchy
    const roleHierarchy = {
      'SuperAdmin': ['SuperAdmin', 'Admin', 'Recruiter', 'Sales', 'Interviewer', 'HR'],
      'Admin': ['Admin', 'Recruiter', 'Sales', 'Interviewer', 'HR']
    };

    const allowedRoles = roleHierarchy[currentUserRole] || [];

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             COUNT(au.account_id) as assigned_accounts
      FROM users u
      LEFT JOIN account_users au ON au.user_id = u.id
      WHERE u.role = ANY($1)
    `;
    let params = [allowedRoles];
    let paramCount = 2;

    if (search) {
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role && allowedRoles.includes(role)) {
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    query += ` GROUP BY u.id, u.name, u.email, u.role, u.created_at ORDER BY u.created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user permissions
router.get('/users/:id/permissions', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get user details
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = userResult.rows[0].role;
    const permissions = await getUserPermissions(id, userRole);

    res.json({
      userId: id,
      role: userRole,
      permissions: permissions
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get role default permissions
router.get('/roles/:role/permissions', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { role } = req.params;
    const permissions = await getRolePermissions(role);

    res.json({
      role: role,
      permissions: permissions
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user permissions
router.put('/users/:id/permissions', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // Array of {name, granted}
    const grantedBy = req.user?.id;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions array is required' });
    }

    // Get user details
    const userResult = await pool.query('SELECT name, role FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Update each permission
    for (const perm of permissions) {
      await setUserPermission(id, perm.name, perm.granted, grantedBy);
    }

    await logAudit(
      grantedBy,
      req.user?.name,
      'USER_PERMISSIONS_UPDATED',
      `Updated permissions for user: ${user.name} (${user.role})`,
      'user',
      id,
      req
    );

    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new user
router.post('/users', checkPermission('create_users'), async (req, res) => {
  try {
    const { name, email, role, phone, useDefaultPermissions, customPermissions } = req.body;
    const createdBy = req.user?.id;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    // Check if current user can create this role
    const currentUserRole = req.user?.role;
    const allowedRoles = {
      'SuperAdmin': ['SuperAdmin', 'Admin', 'Recruiter', 'Sales', 'Interviewer', 'HR'],
      'Admin': ['Recruiter', 'Sales', 'Interviewer', 'HR']
    };

    if (!allowedRoles[currentUserRole]?.includes(role)) {
      return res.status(403).json({ error: 'Cannot create user with this role' });
    }

    // Check if email exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Get creator's account ID for the invite record & auto-assign logic
    let accountId = null;
    if (createdBy) {
      try {
        const creatorAccounts = await pool.query(
          'SELECT account_id FROM account_users WHERE user_id = $1 LIMIT 1',
          [createdBy]
        );
        if (creatorAccounts.rows.length > 0) {
          accountId = creatorAccounts.rows[0].account_id;
        }
      } catch (err) {
        console.error('Error fetching creator account for invite:', err);
      }
    }

    // Create user with highly secure temporary password until they set it via invite link
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, role, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [name, email, role, hashedPassword]
    );

    const userId = result.rows[0].id;

    // Apply permissions based on user choice
    if (useDefaultPermissions) {
      // Apply default role permissions
      const rolePermissions = await getRolePermissions(role);
      for (const perm of rolePermissions) {
        if (perm.has_permission) {
          await setUserPermission(userId, perm.name, true, createdBy);
        }
      }
    } else if (customPermissions && Array.isArray(customPermissions)) {
      // Apply custom permissions
      for (const perm of customPermissions) {
        if (perm.has_permission) {
          await setUserPermission(userId, perm.name, true, createdBy);
        }
      }
    }

    // Auto-assign the new user to the creator's account
    if (accountId) {
      try {
        await pool.query(
          'INSERT INTO account_users (account_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [accountId, userId]
        );
      } catch (err) {
        console.error('Error auto-assigning account:', err);
      }
    }

    // Generate and store invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiration

    try {
      await pool.query(
        'INSERT INTO user_invites (email, token, role, invited_by, account_id, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [email, inviteToken, role, createdBy, accountId, expiresAt]
      );

      const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?token=${inviteToken}`;
      const inviterName = req.user?.name || 'An Admin';

      await sendEmail('noreply', {
        to: email,
        subject: `You've been invited to join FluidJobs.ai as a ${role}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Welcome to FluidJobs!</h2>
            <p>Hello ${name},</p>
            <p><strong>${inviterName}</strong> has invited you to join FluidJobs.ai as a <strong>${role}</strong>.</p>
            <p>Please click the button below to accept the invitation and set up your account password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${inviteLink}</p>
            <p style="margin-top: 40px; font-size: 12px; color: #9ca3af;">This invitation link will expire in 48 hours.</p>
          </div>
        `
      });
    } catch (inviteErr) {
      console.error('Failed to generate invite or send email:', inviteErr);
    }

    await logAudit(
      createdBy,
      req.user?.name,
      'USER_CREATED',
      `Created user: ${name} (${email}) with role ${role}${useDefaultPermissions ? ' with default permissions' : ' with custom permissions'}`,
      'user',
      userId,
      req
    );

    res.json({
      message: 'User created successfully',
      userId: userId,
      tempPassword: tempPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/users/:id', checkPermission('edit_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const updatedBy = req.user?.id;

    // Get current user data
    const currentUser = await pool.query('SELECT name, email, role FROM users WHERE id = $1', [id]);
    if (currentUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user can edit this role
    const currentUserRole = req.user?.role;
    const allowedRoles = {
      'SuperAdmin': ['SuperAdmin', 'Admin', 'Recruiter', 'Sales', 'Interviewer', 'HR'],
      'Admin': ['Recruiter', 'Sales', 'Interviewer', 'HR']
    };

    if (!allowedRoles[currentUserRole]?.includes(role)) {
      return res.status(403).json({ error: 'Cannot assign this role' });
    }

    // Update user
    await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4',
      [name, email, role, id]
    );

    await logAudit(
      updatedBy,
      req.user?.name,
      'USER_UPDATED',
      `Updated user: ${name} (${email}) - Role: ${role}`,
      'user',
      id,
      req
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', checkPermission('delete_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user?.id;

    // Get user details before deletion
    const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check for assigned accounts
    const accountsResult = await pool.query(
      'SELECT COUNT(*) as count FROM account_users WHERE user_id = $1',
      [id]
    );

    if (parseInt(accountsResult.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with assigned accounts. Please transfer accounts first.'
      });
    }

    // Delete user (this will cascade delete user_permissions)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    await logAudit(
      deletedBy,
      req.user?.name,
      'USER_DELETED',
      `Deleted user: ${user.name} (${user.email})`,
      'user',
      id,
      req
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available roles for current user
router.get('/available-roles', checkPermission('create_users'), async (req, res) => {
  try {
    const currentUserRole = req.user?.role;

    const availableRoles = {
      'SuperAdmin': [
        { value: 'SuperAdmin', label: 'Super Admin', description: 'Full system access' },
        { value: 'Admin', label: 'Admin', description: 'Company-level management' },
        { value: 'Recruiter', label: 'Recruiter', description: 'Job creation and candidate management' },
        { value: 'Sales', label: 'Sales', description: 'Job creation only' },
        { value: 'Interviewer', label: 'Interviewer', description: 'Interview and candidate evaluation' },
        { value: 'HR', label: 'HR', description: 'HR operations and candidate management' }
      ],
      'Admin': [
        { value: 'Recruiter', label: 'Recruiter', description: 'Job creation and candidate management' },
        { value: 'Sales', label: 'Sales', description: 'Job creation only' },
        { value: 'Interviewer', label: 'Interviewer', description: 'Interview and candidate evaluation' },
        { value: 'HR', label: 'HR', description: 'HR operations and candidate management' }
      ]
    };

    res.json(availableRoles[currentUserRole] || []);
  } catch (error) {
    console.error('Error fetching available roles:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;