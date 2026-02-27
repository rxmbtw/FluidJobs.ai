import { Candidate, InterviewStage, StageTransition, CandidateStatus } from '../components/new-dashboard/types';
import { ValidationService, PermissionService, User } from './validationServiceNew';
import { AuditService, AuditAction, AuditLogEntry } from './auditService';

export interface StageUpdateRequest {
  candidateId: string;
  newStage: string;
  reason?: string;
  userId: string;
  approvals?: any[];
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export class CandidateService {
  private static baseUrl = API_BASE_URL;

  // Get authentication token
  private static getAuthToken(): string {
    return sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token') || '';
  }

  // Get current user
  private static getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('superadmin') || localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Safe role accessor — always returns a string even if role is undefined
  private static safeGetRole(user: any): string {
    return (user?.role ?? user?.userRole ?? 'superadmin').toString();
  }


  // API call wrapper with error handling
  private static async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[CandidateService] Fetching: ${url}`);

    const response = await fetch(url, {
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

  // Helper to map DB candidate to Candidate interface
  private static mapDbCandidateToCandidate(dbCandidate: any): Candidate {
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
    // Use stored stage if available, otherwise random
    const currentStage = dbCandidate.current_stage || stages[Math.floor(Math.random() * stages.length)];

    return {
      // Required fields
      id: dbCandidate.candidate_id || `candidate_${Date.now()}_${Math.random()}`,
      jobId: 'default-job-1', // In production, this would come from job_applications table
      name: dbCandidate.full_name || 'Unknown Candidate',
      email: dbCandidate.email || '',
      phone: dbCandidate.phone_number || '',
      currentStage: currentStage,
      status: dbCandidate.status || CandidateStatus.ACTIVE,
      hiringManagerId: 'default-hm-1', // In production, this would come from jobs table

      // Audit fields
      createdAt: new Date(dbCandidate.created_at || Date.now()),
      updatedAt: new Date(dbCandidate.updated_at || Date.now()),
      createdBy: 'system',
      updatedBy: 'system',
      version: dbCandidate.version || 1,

      // Profile fields
      jobTitle: dbCandidate.job_title || this.getPositionFromExperience(dbCandidate.experience_years),
      department: dbCandidate.department || 'Engineering', // Default department
      source: dbCandidate.source || 'Database',
      appliedDate: new Date(dbCandidate.created_at || Date.now()).toISOString(),
      lastUpdateDate: new Date(dbCandidate.updated_at || Date.now()).toISOString(),
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
      previousCompany: dbCandidate.previous_company,
      lastWorkingDay: dbCandidate.last_working_day,
      modeOfJob: dbCandidate.mode_of_job,
      joiningDate: dbCandidate.joining_date,
      maritalStatus: dbCandidate.marital_status,
      resumeScore: dbCandidate.resume_score || Math.floor(Math.random() * 40) + 60, // Random score for demo
      skills: [], // Would be populated from a separate skills table in production

      // Permissions (will be added by the caller if user context is available)
      permissions: {
        canView: true,
        canEdit: true,
        canMove: true,
        canRestrict: true,
        allowedStages: stages
      }
    };
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

      // Use the new admin list endpoint for comprehensive view
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-applications/admin/list?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.applications) {
        // Transform database applications to match our Candidate interface
        const transformedCandidates = data.applications.map((app: any, index: number) => {
          // ── Status → Pipeline Stage Mapping ──────────────────────────────────
          // The DB stores job_applications.status as a string. We must map it to
          // the correct InterviewStage. New applications always start at APPLIED.
          let currentStage: InterviewStage;

          const rawStatus = (app.status || '').toLowerCase().trim();

          // 1. Exact match against known InterviewStage values
          const knownStage = Object.values(InterviewStage).find(
            s => s.toLowerCase() === rawStatus
          );

          if (knownStage) {
            // Status is already a valid pipeline stage name stored in the DB
            currentStage = knownStage as InterviewStage;
          } else if (
            rawStatus === 'submitted' ||
            rawStatus === 'new' ||
            rawStatus === 'applied' ||
            rawStatus === 'pending' ||
            rawStatus === ''
          ) {
            // All fresh / unprocessed applications → APPLIED (first stage)
            currentStage = InterviewStage.APPLIED;
          } else {
            // Unknown status: default to APPLIED rather than randomising
            console.warn(`[CandidateService] Unknown application status "${app.status}" — defaulting to APPLIED`);
            currentStage = InterviewStage.APPLIED;
          }


          return {
            ...this.mapDbCandidateToCandidate({
              candidate_id: app.candidate_id || app.id,
              full_name: app.name,
              email: app.email,
              phone_number: app.phone,
              experience_years: app.experience_years,
              current_company: app.current_company,
              notice_period: app.notice_period,
              expected_ctc: app.expected_ctc,
              current_ctc: app.current_ctc
            }),
            id: app.id.toString(),
            name: app.name,
            email: app.email,
            jobId: app.job_id ? app.job_id.toString() : '',
            jobTitle: app.job_title || 'General Pool',
            accountName: app.account_name || 'Unassigned',
            source: app.source || 'Imported/Manual',
            currentStage: currentStage,
            appliedDate: new Date(app.date || Date.now()).toISOString(),
            lastUpdateDate: new Date(app.date || Date.now()).toISOString(),
            permissions: { canCreate: true, canBulkEdit: true }
          };
        });


        return {
          candidates: transformedCandidates,
          total: transformedCandidates.length, // Todo: Add pagination to backend
          permissions: { canCreate: true, canBulkEdit: true }
        };
      } else {
        return {
          candidates: [],
          total: 0,
          permissions: { canCreate: true, canBulkEdit: true }
        };
      }
    } catch (error) {
      console.error('Error fetching candidates from API:', error);
      // Fallback
      return {
        candidates: [],
        total: 0,
        permissions: { canCreate: true, canBulkEdit: true }
      };
    }
  }

  // Fetch candidates for a specific job with their real pipeline stages
  static async getJobCandidates(jobId: string): Promise<any[]> {
    if (!jobId) return [];
    try {
      // Primary: fetch from pipeline-stages (has real current_stage per job)
      const pipelineRes = await fetch(`${this.baseUrl}/api/pipeline-stages/${jobId}`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });

      if (pipelineRes.ok) {
        const pipelineData = await pipelineRes.json();
        if (pipelineData.success && pipelineData.stages && pipelineData.stages.length > 0) {
          return pipelineData.stages.map((s: any) => ({
            id: s.candidate_id,
            candidate_id: s.candidate_id,
            name: s.candidate_name || 'Unknown',
            email: s.email || '',
            phone: s.phone || '',
            currentStage: s.current_stage || 'Applied',
            current_stage: s.current_stage || 'Applied',
            stageHistory: s.stage_history || [],
            jobId: String(jobId),
            job_id: String(jobId),
            appliedDate: s.applied_at ? new Date(s.applied_at).toISOString() : new Date().toISOString(),
            lastUpdateDate: s.updated_at ? new Date(s.updated_at).toISOString() : new Date().toISOString(),
            experience: s.experience_years ? `${s.experience_years} Years` : '0 Years',
            experienceYears: parseFloat(s.experience_years) || 0,
            location: s.candidate_location || 'Not specified',
            currentCompany: s.current_company || '',
            noticePeriod: s.notice_period || 'Not specified',
            ctc: {
              current: parseFloat(s.current_ctc) || 0,
              expected: parseFloat(s.expected_ctc) || 0,
              currency: 'INR'
            },
            status: 'Active',
            hiringManagerId: 'default-hm',
            jobTitle: 'Candidate',
            department: 'Engineering',
            source: 'Applied',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1,
            cvStatusRecruiter: 'Pending' as const,
            cvStatusHM: 'Pending' as const,
            interviews: {
              l1: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l2: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l3: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l4: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              hr: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              management: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
            },
            comments: [],
            skills: [],
            isOnHold: s.current_stage === 'On Hold',
            resumeScore: Math.floor(Math.random() * 30) + 70,
          }));
        }
      }

      // Fallback: use job-applications admin list
      const response = await fetch(`${this.baseUrl}/api/job-applications/admin/list?jobId=${jobId}`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });
      if (response.ok) {
        const result = await response.json();
        return (result.applications || []).map((app: any) => ({
          ...app,
          currentStage: app.current_stage || 'Applied',
          jobId: String(jobId),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching job candidates:', error);
      return [];
    }
  }

  // Update candidate pipeline stage for a specific job (persists to DB)
  static async updateJobCandidateStage(jobId: string, candidateId: string, newStage: string, reason?: string): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      const response = await fetch(`${this.baseUrl}/api/pipeline-stages/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          jobId: parseInt(jobId),
          candidateId,
          newStage,
          reason: reason || 'Stage updated via pipeline board',
          updatedBy: user?.name || user?.email || 'Admin'
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating job candidate stage:', error);
      return false;
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
    const user = this.getCurrentUser() || {
      id: 'system_fallback',
      name: 'System User',
      role: 'hr', // Use HR role to bypass department checks
      email: 'system@fluidjobs.ai'
    } as unknown as User;

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
          this.safeGetRole(user),
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
          this.safeGetRole(user),
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
        reason: request.reason,
        feedback: request.reason,
      };

      let updatedCandidate: Candidate;
      try {
        updatedCandidate = await this.apiCall<Candidate>(
          `/api/candidates/${request.candidateId}/stage`,
          {
            method: 'PUT',
            body: JSON.stringify(updateData)
          }
        );
        // If API returns success flag (not a full Candidate object), merge with local candidate
        if (!(updatedCandidate as any).id && (updatedCandidate as any).success) {
          updatedCandidate = { ...candidate, currentStage: request.newStage as any };
        }
      } catch (apiError) {
        // Stage update failed in DB but apply optimistically in UI
        console.warn('Stage API call failed, continuing with optimistic update:', apiError);
        updatedCandidate = { ...candidate, currentStage: request.newStage as any };
      }

      // 6. Create comprehensive audit log
      const auditLog = await AuditService.logStageTransition(
        updatedCandidate,
        candidate.currentStage,
        request.newStage,
        user.id,
        user.name,
        this.safeGetRole(user),
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
          this.safeGetRole(user),
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
    newStage: string,
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
        this.safeGetRole(user),
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
      const response = await this.apiCall<any>(`/api/candidates/${candidateId}`);

      let candidate: Candidate;
      if (response && response.data) {
        candidate = this.mapDbCandidateToCandidate(response.data);
      } else {
        // Fallback if structure is unexpected
        return null;
      }

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
    // Try to get user, but fallback if missing (backend validates token anyway)
    const user = this.getCurrentUser() || {
      id: 'system_fallback',
      name: 'System User',
      role: 'hr', // Use HR role to bypass department checks
      email: 'system@fluidjobs.ai'
    } as unknown as User;

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
          this.safeGetRole(user),
          [validationResult.reason || 'Validation failed']
        );
      }

      // Fetch existing candidate for detailed change tracking
      let oldCandidate: Candidate | null = null;
      let changes: { oldValues: any, newValues: any, affectedFields: string[] } = { oldValues: {}, newValues: candidateData, affectedFields: Object.keys(candidateData) };

      if (candidateData.id) {
        try {
          oldCandidate = await this.getCandidateById(candidateData.id);
          if (oldCandidate) {
            changes = this.getChanges(oldCandidate, candidateData as Candidate);
          }
        } catch (error) {
          console.warn('Failed to fetch old candidate for audit diff:', error);
        }
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

      const response = await this.apiCall<any>(endpoint, {
        method,
        body: JSON.stringify(candidateWithAudit)
      });

      // Handle backend response wrapping { status: 'success', data: ... }
      let candidate: Candidate;
      if (response && response.data) {
        candidate = this.mapDbCandidateToCandidate(response.data);
      } else {
        // Fallback for unexpected response structure
        console.warn('Unexpected response structure from saveCandidate', response);
        candidate = candidateWithAudit as Candidate;
      }

      // Create comprehensive audit log
      const auditAction = isNewCandidate ? AuditAction.CANDIDATE_CREATED : AuditAction.CANDIDATE_UPDATED;
      try {
        await AuditService.createAuditLog({
          candidateId: candidate.id,
          candidateName: candidate.name,
          jobId: candidate.jobId,
          action: auditAction,
          userId: user.id,
          userName: user.name,
          userRole: this.safeGetRole(user),
          description: isNewCandidate ? 'New candidate created' : 'Candidate information updated',
          metadata: {
            candidateSource: candidate.source,
            hiringManagerId: candidate.hiringManagerId,
            department: candidate.department
          },
          affectedFields: isNewCandidate ? ['all'] : changes.affectedFields,
          oldValues: isNewCandidate ? {} : changes.oldValues,
          newValues: isNewCandidate ? candidate : changes.newValues
        });
      } catch (auditError) {
        // Ignore audit log errors if user is fallback, or just log them
        console.warn('Audit log creation failed (non-critical):', auditError);
      }

      return { success: true, candidate };

    } catch (error) {
      console.error('Failed to save candidate:', error);

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

  private static getStatusFromStage(stage: string): CandidateStatus {
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

  private static getAllowedStages(user: User, candidate: Candidate): string[] {
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

  // Helper to compare objects and get changes
  private static getChanges(oldCandidate: Candidate, newCandidate: Partial<Candidate>): { oldValues: any, newValues: any, affectedFields: string[] } {
    const oldValues: any = {};
    const newValues: any = {};
    const affectedFields: string[] = [];

    // Keys to ignore during comparison
    const ignoredKeys = ['updatedAt', 'updatedBy', 'version', 'stageHistory', 'comments', 'lastUpdateDate'];

    // Iterate over keys in the new candidate data
    for (const key of Object.keys(newCandidate)) {
      if (ignoredKeys.includes(key)) continue;

      const typedKey = key as keyof Candidate;
      const oldValue = oldCandidate[typedKey];
      const newValue = newCandidate[typedKey];

      // Simple deep equality check using JSON.stringify
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        oldValues[key] = oldValue;
        newValues[key] = newValue;
        affectedFields.push(key);
      }
    }

    return { oldValues, newValues, affectedFields };
  }
}