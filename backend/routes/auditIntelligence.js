const express = require('express');
const router = express.Router();
const AuditIntelligenceService = require('../services/auditIntelligenceService');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/audit/stage-movement
 * @desc    Log a stage movement for a candidate
 * @access  Private
 */
router.post('/stage-movement', authenticateToken, async (req, res) => {
  try {
    const {
      candidateId,
      jobId,
      fromStage,
      toStage,
      stageIndex,
      feedback,
      score,
      reason
    } = req.body;

    // Get user info from token
    const movedByUserId = req.user.id;
    const movedByName = req.user.name || req.user.email;
    const movedByRole = req.user.role;

    const result = await AuditIntelligenceService.logStageMovement({
      candidateId,
      jobId,
      fromStage,
      toStage,
      stageIndex,
      movedByUserId,
      movedByName,
      movedByRole,
      feedback,
      score,
      reason
    });

    res.json({
      status: 'success',
      message: 'Stage movement logged successfully',
      data: result
    });
  } catch (error) {
    console.error('Error logging stage movement:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to log stage movement',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/audit/stage-history/:candidateId
 * @desc    Get stage history for a candidate
 * @access  Private
 */
router.get('/stage-history/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const history = await AuditIntelligenceService.getStageHistory(candidateId);
    
    res.json({
      status: 'success',
      data: {
        candidateId: parseInt(candidateId),
        history,
        totalMovements: history.length
      }
    });
  } catch (error) {
    console.error('Error fetching stage history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stage history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/audit/status/:candidateId
 * @desc    Get audit status for a candidate
 * @access  Private
 */
router.get('/status/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const auditStatus = await AuditIntelligenceService.getAuditStatus(candidateId);
    
    res.json({
      status: 'success',
      data: auditStatus
    });
  } catch (error) {
    console.error('Error fetching audit status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch audit status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/audit/status/bulk
 * @desc    Get audit status for multiple candidates
 * @access  Private
 */
router.post('/status/bulk', authenticateToken, async (req, res) => {
  try {
    const { candidateIds } = req.body;
    
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'candidateIds must be a non-empty array'
      });
    }
    
    const auditStatuses = await AuditIntelligenceService.getBulkAuditStatus(candidateIds);
    
    res.json({
      status: 'success',
      data: auditStatuses
    });
  } catch (error) {
    console.error('Error fetching bulk audit status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bulk audit status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/audit/critical/:jobId?
 * @desc    Get candidates with critical audit issues
 * @access  Private
 */
router.get('/critical/:jobId?', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const criticalCandidates = await AuditIntelligenceService.getCriticalAuditCandidates(
      jobId ? parseInt(jobId) : null
    );
    
    res.json({
      status: 'success',
      data: {
        candidates: criticalCandidates,
        count: criticalCandidates.length
      }
    });
  } catch (error) {
    console.error('Error fetching critical audit candidates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch critical audit candidates',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/audit/statistics/:jobId
 * @desc    Get audit statistics for a job
 * @access  Private
 */
router.get('/statistics/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const statistics = await AuditIntelligenceService.getAuditStatistics(parseInt(jobId));
    
    res.json({
      status: 'success',
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch audit statistics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/audit/feedback
 * @desc    Add feedback to a stage
 * @access  Private
 */
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const {
      candidateId,
      stage,
      feedback,
      score
    } = req.body;

    const submittedBy = req.user.name || req.user.email;

    const result = await AuditIntelligenceService.addFeedbackToStage({
      candidateId,
      stage,
      feedback,
      submittedBy,
      score
    });

    res.json({
      status: 'success',
      message: 'Feedback added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add feedback',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/audit/recompute/:candidateId
 * @desc    Recompute audit status for a candidate
 * @access  Private
 */
router.post('/recompute/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    await AuditIntelligenceService.computeAuditStatus(parseInt(candidateId));
    
    const auditStatus = await AuditIntelligenceService.getAuditStatus(parseInt(candidateId));
    
    res.json({
      status: 'success',
      message: 'Audit status recomputed successfully',
      data: auditStatus
    });
  } catch (error) {
    console.error('Error recomputing audit status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to recompute audit status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/audit/recompute-all/:jobId?
 * @desc    Recompute audit status for all candidates (maintenance)
 * @access  Private (Admin only)
 */
router.post('/recompute-all/:jobId?', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Admin access required'
      });
    }

    const { jobId } = req.params;
    
    const result = await AuditIntelligenceService.recomputeAllAuditStatuses(
      jobId ? parseInt(jobId) : null
    );
    
    res.json({
      status: 'success',
      message: 'Audit status recomputed for all candidates',
      data: result
    });
  } catch (error) {
    console.error('Error recomputing all audit statuses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to recompute all audit statuses',
      error: error.message
    });
  }
});

module.exports = router;
