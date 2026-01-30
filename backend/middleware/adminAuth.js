const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * Authenticate admin users (Admin role and above)
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and has admin privileges
    let user = null;
    
    // Check if it's a superadmin token
    if (decoded.role === 'superadmin') {
      const result = await pool.query('SELECT id, name, email FROM superadmins WHERE id = $1', [decoded.id]);
      if (result.rows.length > 0) {
        user = {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
          role: 'SuperAdmin'
        };
      }
    } else {
      // Check regular users table
      const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }
    
    // Check if user has admin privileges
    const adminRoles = ['SuperAdmin', 'Admin'];
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Authenticate any logged-in user
 */
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    let user = null;
    
    // Check if it's a superadmin token
    if (decoded.role === 'superadmin') {
      const result = await pool.query('SELECT id, name, email FROM superadmins WHERE id = $1', [decoded.id]);
      if (result.rows.length > 0) {
        user = {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
          role: 'SuperAdmin'
        };
      }
    } else {
      // Check regular users table
      const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('User authentication error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = {
  authenticateAdmin,
  authenticateUser
};