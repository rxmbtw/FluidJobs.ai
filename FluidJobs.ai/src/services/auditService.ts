import { Candidate, InterviewStage } from '../components/new-dashboard/types';

export enum AuditAction {
  CANDIDATE_CREATED = 'CANDIDATE_CREATED',
  CANDIDATE_UPDATED = 'CANDIDATE_UPDATED',
  CANDIDATE_DELETED = 'CANDIDATE_DELETED',
  STAGE_UPDATED = 'STAGE_UPDATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ASSIGNMENT_SENT = 'ASSIGNMENT_SENT',
  ASSIGNMENT_SUBMITTED = 'ASSIGNMENT_SUBMITTED',
  ASSIGNMENT_EVALUATED = 'ASSIGNMENT_EVALUATED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  INTERVIEW_CANCELLED = 'INTERVIEW_CANCELLED',
  HM_REVIEW_SUBMITTED = 'HM_REVIEW_SUBMITTED',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  CANDIDATE_RESTRICTED = 'CANDIDATE_RESTRICTED',
  CANDIDATE_UNRESTRICTED = 'CANDIDATE_UNRESTRICTED',
  CANDIDATE_ON_HOLD = 'CANDIDATE_ON_HOLD',
  CANDIDATE_ACTIVATED = 'CANDIDATE_ACTIVATED',
  BULK_ACTION = 'BULK_ACTION',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}

export interface AuditLogEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: Date;

  // Change tracking
  fromStage?: string;
  toStage?: string;
  fromStatus?: string;
  toStatus?: string;

  // Context
  reason?: string;
  description?: string;
  metadata?: Record<string, any>;

  // System info
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  // Impact tracking
  affectedFields?: string[];
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface AuditQuery {
  candidateId?: string;
  jobId?: string;
  userId?: string;
  action?: AuditAction;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export class AuditService {
  private static baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // Create comprehensive audit log entry
  static async createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };

    try {
      await this.persistAuditLog(auditEntry);

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Audit Log:', auditEntry);
      }

      return auditEntry;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  // Log stage transition with detailed context
  static async logStageTransition(
    candidate: Candidate,
    fromStage: string,
    toStage: string,
    userId: string,
    userName: string,
    userRole: string,
    reason?: string
  ): Promise<AuditLogEntry> {
    return this.createAuditLog({
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobId: candidate.jobId,
      action: AuditAction.STAGE_UPDATED,
      userId,
      userName,
      userRole,
      fromStage,
      toStage,
      reason,
      description: `Candidate moved from ${fromStage} to ${toStage}`,
      metadata: {
        previousStageHistory: candidate.stageHistory?.slice(-5), // Last 5 transitions
        candidateSource: candidate.source,
        hiringManagerId: candidate.hiringManagerId
      },
      affectedFields: ['currentStage', 'lastUpdateDate', 'updatedBy'],
      oldValues: { currentStage: fromStage },
      newValues: { currentStage: toStage }
    });
  }

  // Log HM review submission
  static async logHMReview(
    candidate: Candidate,
    decision: 'Approve' | 'Reject' | 'On Hold',
    feedback: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<AuditLogEntry> {
    return this.createAuditLog({
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobId: candidate.jobId,
      action: AuditAction.HM_REVIEW_SUBMITTED,
      userId,
      userName,
      userRole,
      description: `HM Review completed with decision: ${decision}`,
      metadata: {
        decision,
        feedback: feedback.substring(0, 200), // Truncate for storage
        reviewDuration: this.calculateReviewDuration(candidate)
      },
      affectedFields: ['hmReview'],
      newValues: { hmDecision: decision, hmFeedback: feedback }
    });
  }

  // Log assignment actions
  static async logAssignmentAction(
    candidate: Candidate,
    action: 'SENT' | 'SUBMITTED' | 'EVALUATED',
    userId: string,
    userName: string,
    userRole: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    const actionMap = {
      'SENT': AuditAction.ASSIGNMENT_SENT,
      'SUBMITTED': AuditAction.ASSIGNMENT_SUBMITTED,
      'EVALUATED': AuditAction.ASSIGNMENT_EVALUATED
    };

    return this.createAuditLog({
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobId: candidate.jobId,
      action: actionMap[action],
      userId,
      userName,
      userRole,
      description: `Assignment ${action.toLowerCase()}`,
      metadata: {
        assignmentStatus: candidate.assignmentStatus,
        assignmentScore: candidate.assignmentScore,
        ...metadata
      }
    });
  }

  // Log interview scheduling/completion
  static async logInterviewAction(
    candidate: Candidate,
    interviewLevel: string,
    action: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED',
    userId: string,
    userName: string,
    userRole: string,
    metadata?: Record<string, any>
  ): Promise<AuditLogEntry> {
    const actionMap = {
      'SCHEDULED': AuditAction.INTERVIEW_SCHEDULED,
      'COMPLETED': AuditAction.INTERVIEW_COMPLETED,
      'CANCELLED': AuditAction.INTERVIEW_CANCELLED
    };

    return this.createAuditLog({
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobId: candidate.jobId,
      action: actionMap[action],
      userId,
      userName,
      userRole,
      description: `${interviewLevel} interview ${action.toLowerCase()}`,
      metadata: {
        interviewLevel,
        interviewer: metadata?.interviewer,
        interviewDate: metadata?.date,
        score: metadata?.score,
        ...metadata
      }
    });
  }

  // Log bulk actions
  static async logBulkAction(
    candidateIds: string[],
    action: string,
    userId: string,
    userName: string,
    userRole: string,
    results: Array<{ candidateId: string; success: boolean; error?: string }>
  ): Promise<AuditLogEntry> {
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return this.createAuditLog({
      candidateId: candidateIds[0], // Primary candidate for indexing
      candidateName: `Bulk Action (${candidateIds.length} candidates)`,
      jobId: 'multiple',
      action: AuditAction.BULK_ACTION,
      userId,
      userName,
      userRole,
      description: `Bulk ${action} performed on ${candidateIds.length} candidates`,
      metadata: {
        totalCandidates: candidateIds.length,
        successCount,
        failureCount,
        candidateIds,
        results: results.slice(0, 10), // Limit stored results
        action
      }
    });
  }

  // Log permission denials for security monitoring
  static async logPermissionDenied(
    candidateId: string,
    attemptedAction: string,
    userId: string,
    userName: string,
    userRole: string,
    reason: string
  ): Promise<AuditLogEntry> {
    return this.createAuditLog({
      candidateId,
      candidateName: 'Permission Check',
      jobId: 'security',
      action: AuditAction.PERMISSION_DENIED,
      userId,
      userName,
      userRole,
      description: `Permission denied for ${attemptedAction}`,
      reason,
      metadata: {
        attemptedAction,
        securityEvent: true
      }
    });
  }

  // Log validation failures for debugging
  static async logValidationFailure(
    candidateId: string,
    attemptedAction: string,
    userId: string,
    userName: string,
    userRole: string,
    validationErrors: string[]
  ): Promise<AuditLogEntry> {
    return this.createAuditLog({
      candidateId,
      candidateName: 'Validation Check',
      jobId: 'system',
      action: AuditAction.VALIDATION_FAILED,
      userId,
      userName,
      userRole,
      description: `Validation failed for ${attemptedAction}`,
      metadata: {
        attemptedAction,
        validationErrors,
        systemEvent: true
      }
    });
  }

  // Query audit logs with filtering and pagination
  static async queryAuditLogs(query: AuditQuery): Promise<{
    logs: AuditLogEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (query.candidateId) queryParams.set('candidateId', query.candidateId);
      if (query.jobId) queryParams.set('jobId', query.jobId);
      if (query.userId) queryParams.set('userId', query.userId);
      if (query.action) queryParams.set('action', query.action);
      if (query.fromDate) queryParams.set('fromDate', query.fromDate.toISOString());
      if (query.toDate) queryParams.set('toDate', query.toDate.toISOString());

      queryParams.set('page', (query.page || 1).toString());
      queryParams.set('limit', (query.limit || 50).toString());

      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${this.baseUrl}/api/audit-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        logs: data.logs,
        total: data.total,
        page: data.page,
        totalPages: Math.ceil(data.total / (query.limit || 50))
      };
    } catch (error) {
      console.error('Failed to query audit logs:', error);
      return { logs: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  // Get audit summary for dashboard
  static async getAuditSummary(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalActions: number;
    stageTransitions: number;
    hmReviews: number;
    interviews: number;
    securityEvents: number;
    topUsers: Array<{ userId: string; userName: string; actionCount: number }>;
    actionBreakdown: Array<{ action: AuditAction; count: number }>;
  }> {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${this.baseUrl}/api/audit-logs/summary?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get audit summary:', error);
      return {
        totalActions: 0,
        stageTransitions: 0,
        hmReviews: 0,
        interviews: 0,
        securityEvents: 0,
        topUsers: [],
        actionBreakdown: []
      };
    }
  }

  // Helper methods
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  private static calculateReviewDuration(candidate: Candidate): number {
    // Calculate time from HM Review stage entry to completion
    const hmReviewEntry = candidate.stageHistory?.find(
      h => h.toStage === InterviewStage.HM_REVIEW
    );

    if (hmReviewEntry) {
      return Date.now() - new Date(hmReviewEntry.timestamp).getTime();
    }

    return 0;
  }

  private static async persistAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${this.baseUrl}/api/audit-logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        throw new Error(`Failed to persist audit log: HTTP ${response.status}`);
      }
    } catch (error) {
      // In production, you might want to queue failed audit logs for retry
      console.error('Audit log persistence failed:', error);
      throw error;
    }
  }
}