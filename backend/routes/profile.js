const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const { upload, uploadToLocal } = require('../config/storage');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Profile test endpoint hit');
  res.json({ success: true, message: 'Profile routes working' });
});

// Test upload endpoint
router.post('/test-upload', (req, res) => {
  console.log('Test upload hit');
  res.json({ success: true, message: 'Test endpoint working' });
});

// Upload profile image to Google Cloud Storage
router.post('/upload-profile-image', authenticateToken, upload.single('profileImage'), async (req, res) => {
  console.log('\n=== PROFILE IMAGE UPLOAD START ===');
  console.log('File received:', req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : 'No file');
  console.log('User:', req.user);
  
  try {
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const candidateId = req.user.candidateId;
    if (!candidateId) {
      console.log('ERROR: No candidateId in token');
      return res.status(400).json({ error: 'Invalid user token' });
    }
    
    console.log('Saving file locally...');
    // Save file locally
    const publicUrl = await uploadToLocal(req.file, 'profile-images');
    console.log('File saved successfully, URL:', publicUrl);
    
    // Save URL to database
    console.log('Updating database with profile image URL...');
    const result = await pool.query(
      'UPDATE candidates SET profile_image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE candidate_id = $2 RETURNING profile_image_url',
      [publicUrl, candidateId]
    );
    
    console.log('Database update result:', result.rows);
    console.log('SUCCESS: Profile image uploaded and saved');
    console.log('=== PROFILE IMAGE UPLOAD END ===\n');
    
    res.json({ success: true, fileUrl: publicUrl });
  } catch (error) {
    console.log('FATAL ERROR in profile image upload:');
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    console.log('=== PROFILE IMAGE UPLOAD END (ERROR) ===\n');
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Upload cover image
router.post('/upload-cover-image', authenticateToken, upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const candidateId = req.user.candidateId;

    await pool.query(
      'UPDATE candidates SET cover_image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE candidate_id = $2',
      [fileUrl, candidateId]
    );

    res.json({ success: true, fileUrl });
  } catch (error) {
    console.error('Cover image upload error:', error);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// Upload resume to Google Cloud Storage
router.post('/upload-resume', authenticateToken, upload.single('resume'), async (req, res) => {
  console.log('\n=== RESUME UPLOAD START ===');
  console.log('File received:', req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : 'No file');
  console.log('User:', req.user);
  
  try {
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const candidateId = req.user.candidateId;
    if (!candidateId) {
      console.log('ERROR: No candidateId in token');
      return res.status(400).json({ error: 'Invalid user token' });
    }

    console.log('Saving file locally...');
    // Save file locally
    const publicUrl = await uploadToLocal(req.file, 'resumes');
    console.log('File saved successfully, URL:', publicUrl);

    // Get current resumes
    console.log('Getting current resumes from database...');
    const result = await pool.query('SELECT resume_files FROM candidates WHERE candidate_id = $1', [candidateId]);
    const currentResumes = result.rows[0]?.resume_files || [];
    console.log('Current resumes:', currentResumes);
    
    const newResume = {
      id: Date.now().toString(),
      name: req.file.originalname,
      url: publicUrl,
      uploadedAt: new Date().toISOString()
    };
    
    const updatedResumes = [...currentResumes, newResume];
    console.log('Updated resumes array:', updatedResumes);

    console.log('Updating database with new resume...');
    await pool.query(
      'UPDATE candidates SET resume_files = $1, updated_at = CURRENT_TIMESTAMP WHERE candidate_id = $2',
      [JSON.stringify(updatedResumes), candidateId]
    );
    
    console.log('SUCCESS: Resume uploaded and saved');
    console.log('=== RESUME UPLOAD END ===\n');
    
    res.json({ success: true, fileUrl: publicUrl, resume: newResume });
  } catch (error) {
    console.log('FATAL ERROR in resume upload:');
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    console.log('=== RESUME UPLOAD END (ERROR) ===\n');
    res.status(500).json({ error: 'Failed to upload resume', details: error.message });
  }
});

// Get user profile with files
router.get('/profile', authenticateToken, async (req, res) => {
  console.log('\n=== GET PROFILE START ===');
  console.log('User:', req.user);
  
  try {
    const candidateId = req.user.candidateId;
    
    if (!candidateId) {
      console.log('ERROR: No candidateId in token');
      return res.status(400).json({ error: 'Invalid user token' });
    }
    
    console.log('Fetching profile for candidateId:', candidateId);
    const result = await pool.query(
      'SELECT * FROM candidates WHERE candidate_id = $1',
      [candidateId]
    );

    if (result.rows.length === 0) {
      console.log('ERROR: Profile not found in database');
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = result.rows[0];
    console.log('Profile found:', {
      candidate_id: profile.candidate_id,
      full_name: profile.full_name,
      email: profile.email,
      profile_image_url: profile.profile_image_url,
      resume_files: profile.resume_files
    });
    
    const responseData = {
      ...profile,
      resume_files: profile.resume_files || [],
      documents: profile.documents || []
    };
    
    console.log('SUCCESS: Profile data retrieved');
    console.log('=== GET PROFILE END ===\n');
    
    res.json(responseData);
  } catch (error) {
    console.log('FATAL ERROR in get profile:');
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    console.log('=== GET PROFILE END (ERROR) ===\n');
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  console.log('\n=== PROFILE UPDATE REQUEST START ===');
  console.log('Auth Header:', req.headers.authorization ? 'Present' : 'Missing');
  console.log('Authenticated User:', req.user);
  console.log('Request Body:', req.body);
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const candidateId = req.user.candidateId;
    const { fullName, phone, email, gender, maritalStatus, workStatus, currentCompany, noticePeriod, currentCTC, lastCompany, previousCTC, city, workMode } = req.body;

    if (!candidateId) {
      console.log('ERROR: No candidateId in token');
      return res.status(400).json({ error: 'Invalid user token - missing candidateId' });
    }

    console.log('Attempting UPDATE for candidateId:', candidateId);
    
    // Check if candidate exists first
    const checkResult = await pool.query('SELECT candidate_id, full_name, email FROM candidates WHERE candidate_id = $1', [candidateId]);
    console.log('Candidate check result:', checkResult.rows);
    
    if (checkResult.rows.length === 0) {
      console.log('ERROR: Candidate not found in database');
      return res.status(404).json({ error: 'Candidate not found in database' });
    }

    // Convert CTC values to proper numeric format
    const currentCTCNumeric = currentCTC ? parseFloat(currentCTC) : null;
    const previousCTCNumeric = previousCTC ? parseFloat(previousCTC) : null;

    // Perform the update with proper column names and data types
    const result = await pool.query(
      `UPDATE candidates SET 
        full_name = $1, 
        phone_number = $2, 
        phone = $2,
        email = $3, 
        gender = $4, 
        marital_status = $5, 
        work_status = $6, 
        current_company = $7, 
        notice_period = $8, 
        current_ctc = $9, 
        last_company = $10, 
        previous_ctc = $11, 
        city = $12,
        location = $12,
        work_mode = $13, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE candidate_id = $14 
      RETURNING *`,
      [fullName, phone, email, gender, maritalStatus, workStatus, currentCompany, noticePeriod, currentCTCNumeric, lastCompany, previousCTCNumeric, city, workMode, candidateId]
    );

    console.log('Update result rows:', result.rows.length);
    console.log('Updated data:', result.rows[0]);

    console.log('SUCCESS: Profile updated successfully');
    console.log('=== PROFILE UPDATE REQUEST END ===\n');
    
    res.json({ success: true, message: 'Profile saved successfully', profile: result.rows[0] });
  } catch (error) {
    console.log('FATAL ERROR in profile update:');
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    console.log('=== PROFILE UPDATE REQUEST END (ERROR) ===\n');
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

module.exports = router;