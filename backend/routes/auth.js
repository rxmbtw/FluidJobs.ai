const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const fetch = require('node-fetch');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email transporter setup
let transporter;
try {
  transporter = nodemailer.createTransporter({
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
    
    // Check if username (email or phone) exists
    const result = await pool.query(
      'SELECT candidate_id FROM candidates WHERE email = $1 OR phone = $1',
      [username]
    );
    
    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Registration request body:', req.body);
    const { username, password, fullName, phone, email, gender, maritalStatus, workStatus, currentCompany, noticePeriod, currentCTC, lastCompany, previousCTC, city, workMode } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT candidate_id FROM candidates WHERE email = $1 OR phone = $2',
      [email || username, phone || username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email or phone' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate candidate ID
    const countResult = await pool.query('SELECT COUNT(*) FROM candidates');
    const count = parseInt(countResult.rows[0].count) + 1;
    const candidateId = `FLC${String(count).padStart(10, '0')}`;
    
    // Convert numeric values
    const currentCTCNum = currentCTC ? parseFloat(currentCTC) : null;
    const previousCTCNum = previousCTC ? parseFloat(previousCTC) : null;
    
    console.log('💾 Inserting candidate with ID:', candidateId);
    
    // Insert new candidate
    const newCandidate = await pool.query(
      `INSERT INTO candidates (
        candidate_id, full_name, email, phone, gender, marital_status,
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

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check candidates table
    const result = await pool.query(
      'SELECT candidate_id, full_name, email, password_hash FROM candidates WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'That email doesn\'t look right. Please check and try again.' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account not properly configured. Please contact support.' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials and try again.' });
    }
    
    const token = jwt.sign(
      {
        candidateId: user.candidate_id,
        email: user.email,
        name: user.full_name,
        role: 'Candidate'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth routes
router.get('/google', async (req, res, next) => {
  const role = req.query.role || 'Candidate';
  const sessionId = req.sessionID;
  
  try {
    // Store role in database
    await pool.query(
      'INSERT INTO pending_auth_roles (session_id, role) VALUES ($1, $2) ON CONFLICT (session_id) DO UPDATE SET role = $2, created_at = CURRENT_TIMESTAMP',
      [sessionId, role]
    );
    
    console.log('Stored role in DB:', role, 'for session:', sessionId);
    
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      state: sessionId
    })(req, res, next);
  } catch (error) {
    console.error('Database error storing role:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=db_error`);
  }
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  async (req, res) => {
    try {
      console.log('✅ Google auth successful for:', req.user.email);
      
      const sessionId = req.query.state || req.sessionID;
      
      // Get role from database
      const roleResult = await pool.query(
        'SELECT role FROM pending_auth_roles WHERE session_id = $1 AND expires_at > CURRENT_TIMESTAMP',
        [sessionId]
      );
      
      let finalRole = 'Candidate';
      if (roleResult.rows.length > 0) {
        finalRole = roleResult.rows[0].role;
        // Clean up the record
        await pool.query('DELETE FROM pending_auth_roles WHERE session_id = $1', [sessionId]);
      }
      
      console.log('🎭 Final role from DB:', finalRole);
      
      // Generate JWT token with the determined role
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
      
      // Clear session data
      delete req.session.selectedRole;
      delete req.session.redirectType;
      
      // Redirect based on final role
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
  console.log('🔵 LinkedIn auth route hit with params:', req.query);
  
  const role = req.query.role || 'Candidate';
  const sessionId = req.sessionID;
  
  try {
    // Store role in database
    await pool.query(
      'INSERT INTO pending_auth_roles (session_id, role) VALUES ($1, $2) ON CONFLICT (session_id) DO UPDATE SET role = $2, created_at = CURRENT_TIMESTAMP',
      [sessionId, role]
    );
    
    console.log('✅ Stored LinkedIn role in DB:', role, 'for session:', sessionId);
    
    // Manual LinkedIn OAuth2 redirect
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(`${process.env.BACKEND_URL}/api/auth/linkedin/callback`)}&` +
      `state=${sessionId}&` +
      `scope=openid%20profile%20email`;
    
    console.log('🔗 Redirecting to LinkedIn:', linkedinAuthUrl);
    res.redirect(linkedinAuthUrl);
  } catch (error) {
    console.error('❌ Database error storing LinkedIn role:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=db_error`);
  }
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
    
    // Check if candidate exists
    const existingCandidate = await pool.query(
      'SELECT * FROM candidates WHERE email = $1',
      [email]
    );
    
    let user;
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
    
    // Get role from database
    const roleResult = await pool.query(
      'SELECT role FROM pending_auth_roles WHERE session_id = $1 AND expires_at > CURRENT_TIMESTAMP',
      [state]
    );
    
    let finalRole = 'Candidate';
    if (roleResult.rows.length > 0) {
      finalRole = roleResult.rows[0].role;
      await pool.query('DELETE FROM pending_auth_roles WHERE session_id = $1', [state]);
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
router.post('/logout', (req, res) => {
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
    
    // Check if user exists
    const result = await pool.query(
      'SELECT candidate_id, full_name, email FROM candidates WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }
    
    const user = result.rows[0];
    
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
    
    // Verify code again
    const codeResult = await pool.query(
      'SELECT * FROM password_reset_codes WHERE email = $1 AND code = $2 AND expires_at > CURRENT_TIMESTAMP',
      [email, code]
    );
    
    if (codeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE candidates SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [hashedPassword, email]
    );
    
    // Delete used verification code
    await pool.query(
      'DELETE FROM password_reset_codes WHERE email = $1',
      [email]
    );
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
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

module.exports = router;
module.exports.authenticateToken = authenticateToken;