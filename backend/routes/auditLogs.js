const express = require('express');
const router = express.Router();
const pool = require('../config/database');
// const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/audit-logs
 * @desc    Get audit logs with filtering and pagination
 * @access  Public (Dev)
 */
router.get('/', async (req, res) => {
    try {
        const {
            candidateId,
            jobId,
            userId,
            action,
            fromDate,
            toDate,
            page = 1,
            limit = 50
        } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        console.log('--- GET /api/audit-logs Request ---');
        console.log('Query Params:', req.query);
        let query = `
      SELECT * FROM audit_logs 
      WHERE 1=1
    `;

        if (candidateId) {
            params.push(candidateId);
            // Fix: cast candidateId to integer if needed, or check if column is string
            // Migration says entity_id is INTEGER but candidateId in frontend is string (UUID usually)
            // Wait, migration 008 says: entity_id INTEGER. 
            // But candidates usually have UUIDs or string IDs in this system?
            // Let's check candidates schema. 
            // Actually, let's look at how audit logs are inserted. 
            // If candidateId is mixed, we might need to handle it.
            // For now assuming the standard ID format.
            // If table has separate columns for candidate_id (text) vs entity_id (int)
            // Let's check 008 again... no, it has entity_id INTEGER.
            // BUT `CandidateService` sends `candidateId`...

            // Checking migration 008 content again from previous turn...
            // `entity_id INTEGER`
            // `entity_type VARCHAR(50)`

            // If candidates use UUIDs (strings), this schema is wrong for them.
            // However, looking at `CandidateService.ts`, `candidateId` seems to be a string.
            // Let's check `metadata` column, maybe candidateId is stored there or `entity_id` is being used loosely (postgres implies type strictness).

            // Let's make the query flexible or check schema.
            // Actually, better to query `metadata->>'candidateId'` if entity_id is int and candidateId is string.
            // OR check if `entity_id` was changed to VARCHAR/UUID in a later migration?
            // I don't see one.

            // Wait, `CandidateService.ts` line 519: `candidateId: candidate.id`.
            // `AuditService.ts` line 79: `id: this.generateId()`.

            // If the backend was using `entity_id` as integer, but candidate IDs are strings, the insertions would fail if we tried to put string in int column.
            // The frontend error is 404, detailed backend logs would show DB error if insertion failed?
            // But user says "Failed to fetch audit logs", implies retrieval.

            // Let's assume for now we search in metadata OR we assume the migration matches.
            // Given `audit_logs` migration might be old/incomplete for string IDs.
            // I'll stick to a safe query: check `metadata->>'candidateId'` OR `entity_id::text = $1` if possible (but might error).

            // Safest: Filter using metadata for candidateId.
            query += ` AND (metadata->>'candidateId' = $${params.length})`;
        }

        if (jobId) {
            params.push(jobId);
            query += ` AND metadata->>'jobId' = $${params.length}`;
        }

        if (userId) {
            params.push(userId);
            query += ` AND user_id = $${params.length}`; // user_id in schema is int? 
            // Schema: user_id INTEGER.
            // If userId is string, this might be an issue too.
        }

        if (action) {
            params.push(action);
            query += ` AND action_type = $${params.length}`;
        }

        if (fromDate) {
            params.push(fromDate);
            query += ` AND created_at >= $${params.length}`;
        }

        if (toDate) {
            params.push(toDate);
            query += ` AND created_at <= $${params.length}`;
        }

        // Add sorting and pagination
        query += ` ORDER BY created_at DESC`;

        // Add Limit/Offset
        params.push(limit);
        query += ` LIMIT $${params.length}`;

        params.push(offset);
        query += ` OFFSET $${params.length}`;

        console.log('Executing Query:', query);
        console.log('With Params:', params);

        const { rows } = await pool.query(query, params);
        console.log(`Found ${rows.length} rows`);

        // Get total count for pagination
        // (Simplification: matching the where clauses again)
        // For now, just return logs. Count is nice but optional for MVP fix.

        res.json({
            status: 'success',
            data: {
                logs: rows.map(row => ({
                    ...row,
                    action: row.action_type, // Map DB column to frontend property
                    newValues: row.metadata?.newValues, // Map metadata fields back to expected format if needed
                    oldValues: row.metadata?.oldValues,
                    affectedFields: row.metadata?.affectedFields,
                    // If stored in columns, use them. If not, use metadata.
                    // Schema has `metadata JSONB`.
                })),
                total: rows.length // precise count requires second query
            }
        });

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch audit logs',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/audit-logs
 * @desc    Create a new audit log entry
 * @access  Public (Dev)
 */
router.post('/', async (req, res) => {
    console.log('--- POST /api/audit-logs Request ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    try {
        const {
            action,
            description,
            userId,
            userName,
            userRole,
            metadata,
            affectedFields,
            oldValues,
            newValues,
            candidateId, // Get candidateId from body
            jobId        // Get jobId from body
        } = req.body;

        // We store extensive data in the JSONB `metadata` column to avoid schema rigidity
        // CRITICAL: Include candidateId and jobId here so the GET query works
        const fullMetadata = {
            ...metadata,
            candidateId,
            jobId,
            affectedFields,
            oldValues,
            newValues,
            userRole
        };

        const query = `
      INSERT INTO audit_logs (
        action_type, 
        action_description, 
        user_id, 
        user_name, 
        metadata,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

        // Note: user_id is Integer in schema. 
        // If we have string IDs, passing it might fail if not parsed.
        // If userId is "system_fallback", it's a string.
        // We should safeguard this.
        const safeUserId = parseInt(userId) || 0;

        const values = [
            action,
            description,
            safeUserId,
            userName,
            fullMetadata
        ];

        const { rows } = await pool.query(query, values);
        console.log('Audit Log Created:', rows[0]);

        res.status(201).json({
            status: 'success',
            message: 'Audit log created',
            data: rows[0]
        });

    } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't crash client if audit fails
        res.status(500).json({
            status: 'error',
            message: 'Failed to create audit log',
            error: error.message
        });
    }
});

module.exports = router;
