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



// Send invite to candidate
router.post('/send-invite', async (req, res) => {
  try {
    const { candidateId, email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }
    
    const nodemailer = require('nodemailer');
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Email service not configured' });
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to FluidJobs.ai - Join the Premier Job Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hello ${name},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We are excited to invite you to join <strong>FluidJobs.ai</strong>, the premier platform connecting talented professionals like you with leading companies.
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 20px;">
            By creating your profile, you will gain access to:
          </p>
          
          <ul style="font-size: 16px; color: #333; line-height: 1.8; margin-left: 20px;">
            <li>A curated selection of job openings not found elsewhere.</li>
            <li>Intelligent tools that simplify and accelerate your job search.</li>
            <li>A user-friendly interface designed for your success.</li>
          </ul>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 20px;">
            Ready to take the next step in your career?
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; font-weight: bold;">
            Create Your Account Here:
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?register=true" 
               style="background-color: #4285F4; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">
              Get Started Now
            </a>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">
            If you have any questions during the sign-up process, please don't hesitate to contact us.
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong>Team FluidJobs.ai</strong>
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Invite sent successfully' });
  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

// Send job notification to existing candidate
router.post('/send-job-notification', async (req, res) => {
  try {
    const { candidateId, email, name, jobId } = req.body;
    
    if (!email || !name || !jobId) {
      return res.status(400).json({ error: 'Email, name, and jobId are required' });
    }
    
    const nodemailer = require('nodemailer');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Email service not configured' });
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Fetch job details
    const jobResult = await pool.query(
      'SELECT job_title, job_type, locations, min_salary, max_salary, job_description FROM public.jobs_enhanced WHERE job_id = $1',
      [jobId]
    );
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobResult.rows[0];
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `New Job Opportunity: ${job.job_title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hello ${name},</p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We have an exciting new job opportunity that matches your profile!
          </p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #4285F4; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin: 0 0 15px 0; color: #4285F4; font-size: 20px;">${job.job_title}</h3>
            <p style="margin: 8px 0; color: #555; font-size: 14px;"><strong>Type:</strong> ${job.job_type}</p>
            <p style="margin: 8px 0; color: #555; font-size: 14px;"><strong>Location:</strong> ${Array.isArray(job.locations) ? job.locations.join(', ') : job.locations}</p>
            ${job.min_salary && job.max_salary ? `<p style="margin: 8px 0; color: #555; font-size: 14px;"><strong>Salary:</strong> ₹${(job.min_salary/100000).toFixed(1)} - ₹${(job.max_salary/100000).toFixed(1)} LPA</p>` : ''}
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 20px;">
            Login to your FluidJobs.ai account to view full details and apply:
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
               style="background-color: #4285F4; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">
              View Job Details
            </a>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong>Team FluidJobs.ai</strong>
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Job notification sent successfully' });
  } catch (error) {
    console.error('Error sending job notification:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to send job notification', details: error.message });
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