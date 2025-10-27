const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const crypto = require('crypto');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/candidates', authenticateToken, upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  let processedCount = 0;

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          try {
            const candidateId = `FLC${String(Date.now() + Math.floor(Math.random() * 1000)).slice(-6)}`;
            const generatedPassword = crypto.randomBytes(8).toString('hex');

            await pool.query(`
              INSERT INTO candidates (
                candidate_id, first_name, last_name, email, phone, location, 
                skills, experience_years, education, certifications, 
                availability, salary_expectation, portfolio_url, linkedin_url, 
                github_url, generated_password
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            `, [
              candidateId,
              row.first_name || '',
              row.last_name || '',
              row.email || '',
              row.phone || '',
              row.location || '',
              row.skills || '',
              parseInt(row.experience_years) || 0,
              row.education || '',
              row.certifications || '',
              row.availability || '',
              row.salary_expectation || '',
              row.portfolio_url || '',
              row.linkedin_url || '',
              row.github_url || '',
              generatedPassword
            ]);
            processedCount++;
          } catch (error) {
            errors.push(`Row ${processedCount + 1}: ${error.message}`);
          }
        }

        fs.unlinkSync(req.file.path);

        res.json({
          success: true,
          processed: processedCount,
          total: results.length,
          errors: errors
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;