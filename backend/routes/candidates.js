const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('./auth');

// Get all candidates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        candidate_id,
        full_name,
        phone_number,
        email,
        gender,
        marital_status,
        current_company,
        notice_period,
        current_ctc,
        location,
        currently_employed,
        previous_company,
        expected_ctc,
        experience_years,
        created_at
      FROM candidates
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM candidates';
    let queryParams = [];
    let countParams = [];
    
    if (search) {
      query += ` WHERE 
        full_name ILIKE $1 OR 
        email ILIKE $1 OR 
        current_company ILIKE $1 OR 
        location ILIKE $1
      `;
      countQuery += ` WHERE 
        full_name ILIKE $1 OR 
        email ILIKE $1 OR 
        current_company ILIKE $1 OR 
        location ILIKE $1
      `;
      queryParams = [`%${search}%`, limit, offset];
      countParams = [`%${search}%`];
    } else {
      queryParams = [limit, offset];
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
    
    const [candidatesResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams)
    ]);
    
    const totalCandidates = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCandidates / limit);
    
    res.json({
      status: 'success',
      data: {
        candidates: candidatesResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCandidates,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch candidates'
    });
  }
});

// Get candidate by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM candidates WHERE candidate_id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidate not found'
      });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch candidate'
    });
  }
});



// Get candidate statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM candidates'),
      pool.query('SELECT COUNT(*) as employed FROM candidates WHERE currently_employed = \'Yes\''),
      pool.query('SELECT COUNT(*) as fresher FROM candidates WHERE currently_employed = \'Fresher\''),
      pool.query('SELECT AVG(experience_years) as avg_experience FROM candidates WHERE experience_years > 0'),
      pool.query(`
        SELECT location, COUNT(*) as count 
        FROM candidates 
        WHERE location IS NOT NULL 
        GROUP BY location 
        ORDER BY count DESC 
        LIMIT 5
      `)
    ]);
    
    res.json({
      status: 'success',
      data: {
        totalCandidates: parseInt(stats[0].rows[0].total),
        employedCandidates: parseInt(stats[1].rows[0].employed),
        fresherCandidates: parseInt(stats[2].rows[0].fresher),
        averageExperience: parseFloat(stats[3].rows[0].avg_experience || 0).toFixed(1),
        topLocations: stats[4].rows
      }
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;