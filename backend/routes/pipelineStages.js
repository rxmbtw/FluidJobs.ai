const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get pipeline stage for a candidate on a specific job
router.get('/:jobId/:candidateId', authenticateToken, async (req, res) => {
    try {
        const { jobId, candidateId } = req.params;

        const result = await pool.query(
            `SELECT * FROM candidate_pipeline_stages WHERE job_id = $1 AND candidate_id = $2`,
            [jobId, candidateId]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                stage: 'Applied',
                stage_history: [],
                exists: false
            });
        }

        res.json({
            success: true,
            ...result.rows[0],
            exists: true
        });
    } catch (error) {
        console.error('Error fetching pipeline stage:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all candidates with their pipeline stages for a specific job
router.get('/:jobId', authenticateToken, async (req, res) => {
    try {
        const { jobId } = req.params;

        const result = await pool.query(`
      SELECT 
        cps.*,
        c.full_name as candidate_name,
        c.email,
        c.phone_number as phone,
        c.experience_years,
        c.current_company,
        c.notice_period,
        c.expected_ctc,
        c.current_ctc,
        c.location as candidate_location,
        ja.applied_at,
        ja.application_id,
        c.gender,
        c.marital_status,
        c.currently_employed,
        c.last_company,
        c.mode_of_job,
        ja.resume_path
      FROM candidate_pipeline_stages cps
      JOIN candidates c ON cps.candidate_id = c.candidate_id
      LEFT JOIN job_applications ja ON ja.job_id = cps.job_id AND ja.candidate_id = cps.candidate_id
      WHERE cps.job_id = $1
      ORDER BY cps.updated_at DESC
    `, [jobId]);

        res.json({ success: true, stages: result.rows });
    } catch (error) {
        console.error('Error fetching job pipeline stages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update candidate pipeline stage for a specific job
router.post('/update', authenticateToken, async (req, res) => {
    try {
        const { jobId, candidateId, newStage, reason, updatedBy } = req.body;

        if (!jobId || !candidateId || !newStage) {
            return res.status(400).json({ success: false, error: 'jobId, candidateId, and newStage are required' });
        }

        // Get existing record
        const existing = await pool.query(
            `SELECT * FROM candidate_pipeline_stages WHERE job_id = $1 AND candidate_id = $2`,
            [jobId, candidateId]
        );

        const historyEntry = {
            fromStage: existing.rows[0]?.current_stage || 'Applied',
            toStage: newStage,
            timestamp: new Date().toISOString(),
            changedBy: updatedBy || 'Admin',
            reason: reason || ''
        };

        if (existing.rows.length === 0) {
            // Create new record
            const initHistory = [{ fromStage: 'Applied', toStage: 'Applied', timestamp: new Date().toISOString(), changedBy: 'System', reason: 'Application submitted' }, historyEntry];
            await pool.query(
                `INSERT INTO candidate_pipeline_stages (job_id, candidate_id, current_stage, stage_history, updated_at, updated_by)
         VALUES ($1, $2, $3, $4::jsonb, NOW(), $5)`,
                [jobId, candidateId, newStage, JSON.stringify(initHistory), updatedBy || 'Admin']
            );
        } else {
            // Update existing record
            const currentHistory = existing.rows[0].stage_history || [];
            const updatedHistory = [...currentHistory, historyEntry];
            await pool.query(
                `UPDATE candidate_pipeline_stages 
         SET current_stage = $1, stage_history = $2::jsonb, updated_at = NOW(), updated_by = $3
         WHERE job_id = $4 AND candidate_id = $5`,
                [newStage, JSON.stringify(updatedHistory), updatedBy || 'Admin', jobId, candidateId]
            );
        }

        res.json({ success: true, stage: newStage, message: 'Stage updated successfully' });
    } catch (error) {
        console.error('Error updating pipeline stage:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Initialize pipeline stage for a newly applied candidate
router.post('/init', async (req, res) => {
    try {
        const { jobId, candidateId } = req.body;

        if (!jobId || !candidateId) {
            return res.status(400).json({ success: false, error: 'jobId and candidateId are required' });
        }

        // Upsert - create if doesn't exist
        await pool.query(`
      INSERT INTO candidate_pipeline_stages (job_id, candidate_id, current_stage, stage_history, updated_at)
      VALUES ($1, $2, 'Applied', $3::jsonb, NOW())
      ON CONFLICT (job_id, candidate_id) DO NOTHING
    `, [jobId, candidateId, JSON.stringify([{
            fromStage: 'Applied',
            toStage: 'Applied',
            timestamp: new Date().toISOString(),
            changedBy: 'System',
            reason: 'Application submitted'
        }])]);

        res.json({ success: true, stage: 'Applied' });
    } catch (error) {
        console.error('Error initializing pipeline stage:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
