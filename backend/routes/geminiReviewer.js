const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database');
const router = express.Router();

const genAI = new GoogleGenerativeAI('AIzaSyB8_Q2YkYl5ASlnHC2ltTgmfYL_31Bj3Mo');

// Review resume against job description
router.post('/review/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    // Get candidate data
    const candidateQuery = `
      SELECT cp.*, ai.resume_text 
      FROM candidate.profile cp 
      LEFT JOIN ai_data ai ON cp.candidate_id = ai.candidate_id 
      WHERE cp.candidate_id = $1
    `;
    const candidateResult = await pool.query(candidateQuery, [candidateId]);
    
    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const candidate = candidateResult.rows[0];
    const resumeText = candidate.resume_text || `${candidate.full_name} - Experience: ${candidate.experience_years} years - Company: ${candidate.current_company}`;

    // Gemini AI prompt
    const prompt = `
    You are an expert HR recruiter. Analyze this resume against the job description and provide a matching score.

    JOB DESCRIPTION:
    ${jobDescription}

    CANDIDATE RESUME:
    ${resumeText}

    Provide a JSON response with:
    {
      "score": number (0-100),
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "summary": "brief summary"
    }

    Focus on skills match, experience relevance, and overall fit.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const aiAnalysis = JSON.parse(jsonMatch[0]);

    // Update database with AI score
    const updateQuery = `
      INSERT INTO ai_data (candidate_id, resume_score, ai_analysis, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (candidate_id) 
      DO UPDATE SET 
        resume_score = $2,
        ai_analysis = $3,
        updated_at = NOW()
    `;

    await pool.query(updateQuery, [
      candidateId,
      aiAnalysis.score,
      JSON.stringify(aiAnalysis)
    ]);

    res.json({
      success: true,
      score: aiAnalysis.score,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error('Gemini review error:', error);
    res.status(500).json({ 
      error: 'Failed to review resume',
      details: error.message 
    });
  }
});

module.exports = router;