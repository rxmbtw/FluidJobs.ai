const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const fetch = require('node-fetch');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { logAudit } = require('../middleware/auditLogger');
const router = express.Router();

// Rate limiter for login attempts (increased for development)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts (increased from 5)
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for signup (increased for development)
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 attempts (increased from 3)
  message: 'Too many registration attempts. Please try again later.',
});

// Password strength validation
function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumber) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true };
}

// Email transporter setup
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('📧 Email transporter initialized');
} catch (error) {
  console.error('❌ Failed to initialize email transporter:', error);
}

// Check username endpoint
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    // Check if username (email or phone) exists in candidates table
    const candidateResult = await pool.query(
      'SELECT candidate_id FROM candidates WHERE LOWER(email) = LOWER($1) OR phone_number = $1',
      [username]
    );

    // Also check if email exists in users table (for admin/recruiter accounts)
    const userResult = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [username]
    );

    const exists = candidateResult.rows.length > 0 || userResult.rows.length > 0;

    res.json({ exists });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Signup endpoint
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    console.log('📝 Registration request body:', req.body);
    const { username, password, fullName, phone, email, gender, maritalStatus, workStatus, currentCompany, noticePeriod, currentCTC, lastCompany, previousCTC, city, workMode } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT candidate_id FROM candidates WHERE email = $1 OR phone_number = $2',
      [email || username, phone || username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email or phone' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate candidate ID using timestamp to avoid duplicates
    const candidateId = `FLC${Date.now()}`;

    // Convert numeric values
    const currentCTCNum = currentCTC ? parseFloat(currentCTC) : null;
    const previousCTCNum = previousCTC ? parseFloat(previousCTC) : null;

    console.log('💾 Inserting candidate with ID:', candidateId);

    // Insert new candidate
    const newCandidate = await pool.query(
      `INSERT INTO candidates (
        candidate_id, full_name, email, phone_number, gender, marital_status,
        current_company, notice_period, current_ctc,
        last_company, previous_ctc, city, work_mode, work_status, password_hash
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING candidate_id, full_name, email`,
      [
        candidateId, fullName, email || username, phone || username, gender, maritalStatus,
        currentCompany, noticePeriod, currentCTCNum,
        lastCompany, previousCTCNum, city, workMode, workStatus, hashedPassword
      ]
    );

    const user = newCandidate.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        candidateId: user.candidate_id,
        email: user.email,
        name: user.full_name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit(user.candidate_id, user.full_name, 'SIGNUP', `New candidate registered: ${user.email}`, 'candidate', user.candidate_id, req);

    res.json({
      user: {
        id: user.candidate_id,
        email: user.email,
        name: user.full_name,
        role: 'Candidate'
      },
      token
    });
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Admin check endpoint
router.post('/admin/check', async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Check failed' });
  }
});

// Admin login endpoint
router.post('/admin/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check admin table (case-insensitive email)
    const result = await pool.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (result.rows.length === 0) {
      await logAudit(null, email, 'LOGIN_FAILED', `Failed admin login attempt for ${email}`, null, null, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    // Verify password
    if (!admin.password_hash) {
      return res.status(401).json({ error: 'Account not properly configured. Please contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      await logAudit(admin.id, admin.name, 'LOGIN_FAILED', `Failed admin login attempt for ${email}`, 'user', admin.id, req);
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        id: admin.id,  // Add this for compatibility
        email: admin.email,
        name: admin.name,
        role: admin.role || 'Admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit(admin.id, admin.name, 'LOGIN', `Admin logged in: ${admin.email}`, 'user', admin.id, req);

    res.json({
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role || 'Admin'
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Login endpoint
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check candidates table for both email and phone (case-insensitive email)
    const result = await pool.query(
      'SELECT candidate_id, full_name, email, password_hash, role FROM candidates WHERE LOWER(email) = LOWER($1) OR phone_number = $1',
      [email]
    );

    if (result.rows.length === 0) {
      await logAudit(null, email, 'LOGIN_FAILED', `Failed candidate login attempt for ${email}`, null, null, req);
      return res.status(401).json({ error: 'That email doesn\'t look right. Please check and try again.' });
    }

    const user = result.rows[0];

    // Verify password
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account not properly configured. Please contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await logAudit(user.candidate_id, user.full_name, 'LOGIN_FAILED', `Failed candidate login attempt for ${email}`, 'candidate', user.candidate_id, req);
      return res.status(401).json({ error: 'Invalid password. Please check your credentials and try again.' });
    }

    const token = jwt.sign(
      {
        candidateId: user.candidate_id,
        email: user.email,
        name: user.full_name,
        role: user.role || 'Candidate'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit(user.candidate_id, user.full_name, 'LOGIN', `Candidate logged in: ${user.email}`, 'candidate', user.candidate_id, req);

    res.json({
      user: {
        id: user.candidate_id,
        email: user.email,
        name: user.full_name,
        role: user.role || 'Candidate'
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth routes
router.get('/google', async (req, res, next) => {
  console.log('🔵 Google OAuth initiated');

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  async (req, res) => {
    try {
      console.log('✅ Google auth successful for:', req.user.email);

      // Use role from passport (determined by database check)
      const finalRole = req.user.role || 'Candidate';
      console.log('🎭 Role from database:', finalRole);

      // Generate JWT token with the database role
      const token = jwt.sign(
        {
          candidateId: req.user.candidate_id,
          email: req.user.email,
          name: req.user.full_name,
          role: finalRole
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('🔑 JWT token created with role:', finalRole);

      // Clean up pending auth roles if any
      const sessionId = req.query.state || req.sessionID;
      try {
        await pool.query('DELETE FROM pending_auth_roles WHERE session_id = $1', [sessionId]);
      } catch (e) {
        // Ignore cleanup errors
      }

      // Redirect based on database role
      const redirectUrl = finalRole === 'Admin'
        ? `${process.env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&role=Admin`
        : `${process.env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&role=Candidate`;

      console.log('🔄 Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('❌ Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// LinkedIn OAuth routes
router.get('/linkedin', async (req, res) => {
  console.log('🔵 LinkedIn auth route hit');

  const sessionId = req.sessionID;

  // Manual LinkedIn OAuth2 redirect
  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(`${process.env.BACKEND_URL}/api/auth/linkedin/callback`)}&` +
    `state=${sessionId}&` +
    `scope=openid%20profile%20email`;

  console.log('🔗 Redirecting to LinkedIn');
  res.redirect(linkedinAuthUrl);
});

router.get('/linkedin/callback', async (req, res) => {
  console.log('🔵 LinkedIn callback hit with query:', req.query);

  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('❌ LinkedIn OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=linkedin_error`);
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET
    });

    console.log('🔗 Token request params:', {
      grant_type: 'authorization_code',
      code: code.substring(0, 10) + '...',
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET ? 'Present' : 'Missing'
    });

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams.toString()
    });

    const tokenData = await tokenResponse.json();
    console.log('🔍 LinkedIn token response:', tokenData);

    if (!tokenData.access_token) {
      console.error('❌ Failed to get access token:', tokenData);
      console.error('❌ Token response status:', tokenResponse.status);
      console.error('❌ Token response headers:', Object.fromEntries(tokenResponse.headers));
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed&details=${encodeURIComponent(JSON.stringify(tokenData))}`);
    }

    // Get user info using OpenID Connect userinfo endpoint
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userInfoResponse.json();

    const email = userData.email || `linkedin_${userData.sub}@temp.fluidjobs.ai`;
    const name = userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || 'LinkedIn User';

    console.log('📧 LinkedIn email:', email);
    console.log('👤 LinkedIn name:', name);

    let user;
    let finalRole = 'Candidate';

    // FIRST: Check if user exists in admin table
    const existingAdmin = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user found:', existingAdmin.rows[0].id);
      user = {
        candidate_id: existingAdmin.rows[0].id,
        email: existingAdmin.rows[0].email,
        full_name: existingAdmin.rows[0].name || name
      };
      finalRole = 'Admin';
    } else {
      // SECOND: Check if candidate exists
      const existingCandidate = await pool.query(
        'SELECT * FROM candidates WHERE email = $1',
        [email]
      );

      if (existingCandidate.rows.length > 0) {
        user = existingCandidate.rows[0];
      } else {
        // Create new candidate
        const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
        const count = parseInt(countResult.rows[0].count) + 1;
        const candidateId = `FLC${String(count).padStart(10, '0')}`;

        const newCandidate = await pool.query(
          `INSERT INTO candidates (
            candidate_id, full_name, email, phone, gender, marital_status, 
            work_status, current_company, notice_period, current_ctc, 
            last_company, previous_ctc, city, work_mode, 
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, '', '', '', '', '', '', '', '', '', '', '', 
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          ) RETURNING *`,
          [candidateId, name, email]
        );

        user = newCandidate.rows[0];
      }
      finalRole = 'Candidate';
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        candidateId: user.candidate_id,
        email: user.email,
        name: user.full_name,
        role: finalRole
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const redirectUrl = finalRole === 'Admin'
      ? `${process.env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&role=Admin`
      : `${process.env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&role=Candidate`;

    console.log('✅ LinkedIn auth successful, redirecting to:', redirectUrl);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ LinkedIn callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

// Test LinkedIn configuration
router.get('/test-linkedin', (req, res) => {
  const hasLinkedInCredentials = !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
  res.json({
    linkedinConfigured: hasLinkedInCredentials,
    clientId: process.env.LINKEDIN_CLIENT_ID ? 'Set' : 'Missing',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'Set' : 'Missing'
  });
});

// Logout route
router.post('/logout', authenticateToken, (req, res) => {
  const user = req.user || { email: 'Unknown' };
  logAudit(user.id || null, user.name || user.email, 'LOGOUT', `User logged out: ${user.email}`, null, null, req);

  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT candidate_id, full_name, email, phone_number, location FROM candidates WHERE candidate_id = $1',
      [req.user.candidateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === 'your-email@gmail.com' ||
      process.env.EMAIL_PASS === 'your-app-password') {
      console.error('❌ Email configuration not set up properly');
      return res.status(500).json({
        error: 'Email service not configured. Please contact administrator.'
      });
    }

    // Check if user exists in users table (Admin/HR/Sales)
    let user;
    let userType = 'candidate';

    const companyUserResult = await pool.query(
      'SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (companyUserResult.rows.length > 0) {
      user = { ...companyUserResult.rows[0], full_name: companyUserResult.rows[0].name };
      userType = 'company';
    } else {
      // Check candidates table
      const candidateResult = await pool.query(
        'SELECT candidate_id, full_name, email FROM candidates WHERE LOWER(email) = LOWER($1)',
        [email]
      );

      if (candidateResult.rows.length === 0) {
        return res.status(404).json({ error: 'No account found with this email address' });
      }

      user = candidateResult.rows[0];
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in database
    await pool.query(
      'INSERT INTO password_reset_codes (email, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP',
      [email, verificationCode, expiresAt]
    );

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code - FluidJobs.ai',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hello ${user.full_name},</p>
          <p>You requested to reset your password for your FluidJobs.ai account.</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; color: #1F2937;">Your verification code is:</h3>
            <h1 style="font-size: 32px; letter-spacing: 8px; color: #4F46E5; margin: 10px 0;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">FluidJobs.ai - Your Career Partner</p>
        </div>
      `
    };

    console.log('📧 Attempting to send email to:', email);
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);

    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        error: 'Email authentication failed. Please check email configuration.'
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(500).json({
        error: 'Unable to connect to email service. Please try again later.'
      });
    }

    res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
});

// Verify reset code endpoint
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    const result = await pool.query(
      'SELECT * FROM password_reset_codes WHERE email = $1 AND code = $2 AND expires_at > CURRENT_TIMESTAMP',
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Verify code
    const codeResult = await pool.query(
      'SELECT * FROM password_reset_codes WHERE LOWER(email) = LOWER($1) AND code = $2 AND expires_at > CURRENT_TIMESTAMP',
      [email, code]
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if user is in users table (Admin/HR/Sales) or candidates table
    const companyUserResult = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (companyUserResult.rows.length > 0) {
      // Update password in users table
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE LOWER(email) = LOWER($2)',
        [hashedPassword, email]
      );
    } else {
      // Update password in candidates table
      await pool.query(
        'UPDATE candidates SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) = LOWER($2)',
        [hashedPassword, email]
      );
    }

    // Delete used verification code
    await pool.query(
      'DELETE FROM password_reset_codes WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    await logAudit(null, email, 'PASSWORD_RESET', `Password reset for: ${email}`, 'user', null, req);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Change password endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.adminId || req.user.id;
    const userEmail = req.user.email;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user is admin or candidate
    let user;
    if (req.user.role === 'Admin' || req.user.role === 'HR' || req.user.role === 'Sales') {
      const result = await pool.query(
        'SELECT id, password_hash FROM users WHERE id = $1',
        [userId]
      );
      user = result.rows[0];
    } else {
      const result = await pool.query(
        'SELECT candidate_id, password_hash FROM candidates WHERE candidate_id = $1',
        [req.user.candidateId]
      );
      user = result.rows[0];
    }

    if (!user || !user.password_hash) {
      return res.status(404).json({ error: 'User not found or password not set' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    if (req.user.role === 'Admin' || req.user.role === 'HR' || req.user.role === 'Sales') {
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, userId]
      );
    } else {
      await pool.query(
        'UPDATE candidates SET password_hash = $1 WHERE candidate_id = $2',
        [hashedPassword, req.user.candidateId]
      );
    }

    await logAudit(userId, userEmail, 'PASSWORD_CHANGED', `Password changed for: ${userEmail}`, 'user', userId, req);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Test endpoint to debug token
router.get('/debug-token', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Debug token - Full user object:', JSON.stringify(req.user, null, 2));
    const userId = req.user.adminId || req.user.id;

    // Check if user exists in users table
    const userCheck = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);

    // Check account assignments
    const accountCheck = await pool.query('SELECT * FROM account_users WHERE user_id = $1', [userId]);

    res.json({
      tokenPayload: req.user,
      extractedUserId: userId,
      userExists: userCheck.rows.length > 0,
      userDetails: userCheck.rows[0] || null,
      accountAssignments: accountCheck.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logged-in user's assigned accounts
router.get('/my-accounts', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 My-accounts request - Full token payload:', JSON.stringify(req.user));
    console.log('🔍 req.user.adminId:', req.user.adminId);
    console.log('🔍 req.user.id:', req.user.id);

    const userId = req.user.adminId || req.user.id;
    console.log('🔍 Extracted userId:', userId);

    if (!userId) {
      console.error('❌ No userId found in token');
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    // First check if user exists in users table
    const userCheck = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    console.log('🔍 User check result:', userCheck.rows);

    if (userCheck.rows.length === 0) {
      console.error('❌ User not found in users table');
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await pool.query(`
      SELECT 
        a.account_id,
        a.account_name,
        a.created_at,
        a.status,
        a.locations,
        a.last_activity_at,
        COUNT(DISTINCT CASE WHEN j.status = 'Published' THEN j.id END) as active_jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'Closed' THEN j.id END) as completed_jobs,
        COUNT(DISTINCT au2.user_id) as assigned_users
      FROM account_users au
      JOIN accounts a ON au.account_id = a.account_id
      LEFT JOIN jobs_enhanced j ON j.account_id = a.account_id
      LEFT JOIN account_users au2 ON au2.account_id = a.account_id
      WHERE au.user_id = $1
      GROUP BY a.account_id, a.account_name, a.created_at, a.status, a.locations, a.last_activity_at
      ORDER BY a.account_name
    `, [userId]);

    console.log('✅ Found accounts:', result.rows.length);
    console.log('📋 Accounts data:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

// Validate an invite token
router.get('/validate-invite/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const tokenResult = await pool.query(
      'SELECT email, role, expires_at, used FROM user_invites WHERE token = $1',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired invitation link.' });
    }

    const invite = tokenResult.rows[0];

    if (invite.used) {
      return res.status(400).json({ valid: false, message: 'This invitation has already been used.' });
    }

    if (new Date() > new Date(invite.expires_at)) {
      return res.status(400).json({ valid: false, message: 'This invitation has expired. Please ask your administrator to send a new one.' });
    }

    res.json({ valid: true, email: invite.email, role: invite.role });
  } catch (error) {
    console.error('Error validating invite token:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set password for invited user
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Validate token and get user email
    const tokenResult = await pool.query(
      'SELECT email, role, expires_at, used FROM user_invites WHERE token = $1',
      [token]
    );

    if (tokenResult.rows.length === 0 || tokenResult.rows[0].used || new Date() > new Date(tokenResult.rows[0].expires_at)) {
      return res.status(400).json({ error: 'Invalid or expired invitation link' });
    }

    const invite = tokenResult.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user record
    const userResult = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, name, role',
      [hashedPassword, invite.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Mark token as used
    await pool.query(
      'UPDATE user_invites SET used = TRUE WHERE token = $1',
      [token]
    );

    // Generate JWT token so they are logged in automatically
    const user = userResult.rows[0];
    const jwtToken = jwt.sign(
      { id: user.id, name: user.name, email: invite.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Password set successfully',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: invite.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;