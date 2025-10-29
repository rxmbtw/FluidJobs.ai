const express = require('express');
const router = express.Router();
const pool = require('../config/database');
// const { authenticateToken } = require('./auth');

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        c.candidate_id,
        c.full_name,
        c.phone_number,
        c.email,
        c.gender,
        c.marital_status,
        c.current_company,
        c.notice_period,
        c.current_ctc,
        c.location,
        c.currently_employed,
        c.previous_company,
        c.expected_ctc,
        c.experience_years,
        c.created_at,
        COALESCE(a.resume_score, 0) as resume_score
      FROM candidate.profile c
      LEFT JOIN ai_data a ON c.candidate_id = a.candidate_id
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM candidate.profile';
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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM candidate.profile WHERE candidate_id = $1',
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
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM candidate.profile'),
      pool.query('SELECT COUNT(*) as employed FROM candidate.profile WHERE currently_employed = \'Yes\''),
      pool.query('SELECT COUNT(*) as fresher FROM candidate.profile WHERE currently_employed = \'Fresher\''),
      pool.query('SELECT AVG(experience_years) as avg_experience FROM candidate.profile WHERE experience_years > 0'),
      pool.query(`
        SELECT location, COUNT(*) as count 
        FROM candidate.profile 
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