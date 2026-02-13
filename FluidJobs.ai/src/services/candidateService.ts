import { Candidate, InterviewStage, StageTransition, CandidateStatus } from '../components/new-dashboard/types';
import { ValidationService, PermissionService, User } from './validationServiceNew';
import { AuditService, AuditAction, AuditLogEntry } from './auditService';

export interface StageUpdateRequest {
  candidateId: string;
  newStage: InterviewStage;
  reason?: string;
  userId: string;
  approvals?: any[];
}

export class CandidateService {
  private static baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  
  // Get authentication token
  private static getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

  // Get current user
  private static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // API call wrapper with error handling
  private static async apiCall<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Fetch candidates with permissions
  static async getCandidates(
    page: number = 1, 
    limit: number = 50,
    filters?: any
  ): Promise<{ candidates: Candidate[], total: number, permissions: any }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data && data.data.candidates) {
        // Transform database candidates to match our Candidate interface
        const transformedCandidates = data.data.candidates.map((dbCandidate: any) => {
          // Generate a random stage for demonstration (in production, this would come from job_applications or interview_stages table)
          const stages = [
            InterviewStage.APPLIED,
            InterviewStage.CV_SHORTLIST,
            InterviewStage.HM_REVIEW,
            InterviewStage.ASSIGNMENT,
            InterviewStage.L1_TECHNICAL,
            InterviewStage.L2_TECHNICAL,
            InterviewStage.HR_ROUND,
            InterviewStage.SELECTED
          ];
          const randomStage = stages[Math.floor(Math.random() * stages.length)];

          const candidate: Candidate = {
            // Required fields
            id: dbCandidate.candidate_id || `candidate_${Date.now()}_${Math.random()}`,
            jobId: 'default-job-1', // In production, this would come from job_applications table
            name: dbCandidate.full_name || 'Unknown Candidate',
            email: dbCandidate.email || '',
            phone: dbCandidate.phone_number || '',
            currentStage: randomStage,
            status: CandidateStatus.ACTIVE,
            hiringManagerId: 'default-hm-1', // In production, this would come from jobs table
            
            // Audit fields
            createdAt: new Date(dbCandidate.created_at || Date.now()),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1,
            
            // Profile fields
            jobTitle: this.getPositionFromExperience(dbCandidate.experience_years),
            department: 'Engineering', // Default department
            source: 'Database',
            appliedDate: new Date(dbCandidate.created_at || Date.now()).toLocaleDateString('en-GB'),
            lastUpdateDate: new Date().toLocaleDateString('en-GB'),
            experience: dbCandidate.experience_years ? `${dbCandidate.experience_years} Years` : '0 Years',
            location: dbCandidate.location || 'Not specified',

            // Status tracking
            isOnHold: false,
            isRestricted: false,

            // CV Tracking
            cvStatusRecruiter: Math.random() > 0.5 ? 'Shortlisted' : 'Pending',
            cvStatusHM: Math.random() > 0.7 ? 'Shortlisted' : 'Pending',

            // Interview Levels (initialize with default values)
            interviews: {
              l1: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
              l2: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
              l3: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
              l4: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
              hr: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' },
              management: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' }
            },

            // Finance/Offer
            ctc: {
              current: dbCandidate.current_ctc || 0,
              expected: dbCandidate.expected_ctc || 0,
              currency: 'INR'
            },
            noticePeriod: dbCandidate.notice_period || 'Immediate',

            // History and tracking
            stageHistory: [],
            comments: [],
            resumeUrl: dbCandidate.resume_link,

            // Additional fields from database
            gender: dbCandidate.gender,
            experienceYears: parseFloat(dbCandidate.experience_years) || 0,
            currentlyEmployed: dbCandidate.currently_employed,
            currentCompany: dbCandidate.current_company,
            maritalStatus: dbCandidate.marital_status,
            resumeScore: dbCandidate.resume_score || Math.floor(Math.random() * 40) + 60, // Random score for demo
            skills: [], // Would be populated from a separate skills table in production
            
            // Permissions (will be added below)
            permissions: {
              canView: true,
              canEdit: true,
              canMove: true,
              canRestrict: true,
              allowedStages: stages
            }
          };

          return candidate;
        });

        return {
          candidates: transformedCandidates,
          total: data.data.pagination?.totalCandidates || transformedCandidates.length,
          permissions: { canCreate: true, canBulkEdit: true }
        };
      } else {
        // Return empty result if no candidates found
        return {
          candidates: [],
          total: 0,
          permissions: { canCreate: true, canBulkEdit: true }
        };
      }
    } catch (error) {
      console.error('Error fetching candidates from API:', error);
      throw new Error(`Failed to fetch candidates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to determine job title from experience
  private static getPositionFromExperience(experienceYears: number | string): string {
    const years = parseFloat(experienceYears as string) || 0;
    
    if (years === 0) return 'Fresher';
    if (years < 2) return 'Junior Software Engineer';
    if (years < 4) return 'Software Engineer';
    if (years < 7) return 'Senior Software Engineer';
    if (years < 10) return 'Lead Software Engineer';
    return 'Principal Software Engineer';
  }

  // Update candidate stage with full validation, audit logging, and persistence
  static async updateCandidateStage(request: StageUpdateRequest): Promise<{
    success: boolean;
    candidate?: Candidate;
    error?: string;
    auditLog?: AuditLogEntry;
  }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // 1. Fetch current candidate data
      const candidate = await this.getCandidateById(request.candidateId);
      if (!candidate) {
        return { success: false, error: 'Candidate not found' };
      }

      // 2. Validate permissions
      const permissionCheck = PermissionService.canMoveStage(user, candidate, request.newStage);
      if (!permissionCheck.valid) {
        // Log permission denial for security monitoring
        await AuditService.logPermissionDenied(
          request.candidateId,
          `Move to ${request.newStage}`,
          user.id,
          user.name,
          user.role.toString(),
          permissionCheck.reason || 'Permission denied'
        );
        return { success: false, error: permissionCheck.reason };
      }

      // 3. Validate business rules
      const validationResult = ValidationService.validateStageTransition(
        candidate, 
        request.newStage, 
        user
      );
      if (!validationResult.valid) {
        // Log validation failure for debugging
        await AuditService.logValidationFailure(
          request.candidateId,
          `Move to ${request.newStage}`,
          user.id,
          user.name,
          user.role.toString(),
          [validationResult.reason || 'Validation failed']
        );
        return { success: false, error: validationResult.reason };
      }

      // 4. Create stage transition record
      const stageTransition: StageTransition = {
        id: this.generateId(),
        candidateId: request.candidateId,
        fromStage: candidate.currentStage,
        toStage: request.newStage,
        timestamp: new Date(),
        userId: user.id,
        userName: user.name,
        reason: request.reason,
        approvals: request.approvals
      };

      // 5. Update candidate in database
      const updateData = {
        currentStage: request.newStage,
        status: this.getStatusFromStage(request.newStage),
        updatedAt: new Date(),
        updatedBy: user.id,
        version: candidate.version + 1,
        stageTransition
      };

      const updatedCandidate = await this.apiCall<Candidate>(
        `/api/candidates/${request.candidateId}/stage`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData)
        }
      );

      // 6. Create comprehensive audit log
      const auditLog = await AuditService.logStageTransition(
        updatedCandidate,
        candidate.currentStage,
        request.newStage,
        user.id,
        user.name,
        user.role.toString(),
        request.reason
      );

      // 7. Send notifications if needed
      await this.sendStageUpdateNotifications(updatedCandidate, stageTransition);

      return {
        success: true,
        candidate: updatedCandidate,
        auditLog
      };

    } catch (error) {
      console.error('Stage update failed:', error);
      
      // Log system error for monitoring
      try {
        await AuditService.logValidationFailure(
          request.candidateId,
          `Move to ${request.newStage}`,
          user.id,
          user.name,
          user.role.toString(),
          [`System error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        );
      } catch (auditError) {
        console.error('Failed to log audit entry:', auditError);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Bulk stage update with transaction support and comprehensive audit logging
  static async bulkUpdateCandidateStages(
    candidateIds: string[],
    newStage: InterviewStage,
    reason?: string
  ): Promise<{
    success: boolean;
    results: Array<{ candidateId: string; success: boolean; error?: string }>;
    auditLogs: AuditLogEntry[];
  }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const results: Array<{ candidateId: string; success: boolean; error?: string }> = [];
    const auditLogs: AuditLogEntry[] = [];

    // Process each candidate
    for (const candidateId of candidateIds) {
      try {
        const result = await this.updateCandidateStage({
          candidateId,
          newStage,
          reason,
          userId: user.id
        });

        results.push({
          candidateId,
          success: result.success,
          error: result.error
        });

        if (result.auditLog) {
          auditLogs.push(result.auditLog);
        }

      } catch (error) {
        results.push({
          candidateId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    // Log bulk action summary
    try {
      await AuditService.logBulkAction(
        candidateIds,
        `Bulk move to ${newStage}`,
        user.id,
        user.name,
        user.role.toString(),
        results
      );
    } catch (auditError) {
      console.error('Failed to log bulk action audit:', auditError);
    }
    
    return {
      success: successCount > 0,
      results,
      auditLogs
    };
  }

  // Get candidate by ID with permissions
  static async getCandidateById(candidateId: string): Promise<Candidate | null> {
    try {
      const candidate = await this.apiCall<Candidate>(`/api/candidates/${candidateId}`);
      
      const user = this.getCurrentUser();
      if (user) {
        candidate.permissions = {
          canView: PermissionService.canViewCandidate(user, candidate).valid,
          canEdit: PermissionService.canEditCandidate(user, candidate).valid,
          canMove: PermissionService.canMoveStage(user, candidate, candidate.currentStage).valid,
          canRestrict: PermissionService.canRestrictCandidate(user, candidate).valid,
          allowedStages: this.getAllowedStages(user, candidate)
        };
      }

      return candidate;
    } catch (error) {
      console.error('Failed to fetch candidate:', error);
      return null;
    }
  }

  // Create or update candidate with comprehensive audit logging
  static async saveCandidate(candidateData: Partial<Candidate>): Promise<{
    success: boolean;
    candidate?: Candidate;
    error?: string;
  }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Validate candidate data
      const validationResult = ValidationService.validateCandidateForm(candidateData);
      if (!validationResult.valid) {
        // Log validation failure
        await AuditService.logValidationFailure(
          candidateData.id || 'new-candidate',
          candidateData.id ? 'Update candidate' : 'Create candidate',
          user.id,
          user.name,
          user.role.toString(),
          [validationResult.reason || 'Validation failed']
        );
        return { success: false, error: validationResult.reason };
      }

      // Add audit fields
      const now = new Date();
      const candidateWithAudit = {
        ...candidateData,
        updatedAt: now,
        updatedBy: user.id,
        version: (candidateData.version || 0) + 1
      };

      const isNewCandidate = !candidateData.id;
      if (isNewCandidate) {
        // Creating new candidate
        candidateWithAudit.createdAt = now;
        candidateWithAudit.createdBy = user.id;
        candidateWithAudit.currentStage = InterviewStage.APPLIED;
        candidateWithAudit.status = CandidateStatus.ACTIVE;
        candidateWithAudit.stageHistory = [];
      }

      const endpoint = candidateData.id 
        ? `/api/candidates/${candidateData.id}`
        : '/api/candidates';
      
      const method = candidateData.id ? 'PUT' : 'POST';

      const candidate = await this.apiCall<Candidate>(endpoint, {
        method,
        body: JSON.stringify(candidateWithAudit)
      });

      // Create comprehensive audit log
      const auditAction = isNewCandidate ? AuditAction.CANDIDATE_CREATED : AuditAction.CANDIDATE_UPDATED;
      await AuditService.createAuditLog({
        candidateId: candidate.id,
        candidateName: candidate.name,
        jobId: candidate.jobId,
        action: auditAction,
        userId: user.id,
        userName: user.name,
        userRole: user.role.toString(),
        description: isNewCandidate ? 'New candidate created' : 'Candidate information updated',
        metadata: {
          candidateSource: candidate.source,
          hiringManagerId: candidate.hiringManagerId,
          department: candidate.department
        },
        affectedFields: isNewCandidate ? ['all'] : Object.keys(candidateData),
        newValues: isNewCandidate ? candidate : candidateData
      });

      return { success: true, candidate };

    } catch (error) {
      console.error('Failed to save candidate:', error);
      
      // Log system error
      try {
        await AuditService.logValidationFailure(
          candidateData.id || 'new-candidate',
          candidateData.id ? 'Update candidate' : 'Create candidate',
          user.id,
          user.name,
          user.role.toString(),
          [`System error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        );
      } catch (auditError) {
        console.error('Failed to log audit entry:', auditError);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get stage history for candidate
  static async getStageHistory(candidateId: string): Promise<StageTransition[]> {
    try {
      const response = await this.apiCall<{ history: StageTransition[] }>(
        `/api/candidates/${candidateId}/history`
      );
      return response.history;
    } catch (error) {
      console.error('Failed to fetch stage history:', error);
      return [];
    }
  }

  // Get audit logs
  static async getAuditLogs(
    candidateId?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: AuditLogEntry[], total: number }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(candidateId && { candidateId })
      });

      const response = await this.apiCall<any>(`/api/audit-logs?${queryParams}`);
      return {
        logs: response.data.logs,
        total: response.data.total
      };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  // Helper methods
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static getStatusFromStage(stage: InterviewStage): CandidateStatus {
    switch (stage) {
      case InterviewStage.REJECTED:
        return CandidateStatus.REJECTED;
      case InterviewStage.DROPPED:
        return CandidateStatus.DROPPED;
      case InterviewStage.NO_SHOW:
        return CandidateStatus.NO_SHOW;
      case InterviewStage.ON_HOLD:
        return CandidateStatus.ON_HOLD;
      default:
        return CandidateStatus.ACTIVE;
    }
  }

  private static getAllowedStages(user: User, candidate: Candidate): InterviewStage[] {
    const allStages = Object.values(InterviewStage);
    
    return allStages.filter(stage => {
      const canMove = PermissionService.canMoveStage(user, candidate, stage);
      const isValid = ValidationService.validateStageTransition(candidate, stage, user);
      return canMove.valid && isValid.valid;
    });
  }

  private static async createAuditLog(logData: Omit<AuditLogEntry, 'id'>): Promise<AuditLogEntry> {
    try {
      const auditLog = {
        ...logData,
        id: this.generateId()
      };

      await this.apiCall('/api/audit-logs', {
        method: 'POST',
        body: JSON.stringify(auditLog)
      });

      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  private static async sendStageUpdateNotifications(
    candidate: Candidate, 
    transition: StageTransition
  ): Promise<void> {
    try {
      await this.apiCall('/api/notifications/stage-update', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
          fromStage: transition.fromStage,
          toStage: transition.toStage,
          hiringManagerId: candidate.hiringManagerId,
          timestamp: transition.timestamp
        })
      });
    } catch (error) {
      console.error('Failed to send notifications:', error);
      // Don't throw - notifications are not critical
    }
  }
}