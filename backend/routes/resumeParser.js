const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Resume parsing and scoring function
const parseAndScoreResume = (resumeText, candidateData) => {
  const skills = extractSkills(resumeText);
  const experience = extractExperience(resumeText);
  const education = extractEducation(resumeText);
  
  const score = calculateScore(skills, experience, education, candidateData);
  
  return {
    skills,
    experience,
    education,
    score,
    extractedText: resumeText
  };
};

const extractSkills = (text) => {
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'REST API', 'GraphQL', 'TypeScript', 'Express', 'Django', 'Flask'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills;
};

const extractExperience = (text) => {
  const expMatch = text.match(/(\d+)\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i);
  return expMatch ? parseInt(expMatch[1]) : 0;
};

const extractEducation = (text) => {
  const educationKeywords = ['Bachelor', 'Master', 'PhD', 'B.Tech', 'M.Tech', 'MBA', 'BCA', 'MCA'];
  const foundEducation = educationKeywords.find(edu => 
    text.toLowerCase().includes(edu.toLowerCase())
  );
  return foundEducation || 'Not specified';
};

const calculateScore = (skills, experience, education, candidateData) => {
  let score = 0;
  
  // Skills score (40%)
  const skillScore = Math.min(skills.length * 5, 40);
  score += skillScore;
  
  // Experience score (35%)
  const expScore = Math.min(experience * 3.5, 35);
  score += expScore;
  
  // Education score (15%)
  const eduScore = education !== 'Not specified' ? 15 : 5;
  score += eduScore;
  
  // Company score (10%)
  const goodCompanies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix'];
  const companyScore = goodCompanies.some(company => 
    candidateData.currentCompany?.toLowerCase().includes(company.toLowerCase())
  ) ? 10 : 5;
  score += companyScore;
  
  return Math.min(Math.round(score), 100);
};

// Parse resume endpoint
router.post('/parse/:candidateId', upload.single('resume'), async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    // Get candidate data
    const candidateResult = await pool.query(
      'SELECT * FROM candidates WHERE candidate_id = $1',
      [candidateId]
    );
    
    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    const candidate = candidateResult.rows[0];
    
    // Mock resume text extraction (in real app, use PDF parser)
    const resumeText = `
      ${candidate.full_name} Software Engineer with ${candidate.experience_years || 3} years of experience.
      Skills: JavaScript, React, Node.js, Python, SQL, AWS, Docker, Git.
      Education: Bachelor of Technology in Computer Science.
      Currently working at ${candidate.current_company || 'Tech Company'}.
      Experience in web development, API design, and database management.
    `;
    
    const parsedData = parseAndScoreResume(resumeText, candidate);
    
    // Store in database
    await pool.query(`
      INSERT INTO ai_data (candidate_id, skills, experience_years, education_level, extracted_text, resume_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (candidate_id) 
      DO UPDATE SET 
        skills = $2,
        experience_years = $3,
        education_level = $4,
        extracted_text = $5,
        resume_score = $6,
        updated_at = CURRENT_TIMESTAMP
    `, [
      candidateId,
      JSON.stringify(parsedData.skills),
      parsedData.experience,
      parsedData.education,
      parsedData.extractedText,
      parsedData.score
    ]);
    
    res.json({
      status: 'success',
      data: {
        candidateId,
        score: parsedData.score,
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education
      }
    });
    
  } catch (error) {
    console.error('Resume parsing error:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

// Get resume score
router.get('/score/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const result = await pool.query(
      'SELECT resume_score, skills, experience_years, education_level FROM ai_data WHERE candidate_id = $1',
      [candidateId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resume score not found' });
    }
    
    res.json({
      status: 'success',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching resume score:', error);
    res.status(500).json({ error: 'Failed to fetch resume score' });
  }
});

module.exports = router;