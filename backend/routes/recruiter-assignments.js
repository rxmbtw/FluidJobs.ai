const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateAdmin } = require('../middleware/adminAuth');

// GET /api/recruiters/:recruiterId/assigned-jobs
// Fetch all jobs assigned to a specific recruiter
router.get('/:recruiterId/assigned-jobs', authenticateAdmin, async (req, res) => {
    try {
        const { recruiterId } = req.params;

        const query = `
            SELECT 
                j.id,
                j.title,
                j.status,
                j.department,
                COUNT(DISTINCT ja.application_id) as "candidatesCount"
            FROM 
                jobs_enhanced j
            LEFT JOIN 
                job_applications ja ON j.id = ja.job_id
            WHERE 
                j.assigned_recruiters @> ARRAY[$1]::integer[]
            GROUP BY 
                j.id, j.title, j.status, j.department
            ORDER BY 
                j.created_at DESC;
        `;

        const result = await pool.query(query, [parseInt(recruiterId)]);

        res.json({
            success: true,
            jobs: result.rows
        });

    } catch (error) {
        console.error('Error fetching assigned jobs:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch assigned jobs.' 
        });
    }
});

// POST /api/recruiters/:recruiterId/assign-job
// Assign a job to a recruiter
router.post('/:recruiterId/assign-job', authenticateAdmin, async (req, res) => {
    try {
        const { recruiterId } = req.params;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Job ID is required.' 
            });
        }

        // Check if job exists
        const jobCheck = await pool.query(
            'SELECT id, assigned_recruiters FROM jobs_enhanced WHERE id = $1',
            [jobId]
        );

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found.' 
            });
        }

        const currentRecruiters = jobCheck.rows[0].assigned_recruiters || [];
        const recruiterIdInt = parseInt(recruiterId);

        // Check if already assigned
        if (currentRecruiters.includes(recruiterIdInt)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Recruiter is already assigned to this job.' 
            });
        }

        // Add recruiter to assigned_recruiters array
        await pool.query(
            `UPDATE jobs_enhanced 
             SET assigned_recruiters = array_append(
                 COALESCE(assigned_recruiters, ARRAY[]::integer[]), 
                 $1
             )
             WHERE id = $2`,
            [recruiterIdInt, jobId]
        );

        res.json({
            success: true,
            message: 'Job assigned successfully.'
        });

    } catch (error) {
        console.error('Error assigning job:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to assign job.' 
        });
    }
});

// POST /api/recruiters/:recruiterId/unassign-job
// Remove a job assignment from a recruiter
router.post('/:recruiterId/unassign-job', authenticateAdmin, async (req, res) => {
    try {
        const { recruiterId } = req.params;
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Job ID is required.' 
            });
        }

        const recruiterIdInt = parseInt(recruiterId);

        // Remove recruiter from assigned_recruiters array
        await pool.query(
            `UPDATE jobs_enhanced 
             SET assigned_recruiters = array_remove(assigned_recruiters, $1)
             WHERE id = $2`,
            [recruiterIdInt, jobId]
        );

        res.json({
            success: true,
            message: 'Job unassigned successfully.'
        });

    } catch (error) {
        console.error('Error unassigning job:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to unassign job.' 
        });
    }
});

// GET /api/recruiters/job-assignments-overview
// Get overview of all job assignments across recruiters
router.get('/job-assignments-overview', authenticateAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                j.id as job_id,
                j.title as job_title,
                j.status as job_status,
                j.department,
                j.assigned_recruiters,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', u.id,
                            'name', u.name,
                            'email', u.email
                        )
                    ) FILTER (WHERE u.id IS NOT NULL),
                    '[]'::json
                ) as recruiters
            FROM 
                jobs_enhanced j
            LEFT JOIN 
                LATERAL unnest(COALESCE(j.assigned_recruiters, ARRAY[]::integer[])) AS recruiter_id ON true
            LEFT JOIN 
                users u ON u.id = recruiter_id
            GROUP BY 
                j.id, j.title, j.status, j.department, j.assigned_recruiters
            ORDER BY 
                j.created_at DESC;
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            assignments: result.rows
        });

    } catch (error) {
        console.error('Error fetching job assignments overview:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch job assignments overview.' 
        });
    }
});

module.exports = router;
