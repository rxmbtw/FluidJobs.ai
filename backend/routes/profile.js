const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('./auth');
const { upload, uploadToLocal } = require('../config/storage');
const { analyzeResumeForJobs } = require('../utils/resumeAnalyzer');
const path = require('path');
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
    
    // Analyze resume and match with jobs
    console.log('\n=== STARTING RESUME ANALYSIS ===');
    try {
      const jobsResult = await pool.query('SELECT * FROM jobs_enhanced WHERE status = \'Published\'');
      const jobs = jobsResult.rows;
      console.log(`Found ${jobs.length} published jobs to analyze`);
      
      if (jobs.length === 0) {
        console.log('No jobs to analyze against');
      } else {
        const resumeFilePath = path.join(__dirname, '..', publicUrl.replace(/^\//,''));
        console.log('Resume file path:', resumeFilePath);
        
        const analysisResult = await analyzeResumeForJobs(resumeFilePath, jobs);
        console.log('Resume keywords found:', analysisResult.resumeKeywords);
        console.log(`Found ${analysisResult.matches.length} job matches`);
        
        if (analysisResult.matches.length > 0) {
          // Store ALL matches in database
          for (const match of analysisResult.matches) {
            console.log(`Saving match: Job ${match.jobId} - ${match.score}%`);
            await pool.query(
              'INSERT INTO job_matches (candidate_id, job_id, match_score, matched_keywords) VALUES ($1, $2, $3, $4) ON CONFLICT (candidate_id, job_id) DO UPDATE SET match_score = $3, matched_keywords = $4',
              [candidateId, match.jobId, match.score, JSON.stringify(match.matchedKeywords)]
            );
          }
          console.log(`✅ ${analysisResult.matches.length} job matches saved to database`);
        } else {
          console.log('⚠️ No matches found');
        }
      }
    } catch (analysisError) {
      console.error('❌ Resume analysis error:', analysisError);
      console.error('Error stack:', analysisError.stack);
    }
    console.log('=== RESUME ANALYSIS COMPLETE ===\n');
    
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
    
    // Ensure all fields have proper values (convert NULL to empty string or appropriate default)
    const responseData = {
      ...profile,
      phone: profile.phone_number || '',
      phone_number: profile.phone_number || '',
      gender: profile.gender || '',
      marital_status: profile.marital_status || '',
      city: profile.city || profile.location || '',
      location: profile.city || profile.location || '',
      current_company: profile.current_company || '',
      notice_period: profile.notice_period || '',
      work_mode: profile.work_mode || '',
      last_company: profile.last_company || '',
      work_status: profile.work_status || '',
      resume_files: Array.isArray(profile.resume_files) ? profile.resume_files : [],
      documents: Array.isArray(profile.documents) ? profile.documents : [],
      // Basic Details fields
      roll_no: profile.roll_no || '',
      first_name: profile.first_name || '',
      middle_name: profile.middle_name || '',
      last_name: profile.last_name || '',
      course: profile.course || '',
      primary_specialization: profile.primary_specialization || '',
      date_of_birth: profile.date_of_birth || '',
      blood_group: profile.blood_group || '',
      medical_history: profile.medical_history || '',
      disability: profile.disability || '',
      known_languages: profile.known_languages || '',
      dream_company: profile.dream_company || '',
      created_at: profile.created_at
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
    const { fullName, phone, email, gender, maritalStatus, workStatus, currentCompany, noticePeriod, currentCTC, lastCompany, previousCTC, city, workMode, college, joiningDate, leavingDate } = req.body;

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

    // Convert empty strings to NULL for proper database handling
    const fullNameValue = fullName?.trim() || null;
    const phoneValue = phone?.trim() || null;
    const emailValue = email?.trim() || null;
    const genderValue = gender?.trim() || null;
    const maritalStatusValue = maritalStatus?.trim() || null;
    const workStatusValue = workStatus?.trim() || null;
    const currentCompanyValue = currentCompany?.trim() || null;
    const noticePeriodValue = noticePeriod?.trim() || null;
    const lastCompanyValue = lastCompany?.trim() || null;
    const cityValue = city?.trim() || null;
    const workModeValue = workMode?.trim() || null;
    const collegeValue = college?.trim() || null;
    const joiningDateValue = joiningDate?.trim() || null;
    const leavingDateValue = leavingDate?.trim() || null;
    
    // Convert CTC values to proper numeric format
    const currentCTCNumeric = currentCTC ? parseFloat(currentCTC) : null;
    const previousCTCNumeric = previousCTC ? parseFloat(previousCTC) : null;

    // Perform the update with proper column names and data types
    const result = await pool.query(
      `UPDATE candidates SET 
        full_name = $1, 
        phone_number = $2, 
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
        college = $14,
        joining_date = $15,
        leaving_date = $16, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE candidate_id = $17 
      RETURNING *`,
      [fullNameValue, phoneValue, emailValue, genderValue, maritalStatusValue, workStatusValue, currentCompanyValue, noticePeriodValue, currentCTCNumeric, lastCompanyValue, previousCTCNumeric, cityValue, workModeValue, collegeValue, joiningDateValue, leavingDateValue, candidateId]
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

// Update basic details
router.put('/basic-details', authenticateToken, async (req, res) => {
  console.log('\n=== BASIC DETAILS UPDATE START ===');
  console.log('User:', req.user);
  console.log('Request Body:', req.body);
  
  try {
    const candidateId = req.user.candidateId;
    const { 
      rollNo, 
      firstName, 
      middleName, 
      lastName, 
      course, 
      primarySpecialization, 
      gender, 
      dateOfBirth, 
      bloodGroup, 
      maritalStatus, 
      medicalHistory, 
      disability, 
      knownLanguages, 
      dreamCompany 
    } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Invalid user token' });
    }

    // Convert empty strings to NULL
    const rollNoValue = rollNo?.trim() || null;
    const firstNameValue = firstName?.trim() || null;
    const middleNameValue = middleName?.trim() || null;
    const lastNameValue = lastName?.trim() || null;
    const courseValue = course?.trim() || null;
    const primarySpecializationValue = primarySpecialization?.trim() || null;
    const genderValue = (gender && gender !== 'Select') ? gender.trim() : null;
    const dateOfBirthValue = dateOfBirth?.trim() || null;
    const bloodGroupValue = (bloodGroup && bloodGroup !== 'Select') ? bloodGroup.trim() : null;
    const maritalStatusValue = (maritalStatus && maritalStatus !== 'Select') ? maritalStatus.trim() : null;
    const medicalHistoryValue = medicalHistory?.trim() || null;
    const disabilityValue = (disability && disability !== 'Select') ? disability.trim() : null;
    const knownLanguagesValue = knownLanguages?.trim() || null;
    const dreamCompanyValue = dreamCompany?.trim() || null;

    // Update full_name from first, middle, last names
    const fullNameParts = [firstNameValue, middleNameValue, lastNameValue].filter(Boolean);
    const fullNameValue = fullNameParts.length > 0 ? fullNameParts.join(' ') : null;

    const result = await pool.query(
      `UPDATE candidates SET 
        roll_no = $1,
        first_name = $2,
        middle_name = $3,
        last_name = $4,
        full_name = $5,
        course = $6,
        primary_specialization = $7,
        gender = $8,
        date_of_birth = $9,
        blood_group = $10,
        marital_status = $11,
        medical_history = $12,
        disability = $13,
        known_languages = $14,
        dream_company = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE candidate_id = $16
      RETURNING *`,
      [
        rollNoValue,
        firstNameValue,
        middleNameValue,
        lastNameValue,
        fullNameValue,
        courseValue,
        primarySpecializationValue,
        genderValue,
        dateOfBirthValue,
        bloodGroupValue,
        maritalStatusValue,
        medicalHistoryValue,
        disabilityValue,
        knownLanguagesValue,
        dreamCompanyValue,
        candidateId
      ]
    );

    console.log('SUCCESS: Basic details updated');
    console.log('=== BASIC DETAILS UPDATE END ===\n');
    
    res.json({ success: true, message: 'Basic details saved successfully', data: result.rows[0] });
  } catch (error) {
    console.log('ERROR in basic details update:', error.message);
    console.log('=== BASIC DETAILS UPDATE END (ERROR) ===\n');
    res.status(500).json({ error: 'Failed to update basic details', details: error.message });
  }
});

// Delete resume
router.delete('/delete-resume/:resumeId', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    const { resumeId } = req.params;
    
    const result = await pool.query('SELECT resume_files FROM candidates WHERE candidate_id = $1', [candidateId]);
    const currentResumes = result.rows[0]?.resume_files || [];
    
    const updatedResumes = currentResumes.filter(r => r.id !== resumeId);
    
    await pool.query(
      'UPDATE candidates SET resume_files = $1, updated_at = CURRENT_TIMESTAMP WHERE candidate_id = $2',
      [JSON.stringify(updatedResumes), candidateId]
    );
    
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Manually trigger resume analysis
router.post('/analyze-resume', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    
    // Get candidate's latest resume
    const result = await pool.query('SELECT resume_files FROM candidates WHERE candidate_id = $1', [candidateId]);
    const resumes = result.rows[0]?.resume_files || [];
    
    if (resumes.length === 0) {
      return res.status(400).json({ error: 'No resume found. Please upload a resume first.' });
    }
    
    const latestResume = resumes[resumes.length - 1];
    const resumeFilePath = path.join(__dirname, '..', latestResume.url.replace(/^\//,''));
    
    // Get all published jobs
    const jobsResult = await pool.query('SELECT * FROM jobs_enhanced WHERE status = \'Published\'');
    const jobs = jobsResult.rows;
    
    if (jobs.length === 0) {
      return res.json({ success: true, message: 'No jobs available to match against', matches: [] });
    }
    
    // Analyze resume
    const analysisResult = await analyzeResumeForJobs(resumeFilePath, jobs);
    
    // Store matches
    for (const match of analysisResult.matches) {
      await pool.query(
        'INSERT INTO job_matches (candidate_id, job_id, match_score, matched_keywords) VALUES ($1, $2, $3, $4) ON CONFLICT (candidate_id, job_id) DO UPDATE SET match_score = $3, matched_keywords = $4',
        [candidateId, match.jobId, match.score, JSON.stringify(match.matchedKeywords)]
      );
    }
    
    res.json({ 
      success: true, 
      message: `Found ${analysisResult.matches.length} job matches`,
      matchCount: analysisResult.matches.length,
      resumeKeywords: analysisResult.resumeKeywords.slice(0, 20)
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// Get matched jobs for candidate
router.get('/matched-jobs', authenticateToken, async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    
    const result = await pool.query(`
      SELECT 
        jm.match_score,
        jm.matched_keywords,
        j.*
      FROM job_matches jm
      JOIN jobs_enhanced j ON jm.job_id = j.job_id
      WHERE jm.candidate_id = $1
      ORDER BY jm.match_score DESC
    `, [candidateId]);
    
    res.json({ success: true, matches: result.rows });
  } catch (error) {
    console.error('Error fetching matched jobs:', error);
    res.status(500).json({ error: 'Failed to fetch matched jobs' });
  }
});

module.exports = router;