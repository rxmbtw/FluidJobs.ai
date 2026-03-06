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
    
    // Check if user exists in users table (includes SuperAdmin)
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }
    
    const user = result.rows[0];
    
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
    
    // Check if user exists in users table (includes all roles including SuperAdmin)
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }
    
    req.user = result.rows[0];
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