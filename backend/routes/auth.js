const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const fetch = require('node-fetch');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check candidates table
    const result = await pool.query(
      'SELECT candidate_id, full_name, email, password_hash, role FROM candidates WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'That email doesn\'t look right. Please check and try again.' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    if (user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      // Fallback for users without password hash
      if (password !== 'admin@123') {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }
    
    const finalRole = role || user.role || 'Candidate';
    
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
    
    res.json({
      user: {
        id: user.candidate_id,
        email: user.email,
        name: user.full_name,
        role: finalRole
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