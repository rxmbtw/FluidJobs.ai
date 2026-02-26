const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// ─── Auto-create table on first run ─────────────────────────────────────────
pool.query(`
  CREATE TABLE IF NOT EXISTS job_candidate_assignments (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    assigned_recruiter_id INTEGER NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(job_id, candidate_id)
  );
  CREATE INDEX IF NOT EXISTS idx_jca_job_id ON job_candidate_assignments(job_id);
  CREATE INDEX IF NOT EXISTS idx_jca_recruiter ON job_candidate_assignments(assigned_recruiter_id);
`).catch(err => console.error('[candidateAssignments] Table creation error:', err));

// ─── GET all assignments for a job ──────────────────────────────────────────
// GET /api/candidate-assignments/:jobId
router.get('/:jobId', authenticateToken, async (req, res) => {
    try {
        const { jobId } = req.params;
        const result = await pool.query(
            `SELECT 
          jca.id,
          jca.job_id,
          jca.candidate_id,
          jca.assigned_at,
          jca.notes,
          u.id as recruiter_id,
          u.name as recruiter_name,
          u.email as recruiter_email
       FROM job_candidate_assignments jca
       JOIN users u ON jca.assigned_recruiter_id = u.id
       WHERE jca.job_id = $1
       ORDER BY jca.assigned_at DESC`,
            [jobId]
        );
        res.json({ success: true, assignments: result.rows });
    } catch (error) {
        console.error('[candidateAssignments] GET /:jobId error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch assignments.' });
    }
});

// ─── GET assignments only for the calling recruiter on a job ──────────────
// GET /api/candidate-assignments/:jobId/mine
router.get('/:jobId/mine', authenticateToken, async (req, res) => {
    try {
        const { jobId } = req.params;
        const recruiterId = req.user.id;
        const result = await pool.query(
            `SELECT candidate_id, assigned_at, notes
       FROM job_candidate_assignments
       WHERE job_id = $1 AND assigned_recruiter_id = $2`,
            [jobId, recruiterId]
        );
        res.json({ success: true, assignments: result.rows });
    } catch (error) {
        console.error('[candidateAssignments] GET /:jobId/mine error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch your assignments.' });
    }
});

// ─── CLAIM a batch of candidates ────────────────────────────────────────────
// POST /api/candidate-assignments/claim
// Body: { jobId: number, candidateIds: number[], notes?: string }
router.post('/claim', authenticateToken, async (req, res) => {
    const { jobId, candidateIds, notes } = req.body;

    if (!jobId || !Array.isArray(candidateIds) || candidateIds.length === 0) {
        return res.status(400).json({ success: false, message: 'jobId and candidateIds[] required.' });
    }

    const recruiterId = req.user.id;
    const client = await pool.connect();
    const claimed = [];
    const alreadyClaimed = [];

    try {
        await client.query('BEGIN');

        for (const candidateId of candidateIds) {
            // Check if already claimed by someone else
            const existing = await client.query(
                `SELECT assigned_recruiter_id FROM job_candidate_assignments
         WHERE job_id = $1 AND candidate_id = $2`,
                [jobId, candidateId]
            );

            if (existing.rows.length > 0) {
                if (existing.rows[0].assigned_recruiter_id !== recruiterId) {
                    alreadyClaimed.push(candidateId);
                    continue; // skip — already owned by another recruiter
                }
                // already owned by same recruiter — idempotent, update notes if provided
                await client.query(
                    `UPDATE job_candidate_assignments SET notes = COALESCE($1, notes)
           WHERE job_id = $2 AND candidate_id = $3`,
                    [notes || null, jobId, candidateId]
                );
                claimed.push(candidateId);
            } else {
                await client.query(
                    `INSERT INTO job_candidate_assignments (job_id, candidate_id, assigned_recruiter_id, notes)
           VALUES ($1, $2, $3, $4)`,
                    [jobId, candidateId, recruiterId, notes || null]
                );
                claimed.push(candidateId);
            }
        }

        await client.query('COMMIT');
        res.json({
            success: true,
            claimed,
            alreadyClaimed,
            message: alreadyClaimed.length > 0
                ? `${claimed.length} claimed. ${alreadyClaimed.length} already assigned to another recruiter.`
                : `${claimed.length} candidate(s) successfully claimed.`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[candidateAssignments] POST /claim error:', error);
        res.status(500).json({ success: false, message: 'Failed to claim candidates.' });
    } finally {
        client.release();
    }
});

// ─── RELEASE / un-claim candidates ──────────────────────────────────────────
// POST /api/candidate-assignments/release
// Body: { jobId: number, candidateIds: number[] }
router.post('/release', authenticateToken, async (req, res) => {
    const { jobId, candidateIds } = req.body;
    if (!jobId || !Array.isArray(candidateIds) || candidateIds.length === 0) {
        return res.status(400).json({ success: false, message: 'jobId and candidateIds[] required.' });
    }

    const recruiterId = req.user.id;
    const userRole = req.user.role;
    const isAdmin = ['Admin', 'SuperAdmin'].includes(userRole);

    try {
        // Recruiters can only release their own; Admins can release any
        const whereClause = isAdmin
            ? `WHERE job_id = $1 AND candidate_id = ANY($2::int[])`
            : `WHERE job_id = $1 AND candidate_id = ANY($2::int[]) AND assigned_recruiter_id = $3`;

        const params = isAdmin ? [jobId, candidateIds] : [jobId, candidateIds, recruiterId];

        const result = await pool.query(
            `DELETE FROM job_candidate_assignments ${whereClause} RETURNING candidate_id`,
            params
        );

        res.json({ success: true, released: result.rows.map(r => r.candidate_id) });
    } catch (error) {
        console.error('[candidateAssignments] POST /release error:', error);
        res.status(500).json({ success: false, message: 'Failed to release candidates.' });
    }
});

// ─── ADMIN: Re-assign a candidate to a different recruiter ─────────────────
// POST /api/candidate-assignments/reassign
// Body: { jobId, candidateId, newRecruiterId }
router.post('/reassign', authenticateAdmin, async (req, res) => {
    const { jobId, candidateId, newRecruiterId } = req.body;
    if (!jobId || !candidateId || !newRecruiterId) {
        return res.status(400).json({ success: false, message: 'jobId, candidateId, newRecruiterId required.' });
    }

    try {
        await pool.query(
            `INSERT INTO job_candidate_assignments (job_id, candidate_id, assigned_recruiter_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (job_id, candidate_id) DO UPDATE SET assigned_recruiter_id = $3, assigned_at = NOW()`,
            [jobId, candidateId, newRecruiterId]
        );
        res.json({ success: true, message: 'Candidate re-assigned successfully.' });
    } catch (error) {
        console.error('[candidateAssignments] POST /reassign error:', error);
        res.status(500).json({ success: false, message: 'Failed to reassign candidate.' });
    }
});

// ─── ADMIN: Overview — all unassigned candidates for a job ─────────────────
// GET /api/candidate-assignments/overview/:jobId
router.get('/overview/:jobId', authenticateAdmin, async (req, res) => {
    try {
        const { jobId } = req.params;
        const result = await pool.query(
            `SELECT
         ja.id as application_id,
         ja.candidate_id,
         COALESCE(c.full_name, ja.candidate_name) as name,
         COALESCE(c.email, ja.candidate_email) as email,
         jca.assigned_recruiter_id,
         u.name as assigned_recruiter_name,
         jca.assigned_at
       FROM job_applications ja
       LEFT JOIN candidates c ON ja.candidate_id = c.candidate_id
       LEFT JOIN job_candidate_assignments jca ON ja.job_id = jca.job_id AND ja.candidate_id = jca.candidate_id
       LEFT JOIN users u ON jca.assigned_recruiter_id = u.id
       WHERE ja.job_id = $1
       ORDER BY jca.assigned_at NULLS LAST, ja.applied_at DESC`,
            [jobId]
        );
        res.json({ success: true, candidates: result.rows });
    } catch (error) {
        console.error('[candidateAssignments] GET /overview/:jobId error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch overview.' });
    }
});

module.exports = router;
