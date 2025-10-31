const express = require('express');
const { upload, uploadJobPDF } = require('../config/storage');
const pool = require('../config/database');
const router = express.Router();

// Upload job description PDF
router.post('/upload/:jobId', upload.single('jobPDF'), async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    
    // Get job title
    const jobResult = await pool.query('SELECT job_title FROM jobs_enhanced WHERE job_id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const jobTitle = jobResult.rows[0].job_title;
    
    // Upload to Google Cloud Storage
    const { publicUrl, fileName } = await uploadJobPDF(req.file, jobId, jobTitle);
    
    // Save to database
    const result = await pool.query(`
      INSERT INTO job_attachments (
        job_id, file_name, original_name, file_path, 
        file_size, file_type, attachment_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING attachment_id;
    `, [
      jobId,
      fileName,
      `JD - ${jobTitle}.pdf`,
      publicUrl,
      req.file.size,
      'application/pdf',
      'job_description'
    ]);
    
    res.json({
      success: true,
      attachment_id: result.rows[0].attachment_id,
      file_url: publicUrl,
      message: 'Job description PDF uploaded successfully'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
});

// Get job attachments
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const result = await pool.query(`
      SELECT attachment_id, original_name, file_path, file_type, attachment_type, uploaded_at
      FROM job_attachments 
      WHERE job_id = $1
      ORDER BY uploaded_at DESC;
    `, [jobId]);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

module.exports = router;