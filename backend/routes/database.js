const express = require('express');
const router = express.Router();
const { setupDatabase, testConnection } = require('../utils/dbSetup');
const pool = require('../config/database');

// Test database connection
router.get('/test', async (req, res) => {
  try {
    const connected = await testConnection();
    if (connected) {
      res.json({ 
        status: 'success', 
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Setup database schema
router.post('/setup', async (req, res) => {
  try {
    await setupDatabase();
    res.json({ 
      status: 'success', 
      message: 'Database schema created successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Get database info
router.get('/info', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    res.json({ 
      status: 'success', 
      tables: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;