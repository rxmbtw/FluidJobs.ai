export enum InterviewStage {
  APPLIED = 'Applied',
  SCREENING = 'Screening',
  CV_SHORTLIST = 'CV Shortlist',
  CV_SHORTLISTED = 'CV Shortlisted',
  HM_REVIEW = 'HM Review',
  ASSIGNMENT = 'Assignment',
  ASSIGNMENT_RESULT = 'Assignment Result',
  L1 = 'L1 Technical',
  L1_TECHNICAL = 'L1 Technical',
  L2 = 'L2 Technical',
  L2_TECHNICAL = 'L2 Technical',
  L3 = 'L3 Technical',
  L3_TECHNICAL = 'L3 Technical',
  L4 = 'L4 Technical',
  L4_TECHNICAL = 'L4 Technical',
  HR_ROUND = 'HR Round',
  MANAGEMENT_ROUND = 'Management Round',
  OFFER_EXTENDED = 'Offer Extended',
  SELECTED = 'Selected',
  JOINED = 'Joined',
  REJECTED = 'Rejected',
  DROPPED = 'Dropped',
  NO_SHOW = 'No Show',
  ON_HOLD = 'On Hold'
}

export enum CandidateStatus {
  ACTIVE = 'Active',
  ON_HOLD = 'On Hold',
  REJECTED = 'Rejected',
  DROPPED = 'Dropped',
  NO_SHOW = 'No Show'
}

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  HR = 'hr',
  HIRING_MANAGER = 'hiring_manager',
  RECRUITER = 'recruiter'
}

export interface StageTransition {
  id: string;
  candidateId: string;
  fromStage: string;
  toStage: string;
  timestamp: Date;
  userId: string;
  userName: string;
  reason?: string;
  approvals?: Approval[];
}

export interface Approval {
  userId: string;
  userName: string;
  decision: 'Approve' | 'Reject' | 'On Hold';
  feedback?: string;
  timestamp: Date;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  requiredApprovals?: string[];
}

export interface CandidatePermissions {
  canView: boolean;
  canEdit: boolean;
  canMove: boolean;
  canRestrict: boolean;
  allowedStages: string[];
}

export interface InterviewLevel {
  interviewer: string;
  date: string;
  feedbackDate: string;
  status: 'Pending' | 'Scheduled' | 'Cleared' | 'Rejected' | 'On Hold';
  score?: number;
}

export interface Candidate {
  // Required fields
  id: string;
  jobId: string; // Now required
  name: string;
  email: string;
  phone: string;
  currentStage: string;
  status: CandidateStatus;
  hiringManagerId: string; // Now required
  hiringManager?: string; // Display name for hiring manager

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;

  // Profile fields
  jobTitle: string;
  department: string;
  source: string;
  appliedDate: string;
  lastUpdateDate: string;
  experience: string;
  location: string;
  accountName?: string; // Added for Manage Candidates view

  // Status tracking
  isOnHold?: boolean;
  onHoldReason?: string;
  isRestricted?: boolean;
  restrictionReason?: string;

  // HM Review specific fields
  hmReview?: {
    reviewStatus: 'Pending Review' | 'Reviewed' | 'Changes Requested';
    hmDecision?: 'Approve' | 'Reject' | 'On Hold';
    hmFeedback?: string;
    reviewedBy?: string;
    reviewedOn?: string;
  };

  // CV Tracking
  cvStatusRecruiter: 'Pending' | 'Shortlisted' | 'Rejected';
  cvStatusHM: 'Pending' | 'Shortlisted' | 'Rejected';

  // Assignment
  assignmentDate?: string;
  assignmentStatus?: 'Pending' | 'Sent' | 'Submitted' | 'Evaluated';
  assignmentScore?: number;

  // Interview Levels
  interviews: {
    l1: InterviewLevel;
    l2: InterviewLevel;
    l3: InterviewLevel;
    l4: InterviewLevel;
    hr: InterviewLevel;
    management: InterviewLevel;
  };

  // Finance/Offer
  ctc: {
    current: number;
    expected: number;
    currency: string;
  };
  noticePeriod: string;
  offerReleaseDate?: string;
  offerAcceptDate?: string;
  offerDeclineDate?: string;

  // Joining
  joiningDate?: string;
  joiningAging?: number;

  // History and tracking
  stageHistory: StageTransition[];
  comments: string[];
  resumeUrl?: string;

  // Additional fields
  applicationDate?: string;
  gender?: string;
  position?: string;
  experienceYears?: number;
  currentlyEmployed?: string;
  currentCompany?: string;
  previousCompany?: string; // Newly added
  lastWorkingDay?: string; // Newly added
  currentSalary?: string;
  expectedSalary?: string;
  maritalStatus?: string;
  resumeScore?: number;
  skills?: string[];
  modeOfJob?: string; // Work mode in previous company
  resumePath?: string; // Path to submitted resume file
  linkedinUrl?: string; // Candidate's LinkedIn profile URL
  candidateJobStatuses?: { job_id: number, job_title: string, status: string }[];

  // Permissions (computed at runtime)
  permissions?: CandidatePermissions;
}

export interface JobStage {
  id: string; // Unique identifier for the stage
  name: string; // Display name
  type: 'standard' | 'custom';
  isMandatory: boolean; // Locked stages cannot be removed
  remarksRequired: boolean; // Toggle for mandatory remarks
  color?: string; // For visual distinction
  order: number; // For sorting
}

export interface Job {
  id: string;
  title: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Closed' | 'Draft';
  openings: number;
  filled: number;
  location: string;
  stages?: JobStage[]; // Added stages configuration
}

export interface Stats {
  totalCandidates: number;
  activeApplications: number;
  hiresThisMonth: number;
  rejectedApplications: number;
  avgTimeToHire: number;
}

export interface AuditFlag {
  type: 'moved_without_feedback' | 'low_score_advanced' | 'aging_exceeds_sla' |
  'no_hiring_manager' | 'skipped_stage' | 'assignment_without_result';
  severity: 'critical' | 'warning';
  message: string;
  details?: string;
}

export interface PipelineCandidate extends Candidate {
  stage: string;
  aging: number;
  interviewer: string | null;
  interviewNote: string | null;
}