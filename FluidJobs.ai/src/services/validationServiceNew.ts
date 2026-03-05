import { Candidate, ValidationResult, UserRole } from '../components/new-dashboard/types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  permissions?: string[];
}

export interface PermissionResult {
  valid: boolean;
  reason?: string;
}

export class ValidationService {
  static validateStageTransition(
    candidate: Candidate & { stage?: string },
    newStage: string,
    _user: User
  ): ValidationResult {
    // PipelineBoard uses `stage`, Candidate interface uses `currentStage`
    const currentStage = (candidate as any).stage || candidate.currentStage;
    if (currentStage && currentStage === newStage) {
      return {
        valid: false,
        reason: 'Candidate is already in this stage'
      };
    }

    return { valid: true };
  }

  static validateCandidateForm(candidateData: Partial<Candidate>): ValidationResult {
    const errors: string[] = [];

    if (!candidateData.name?.trim()) {
      errors.push('Candidate name is required');
    }

    if (!candidateData.email?.trim()) {
      errors.push('Email is required');
    }

    if (!candidateData.phone?.trim()) {
      errors.push('Phone number is required');
    }

    return {
      valid: errors.length === 0,
      reason: errors.length > 0 ? errors.join(', ') : undefined
    };
  }

  static validateBulkOperation(candidateIds: string[], _operation: string, _user: User): ValidationResult {
    if (candidateIds.length === 0) {
      return { valid: false, reason: 'No candidates selected for bulk operation' };
    }

    return { valid: true };
  }
}

export class PermissionService {
  static canViewCandidate(user: User, candidate: Candidate): PermissionResult {
    if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) {
      return { valid: true };
    }

    if (user.role === UserRole.HR) {
      return { valid: true };
    }

    if (user.role === UserRole.HIRING_MANAGER && candidate.hiringManagerId === user.id) {
      return { valid: true };
    }

    if (user.role === UserRole.RECRUITER && candidate.department === user.department) {
      return { valid: true };
    }

    return { valid: false, reason: 'Insufficient permissions to view this candidate' };
  }

  static canEditCandidate(user: User, candidate: Candidate): PermissionResult {
    if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) {
      return { valid: true };
    }

    if (user.role === UserRole.HR) {
      return { valid: true };
    }

    if (user.role === UserRole.HIRING_MANAGER && candidate.hiringManagerId === user.id) {
      return { valid: true };
    }

    if (user.role === UserRole.RECRUITER && candidate.department === user.department) {
      return { valid: true };
    }

    return { valid: false, reason: 'Insufficient permissions to edit this candidate' };
  }

  static canMoveStage(user: User, candidate: Candidate, newStage: string): PermissionResult {
    const editCheck = this.canEditCandidate(user, candidate);
    if (!editCheck.valid) {
      return editCheck;
    }

    return { valid: true };
  }

  static canRestrictCandidate(user: User, _candidate: Candidate): PermissionResult {
    if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN || user.role === UserRole.HR) {
      return { valid: true };
    }

    return { valid: false, reason: 'Only Admin, Superadmin, or HR can restrict candidates' };
  }

  static canPerformBulkOperations(user: User): PermissionResult {
    if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN || user.role === UserRole.HR) {
      return { valid: true };
    }

    return { valid: false, reason: 'Bulk operations require Admin, Superadmin, or HR permissions' };
  }
}