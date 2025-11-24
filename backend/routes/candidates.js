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
        c.resume_link,
        c.created_at,
        0 as resume_score
      FROM public.candidates c
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM public.candidates';
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

// Create new candidate
router.post('/', async (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      email,
      gender,
      marital_status,
      current_company,
      notice_period,
      current_ctc,
      location,
      resume_link,
      currently_employed,
      previous_company,
      expected_ctc,
      experience_years
    } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'full_name and email are required'
      });
    }

    const checkEmail = await pool.query(
      'SELECT candidate_id FROM public.candidates WHERE email = $1',
      [email]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already exists - duplicate candidate'
      });
    }

    const candidateId = `FLC${Date.now().toString().slice(-8)}`;

    const result = await pool.query(`
      INSERT INTO public.candidates (
        candidate_id, full_name, phone_number, email, gender, marital_status,
        current_company, notice_period, current_ctc, location, resume_link,
        currently_employed, previous_company, expected_ctc, experience_years
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      candidateId, full_name, phone_number, email, gender, marital_status,
      current_company, notice_period, current_ctc, location, resume_link,
      currently_employed, previous_company, expected_ctc, experience_years
    ]);

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create candidate'
    });
  }
});

// Get candidate by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM public.candidates WHERE candidate_id = $1',
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



// CREATE - Add new candidate
router.post('/', async (req, res) => {
  try {
    const { 
      full_name, email, phone_number, gender, marital_status,
      current_company, notice_period, current_ctc, location,
      currently_employed, previous_company, expected_ctc, experience_years
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO public.candidates (
        full_name, email, phone_number, gender, marital_status,
        current_company, notice_period, current_ctc, location,
        currently_employed, previous_company, expected_ctc, experience_years
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
      [full_name, email, phone_number, gender, marital_status,
       current_company, notice_period, current_ctc, location,
       currently_employed, previous_company, expected_ctc, experience_years]
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Candidate created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create candidate',
      error: error.message
    });
  }
});

// UPDATE - Update candidate by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      full_name, email, phone_number, gender, marital_status,
      current_company, notice_period, current_ctc, location,
      currently_employed, previous_company, expected_ctc, experience_years
    } = req.body;
    
    const result = await pool.query(
      `UPDATE public.candidates SET
        full_name = $1, email = $2, phone_number = $3, gender = $4,
        marital_status = $5, current_company = $6, notice_period = $7,
        current_ctc = $8, location = $9, currently_employed = $10,
        previous_company = $11, expected_ctc = $12, experience_years = $13
      WHERE candidate_id = $14 RETURNING *`,
      [full_name, email, phone_number, gender, marital_status,
       current_company, notice_period, current_ctc, location,
       currently_employed, previous_company, expected_ctc, experience_years, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidate not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Candidate updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update candidate',
      error: error.message
    });
  }
});

// DELETE - Delete candidate by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM public.candidates WHERE candidate_id = $1 RETURNING *',
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
      message: 'Candidate deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete candidate',
      error: error.message
    });
  }
});

// Get candidate statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM public.candidates'),
      pool.query('SELECT COUNT(*) as employed FROM public.candidates WHERE currently_employed = \'Yes\''),
      pool.query('SELECT COUNT(*) as fresher FROM public.candidates WHERE currently_employed = \'Fresher\''),
      pool.query('SELECT AVG(experience_years) as avg_experience FROM public.candidates WHERE experience_years > 0'),
      pool.query(`
        SELECT location, COUNT(*) as count 
        FROM public.candidates 
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