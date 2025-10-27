const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Always store role info, even if not provided
  req.session.selectedRole = req.query.role || 'Candidate';
  req.session.redirectType = req.query.redirect || 'default';
  
  console.log('Stored role:', req.session.selectedRole, 'redirect:', req.session.redirectType);
  
  // Force session save before OAuth redirect
  req.session.save((err) => {
    if (err) {
      console.error('Session save error before Google auth:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=session_error`);
    }
    console.log('Session saved successfully, proceeding to Google OAuth');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    try {
      console.log('✅ Google auth successful for:', req.user.email);
      console.log('📋 Session ID:', req.sessionID);
      console.log('🍪 Cookies received:', req.headers.cookie);
      console.log('📋 Full session:', req.session);
      
      const sessionRole = req.session?.selectedRole;
      const redirectType = req.session?.redirectType;
      console.log('🎭 Session role:', sessionRole, 'Redirect type:', redirectType);
      console.log('🔍 Session exists:', !!req.session, 'Has role data:', !!(sessionRole || redirectType));
      
      // Ensure role is properly set - default to Candidate if not specified
      let finalRole = 'Candidate';
      if (sessionRole === 'Admin' || redirectType === 'admin') {
        finalRole = 'Admin';
      }
      
      console.log('🎭 Final role determined:', finalRole);
      
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
        ? `${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=Admin`
        : `${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=Candidate`;
      
      console.log('🔄 Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

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