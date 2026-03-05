const pool = require('../config/database');

class AuditIntelligenceService {
  /**
   * Log a stage movement for a candidate
   */
  static async logStageMovement({
    candidateId,
    jobId,
    fromStage,
    toStage,
    stageIndex,
    movedByUserId,
    movedByName,
    movedByRole,
    feedback = null,
    score = null,
    reason = null
  }) {
    try {
      const result = await pool.query(
        `SELECT log_stage_movement($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) as history_id`,
        [
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
        ]
      );
      
      // Recompute audit status after movement
      await this.computeAuditStatus(candidateId);
      
      return {
        success: true,
        historyId: result.rows[0].history_id
      };
    } catch (error) {
      console.error('Error logging stage movement:', error);
      throw error;
    }
  }

  /**
   * Get stage history for a candidate
   */
  static async getStageHistory(candidateId) {
    try {
      const result = await pool.query(
        `SELECT 
          history_id,
          candidate_id,
          job_id,
          from_stage,
          to_stage,
          stage_index,
          moved_by_user_id,
          moved_by_name,
          moved_by_role,
          moved_at,
          feedback,
          feedback_submitted_at,
          feedback_submitted_by,
          score,
          score_threshold,
          reason,
          notes,
          duration_in_previous_stage_days,
          is_skipped_stage,
          is_backward_movement,
          is_automated,
          created_at
        FROM candidate_stage_history
        WHERE candidate_id = $1
        ORDER BY moved_at DESC`,
        [candidateId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching stage history:', error);
      throw error;
    }
  }

  /**
   * Compute audit status for a candidate
   */
  static async computeAuditStatus(candidateId) {
    try {
      await pool.query(
        `SELECT compute_audit_status($1)`,
        [candidateId]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error computing audit status:', error);
      throw error;
    }
  }

  /**
   * Get audit status for a candidate
   */
  static async getAuditStatus(candidateId) {
    try {
      const result = await pool.query(
        `SELECT 
          audit_id,
          candidate_id,
          job_id,
          feedback_missing,
          feedback_missing_stages,
          feedback_missing_count,
          score_threshold_violation,
          score_violation_stages,
          score_violation_count,
          aging_exceeded,
          aging_days,
          aging_sla_days,
          skipped_stages,
          skipped_stage_list,
          skipped_stage_count,
          owner_missing,
          assignment_gap_days,
          backward_movement,
          backward_movement_count,
          overall_audit_status,
          critical_flags_count,
          warning_flags_count,
          audit_reasons,
          current_stage,
          current_stage_since,
          total_stages_completed,
          last_audit_check,
          created_at,
          updated_at
        FROM candidate_audit_status
        WHERE candidate_id = $1`,
        [candidateId]
      );
      
      if (result.rows.length === 0) {
        // Initialize if not exists
        await this.computeAuditStatus(candidateId);
        return await this.getAuditStatus(candidateId);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching audit status:', error);
      throw error;
    }
  }

  /**
   * Get audit status for multiple candidates
   */
  static async getBulkAuditStatus(candidateIds) {
    try {
      const result = await pool.query(
        `SELECT 
          audit_id,
          candidate_id,
          job_id,
          feedback_missing,
          feedback_missing_count,
          score_threshold_violation,
          score_violation_count,
          aging_exceeded,
          aging_days,
          skipped_stages,
          skipped_stage_count,
          owner_missing,
          backward_movement,
          backward_movement_count,
          overall_audit_status,
          critical_flags_count,
          warning_flags_count,
          audit_reasons,
          current_stage,
          aging_sla_days
        FROM candidate_audit_status
        WHERE candidate_id = ANY($1::int[])`,
        [candidateIds]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching bulk audit status:', error);
      throw error;
    }
  }

  /**
   * Get candidates with critical audit issues
   */
  static async getCriticalAuditCandidates(jobId = null) {
    try {
      let query = `
        SELECT 
          cas.*,
          c.full_name,
          c.email,
          c.current_stage
        FROM candidate_audit_status cas
        JOIN candidates c ON cas.candidate_id = c.candidate_id
        WHERE cas.overall_audit_status = 'critical'
      `;
      
      const params = [];
      if (jobId) {
        query += ` AND cas.job_id = $1`;
        params.push(jobId);
      }
      
      query += ` ORDER BY cas.critical_flags_count DESC, cas.updated_at DESC`;
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching critical audit candidates:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics for a job
   */
  static async getAuditStatistics(jobId) {
    try {
      const result = await pool.query(
        `SELECT 
          COUNT(*) as total_candidates,
          COUNT(*) FILTER (WHERE overall_audit_status = 'healthy') as healthy_count,
          COUNT(*) FILTER (WHERE overall_audit_status = 'warning') as warning_count,
          COUNT(*) FILTER (WHERE overall_audit_status = 'critical') as critical_count,
          COUNT(*) FILTER (WHERE feedback_missing = true) as feedback_missing_count,
          COUNT(*) FILTER (WHERE aging_exceeded = true) as aging_exceeded_count,
          COUNT(*) FILTER (WHERE owner_missing = true) as owner_missing_count,
          COUNT(*) FILTER (WHERE skipped_stages = true) as skipped_stages_count,
          AVG(aging_days) as avg_aging_days,
          MAX(aging_days) as max_aging_days
        FROM candidate_audit_status
        WHERE job_id = $1`,
        [jobId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      throw error;
    }
  }

  /**
   * Add feedback to a stage history entry
   */
  static async addFeedbackToStage({
    candidateId,
    stage,
    feedback,
    submittedBy,
    score = null
  }) {
    try {
      const result = await pool.query(
        `UPDATE candidate_stage_history
        SET 
          feedback = $1,
          feedback_submitted_at = CURRENT_TIMESTAMP,
          feedback_submitted_by = $2,
          score = $3
        WHERE candidate_id = $4
          AND to_stage = $5
          AND feedback IS NULL
        ORDER BY moved_at DESC
        LIMIT 1
        RETURNING history_id`,
        [feedback, submittedBy, score, candidateId, stage]
      );
      
      if (result.rows.length > 0) {
        // Recompute audit status
        await this.computeAuditStatus(candidateId);
        
        return {
          success: true,
          historyId: result.rows[0].history_id
        };
      }
      
      return { success: false, message: 'No matching stage history found' };
    } catch (error) {
      console.error('Error adding feedback to stage:', error);
      throw error;
    }
  }

  /**
   * Recompute audit status for all candidates (maintenance task)
   */
  static async recomputeAllAuditStatuses(jobId = null) {
    try {
      let query = `SELECT candidate_id FROM candidates`;
      const params = [];
      
      if (jobId) {
        query += ` WHERE job_id = $1`;
        params.push(jobId);
      }
      
      const result = await pool.query(query, params);
      const candidateIds = result.rows.map(row => row.candidate_id);
      
      console.log(`Recomputing audit status for ${candidateIds.length} candidates...`);
      
      for (const candidateId of candidateIds) {
        await this.computeAuditStatus(candidateId);
      }
      
      console.log('✅ Audit status recomputation complete');
      
      return {
        success: true,
        processedCount: candidateIds.length
      };
    } catch (error) {
      console.error('Error recomputing all audit statuses:', error);
      throw error;
    }
  }
}

module.exports = AuditIntelligenceService;
