import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MoreHorizontal,
  Download,
  ExternalLink,
  Users,
  Minus,
  Eye,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Briefcase,
  Check,
  X,
  CheckSquare,
  User as LucideUser,
  LayoutGrid,
  List
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useDashboardHeader } from './NewDashboardContainer';
import {
  TimeCircle,
  Danger,
  User as IconlyUser,
  InfoSquare,
  Show,
  Paper,
  Calendar as IconlyCalendar,
  TickSquare,
  Graph,
  Document,
  MoreSquare,
  Filter,
  Edit,
  Setting,
  Star,
  Login,
  CloseSquare,
  TwoUsers as IconlyUsers
} from 'react-iconly';
import { PipelineCandidate, InterviewStage, CandidateStatus, JobStage } from './types';
import { STATUS_COLORS } from './constants';
import { CandidateService } from '../../services/candidateService';
import { ValidationService } from '../../services';
import { useAuth } from '../../contexts/AuthProvider';
import { useDebounce } from './useDebounce';
import { usePipelineOptimizations } from './usePipelineOptimizations';
import OptimizedCandidateRow from './OptimizedCandidateRow';
import { StageJumpModal, FeedbackReviewModal, StatusActionModal } from './StageJumpModals';
import { HMReviewModal } from './HMReviewModal';
import { CandidateCardSkipBadge, CandidateCardActions } from './CandidateCardComponents';

// Production pipeline stages - unified with InterviewStage enum
const BOARD_STAGES = [
  InterviewStage.APPLIED,
  InterviewStage.SCREENING,           // Added: Screening stage
  InterviewStage.CV_SHORTLIST,
  InterviewStage.HM_REVIEW,
  InterviewStage.ASSIGNMENT,          // Single assignment column (no separate result)
  InterviewStage.L1_TECHNICAL,
  InterviewStage.L2_TECHNICAL,
  InterviewStage.L3_TECHNICAL,
  InterviewStage.L4_TECHNICAL,
  InterviewStage.HR_ROUND,
  InterviewStage.MANAGEMENT_ROUND,
  InterviewStage.SELECTED,
  InterviewStage.JOINED,
  InterviewStage.REJECTED,            // Terminal outcome
  InterviewStage.DROPPED,             // Terminal outcome
  InterviewStage.NO_SHOW,             // Terminal outcome
  InterviewStage.ON_HOLD              // On hold status
];

// Terminal outcomes (now included in board for visibility)
const TERMINAL_OUTCOMES: string[] = [
  InterviewStage.REJECTED,
  InterviewStage.DROPPED,
  InterviewStage.NO_SHOW
];

// Combined for filtering/display purposes
const ALL_STAGES = BOARD_STAGES;

// Helper to get icon for stage
const getStageIcon = (stage: string) => {
  switch (stage) {
    case InterviewStage.APPLIED: return <Document set="bold" primaryColor="currentColor" />;
    case InterviewStage.SCREENING: return <Filter set="bold" primaryColor="currentColor" />;
    case InterviewStage.CV_SHORTLIST: return <Paper set="bold" primaryColor="currentColor" />;
    case InterviewStage.HM_REVIEW: return <IconlyUser set="bold" primaryColor="currentColor" />;
    case InterviewStage.ASSIGNMENT: return <Edit set="bold" primaryColor="currentColor" />;
    case InterviewStage.ASSIGNMENT_RESULT: return <Graph set="bold" primaryColor="currentColor" />;
    case InterviewStage.L1_TECHNICAL:
    case InterviewStage.L2_TECHNICAL:
    case InterviewStage.L3_TECHNICAL:
    case InterviewStage.L4_TECHNICAL: return <Setting set="bold" primaryColor="currentColor" />;
    case InterviewStage.HR_ROUND: return <IconlyUsers set="bold" primaryColor="currentColor" />;
    case InterviewStage.MANAGEMENT_ROUND: return <Star set="bold" primaryColor="currentColor" />;
    case InterviewStage.SELECTED: return <TickSquare set="bold" primaryColor="currentColor" />;
    case InterviewStage.JOINED: return <Login set="bold" primaryColor="currentColor" />;
    case InterviewStage.REJECTED:
    case InterviewStage.DROPPED:
    case InterviewStage.NO_SHOW: return <Danger set="bold" primaryColor="currentColor" />;
    case InterviewStage.ON_HOLD: return <TimeCircle set="bold" primaryColor="currentColor" />;
    default: return <InfoSquare set="bold" primaryColor="currentColor" />;
  }
};

interface PipelineBoardProps {
  onViewProfile: (id: string) => void;
  candidates: PipelineCandidate[];
  users?: any[];
  stages?: JobStage[]; // JobStage[]
  // Job-level team assignments from Job Settings
  teamAssignments?: Record<string, string[]>; // { userId: responsibilities[] }
  primaryRecruiterId?: number | null;
}

const PipelineBoard: React.FC<PipelineBoardProps> = ({ onViewProfile, candidates: propCandidates, users = [], stages: jobStages, teamAssignments = {}, primaryRecruiterId = null }) => {
  const { setHeaderActions } = useDashboardHeader();
  // Use candidates from props instead of hardcoded ones
  const [candidates, setCandidates] = useState<PipelineCandidate[]>(propCandidates || []);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  // Fallback: Try to get user from authService if hook returns null
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeStages, setActiveStages] = useState<string[]>(BOARD_STAGES);

  // Get authenticated user
  const { user: authUser } = useAuth();

  // Normalize legacy stage names → canonical InterviewStage enum values
  const STAGE_ALIAS: Record<string, string> = {
    'Technical Assessment': InterviewStage.ASSIGNMENT,
    'Assignment Result': InterviewStage.ASSIGNMENT,
    'Phone Screening': InterviewStage.SCREENING,
    'Application Review': InterviewStage.CV_SHORTLIST,
    'L1 Technical Interview': InterviewStage.L1_TECHNICAL,
    'L2 Technical Interview': InterviewStage.L2_TECHNICAL,
    'L3 Technical Interview': InterviewStage.L3_TECHNICAL,
    'L4 Technical Interview': InterviewStage.L4_TECHNICAL,
    'System Design Round': InterviewStage.ASSIGNMENT,
    'Cultural Fit Interview': InterviewStage.MANAGEMENT_ROUND,
    'Final Interview': InterviewStage.MANAGEMENT_ROUND,
  };

  useEffect(() => {
    if (jobStages && jobStages.length > 0) {
      const middleStages = jobStages.map(s => STAGE_ALIAS[s.name] || s.name);

      const fullStages = [
        InterviewStage.APPLIED,
        ...middleStages,
        InterviewStage.SELECTED,
        InterviewStage.JOINED,
        InterviewStage.REJECTED,
        InterviewStage.DROPPED,
        InterviewStage.ON_HOLD
      ];

      const uniqueStages = Array.from(new Set(fullStages)).filter(s => s !== InterviewStage.ASSIGNMENT_RESULT);
      setActiveStages(uniqueStages);
    } else {
      // If no job stages, use the standard ones but ensure terminal outcomes are present
      setActiveStages(BOARD_STAGES);
    }
  }, [jobStages]);

  useEffect(() => {
    console.log('PipelineBoard - useEffect triggered, authUser:', authUser);

    if (authUser) {
      console.log('PipelineBoard - User from useAuth:', authUser);
      setCurrentUser(authUser);
    } else {
      console.log('PipelineBoard - authUser is null, trying authService fallback...');

      // Fallback to authService
      try {
        const { authService } = require('../../services/authService');
        const user = authService.getCurrentUser();
        console.log('PipelineBoard - User from authService fallback:', user);

        if (user) {
          setCurrentUser(user);
        } else {
          // Last resort: check sessionStorage directly
          console.log('PipelineBoard - authService returned null, checking sessionStorage...');
          const sessionUser = sessionStorage.getItem('fluidjobs_user');
          console.log('PipelineBoard - sessionStorage fluidjobs_user:', sessionUser);

          if (sessionUser) {
            const parsedUser = JSON.parse(sessionUser);
            console.log('PipelineBoard - Parsed user from sessionStorage:', parsedUser);
            setCurrentUser(parsedUser);
          } else {
            // Check localStorage too (superadmin might be stored there)
            const localUser = localStorage.getItem('superadmin') || localStorage.getItem('currentUser');
            if (localUser) {
              try {
                const parsedLocalUser = JSON.parse(localUser);
                console.log('PipelineBoard - Parsed user from localStorage:', parsedLocalUser);
                setCurrentUser(parsedLocalUser);
              } catch (e) {
                console.error('PipelineBoard - Error parsing localStorage user:', e);
              }
            } else {
              // Create a basic user object so the board can still render
              console.warn('PipelineBoard - No user found, using guest mode');
              setCurrentUser({ id: 'guest', name: 'User', email: '', role: 'Admin' } as any);
            }
          }
        }
      } catch (error) {
        console.error('PipelineBoard - Error retrieving user:', error);
      }
    }
  }, [authUser]);

  useEffect(() => {
    setHeaderActions(
      <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
        <button
          onClick={() => setViewMode('board')}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'board'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Board
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <List className="w-4 h-4 mr-2" />
          List
        </button>
      </div>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions, viewMode]);



  // Selection state
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [stageSelections, setStageSelections] = useState<{ [key: string]: boolean }>({});

  // Modal states

  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [bulkMoveFeedback, setBulkMoveFeedback] = useState('');

  const [showHMReviewModal, setShowHMReviewModal] = useState(false);
  const [showHMFeedbackModal, setShowHMFeedbackModal] = useState(false);
  const [selectedCandidateForHMReview, setSelectedCandidateForHMReview] = useState<PipelineCandidate | null>(null);
  const [selectedCandidateForFeedback, setSelectedCandidateForFeedback] = useState<PipelineCandidate | null>(null);
  const [hmDecision, setHmDecision] = useState<'Approve' | 'Reject' | 'On Hold'>('Approve');
  const [hmFeedback, setHmFeedback] = useState('');

  // Stage jump modal states
  const [showStageJumpModal, setShowStageJumpModal] = useState(false);
  const [selectedCandidatesForJump, setSelectedCandidatesForJump] = useState<PipelineCandidate[]>([]);
  const [jumpDirection, setJumpDirection] = useState<'forward' | 'backward'>('forward');
  const [targetJumpStage, setTargetJumpStage] = useState<string | null>(null);
  const [jumpFeedback, setJumpFeedback] = useState('');
  const [jumpAssignmentScore, setJumpAssignmentScore] = useState('');

  // Feedback review modal states
  // Feedback review modal states
  const [showFeedbackReviewModal, setShowFeedbackReviewModal] = useState(false);
  const [selectedFeedbackStage, setSelectedFeedbackStage] = useState<string | null>(null);
  const [selectedFeedbackCandidate, setSelectedFeedbackCandidate] = useState<PipelineCandidate | null>(null);

  // Status Action Modal State
  const [showStatusActionModal, setShowStatusActionModal] = useState(false);
  const [selectedStatusCandidate, setSelectedStatusCandidate] = useState<PipelineCandidate | null>(null);
  const [selectedStatusAction, setSelectedStatusAction] = useState<'Reject' | 'Drop' | 'Hold' | null>(null);
  const [statusReason, setStatusReason] = useState('');

  // Rejection Cooldown State
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [cooldownCandidate, setCooldownCandidate] = useState<PipelineCandidate | null>(null);
  const [daysSinceRejection, setDaysSinceRejection] = useState<number>(0);

  // Multi-Interviewer Picker state
  const [showInterviewerPicker, setShowInterviewerPicker] = useState(false);
  const [interviewerPickerStage, setInterviewerPickerStage] = useState<string | null>(null);
  const [interviewerPickerCandidate, setInterviewerPickerCandidate] = useState<PipelineCandidate | null>(null);
  const [selectedInterviewerUserId, setSelectedInterviewerUserId] = useState<string | null>(null);
  const [pickerDirection, setPickerDirection] = useState<'forward' | 'backward'>('forward');

  // Configuration: Define which stages allow skipping
  const SKIPPABLE_STAGES: string[] = [
    InterviewStage.ASSIGNMENT,
    InterviewStage.L1_TECHNICAL,
    InterviewStage.L2_TECHNICAL,
    InterviewStage.L3_TECHNICAL,
    InterviewStage.L4_TECHNICAL,
  ];

  // Helper function to check if a stage is skippable
  const isStageSkippable = (stage: string): boolean => {
    return SKIPPABLE_STAGES.includes(stage);
  };

  // Helper function to convert auth user to validation service user format
  const toValidationUser = (user: any) => {
    if (!user) return null;

    // Map role string to UserRole enum
    const roleMap: { [key: string]: string } = {
      'Admin': 'admin',
      'HR': 'hr',
      'Sales': 'recruiter',
      'Candidate': 'candidate',
      'Client': 'client'
    };

    return {
      ...user,
      role: roleMap[user.role] || user.role.toLowerCase()
    };
  };

  // Get random user from database users
  const getRandomUser = (roleFilter?: string[]) => {
    if (users.length === 0) return 'Not Assigned';

    let filteredUsers = users;
    if (roleFilter && roleFilter.length > 0) {
      filteredUsers = users.filter(user => roleFilter.includes(user.role));
    }

    if (filteredUsers.length === 0) return users[0]?.full_name || 'Not Assigned';
    return filteredUsers[Math.floor(Math.random() * filteredUsers.length)]?.full_name || 'Not Assigned';
  };


  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [openStageMenu, setOpenStageMenu] = useState<string | null>(null);

  // Audit Intelligence Mode states
  const [selectedCandidateTimeline, setSelectedCandidateTimeline] = useState<PipelineCandidate | null>(null);
  const [showTimelineDrawer, setShowTimelineDrawer] = useState(false);
  const [auditFilters, setAuditFilters] = useState<Set<string>>(new Set()); // Changed to Set for multi-select
  const [agingFilter, setAgingFilter] = useState<number | null>(null);

  // Performance optimizations: Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update candidates when props change
  useEffect(() => {
    setCandidates(propCandidates || []);
  }, [propCandidates]);

  // Feedback Intelligence System

  // Check if a specific stage has feedback
  const getStageFeedback = (candidate: PipelineCandidate, stage: string): {
    exists: boolean;
    feedback: string;
    isEmpty: boolean;
    timestamp?: string;
    providedBy?: string;
  } => {
    // Mock feedback data - in production, this would come from candidate.stageHistory
    const mockFeedback: { [key: string]: any } = {
      [InterviewStage.HM_REVIEW]: candidate.hmReview?.hmFeedback ? {
        exists: true,
        feedback: candidate.hmReview.hmFeedback,
        isEmpty: candidate.hmReview.hmFeedback.trim().length === 0,
        timestamp: candidate.hmReview.reviewedOn,
        providedBy: candidate.hmReview.reviewedBy
      } : null,
      [InterviewStage.L1_TECHNICAL]: candidate.interviews?.l1?.status === 'Cleared' ? {
        exists: true,
        feedback: 'Strong technical fundamentals. Good problem-solving approach.',
        isEmpty: false,
        timestamp: candidate.interviews.l1.feedbackDate,
        providedBy: candidate.interviews.l1.interviewer
      } : null,
      [InterviewStage.L2_TECHNICAL]: candidate.interviews?.l2?.status === 'Cleared' ? {
        exists: true,
        feedback: 'Excellent system design skills. Clear communication.',
        isEmpty: false,
        timestamp: candidate.interviews.l2.feedbackDate,
        providedBy: candidate.interviews.l2.interviewer
      } : null,
    };

    const stageFeedback = mockFeedback[stage];
    if (stageFeedback) {
      return stageFeedback;
    }

    return {
      exists: false,
      feedback: '',
      isEmpty: true
    };
  };

  // Get feedback status for current stage
  const getFeedbackStatus = (candidate: PipelineCandidate): 'submitted' | 'incomplete' | 'pending' | 'missing' => {
    const currentStageIndex = activeStages.indexOf(candidate.stage);

    // First stage (Applied) doesn't require feedback
    if (currentStageIndex === 0) {
      return 'pending';
    }

    // Terminal stages don't require feedback
    if (TERMINAL_OUTCOMES.includes(candidate.stage)) {
      return 'submitted';
    }

    // Check current stage feedback
    const stageFeedback = getStageFeedback(candidate, candidate.stage);

    if (stageFeedback.exists) {
      if (stageFeedback.isEmpty) {
        return 'incomplete';
      }
      return 'submitted';
    }

    // If in HM Review or interview stages, feedback is pending
    if (candidate.stage === InterviewStage.HM_REVIEW ||
      candidate.stage.includes('Technical') ||
      candidate.stage === InterviewStage.HR_ROUND ||
      candidate.stage === InterviewStage.MANAGEMENT_ROUND) {
      return 'pending';
    }

    return 'missing';
  };

  // Check for audit violations - feedback missing on completed stages
  const checkFeedbackViolations = useCallback((candidate: PipelineCandidate): {
    hasViolations: boolean;
    violations: Array<{ stage: string; reason: string }>;
  } => {
    const violations: Array<{ stage: string; reason: string }> = [];
    const currentStageIndex = activeStages.indexOf(candidate.stage);

    // Check all completed stages (before current stage)
    for (let i = 1; i < currentStageIndex; i++) {
      const stage = activeStages[i];

      // Skip stages that don't require feedback
      if (stage === InterviewStage.APPLIED ||
        stage === InterviewStage.SCREENING ||
        stage === InterviewStage.CV_SHORTLIST) {
        continue;
      }

      const stageFeedback = getStageFeedback(candidate, stage);

      if (!stageFeedback.exists) {
        violations.push({
          stage,
          reason: 'Candidate advanced without feedback'
        });
      } else if (stageFeedback.isEmpty) {
        violations.push({
          stage,
          reason: 'Feedback exists but is empty'
        });
      }
    }

    return {
      hasViolations: violations.length > 0,
      violations
    };
  }, []);

  // Audit Flag Engine - Comprehensive Audit Checks

  // Define SLA thresholds per stage (in days)
  const STAGE_SLA: { [key: string]: number } = {
    [InterviewStage.APPLIED]: 2,
    [InterviewStage.SCREENING]: 3,
    [InterviewStage.CV_SHORTLIST]: 2,
    [InterviewStage.HM_REVIEW]: 3,
    [InterviewStage.ASSIGNMENT]: 7,
    [InterviewStage.ASSIGNMENT_RESULT]: 3,
    [InterviewStage.L1_TECHNICAL]: 5,
    [InterviewStage.L2_TECHNICAL]: 5,
    [InterviewStage.L3_TECHNICAL]: 5,
    [InterviewStage.L4_TECHNICAL]: 5,
    [InterviewStage.HR_ROUND]: 4,
    [InterviewStage.MANAGEMENT_ROUND]: 3,
    [InterviewStage.SELECTED]: 7,
    [InterviewStage.JOINED]: 0,
    [InterviewStage.REJECTED]: 0,
    [InterviewStage.DROPPED]: 0,
    [InterviewStage.NO_SHOW]: 0,
    [InterviewStage.ON_HOLD]: 0
  };

  // Score threshold for advancement
  const SCORE_THRESHOLD = 70;

  // Audit Flag 1: Moved without feedback
  const checkMovedWithoutFeedback = (candidate: PipelineCandidate): boolean => {
    const feedbackCheck = checkFeedbackViolations(candidate);
    return feedbackCheck.hasViolations;
  };

  // Audit Flag 2: Advanced despite score < threshold
  const checkLowScoreAdvanced = (candidate: PipelineCandidate): boolean => {
    const currentStageIndex = activeStages.indexOf(candidate.stage);

    // Check assignment score
    if (candidate.assignmentScore && candidate.assignmentScore < SCORE_THRESHOLD) {
      const assignmentResultIndex = activeStages.indexOf(InterviewStage.ASSIGNMENT_RESULT);
      if (currentStageIndex > assignmentResultIndex) {
        return true;
      }
    }

    // Check interview scores
    if (candidate.interviews) {
      const interviewStages = [
        { stage: InterviewStage.L1_TECHNICAL, score: candidate.interviews.l1?.score },
        { stage: InterviewStage.L2_TECHNICAL, score: candidate.interviews.l2?.score },
        { stage: InterviewStage.L3_TECHNICAL, score: candidate.interviews.l3?.score },
        { stage: InterviewStage.L4_TECHNICAL, score: candidate.interviews.l4?.score }
      ];

      for (const { stage, score } of interviewStages) {
        if (score && score < SCORE_THRESHOLD) {
          const stageIndex = activeStages.indexOf(stage);
          if (currentStageIndex > stageIndex) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Audit Flag 3: Aging exceeds SLA for current stage
  const checkAgingExceedsSLA = (candidate: PipelineCandidate): { exceeds: boolean; sla: number; actual: number } => {
    const sla = STAGE_SLA[candidate.stage] || 7;
    return {
      exceeds: candidate.aging > sla,
      sla,
      actual: candidate.aging
    };
  };

  // Audit Flag 4: No hiring manager assigned
  const checkNoHiringManager = (candidate: PipelineCandidate): boolean => {
    return !candidate.hiringManager || candidate.hiringManager.trim() === '';
  };

  // Audit Flag 5: Skipped stage detected
  const checkSkippedStages = (candidate: PipelineCandidate): { hasSkipped: boolean; skippedStages: string[] } => {
    const currentStageIndex = activeStages.indexOf(candidate.stage);
    const skippedStages: string[] = [];

    // Check if candidate has stage history
    if (candidate.stageHistory && candidate.stageHistory.length > 0) {
      const visitedStages = new Set(candidate.stageHistory.map(h => h.toStage));

      // Check all stages before current
      for (let i = 0; i < currentStageIndex; i++) {
        const stage = activeStages[i];

        // Skip optional stages
        if (stage === InterviewStage.SCREENING ||
          stage === InterviewStage.L3_TECHNICAL ||
          stage === InterviewStage.L4_TECHNICAL) {
          continue;
        }

        if (!visitedStages.has(stage)) {
          skippedStages.push(stage);
        }
      }
    }

    return {
      hasSkipped: skippedStages.length > 0,
      skippedStages
    };
  };

  // Audit Flag 6: Assignment completed but no result stage entered
  const checkAssignmentWithoutResult = (candidate: PipelineCandidate): boolean => {
    const currentStageIndex = activeStages.indexOf(candidate.stage);
    const assignmentIndex = activeStages.indexOf(InterviewStage.ASSIGNMENT);
    const assignmentResultIndex = activeStages.indexOf(InterviewStage.ASSIGNMENT_RESULT);

    // If past assignment but never entered assignment result
    if (currentStageIndex > assignmentIndex && currentStageIndex !== assignmentResultIndex) {
      // Check if assignment result was in history
      if (candidate.stageHistory && candidate.stageHistory.length > 0) {
        const hasAssignmentResult = candidate.stageHistory.some(
          h => h.toStage === InterviewStage.ASSIGNMENT_RESULT
        );
        return !hasAssignmentResult;
      }
      // If no history, assume it was skipped
      return true;
    }

    return false;
  };

  // Comprehensive Audit Status Engine
  interface AuditFlag {
    type: 'moved_without_feedback' | 'low_score_advanced' | 'aging_exceeds_sla' |
    'no_hiring_manager' | 'skipped_stage' | 'assignment_without_result';
    severity: 'critical' | 'warning';
    message: string;
    details?: string;
  }

  const computeAuditFlags = (candidate: PipelineCandidate): AuditFlag[] => {
    const flags: AuditFlag[] = [];

    // Flag 1: Moved without feedback (CRITICAL)
    if (checkMovedWithoutFeedback(candidate)) {
      const feedbackCheck = checkFeedbackViolations(candidate);
      flags.push({
        type: 'moved_without_feedback',
        severity: 'critical',
        message: `${feedbackCheck.violations.length} stage(s) missing feedback`,
        details: feedbackCheck.violations.map(v => v.stage).join(', ')
      });
    }

    // Flag 2: Advanced despite low score (CRITICAL)
    if (checkLowScoreAdvanced(candidate)) {
      flags.push({
        type: 'low_score_advanced',
        severity: 'critical',
        message: `Advanced with score < ${SCORE_THRESHOLD}%`,
        details: `Score: ${candidate.assignmentScore || 'N/A'}%`
      });
    }

    // Flag 3: Aging exceeds SLA (WARNING)
    const agingCheck = checkAgingExceedsSLA(candidate);
    if (agingCheck.exceeds) {
      flags.push({
        type: 'aging_exceeds_sla',
        severity: 'warning',
        message: `Aging exceeds SLA (${agingCheck.actual}d > ${agingCheck.sla}d)`,
        details: `Current stage: ${candidate.stage}`
      });
    }

    // Flag 4: No hiring manager (WARNING)
    if (checkNoHiringManager(candidate)) {
      flags.push({
        type: 'no_hiring_manager',
        severity: 'warning',
        message: 'No hiring manager assigned',
        details: 'Candidate lacks ownership'
      });
    }

    // Flag 5: Skipped stages (WARNING)
    const skippedCheck = checkSkippedStages(candidate);
    if (skippedCheck.hasSkipped) {
      flags.push({
        type: 'skipped_stage',
        severity: 'warning',
        message: `${skippedCheck.skippedStages.length} stage(s) skipped`,
        details: skippedCheck.skippedStages.join(', ')
      });
    }

    // Flag 6: Assignment without result (CRITICAL)
    if (checkAssignmentWithoutResult(candidate)) {
      flags.push({
        type: 'assignment_without_result',
        severity: 'critical',
        message: 'Assignment completed but no result recorded',
        details: 'Missing assignment evaluation'
      });
    }

    return flags;
  };

  // Enhanced audit status with all flags
  const getAuditStatus = (candidate: PipelineCandidate): {
    status: 'healthy' | 'warning' | 'critical';
    reasons: string[];
    feedbackViolations: number;
    flags: AuditFlag[];
    criticalCount: number;
    warningCount: number;
  } => {
    const flags = computeAuditFlags(candidate);
    const criticalFlags = flags.filter(f => f.severity === 'critical');
    const warningFlags = flags.filter(f => f.severity === 'warning');

    const reasons = flags.map(f => f.message);
    const feedbackViolations = flags.find(f => f.type === 'moved_without_feedback')
      ? checkFeedbackViolations(candidate).violations.length
      : 0;

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalFlags.length > 0) {
      status = 'critical';
    } else if (warningFlags.length > 0) {
      status = 'warning';
    }

    return {
      status,
      reasons,
      feedbackViolations,
      flags,
      criticalCount: criticalFlags.length,
      warningCount: warningFlags.length
    };
  };

  // Rejection Cooldown Logic
  const checkRejectionCooldown = (candidate: PipelineCandidate): boolean => {
    // Check if moving to Applied (Re-application)

    if (candidate.stage === InterviewStage.REJECTED) {
      let rejectionDate = new Date();

      // Try to find actual rejection date from history
      if (candidate.stageHistory && candidate.stageHistory.length > 0) {
        const rejectionEntry = [...candidate.stageHistory]
          .reverse()
          .find(h => h.toStage === InterviewStage.REJECTED);

        if (rejectionEntry) {
          rejectionDate = new Date(rejectionEntry.timestamp);
        } else {
          // Fallback: use lastUpdateDate
          rejectionDate = new Date(candidate.lastUpdateDate || Date.now());
        }
      } else {
        // Fallback for demo: 30 days ago
        rejectionDate.setDate(rejectionDate.getDate() - 30);
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - rejectionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 180) { // 6 months
        setDaysSinceRejection(diffDays);
        return true; // Cooldown active
      }
    }
    return false;
  };

  const generateMockStageHistory = (candidate: PipelineCandidate) => {
    // If candidate has real stageHistory data, use it directly
    if (candidate.stageHistory && candidate.stageHistory.length > 0) {
      return candidate.stageHistory.map((entry: any) => ({
        stage: entry.toStage || entry.stage,
        movedBy: entry.movedBy || entry.changedBy || getRandomUser(),
        timestamp: entry.timestamp || entry.changedAt || new Date().toISOString(),
        feedback: (entry.reason || entry.feedback || '').trim() || undefined,
        hasFeedback: !!(entry.reason || entry.feedback),
        score: entry.score || (
          ((entry.toStage || entry.stage || '').includes('Technical') ||
            (entry.toStage || entry.stage || '') === InterviewStage.ASSIGNMENT_RESULT)
            ? Math.floor(Math.random() * 30) + 70
            : null
        ),
        duration: entry.duration || null
      }));
    }

    // Fallback: generate mock history (no real data available)
    const currentStageIndex = activeStages.indexOf(candidate.stage);
    const history = [];

    for (let i = 0; i <= currentStageIndex; i++) {
      const stage = activeStages[i];
      const daysAgo = (currentStageIndex - i) * 3 + Math.floor(Math.random() * 3);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const stageFeedback = getStageFeedback(candidate, stage);

      history.push({
        stage,
        movedBy: getRandomUser(),
        timestamp: date.toISOString(),
        feedback: stageFeedback.exists ? stageFeedback.feedback : undefined,
        hasFeedback: stageFeedback.exists && !stageFeedback.isEmpty,
        score: stage.includes('Technical') || stage === InterviewStage.ASSIGNMENT_RESULT
          ? Math.floor(Math.random() * 30) + 70
          : null,
        duration: i < currentStageIndex ? Math.floor(Math.random() * 5) + 1 : candidate.aging
      });
    }

    return history;
  };


  // Get stage status for timeline
  const getStageStatus = (stage: string, candidate: PipelineCandidate):
    'completed' | 'current' | 'pending' | 'skipped' | 'terminal' => {
    const currentStageIndex = activeStages.indexOf(candidate.stage);
    const stageIndex = activeStages.indexOf(stage);

    if (TERMINAL_OUTCOMES.includes(stage)) {
      return stage === candidate.stage ? 'terminal' : 'pending';
    }

    if (stageIndex < currentStageIndex) {
      // Check if stage was skipped
      const skippedCheck = checkSkippedStages(candidate);
      if (skippedCheck.skippedStages.includes(stage)) {
        return 'skipped';
      }
      return 'completed';
    }

    if (stageIndex === currentStageIndex) {
      return 'current';
    }

    return 'pending';
  };

  // Update candidates when props change
  useEffect(() => {
    setCandidates(propCandidates || []);
  }, [propCandidates]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openStageMenu) {
        setOpenStageMenu(null);
      }
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openStageMenu, openDropdown]);

  // Selection handlers
  const handleCandidateSelect = (candidateId: string, checked: boolean) => {
    const newSelection = new Set(selectedCandidates);
    if (checked) {
      newSelection.add(candidateId);
    } else {
      newSelection.delete(candidateId);
    }
    setSelectedCandidates(newSelection);
  };

  const handleStageSelectAll = (stage: string, checked: boolean) => {
    const stageCandidates = candidates.filter(c => c.stage === stage);
    const newSelection = new Set(selectedCandidates);

    if (checked) {
      stageCandidates.forEach(c => newSelection.add(c.id));
    } else {
      stageCandidates.forEach(c => newSelection.delete(c.id));
    }

    setSelectedCandidates(newSelection);
    setStageSelections({ ...stageSelections, [stage]: checked });
  };

  const clearSelection = () => {
    setSelectedCandidates(new Set());
    setStageSelections({});
  };

  // Get next stage for selected candidates
  const getNextStage = (currentStage: string): string => {
    const currentIndex = activeStages.indexOf(currentStage);
    if (currentIndex < activeStages.length - 1) {
      return activeStages[currentIndex + 1];
    }
    return currentStage;
  };

  // Get previous stage for feedback display
  const getPreviousStage = (currentStage: string): string => {
    const currentIndex = activeStages.indexOf(currentStage);
    if (currentIndex > 0) {
      return activeStages[currentIndex - 1];
    }
    return currentStage; // fallback: show current if no previous
  };

  // ==================== STAGE JUMPING SYSTEM ====================

  // Get available forward stages (can skip multiple at once)
  const getAvailableForwardStages = (candidate: PipelineCandidate): string[] => {
    const currentIndex = activeStages.indexOf(candidate.stage);
    const availableStages: string[] = [];

    // Can skip to any stage ahead (excluding terminal outcomes initially)
    for (let i = currentIndex + 1; i < activeStages.length; i++) {
      const stage = activeStages[i];
      // Exclude current stage
      if (stage !== candidate.stage) {
        availableStages.push(stage);
      }
    }

    return availableStages;
  };

  // Get available backward stages (any previously visited stage)
  const getAvailableBackwardStages = (candidate: PipelineCandidate): string[] => {
    const availableStages: string[] = [];

    // Get all stages before current
    const currentIndex = activeStages.indexOf(candidate.stage);
    for (let i = 0; i < currentIndex; i++) {
      availableStages.push(activeStages[i]);
    }

    return availableStages;
  };

  // Get skip status for a stage - determines if it's "Skipped" or "Skipped (Later Completed)"
  const getStageSkipStatus = (candidate: PipelineCandidate, stage: string):
    'not_skipped' | 'skipped' | 'skipped_later_completed' => {

    if (!candidate.stageHistory || candidate.stageHistory.length === 0) {
      return 'not_skipped';
    }

    const stageHistory = candidate.stageHistory;
    const stageIndex = activeStages.indexOf(stage);
    const currentIndex = activeStages.indexOf(candidate.stage);

    // Only check stages before current
    if (stageIndex >= currentIndex) {
      return 'not_skipped';
    }

    // Check if stage was visited
    const wasVisited = stageHistory.some(h => h.toStage === stage);

    if (!wasVisited) {
      // Stage was skipped - now check if it was later completed
      // Look for any history entry that went back to this stage after skipping it
      let wasSkippedInitially = false;
      let wasLaterCompleted = false;

      for (let i = 0; i < stageHistory.length; i++) {
        const entry = stageHistory[i];
        const entryStageIndex = activeStages.indexOf(entry.toStage);

        // If we jumped past this stage, it was skipped
        if (entryStageIndex > stageIndex && !wasVisited) {
          wasSkippedInitially = true;
        }

        // If we later came back to this stage
        if (entry.toStage === stage && wasSkippedInitially) {
          wasLaterCompleted = true;
          break;
        }
      }

      if (wasLaterCompleted) {
        return 'skipped_later_completed';
      } else if (wasSkippedInitially) {
        return 'skipped';
      }
    }

    return 'not_skipped';
  };

  // Handle opening stage jump modal
  const handleStageJump = (candidate: PipelineCandidate, direction: 'forward' | 'backward', targetStage?: InterviewStage) => {
    const resolvedTarget = targetStage || null;

    // If moving forward to a stage with 2+ interviewers, show picker first
    if (direction === 'forward' && resolvedTarget) {
      const assignees = getStageAssignees(resolvedTarget);
      if (assignees.length >= 2) {
        setInterviewerPickerCandidate(candidate);
        setInterviewerPickerStage(resolvedTarget);
        setPickerDirection(direction);
        setSelectedInterviewerUserId(null);
        setShowInterviewerPicker(true);
        return; // Don't open StageJumpModal yet — wait for picker selection
      }
    }

    setSelectedCandidatesForJump([candidate]);
    setJumpDirection(direction);
    setTargetJumpStage(resolvedTarget);
    setJumpFeedback('');
    setJumpAssignmentScore('');
    setShowStageJumpModal(true);
  };

  // Execute stage jump with validation
  const executeStageJump = async () => {
    if (selectedCandidatesForJump.length === 0 || !targetJumpStage) {
      alert('Please select a target stage.');
      return;
    }

    const feedbackToUse = jumpFeedback.trim() || `Moved to ${targetJumpStage} by admin`;

    try {
      const effectiveUser = currentUser || { id: 'admin', name: 'Admin', role: 'superadmin', email: 'admin@fluidjobs.ai' };

      // Validate the transition (We validate the first candidate as rep for bulk for now)
      const validationResult = ValidationService.validateStageTransition(
        selectedCandidatesForJump[0],
        targetJumpStage,
        toValidationUser(effectiveUser)
      );

      if (!validationResult.valid) {
        alert(`Cannot move to ${targetJumpStage}: ${validationResult.reason || 'Validation failed'}`);
        return;
      }

      // Rejection Cooldown Check
      if (targetJumpStage === InterviewStage.APPLIED) {
        const triggeredCooldown = selectedCandidatesForJump.find(c => checkRejectionCooldown(c));
        if (triggeredCooldown) {
          setCooldownCandidate(triggeredCooldown);
          setShowCooldownModal(true);
          return;
        }
      }

      // Determine skip info from first candidate
      const currentIndex = activeStages.indexOf(selectedCandidatesForJump[0].stage);
      const targetIndex = activeStages.indexOf(targetJumpStage);
      const skippedStages: string[] = [];

      if (jumpDirection === 'forward' && targetIndex > currentIndex + 1) {
        for (let i = currentIndex + 1; i < targetIndex; i++) {
          skippedStages.push(activeStages[i]);
        }
      }

      const skipInfo = skippedStages.length > 0 ? ` [Skipped: ${skippedStages.join(', ')}]` : '';
      const finalReason = `${feedbackToUse}${skipInfo ? ' ' + skipInfo : ''}`;

      const candidateIds = selectedCandidatesForJump.map(c => c.id);

      const result = await CandidateService.bulkUpdateCandidateStages(
        candidateIds,
        targetJumpStage,
        finalReason,
        targetJumpStage.includes('Assignment') || targetJumpStage === 'Assignment Result' ? jumpAssignmentScore : undefined
      );

      if (result.success) {
        const successfulIds = result.results.filter(r => r.success).map(r => r.candidateId);

        setCandidates(prev => prev.map(c =>
          successfulIds.includes(c.id) ? { ...c, stage: targetJumpStage } : c
        ));

        // Clear selection for those successfully moved
        const newSelection = new Set(selectedCandidates);
        successfulIds.forEach(id => newSelection.delete(id));
        setSelectedCandidates(newSelection);

        setShowStageJumpModal(false);
        setSelectedCandidatesForJump([]);
        setTargetJumpStage(null);
        setJumpFeedback('');
        setJumpAssignmentScore('');
      } else {
        alert('Failed to update one or more candidates.');
      }
    } catch (error) {
      console.error('Stage jump error:', error);
      alert('An error occurred while moving candidates.');
    }
  };

  // ==================== END STAGE JUMPING SYSTEM ====================

  // Modal handlers


  const handleBulkMove = () => {
    const selectedCandidatesList = candidates.filter(c => selectedCandidates.has(c.id));
    if (selectedCandidatesList.length === 0) return;
    setSelectedCandidatesForJump(selectedCandidatesList);
    setJumpDirection('forward');
    setTargetJumpStage(null);
    setJumpFeedback('');
    setJumpAssignmentScore('');
    setShowStageJumpModal(true);
  };

  // Get bulk action button text and check if action is allowed
  const getBulkActionInfo = (): { text: string; disabled: boolean; reason?: string } => {
    if (selectedCandidates.size === 0) return { text: 'Move to Next Stage', disabled: true };

    const selectedCandidatesList = candidates.filter(c => selectedCandidates.has(c.id));
    if (selectedCandidatesList.length === 0) return { text: 'Move to Next Stage', disabled: true };

    // Check if any selected candidates cannot move to next stage
    const blockedCandidates = selectedCandidatesList.filter(c => !canMoveToNextStage(c));
    if (blockedCandidates.length > 0) {
      const hmReviewBlocked = blockedCandidates.filter(c => c.stage === 'HM Review');
      if (hmReviewBlocked.length > 0) {
        return {
          text: 'Move to Next Stage',
          disabled: true,
          reason: `${hmReviewBlocked.length} candidate(s) need HM approval first`
        };
      }
    }

    const firstCandidate = selectedCandidatesList[0];
    const nextStage = getNextStage(firstCandidate.stage);
    return { text: `Move to ${nextStage}`, disabled: false };
  };

  // Filter candidates - exclude terminal outcomes from active pipeline
  const activeCandidates = candidates.filter(candidate =>
    !TERMINAL_OUTCOMES.includes(candidate.stage) && candidate.status !== 'Rejected'
  );

  // Performance optimization: Use memoized filtering and audit computations
  const {
    filteredCandidates,
    auditStatusMap,
    healthMetrics,
    cleanupCache
  } = usePipelineOptimizations(
    candidates,
    debouncedSearchQuery,
    stageFilter,
    auditFilters,
    agingFilter,
    activeStages,
    getStageFeedback,
    checkFeedbackViolations
  );

  // Cleanup cache periodically
  useEffect(() => {
    const interval = setInterval(cleanupCache, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [cleanupCache]);

  // Helper function to toggle audit filter (multi-select)
  const toggleAuditFilter = (filter: string) => {
    const newFilters = new Set(auditFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setAuditFilters(newFilters);
  };

  // HM Review handlers
  const handleHMReview = (candidate: PipelineCandidate) => {
    setSelectedCandidateForHMReview(candidate);
    setHmDecision('Approve');
    setHmFeedback('');
    setShowHMReviewModal(true);
  };

  const handleViewHMFeedback = (candidate: PipelineCandidate) => {
    setSelectedCandidateForFeedback(candidate);
    setShowHMFeedbackModal(true);
  };

  const handleHMReviewSubmit = (decision: 'Approve' | 'Reject' | 'On Hold', feedback: string) => {
    if (selectedCandidateForHMReview) {
      const reviewedBy = getRandomUser(['admin', 'superadmin', 'hr']);
      setCandidates(prev => prev.map(c =>
        c.id === selectedCandidateForHMReview.id ? {
          ...c,
          hmReview: {
            reviewStatus: 'Reviewed',
            hmDecision: decision,
            hmFeedback: feedback,
            reviewedBy: reviewedBy,
            reviewedOn: new Date().toLocaleString()
          },
          // If rejected, move to terminal state
          stage: decision === 'Reject' ? InterviewStage.REJECTED : c.stage,
          // If on hold, set status flag
          status: decision === 'On Hold' ? CandidateStatus.ON_HOLD : c.status,
          lastUpdateDate: new Date().toISOString().split('T')[0]
        } : c
      ));
      setShowHMReviewModal(false);
      setSelectedCandidateForHMReview(null);
      setHmDecision('Approve');
      setHmFeedback('');
    }
  };

  const getHMReviewStatusBadge = (candidate: PipelineCandidate) => {
    if (candidate.stage !== 'HM Review') return null;

    const review = candidate.hmReview;
    if (!review || review.reviewStatus === 'Pending Review') {
      return (
        <span className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-medium rounded-full inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-yellow-500" />
          Pending HM Review
        </span>
      );
    }

    switch (review.hmDecision) {
      case 'Approve':
        return (
          <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-medium rounded-full inline-flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            HM Approved
          </span>
        );
      case 'Reject':
        return (
          <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-medium rounded-full inline-flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            HM Rejected
          </span>
        );
      case 'On Hold':
        return (
          <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium rounded-full inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            HM On Hold
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium rounded-full inline-flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            HM Reviewed
          </span>
        );
    }
  };

  const getHMReviewActionButton = (candidate: PipelineCandidate) => {
    if (candidate.stage !== 'HM Review') return null;

    const review = candidate.hmReview;
    const isPending = !review || review.reviewStatus === 'Pending Review';

    return (
      <button
        onClick={() => isPending ? handleHMReview(candidate) : setSelectedCandidateForHMReview(candidate)}
        className="w-full mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
      >
        {isPending ? (
          <>
            <FileText className="w-3 h-3" />
            Review Candidate â†’
          </>
        ) : (
          <>
            <MessageSquare className="w-3 h-3" />
            View HM Feedback â†’
          </>
        )}
      </button>
    );
  };

  // Check if candidate can move to next stage using production validation
  const canMoveToNextStage = (candidate: PipelineCandidate): boolean => {
    const user = { id: 'current-user', name: 'Current User', role: 'admin' } as any; // This should come from auth context
    const targetStage = getNextStage(candidate.stage);

    const validationResult = ValidationService.validateStageTransition(candidate, targetStage, user);
    return validationResult.valid;
  };

  // Stage action handlers
  const handleStageAction = (stage: string, action: string) => {
    switch (action) {
      case 'export':
        alert(`Export ${stage} candidates to CSV`);
        break;
      default:
        break;
    }
    setOpenStageMenu(null);
  };

  // ─── Team owner helper ─────────────────────────────────────────────────────
  // Maps pipeline stage → the most relevant responsibility key in teamAssignments
  const STAGE_TO_RESPONSIBILITY: Record<string, string> = {
    'CV Shortlist': 'cv_shortlist_reviewer',
    'CV Shortlisted': 'cv_shortlist_reviewer',
    'Screening': 'screening_reviewer',
    'HM Review': 'hiring_manager',
    'Assignment': 'assignment_reviewer',
    'Assignment Result': 'assignment_reviewer',
    'L1 Technical': 'l1_technical_interviewer',
    'L2 Technical': 'l2_technical_interviewer',
    'L3 Technical': 'l3_technical_interviewer',
    'L4 Technical': 'l4_technical_interviewer',
    'HR Round': 'hr_round',
    'Management Round': 'management_round',
  };

  // Returns { label, name, role } of the first matching team member for a stage, or the primary recruiter
  const getStageOwner = (stage: string): { label: string; name: string; role: string } | null => {
    const responsibility = STAGE_TO_RESPONSIBILITY[stage];
    if (responsibility && Object.keys(teamAssignments).length > 0) {
      for (const [userId, responsibilities] of Object.entries(teamAssignments)) {
        if (responsibilities.includes(responsibility)) {
          const user = users.find(u => String(u.id) === String(userId));
          if (user) {
            const label = responsibility === 'hiring_manager' ? 'Hiring Manager'
              : responsibility.includes('interviewer') ? 'Assigned Interviewer'
                : responsibility === 'hr_round' ? 'HR'
                  : responsibility === 'management_round' ? 'Management'
                    : responsibility.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return { label, name: user.name || user.full_name || 'Unknown', role: user.role || '' };
          }
        }
      }
    }
    // Fall back to primary recruiter if assigned
    if (primaryRecruiterId) {
      const recruiter = users.find(u => String(u.id) === String(primaryRecruiterId));
      if (recruiter) {
        return { label: 'Primary Recruiter', name: recruiter.name || recruiter.full_name || 'Unknown', role: recruiter.role || '' };
      }
    }
    return null;
  };

  // Returns ALL users assigned to a given stage (for multi-interviewer picker)
  const getStageAssignees = (stage: string): { id: string; name: string; role: string }[] => {
    const responsibility = STAGE_TO_RESPONSIBILITY[stage];
    if (!responsibility || Object.keys(teamAssignments).length === 0) return [];
    const assignees: { id: string; name: string; role: string }[] = [];
    for (const [userId, responsibilities] of Object.entries(teamAssignments)) {
      if (responsibilities.includes(responsibility)) {
        const user = users.find(u => String(u.id) === String(userId));
        if (user) assignees.push({ id: String(userId), name: user.name || user.full_name || 'Unknown', role: user.role || '' });
      }
    }
    return assignees;
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-500">


      {/* Bulk Action Bar */}
      {selectedCandidates.size > 0 && (
        <div className="sticky top-0 z-10 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedCandidates.size} candidate{selectedCandidates.size > 1 ? 's' : ''} selected
            </span>
            {getBulkActionInfo().reason && (
              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                âš ï¸ {getBulkActionInfo().reason}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMove}
              disabled={getBulkActionInfo().disabled}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title={getBulkActionInfo().reason}
            >
              {getBulkActionInfo().text}
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {viewMode === 'board' ? (
        /* Board View - Modern Redesign with Subtle Borders & Dot Pattern */
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] scrollbar-thin">
          {/* Subtle edge gradient for scroll indication */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-10"></div>

          <div className="flex gap-6 pb-4 select-none h-full min-h-[600px]">
            {activeStages.map(stage => {
              const columnCandidates = activeCandidates.filter(c => c.stage === stage);
              const stageSelectedCount = columnCandidates.filter(c => selectedCandidates.has(c.id)).length;
              const isStageFullySelected = columnCandidates.length > 0 && stageSelectedCount === columnCandidates.length;

              return (
                <div
                  key={stage}
                  className={`flex-shrink-0 w-80 flex flex-col max-h-full rounded-lg p-1 ${stage !== 'On Hold' ? 'border-r border-[#F3F4F6]' : ''
                    }`}
                >

                  {/* Standardized Stage Header - Clean Modern Design */}
                  <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-3 py-3 border-b border-gray-100 mb-2">
                    {/* Top Row: Title + Count Pill */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-400">
                          {getStageIcon(stage)}
                        </div>
                        <h3 className="text-xs font-poppins font-semibold text-gray-900 uppercase tracking-wider">{stage}</h3>
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                          {columnCandidates.length}
                        </span>
                      </div>

                      {/* Actions (Checkbox + Menu) */}
                      <div className="flex items-center gap-1">
                        <label className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 cursor-pointer transition-colors duration-200 group" title="Select all in column">
                          <input
                            type="checkbox"
                            checked={isStageFullySelected}
                            onChange={(e) => handleStageSelectAll(stage, e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <button
                          onClick={() => setOpenStageMenu(openStageMenu === stage ? null : stage)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                          title="Stage actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>



                    {openStageMenu === stage && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden">
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                            {stage} Actions
                          </div>

                          {columnCandidates.length === 0 ? (
                            <div className="px-3 py-8 text-center">
                              <div className="flex justify-center mb-2">
                                <FileText className="w-8 h-8 text-gray-300" />
                              </div>
                              <p className="text-xs text-gray-400 font-medium">No candidates in this stage</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStageAction(stage, 'export')}
                              className="w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors duration-[120ms] flex items-center gap-3 text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4" />
                              <span className="font-medium">Export Candidates</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rejection Cooldown Modal */}
                  {showCooldownModal && cooldownCandidate && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border-l-4 border-red-500">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Re-application Policy</h3>
                          </div>

                          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-800 font-medium">Cooldown Period Active</p>
                            <p className="text-sm text-red-700 mt-1">
                              Candidate <strong>{cooldownCandidate.name}</strong> was rejected {daysSinceRejection} days ago.
                            </p>
                          </div>

                          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Policy requires a minimum <strong>6-month (180 days)</strong> cooldown period before a rejected candidate can re-apply.
                            <br /><br />
                            Please advise the candidate to apply again after the cooldown period expires.
                          </p>

                          <div className="flex justify-end">
                            <button
                              onClick={() => setShowCooldownModal(false)}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                            >
                              Close & Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cards Container - Clean */}
                  <div className="flex-1 overflow-y-auto space-y-3 px-4 pt-4 pb-2">
                    {columnCandidates.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-gray-300 gap-2 opacity-50">
                        <Users className="w-5 h-5 opacity-30" />
                        <div className="text-center px-4">
                          <p className="text-xs font-medium text-gray-500">No candidates yet</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {stage === 'Applied' && 'Candidates will appear here when they apply'}
                            {stage === 'Screening' && 'Candidates scheduled for initial screening'}
                            {stage === 'CV Shortlist' && 'Move candidates here after initial screening'}
                            {stage === 'HM Review' && 'Candidates await manager review'}
                            {stage === 'Assignment' && 'Candidates with assigned tasks'}
                            {stage === 'Assignment Result' && 'Evaluated assignments appear here'}
                            {stage === 'L1 Technical' && 'Scheduled for first technical round'}
                            {stage === 'L2 Technical' && 'Advanced technical candidates'}
                            {stage === 'L3 Technical' && 'System design candidates'}
                            {stage === 'L4 Technical' && 'Final technical round candidates'}
                            {stage === 'HR Round' && 'Candidates for HR evaluation'}
                            {stage === 'Management Round' && 'Executive review candidates'}
                            {stage === 'Selected' && 'Candidates with offers extended'}
                            {stage === 'Joined' && 'Successfully onboarded employees'}
                            {stage === 'Rejected' && 'Candidates not selected'}
                            {stage === 'Dropped' && 'Candidates who withdrew'}
                            {stage === 'No Show' && 'Candidates who missed interviews'}
                            {stage === 'On Hold' && 'Candidates on hold'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      columnCandidates.map(candidate => {
                        // Stage-specific card rendering
                        if (stage === 'Applied') {
                          return (
                            <div
                              key={candidate.id}
                              className={`bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id) ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent' : 'border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'}`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Applied date + aging badge inline */}
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] text-gray-500">Applied: {new Date(candidate.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${candidate.aging <= 3 ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                  candidate.aging <= 7 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    candidate.aging <= 14 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                  {candidate.aging}d
                                </div>
                              </div>

                              {/* Status badge */}
                              <div className="mb-3">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${candidate.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                                  candidate.status === 'On Hold' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                    'bg-gray-50 text-gray-700 border border-gray-200'
                                  }`}>
                                  {candidate.status}
                                </span>
                              </div>

                              {/* Hiring Manager with warning if not assigned */}
                              <div className="mb-3">
                                {candidate.hiringManager && candidate.hiringManager !== 'Not Assigned' ? (
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-white">
                                      <LucideUser className="w-2 h-2 text-green-600" />
                                    </div>
                                    <span className="text-gray-500">HM:</span>
                                    <span className="font-medium text-green-700">{candidate.hiringManager}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs">
                                    <AlertCircle className="w-3 h-3 text-amber-500" />
                                    <span className="text-amber-600 font-medium">No Recruiter assigned</span>
                                  </div>
                                )}
                              </div>

                              {/* Team owner for this stage */}
                              {(() => {
                                const owner = getStageOwner(stage); return owner ? (
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 text-xs">
                                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                                        <LucideUser className="w-2 h-2 text-indigo-600" />
                                      </div>
                                      <span className="text-gray-500">{owner.label}:</span>
                                      <span className="font-medium text-indigo-700">{owner.name}</span>
                                      {owner.role && <span className="text-gray-400">({owner.role})</span>}
                                    </div>
                                  </div>
                                ) : null;
                              })()}

                              {/* Subtle divider + Check status action */}

                            </div>
                          );
                        }

                        if (stage === 'CV Shortlist') {
                          return (
                            <div
                              key={candidate.id}
                              className={`bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id) ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent' : 'border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'}`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Applied date + aging badge inline (smaller) */}
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] text-gray-500">Applied: {new Date(candidate.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${candidate.aging <= 3 ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                  candidate.aging <= 7 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    candidate.aging <= 14 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                  {candidate.aging}d
                                </div>
                              </div>

                              {/* Primary Shortlisted badge + lighter Active badge */}
                              <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  Shortlisted
                                </span>
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-100">
                                  Active
                                </span>
                              </div>

                              {/* Hiring Manager with compact label */}
                              {candidate.hiringManager && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-white">
                                      <LucideUser className="w-2 h-2 text-purple-600" />
                                    </div>
                                    <span className="text-gray-600" title="Hiring Manager">HM:</span>
                                    <span className="font-medium text-gray-700">{candidate.hiringManager}</span>
                                  </div>
                                </div>
                              )}

                              {/* Increased spacing + Check status action */}

                              {/* Team owner for this stage */}
                              {(() => {
                                const owner = getStageOwner(stage); return owner ? (
                                  <div className="mb-2">
                                    <div className="flex items-center gap-2 text-xs">
                                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                                        <LucideUser className="w-2 h-2 text-indigo-600" />
                                      </div>
                                      <span className="text-gray-500">{owner.label}:</span>
                                      <span className="font-medium text-indigo-700">{owner.name}</span>
                                      {owner.role && <span className="text-gray-400">({owner.role})</span>}
                                    </div>
                                  </div>
                                ) : null;
                              })()}

                            </div>
                          );
                        }

                        if (stage === 'HM Review') {
                          const review = candidate.hmReview;
                          const isPending = !review || review.reviewStatus === 'Pending Review';
                          const isReviewed = review?.reviewStatus === 'Reviewed';
                          const hasValidDecision = isReviewed && review?.hmDecision && ['Approve', 'Reject', 'On Hold'].includes(review.hmDecision);
                          const hasFeedback = review?.hmFeedback && review.hmFeedback.trim().length > 0;

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${isPending
                                  ? 'hover:border-yellow-300 hover:shadow-[0_4px_20px_-4px_rgba(250,204,21,0.3)]'
                                  : review?.hmDecision === 'Approve'
                                    ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                    : review?.hmDecision === 'Reject'
                                      ? 'hover:border-red-300 hover:shadow-[0_4px_20px_-4px_rgba(239,68,68,0.3)]'
                                      : review?.hmDecision === 'On Hold'
                                        ? 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                        : 'hover:border-gray-200 hover:shadow-md'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* HM Review Status Badge - directly below candidate name */}
                              <div className="mb-3">
                                {isPending && (
                                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                    Pending Review
                                  </span>
                                )}
                                {hasValidDecision && review?.hmDecision === 'Approve' && (
                                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    Reviewed â€“ Approved
                                  </span>
                                )}
                                {hasValidDecision && review?.hmDecision === 'Reject' && (
                                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                    Reviewed â€“ Rejected
                                  </span>
                                )}
                                {hasValidDecision && review?.hmDecision === 'On Hold' && (
                                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                                    On Hold
                                  </span>
                                )}
                              </div>

                              {/* Applied date + aging badge inline (consistent format) */}
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] text-gray-500">Applied: {new Date(candidate.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${candidate.aging <= 3 ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                  candidate.aging <= 7 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    candidate.aging <= 14 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                  {candidate.aging}d
                                </div>
                              </div>

                              {/* Assigned Hiring Manager (consistent format) */}
                              {candidate.hiringManager && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-white">
                                      <LucideUser className="w-2 h-2 text-purple-600" />
                                    </div>
                                    <span className="text-gray-600">HM:</span>
                                    <span className="font-medium text-gray-700">{candidate.hiringManager}</span>
                                  </div>
                                </div>
                              )}

                              {/* Feedback Preview - ONLY for non-pending states with valid decision and feedback */}
                              {!isPending && hasValidDecision && hasFeedback && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Feedback</div>
                                  <div className="text-xs text-gray-700 truncate" title={review.hmFeedback}>
                                    {review.hmFeedback}
                                  </div>
                                </div>
                              )}

                              {/* Action area - show for pending OR for reviewed with feedback */}
                              {(isPending || (!isPending && hasValidDecision && hasFeedback)) && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  {isPending ? (
                                    <button
                                      onClick={() => handleHMReview(candidate)}
                                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                                    >
                                      <FileText className="w-3 h-3" />
                                      Review Candidate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleViewHMFeedback(candidate)}
                                      className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-xs font-medium transition-colors"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      View HM Feedback
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Assigned team member for this stage (from Job Settings) */}
                              {(() => {
                                const owner = getStageOwner(stage); return owner ? (
                                  <div className="mb-3 mt-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                                        <LucideUser className="w-2 h-2 text-indigo-600" />
                                      </div>
                                      <span className="text-gray-500">{owner.label}:</span>
                                      <span className="font-medium text-indigo-700">{owner.name}</span>
                                      {owner.role && <span className="text-gray-400">({owner.role})</span>}
                                    </div>
                                  </div>
                                ) : null;
                              })()}

                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'Assignment') {
                          // Generate assignment status and due date
                          const assignmentStatuses = ['Assigned', 'In Progress', 'Submitted'];
                          const assignmentStatus = assignmentStatuses[Math.floor(Math.random() * assignmentStatuses.length)];
                          const dueDate = new Date();
                          dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7) + 1);
                          const dueDateString = dueDate.toLocaleDateString('en-GB');

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${assignmentStatus === 'Submitted'
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : assignmentStatus === 'In Progress'
                                    ? 'hover:border-orange-300 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.3)]'
                                    : 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Assignment Status Badge - emphasize progress */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${assignmentStatus === 'Assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  assignmentStatus === 'In Progress' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-green-50 text-green-700 border-green-200'
                                  }`}>
                                  {assignmentStatus === 'Assigned' && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                                  {assignmentStatus === 'In Progress' && <Clock className="w-3.5 h-3.5 text-orange-500" />}
                                  {assignmentStatus === 'Submitted' && <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />}
                                  {assignmentStatus}
                                </span>
                              </div>

                              {/* Assignment Due Date */}
                              <div className="mb-3">
                                <p className="text-xs text-gray-500">
                                  Due: <span className="font-medium text-gray-700">{dueDateString}</span>
                                </p>
                              </div>

                              {/* Assigned Hiring Manager */}
                              {candidate.hiringManager && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-white">
                                      <LucideUser className="w-2 h-2 text-purple-600" />
                                    </div>
                                    <span className="text-gray-600">HM:</span>
                                    <span className="font-medium text-gray-700">{candidate.hiringManager}</span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}


                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'Assignment Result') {
                          // Generate assignment score and status
                          const score = Math.floor(Math.random() * 40) + 60; // 60-100%
                          const isPassed = score >= 70;
                          const status = isPassed ? 'Passed' : 'Needs Review';

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${isPassed
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : 'hover:border-orange-300 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.3)]'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Assignment Score - PRIMARY VISUAL ELEMENT */}
                              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-600">Assignment Score</span>
                                  <span className={`text-lg font-bold ${score >= 85 ? 'text-green-600' :
                                    score >= 70 ? 'text-blue-600' :
                                      score >= 60 ? 'text-orange-600' :
                                        'text-red-600'
                                    }`}>
                                    {score}%
                                  </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${score >= 85 ? 'bg-green-500' :
                                      score >= 70 ? 'bg-blue-500' :
                                        score >= 60 ? 'bg-orange-500' :
                                          'bg-red-500'
                                      }`}
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${isPassed
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                                  }`}>
                                  {isPassed ? (
                                    <>
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                                      Passed
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                      Needs Review
                                    </>
                                  )}
                                </span>
                              </div>

                              {/* Assigned Hiring Manager */}
                              {candidate.hiringManager && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-white">
                                      <LucideUser className="w-2 h-2 text-purple-600" />
                                    </div>
                                    <span className="text-gray-600">HM:</span>
                                    <span className="font-medium text-gray-700">{candidate.hiringManager}</span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}

                              {/* Assigned team member for this stage */}
                              {(() => {
                                const owner = getStageOwner(stage); return owner ? (
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 text-xs">
                                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                                        <LucideUser className="w-2 h-2 text-indigo-600" />
                                      </div>
                                      <span className="text-gray-500">{owner.label}:</span>
                                      <span className="font-medium text-indigo-700">{owner.name}</span>
                                      {owner.role && <span className="text-gray-400">({owner.role})</span>}
                                    </div>
                                  </div>
                                ) : null;
                              })()}

                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'L1 Technical') {
                          // Generate interview status and details
                          const interviewStatuses = ['Scheduled', 'Completed'];
                          const interviewStatus = interviewStatuses[Math.floor(Math.random() * interviewStatuses.length)];
                          const interviewAging = Math.floor(Math.random() * 10) + 1; // 1-10 days
                          const interviewers = [getRandomUser(['admin', 'superadmin', 'hr'])];
                          const interviewer = interviewers[0];
                          const assignmentScore = candidate.assignmentScore; // Use actual assignment score

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${interviewStatus === 'Completed'
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Interview Status Badge */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${interviewStatus === 'Scheduled'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                                  }`}>
                                  {interviewStatus === 'Scheduled' ? (
                                    <>
                                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                      Scheduled
                                    </>
                                  ) : (
                                    <>
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                                      Completed
                                    </>
                                  )}
                                </span>
                              </div>

                              {/* Interview Aging Badge */}
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-gray-500">
                                  {interviewStatus === 'Scheduled' ? 'Interview in:' : 'Completed:'}
                                </p>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${interviewAging <= 3 ? 'bg-green-50 text-green-700 border-green-200' :
                                  interviewAging <= 7 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                  {interviewAging}d
                                </div>
                              </div>

                              {/* Assigned Interviewer */}
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                                    <LucideUser className="w-2 h-2 text-indigo-600" />
                                  </div>
                                  <span className="text-gray-600">Interviewer:</span>
                                  <span className="font-medium text-gray-700">{interviewer}</span>
                                </div>
                              </div>

                              {/* Optional Assignment Score (small, secondary) */}
                              {assignmentScore && (
                                <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Assignment:</span>
                                    <span className={`text-xs font-medium ${assignmentScore >= 70 ? 'text-green-600' : 'text-orange-600'
                                      }`}>
                                      {assignmentScore}%
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}


                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'L2 Technical') {
                          // Generate interview status and details
                          const interviewStatuses = ['Scheduled', 'Completed'];
                          const interviewStatus = interviewStatuses[Math.floor(Math.random() * interviewStatuses.length)];
                          const interviewAging = Math.floor(Math.random() * 10) + 1; // 1-10 days
                          const interviewers = [getRandomUser(['admin', 'superadmin', 'hr'])];
                          const interviewer = interviewers[0];
                          const l1Score = Math.random() > 0.2 ? Math.floor(Math.random() * 30) + 70 : null; // Usually show L1 score

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${interviewStatus === 'Completed'
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Interview Status Badge */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${interviewStatus === 'Scheduled'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                                  }`}>
                                  {interviewStatus === 'Scheduled' ? (
                                    <>
                                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                      Scheduled
                                    </>
                                  ) : (
                                    <>
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                                      Completed
                                    </>
                                  )}
                                </span>
                              </div>

                              {/* Interview Aging Badge */}
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-gray-500">
                                  {interviewStatus === 'Scheduled' ? 'Interview in:' : 'Completed:'}
                                </p>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${interviewAging <= 3 ? 'bg-green-50 text-green-700 border border-green-200' :
                                  interviewAging <= 7 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                    'bg-red-50 text-red-700 border border-red-200'
                                  }`}>
                                  {interviewAging}d
                                </div>
                              </div>

                              {/* Assigned Interviewer */}
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                                    <LucideUser className="w-2 h-2 text-indigo-600" />
                                  </div>
                                  <span className="text-gray-600">Interviewer:</span>
                                  <span className="font-medium text-gray-700">{interviewer}</span>
                                </div>
                              </div>

                              {/* Optional Previous Round Score (L1) */}
                              {l1Score && (
                                <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">L1 Score:</span>
                                    <span className={`text-xs font-medium ${l1Score >= 80 ? 'text-green-600' : 'text-blue-600'
                                      }`}>
                                      {l1Score}%
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}


                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'L3 Technical') {
                          // Generate interview status and details
                          const interviewStatuses = ['Scheduled', 'Completed'];
                          const interviewStatus = interviewStatuses[Math.floor(Math.random() * interviewStatuses.length)];
                          const interviewAging = Math.floor(Math.random() * 10) + 1; // 1-10 days
                          const interviewers = [getRandomUser(['admin', 'superadmin', 'hr'])];
                          const interviewer = interviewers[0];

                          // Combined technical confidence from L1 + L2 scores
                          const l1Score = Math.random() > 0.2 ? Math.floor(Math.random() * 30) + 70 : null;
                          const l2Score = Math.random() > 0.2 ? Math.floor(Math.random() * 30) + 70 : null;
                          const combinedConfidence = (l1Score && l2Score) ? Math.round((l1Score + l2Score) / 2) : null;

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${interviewStatus === 'Completed'
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Interview Status Badge */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${interviewStatus === 'Scheduled'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                                  }`}>
                                  {interviewStatus === 'Scheduled' ? (
                                    <>
                                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                      Scheduled
                                    </>
                                  ) : (
                                    <>
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                                      Completed
                                    </>
                                  )}
                                </span>
                              </div>

                              {/* Interview Aging Badge */}
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-gray-500">
                                  {interviewStatus === 'Scheduled' ? 'Interview in:' : 'Completed:'}
                                </p>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${interviewAging <= 3 ? 'bg-green-50 text-green-700 border border-green-200' :
                                  interviewAging <= 7 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                    'bg-red-50 text-red-700 border border-red-200'
                                  }`}>
                                  {interviewAging}d
                                </div>
                              </div>

                              {/* Assigned Interviewer */}
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white">
                                    <LucideUser className="w-2 h-2 text-indigo-600" />
                                  </div>
                                  <span className="text-gray-600">Interviewer:</span>
                                  <span className="font-medium text-gray-700">{interviewer}</span>
                                </div>
                              </div>

                              {/* Optional Combined Technical Confidence Indicator */}
                              {combinedConfidence && (
                                <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Technical Confidence:</span>
                                    <span className={`text-xs font-medium ${combinedConfidence >= 80 ? 'text-green-600' :
                                      combinedConfidence >= 70 ? 'text-blue-600' : 'text-orange-600'
                                      }`}>
                                      {combinedConfidence}%
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}


                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'L4 Technical') {
                          // Generate interview completion status and details
                          const completionStatuses = ['Completed', 'In Progress', 'Scheduled'];
                          const completionStatus = completionStatuses[Math.floor(Math.random() * completionStatuses.length)];
                          const assignmentScore = candidate.assignmentScore; // Use actual assignment score

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${completionStatus === 'Completed'
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : completionStatus === 'In Progress'
                                    ? 'hover:border-orange-300 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.3)]'
                                    : 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Interview Completion Status Badge */}
                              <div className="mb-3">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${completionStatus === 'Completed'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : completionStatus === 'In Progress'
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                  {completionStatus === 'Completed' && <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />}
                                  {completionStatus === 'In Progress' && <Clock className="w-3.5 h-3.5 text-orange-500" />}
                                  {completionStatus === 'Scheduled' && <Calendar className="w-3.5 h-3.5 text-blue-500" />}
                                  {completionStatus}
                                </span>
                              </div>

                              {/* Assignment Score (if relevant) */}
                              {assignmentScore && (
                                <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Assignment Score:</span>
                                    <span className={`text-xs font-medium ${assignmentScore >= 80 ? 'text-green-600' :
                                      assignmentScore >= 70 ? 'text-blue-600' : 'text-orange-600'
                                      }`}>
                                      {assignmentScore}%
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Hiring Manager */}
                              {candidate.hiringManager && (
                                <div className="mb-3">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-white">
                                      <LucideUser className="w-2 h-2 text-purple-600" />
                                    </div>
                                    <span className="text-gray-600">HM:</span>
                                    <span className="font-medium text-gray-700">{candidate.hiringManager}</span>
                                  </div>
                                </div>
                              )}

                              {/* HR Round Readiness Indicator */}
                              {completionStatus === 'Completed' && (
                                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-blue-700">Ready for HR Round</span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}


                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'HR Round') {
                          // Generate HR interview status and details
                          const hrStatuses = ['Scheduled', 'Completed', 'In Progress'];
                          const hrStatus = hrStatuses[Math.floor(Math.random() * hrStatuses.length)];
                          const hrAging = Math.floor(Math.random() * 8) + 1; // 1-8 days
                          const hrPersonnel = [getRandomUser(['hr', 'admin', 'superadmin']) + ' (HR)'];
                          const assignedHR = hrPersonnel[0];

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${hrStatus === 'Completed'
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : hrStatus === 'In Progress'
                                    ? 'hover:border-orange-300 hover:shadow-[0_4px_20px_-4px_rgba(249,115,22,0.3)]'
                                    : 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* HR Interview Status Badge */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${hrStatus === 'Completed'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : hrStatus === 'In Progress'
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                  {hrStatus === 'Completed' && <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />}
                                  {hrStatus === 'In Progress' && <Clock className="w-3.5 h-3.5 text-orange-500" />}
                                  {hrStatus === 'Scheduled' && <Calendar className="w-3.5 h-3.5 text-blue-500" />}
                                  HR {hrStatus}
                                </span>
                              </div>

                              {/* HR Aging Badge */}
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-gray-500">
                                  {hrStatus === 'Scheduled' ? 'Interview in:' :
                                    hrStatus === 'In Progress' ? 'Started:' : 'Completed:'}
                                </p>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${hrAging <= 2 ? 'bg-green-50 text-green-700 border-green-200' :
                                  hrAging <= 5 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                  {hrAging}d
                                </div>
                              </div>

                              {/* Assigned HR / HM */}
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                                    <LucideUser className="w-2 h-2 text-amber-600" />
                                  </div>
                                  <span className="text-gray-600">Assigned:</span>
                                  <span className="font-medium text-gray-700">{assignedHR}</span>
                                </div>
                              </div>

                              {/* Management Decision Readiness */}
                              {hrStatus === 'Completed' && (
                                <div className="mb-3 p-2 bg-amber-50 rounded border border-amber-200">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-amber-700">Ready for Management</span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}


                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'Management Round') {
                          // Generate management interview status and details
                          const mgmtStatuses = ['Scheduled', 'Completed', 'Pending Decision'];
                          const mgmtStatus = mgmtStatuses[Math.floor(Math.random() * mgmtStatuses.length)];
                          const mgmtAging = Math.floor(Math.random() * 5) + 1; // 1-5 days (faster at exec level)

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : `border-gray-100 hover:-translate-y-0.5 ${mgmtStatus === 'Completed'
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : mgmtStatus === 'Pending Decision'
                                    ? 'hover:border-purple-300 hover:shadow-[0_4px_20px_-4px_rgba(168,85,247,0.3)]'
                                    : 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                }`
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Management Interview Status Badge */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${mgmtStatus === 'Completed'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : mgmtStatus === 'Pending Decision'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                  {mgmtStatus === 'Completed' && <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />}
                                  {mgmtStatus === 'Pending Decision' && <Clock className="w-3.5 h-3.5 text-orange-500" />}
                                  {mgmtStatus === 'Scheduled' && <Calendar className="w-3.5 h-3.5 text-blue-500" />}
                                  {mgmtStatus}
                                </span>
                              </div>

                              {/* Management Aging Badge */}
                              <div className="flex items-center justify-between mb-4">
                                <p className="text-xs text-gray-500">
                                  {mgmtStatus === 'Scheduled' ? 'Interview in:' :
                                    mgmtStatus === 'Pending Decision' ? 'Decision pending:' : 'Completed:'}
                                </p>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${mgmtAging <= 1 ? 'bg-green-50 text-green-700 border-green-200' :
                                  mgmtAging <= 3 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                  {mgmtAging}d
                                </div>
                              </div>

                              {/* Decision Readiness Indicator */}
                              {mgmtStatus === 'Completed' && (
                                <div className="mb-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-emerald-700">Ready for Final Decision</span>
                                  </div>
                                </div>
                              )}

                              {mgmtStatus === 'Pending Decision' && (
                                <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-purple-700">Awaiting Management Decision</span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}


                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'Selected') {
                          // Generate offer details
                          const offerAging = Math.floor(Math.random() * 10) + 1; // 1-10 days since offer

                          return (
                            <div
                              key={candidate.id}
                              className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                                : 'border-gray-100 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                                }`}
                            >
                              {/* Top row: checkbox + candidate name + skip badge + action buttons */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidates.has(candidate.id)}
                                    onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                  />
                                  <div className="flex-1">
                                    <button
                                      onClick={() => onViewProfile(candidate.id)}
                                      className="text-left group w-full"
                                    >
                                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                        {candidate.name}
                                      </h4>
                                    </button>
                                    <div className="mt-1">
                                      <CandidateCardSkipBadge
                                        candidate={candidate}
                                        skippedStages={checkSkippedStages(candidate).skippedStages}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CandidateCardActions
                                    candidate={candidate}
                                    onViewFeedback={async (candidate, stage) => {
                                      const history = await CandidateService.getStageHistory(candidate.id);
                                      setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                      setSelectedFeedbackStage(getPreviousStage(stage));
                                      setShowFeedbackReviewModal(true);
                                    }}
                                    onStatusAction={(candidate, action) => {
                                      setSelectedStatusCandidate(candidate);
                                      setSelectedStatusAction(action);
                                      setStatusReason('');
                                      setShowStatusActionModal(true);
                                    }}
                                    onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                  />

                                </div>
                              </div>

                              {/* Offer Status Badge */}
                              <div className="mb-3">
                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  ðŸ“‹ Offer Extended
                                </span>
                              </div>

                              {/* Aging Since Offer */}
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-gray-500">Offer sent:</p>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${offerAging <= 3 ? 'bg-green-50 text-green-700 border-green-200' :
                                  offerAging <= 7 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                  {offerAging}d ago
                                </div>
                              </div>

                              {/* Hiring Manager */}
                              {candidate.hiringManager && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-white">
                                      <LucideUser className="w-2 h-2 text-purple-600" />
                                    </div>
                                    <span className="text-gray-600">HM:</span>
                                    <span className="font-medium text-gray-700">{candidate.hiringManager}</span>
                                  </div>
                                </div>
                              )}

                              {/* Action area */}


                              {/* Subtle gray divider at bottom for visual consistency */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-100"></div>
                            </div>
                          );
                        }

                        if (stage === 'Joined') {
                          // Generate joined date
                          const joinedDate = new Date();
                          joinedDate.setDate(joinedDate.getDate() - Math.floor(Math.random() * 30)); // Joined within last 30 days
                          const joinedDateString = joinedDate.toLocaleDateString('en-GB');

                          return (
                            <div
                              key={candidate.id}
                              className="group bg-white p-5 rounded-xl border border-gray-100 hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
                            >
                              {/* Top row: candidate name + view icon (no checkbox for joined candidates) */}
                              <div className="flex items-start justify-between mb-3">
                                <button
                                  onClick={() => onViewProfile(candidate.id)}
                                  className="text-left group flex-1"
                                >
                                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                    {candidate.name}
                                  </h4>
                                </button>

                              </div>

                              {/* Joined Status Badge */}
                              <div className="mb-3">
                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  ðŸŽ‰ Joined
                                </span>
                              </div>

                              {/* Joined Date */}
                              <div className="mb-4">
                                <p className="text-xs text-gray-500">
                                  Joined: <span className="font-medium text-gray-700">{joinedDateString}</span>
                                </p>
                              </div>

                              {/* View Only Action */}
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <button
                                  onClick={() => onViewProfile(candidate.id)}
                                  className="flex items-center gap-2 text-green-600 hover:text-green-700 text-xs font-medium transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  View Profile
                                </button>
                              </div>

                              {/* Subtle green divider at bottom for celebratory touch */}
                              <div className="absolute bottom-0 left-4 right-4 h-px bg-green-200"></div>
                            </div>
                          );
                        }

                        // Default card for other stages (existing layout)
                        return (
                          <div
                            key={candidate.id}
                            className={`group bg-white p-5 rounded-xl border transition-all duration-200 cursor-pointer relative ${selectedCandidates.has(candidate.id)
                              ? 'border-l-[3px] border-l-amber-400 bg-amber-50/10 border-y-transparent border-r-transparent'
                              : `border-gray-100 hover:-translate-y-0.5 ${candidate.status === 'Rejected' || candidate.status === 'Dropped'
                                ? 'hover:border-red-300 hover:shadow-[0_4px_20px_-4px_rgba(239,68,68,0.3)]'
                                : candidate.status === 'Active'
                                  ? 'hover:border-green-300 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]'
                                  : 'hover:border-blue-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                              }`
                              }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.has(candidate.id)}
                                onChange={(e) => handleCandidateSelect(candidate.id, e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                              />
                              <div className="flex-1">
                                <button
                                  onClick={() => onViewProfile(candidate.id)}
                                  className="text-left group"
                                >
                                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 group-hover:underline transition-colors cursor-pointer">
                                    {candidate.name}
                                  </h4>
                                </button>
                                <p className="text-xs text-gray-500 mt-1">Applied: {new Date(candidate.appliedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <CandidateCardActions
                                  candidate={candidate}
                                  onViewFeedback={async (candidate, stage) => {
                                    const history = await CandidateService.getStageHistory(candidate.id);
                                    setSelectedFeedbackCandidate({ ...candidate, stageHistory: history });
                                    setSelectedFeedbackStage(getPreviousStage(stage));
                                    setShowFeedbackReviewModal(true);
                                  }}
                                  onStatusAction={(candidate, action) => {
                                    setSelectedStatusCandidate(candidate);
                                    setSelectedStatusAction(action);
                                    setStatusReason('');
                                    setShowStatusActionModal(true);
                                  }}
                                  onMoveStage={(candidate) => { handleStageJump(candidate, 'forward'); }}
                                />

                                <div className={`px-2 py-0.5 rounded text-xs font-medium ${candidate.aging > 15 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {candidate.aging}d
                                </div>
                              </div>
                            </div>

                            {/* HM Review Status Badge */}
                            {candidate.stage === 'HM Review' && (
                              <div className="mb-3">
                                {getHMReviewStatusBadge(candidate)}
                              </div>
                            )}

                            {/* HM Feedback Preview */}
                            {candidate.stage === 'HM Review' && candidate.hmReview?.hmFeedback && (
                              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs font-medium text-gray-600 mb-1">HM Feedback:</div>
                                <div className="text-xs text-gray-700 line-clamp-2" title={candidate.hmReview.hmFeedback}>
                                  {candidate.hmReview.hmFeedback.length > 60
                                    ? `${candidate.hmReview.hmFeedback.substring(0, 60)}...`
                                    : candidate.hmReview.hmFeedback
                                  }
                                </div>
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="mb-3">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${candidate.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                                candidate.status === 'Dropped' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                  candidate.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-gray-50 text-gray-700 border border-gray-200'
                                }`}>
                                {candidate.status}
                              </span>
                            </div>

                            {/* Assignment Score */}
                            {candidate.assignmentScore && (candidate.stage.includes('Assignment') || candidate.stage === 'Assignment Result') && (
                              <div className="mb-3">
                                <div className="text-xs text-gray-600 font-medium mb-1">
                                  Assignment Score: <span className="font-bold text-green-600">{candidate.assignmentScore}%</span>
                                </div>
                              </div>
                            )}

                            {/* Hiring Manager Information */}
                            {candidate.hiringManager && candidate.hiringManager !== 'Not Assigned' ? (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-white">
                                    <Briefcase className="w-2 h-2 text-purple-600" />
                                  </div>
                                  <span className="font-medium text-gray-700">{candidate.hiringManager}</span>
                                  <span className="text-xs text-gray-500">HM</span>
                                </div>
                              </div>
                            ) : (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                  <span className="text-amber-600 font-medium">No Recruiter assigned</span>
                                </div>
                              </div>
                            )}

                            {/* Check Status Button or HM Review Action */}
                            {getHMReviewActionButton(candidate)}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Audit Intelligence Mode - List View */
        <div className="space-y-4">
          {/* Pipeline Health Dashboard Strip - Using Optimized Metrics */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                Pipeline Health Dashboard
              </h3>
              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                Live Metrics
              </span>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {/* Total Candidates */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{healthMetrics.totalCandidates}</div>
                <div className="text-xs text-gray-500 mt-1">Candidates</div>
              </div>

              {/* Missing Feedback */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</span>
                  <MessageSquare className="w-4 h-4 text-red-500" />
                </div>
                <div className={`text-2xl font-bold ${healthMetrics.feedbackMissingPercent > 30 ? 'text-red-600' : healthMetrics.feedbackMissingPercent > 15 ? 'text-orange-600' : 'text-green-600'}`}>
                  {healthMetrics.feedbackMissingPercent}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Missing ({healthMetrics.feedbackMissingCount})</div>
              </div>

              {/* Average Aging */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Aging</span>
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <div className={`text-2xl font-bold ${healthMetrics.avgAging > 21 ? 'text-red-600' : healthMetrics.avgAging > 14 ? 'text-orange-600' : 'text-green-600'}`}>
                  {healthMetrics.avgAging}d
                </div>
                <div className="text-xs text-gray-500 mt-1">In stage</div>
              </div>

              {/* Bottleneck Stage */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bottleneck</span>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-sm font-bold text-gray-900 truncate" title={healthMetrics.bottleneckStage}>
                  {healthMetrics.bottleneckStage}
                </div>
                <div className="text-xs text-gray-500 mt-1">{healthMetrics.maxAgingCount} aging</div>
              </div>

              {/* Healthy % */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Healthy</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">{healthMetrics.healthyPercent}%</div>
                <div className="text-xs text-gray-500 mt-1">{healthMetrics.healthyCount} candidates</div>
              </div>

              {/* Critical % */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Critical</span>
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-600">{healthMetrics.criticalPercent}%</div>
                <div className="text-xs text-gray-500 mt-1">{healthMetrics.criticalCount} candidates</div>
              </div>
            </div>

            {/* Health Bar */}
            <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Pipeline Health Distribution</span>
                <span className="text-xs text-gray-500">{healthMetrics.totalCandidates} total</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${healthMetrics.healthyPercent}%` }}
                  title={`${healthMetrics.healthyPercent}% Healthy`}
                ></div>
                <div
                  className="bg-yellow-500 transition-all duration-500"
                  style={{ width: `${100 - healthMetrics.healthyPercent - healthMetrics.criticalPercent}%` }}
                  title={`${100 - healthMetrics.healthyPercent - healthMetrics.criticalPercent}% Warning`}
                ></div>
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{ width: `${healthMetrics.criticalPercent}%` }}
                  title={`${healthMetrics.criticalPercent}% Critical`}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-green-600 font-medium">{healthMetrics.healthyPercent}% Healthy</span>
                <span className="text-yellow-600 font-medium">{100 - healthMetrics.healthyPercent - healthMetrics.criticalPercent}% Warning</span>
                <span className="text-red-600 font-medium">{healthMetrics.criticalPercent}% Critical</span>
              </div>
            </div>
          </div>

          {/* Intelligent Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200">
            <div className="flex flex-col gap-4">
              {/* Search and Basic Filters */}
              <div className="flex items-center gap-3">
                {/* Search Field */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search candidates, interviewers, or hiring managers..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-normal focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                </div>

                {/* Stage Filter */}
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="">All Stages</option>
                  {ALL_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(searchQuery || stageFilter || auditFilters.size > 0 || agingFilter) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStageFilter('');
                      setAuditFilters(new Set());
                      setAgingFilter(null);
                    }}
                    className="text-xs font-medium text-blue-600 uppercase hover:underline px-2"
                  >
                    Clear All {auditFilters.size > 0 && `(${auditFilters.size} active)`}
                  </button>
                )}
              </div>

              {/* Quick Audit Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Filters:</span>

                {/* Critical Filters */}
                <button
                  onClick={() => toggleAuditFilter('critical')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('critical')
                    ? 'bg-red-50 text-red-700 border border-red-200 border-2 border-red-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Critical Issues
                </button>
                <button
                  onClick={() => toggleAuditFilter('missing-feedback')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('missing-feedback')
                    ? 'bg-red-50 text-red-700 border border-red-200 border-2 border-red-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Missing Feedback
                </button>
                <button
                  onClick={() => toggleAuditFilter('low-score')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('low-score')
                    ? 'bg-red-50 text-red-700 border border-red-200 border-2 border-red-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Low Score Advanced
                </button>
                <button
                  onClick={() => toggleAuditFilter('assignment-gap')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('assignment-gap')
                    ? 'bg-red-50 text-red-700 border border-red-200 border-2 border-red-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Assignment Gap
                </button>

                {/* Warning Filters */}
                <button
                  onClick={() => toggleAuditFilter('warning')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('warning')
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 border-2 border-yellow-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Warnings
                </button>
                <button
                  onClick={() => toggleAuditFilter('aging-7')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('aging-7')
                    ? 'bg-orange-50 text-orange-700 border border-orange-200 border-2 border-orange-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Aging &gt; 7 days
                </button>
                <button
                  onClick={() => toggleAuditFilter('sla-exceeded')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('sla-exceeded')
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 border-2 border-yellow-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  SLA Exceeded
                </button>
                <button
                  onClick={() => toggleAuditFilter('no-owner')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('no-owner')
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  No Owner
                </button>
                <button
                  onClick={() => toggleAuditFilter('skipped-stage')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('skipped-stage')
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 border-2 border-yellow-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Skipped Stages
                </button>

                {/* Status Filters */}
                <button
                  onClick={() => toggleAuditFilter('on-hold')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('on-hold')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 border-2 border-blue-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  On Hold
                </button>
                <button
                  onClick={() => toggleAuditFilter('rejected')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('rejected')
                    ? 'bg-red-50 text-red-700 border border-red-200 border-2 border-red-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Rejected
                </button>
                <button
                  onClick={() => toggleAuditFilter('dropped')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('dropped')
                    ? 'bg-gray-200 text-gray-800 border-2 border-gray-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Dropped
                </button>
                <button
                  onClick={() => toggleAuditFilter('no-show')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('no-show')
                    ? 'bg-purple-50 text-purple-700 border border-purple-200 border-2 border-purple-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  No Show
                </button>

                {/* Healthy Filter */}
                <button
                  onClick={() => toggleAuditFilter('healthy')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${auditFilters.has('healthy')
                    ? 'bg-green-50 text-green-700 border border-green-200 border-2 border-green-400 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  Healthy Only
                </button>
              </div>
            </div>
          </div>

          {/* Minimal Enterprise Audit Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left" colSpan={7}>
                      <div className="flex items-center gap-4 text-sm font-medium text-gray-900">
                        <div className="w-[260px] flex-shrink-0 pl-1">Candidate</div>
                        <div className="w-[280px] flex-shrink-0">Stage</div>
                        <div className="w-[220px] flex-shrink-0">Progress</div>
                        <div className="w-[220px] flex-shrink-0">Scores</div>
                        <div className="w-[200px] flex-shrink-0">Audit</div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredCandidates.map((candidate, index) => {
                    const feedbackStatus = getFeedbackStatus(candidate);
                    const auditStatus = auditStatusMap.get(candidate.id) || getAuditStatus(candidate);

                    return (
                      <OptimizedCandidateRow
                        key={candidate.id}
                        candidate={candidate}
                        index={index}
                        boardStages={BOARD_STAGES}
                        auditStatus={auditStatus}
                        feedbackStatus={feedbackStatus}
                        onViewProfile={onViewProfile}
                        onRowClick={(candidate) => {
                          setSelectedCandidateTimeline(candidate);
                          setShowTimelineDrawer(true);
                        }}
                      />
                    );
                  })}
                </tbody>
              </table>
              {filteredCandidates.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                  <Search className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm">
                    {searchQuery || stageFilter ? 'No candidates match your filters' : 'No candidates found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Single Candidate Status Modal */}


      {/* Bulk Move Confirmation Modal */}

      {/* HM Review Modal - REPLACED WITH NEW COMPONENT */}
      <HMReviewModal
        show={showHMReviewModal}
        candidate={selectedCandidateForHMReview}
        onClose={() => {
          setShowHMReviewModal(false);
          setSelectedCandidateForHMReview(null);
        }}
        onSubmit={handleHMReviewSubmit}
      />

      {/* HM Feedback View Modal - READ-ONLY */}
      {showHMFeedbackModal && selectedCandidateForFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">HM Review Feedback</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Candidate Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`https://i.pravatar.cc/150?u=${selectedCandidateForFeedback.id}`}
                    className="w-10 h-10 rounded-full border border-gray-200"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedCandidateForFeedback.name}</h4>
                    <p className="text-sm text-gray-600">{selectedCandidateForFeedback.jobTitle || 'AI Lead'}</p>
                  </div>
                </div>
              </div>

              {/* Review Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Status</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedCandidateForFeedback.hmReview?.hmDecision === 'Approve' && (
                    <span className="inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                      Approved
                    </span>
                  )}
                  {selectedCandidateForFeedback.hmReview?.hmDecision === 'Reject' && (
                    <span className="inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                      âŒ Rejected
                    </span>
                  )}
                  {selectedCandidateForFeedback.hmReview?.hmDecision === 'On Hold' && (
                    <span className="inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      â¸ï¸ On Hold
                    </span>
                  )}
                </div>
              </div>

              {/* Review Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By</label>
                  <p className="text-sm text-gray-900">{selectedCandidateForFeedback.hmReview?.reviewedBy || selectedCandidateForFeedback.hiringManager || 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed On</label>
                  <p className="text-sm text-gray-900">{selectedCandidateForFeedback.hmReview?.reviewedOn || 'N/A'}</p>
                </div>
              </div>

              {/* Feedback Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedCandidateForFeedback.hmReview?.hmFeedback || 'No feedback provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowHMFeedbackModal(false);
                  setSelectedCandidateForFeedback(null);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Timeline Drawer */}
      {showTimelineDrawer && selectedCandidateTimeline && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => {
              setShowTimelineDrawer(false);
              setSelectedCandidateTimeline(null);
            }}
          ></div>

          {/* Drawer */}
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={`https://i.pravatar.cc/150?u=${selectedCandidateTimeline.id}`}
                    className="w-14 h-14 rounded-full border-2 border-blue-200"
                    alt={selectedCandidateTimeline.name}
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedCandidateTimeline.name}</h2>
                    <p className="text-sm text-gray-600">{selectedCandidateTimeline.jobTitle || 'AI Lead'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Applied: {selectedCandidateTimeline.appliedDate}</span>
                      <span className="text-xs text-gray-400">â€¢</span>
                      <span className={`text-xs font-medium ${selectedCandidateTimeline.aging > 14 ? 'text-red-600' :
                        selectedCandidateTimeline.aging > 7 ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                        {selectedCandidateTimeline.aging}d in current stage
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTimelineDrawer(false);
                    setSelectedCandidateTimeline(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-1">
                {/* Active Stages Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Pipeline</h3>

                  {BOARD_STAGES.filter(stage => !TERMINAL_OUTCOMES.includes(stage)).map((stage, index) => {
                    const stageStatus = getStageStatus(stage, selectedCandidateTimeline);
                    const stageHistory = generateMockStageHistory(selectedCandidateTimeline);
                    const stageData = stageHistory.find(h => h.stage === stage);
                    const isLast = index === BOARD_STAGES.filter(s => !TERMINAL_OUTCOMES.includes(s)).length - 1;

                    return (
                      <div key={stage} className="relative">
                        {/* Timeline Line */}
                        {!isLast && (
                          <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${stageStatus === 'completed' ? 'bg-green-300' :
                            stageStatus === 'current' ? 'bg-blue-300' :
                              stageStatus === 'skipped' ? 'bg-red-200' :
                                'bg-gray-200'
                            }`}></div>
                        )}

                        {/* Stage Item */}
                        <div className={`relative flex gap-4 pb-6 ${stageStatus === 'current' ? 'bg-blue-50/50 -mx-4 px-4 py-3 rounded-lg' : ''
                          }`}>
                          {/* Stage Icon */}
                          <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${stageStatus === 'completed'
                            ? 'bg-green-100 border-green-400 text-green-700' :
                            stageStatus === 'current'
                              ? 'bg-blue-100 border-blue-400 text-blue-700 ring-4 ring-blue-100' :
                              stageStatus === 'skipped'
                                ? 'bg-red-50 border-red-300 text-red-600' :
                                'bg-gray-50 border-gray-300 text-gray-400'
                            }`}>
                            {stageStatus === 'completed' && <Check className="w-4 h-4" />}
                            {stageStatus === 'current' && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
                            {stageStatus === 'skipped' && <X className="w-4 h-4" />}
                            {stageStatus === 'pending' && <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                          </div>

                          {/* Stage Content */}
                          <div className="flex-1 min-w-0">
                            {/* Stage Name & Status */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <h4 className={`text-sm font-semibold ${stageStatus === 'current' ? 'text-blue-900' :
                                  stageStatus === 'completed' ? 'text-gray-900' :
                                    stageStatus === 'skipped' ? 'text-red-700' :
                                      'text-gray-500'
                                  }`}>
                                  {stage}
                                </h4>
                                {stageStatus === 'current' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium rounded border border-blue-200 mt-1">
                                    Current Stage
                                  </span>
                                )}
                                {stageStatus === 'skipped' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-medium rounded border border-red-200 mt-1">
                                    Skipped
                                  </span>
                                )}
                              </div>

                              {stageData && stageStatus !== 'pending' && (
                                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                  {stageData.duration}d
                                </span>
                              )}
                            </div>

                            {/* Stage Details - Only for completed and current */}
                            {stageData && (stageStatus === 'completed' || stageStatus === 'current') && (
                              <div className="space-y-2 mt-2">
                                {/* Timestamp & User */}
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(stageData.timestamp).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <LucideUser className="w-3 h-3" />
                                    <span>{stageData.movedBy}</span>
                                  </div>
                                </div>

                                {/* Score */}
                                {stageData.score && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Score:</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stageData.score >= 80 ? 'bg-green-50 text-green-700 border border-green-200' :
                                      stageData.score >= 60 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                        'bg-red-50 text-red-700 border border-red-200'
                                      }`}>
                                      {stageData.score}%
                                    </span>
                                  </div>
                                )}

                                {/* Feedback */}
                                {stageData.hasFeedback ? (
                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-1 mb-1">
                                      <MessageSquare className="w-3 h-3 text-gray-500" />
                                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Feedback</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed">
                                      {stageData.feedback}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-xs text-amber-600">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>No feedback provided</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Pending State Message */}
                            {stageStatus === 'pending' && (
                              <p className="text-xs text-gray-400 mt-1">Pending</p>
                            )}

                            {/* Skipped State Message */}
                            {stageStatus === 'skipped' && (
                              <p className="text-xs text-red-600 mt-1">This stage was skipped in the process</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Terminal Outcomes Section */}
                <div className="pt-4 border-t-2 border-gray-300">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Terminal Outcomes</h3>

                  {TERMINAL_OUTCOMES.map((stage, index) => {
                    const stageStatus = getStageStatus(stage, selectedCandidateTimeline);
                    const isActive = stage === selectedCandidateTimeline.stage;

                    return (
                      <div key={stage} className={`relative flex gap-4 pb-4 ${isActive ? 'bg-red-50/50 -mx-4 px-4 py-3 rounded-lg' : ''
                        }`}>
                        {/* Stage Icon */}
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive
                          ? 'bg-red-100 border-red-400 text-red-700 ring-4 ring-red-100' :
                          'bg-gray-50 border-gray-300 text-gray-400'
                          }`}>
                          {isActive ? <XCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                        </div>

                        {/* Stage Content */}
                        <div className="flex-1">
                          <h4 className={`text-sm font-semibold ${isActive ? 'text-red-900' : 'text-gray-500'
                            }`}>
                            {stage}
                          </h4>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-medium rounded border border-red-200 mt-1">
                              Current Status
                            </span>
                          )}
                          {!isActive && (
                            <p className="text-xs text-gray-400 mt-1">Not applicable</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* On Hold Status */}
                {selectedCandidateTimeline.status === CandidateStatus.ON_HOLD && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <h4 className="text-sm font-semibold text-blue-900">On Hold</h4>
                    </div>
                    <p className="text-xs text-blue-700">
                      {selectedCandidateTimeline.onHoldReason || 'This candidate\'s application is currently on hold.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Read-only timeline view
                </div>
                <button
                  onClick={() => onViewProfile(selectedCandidateTimeline.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STAGE JUMP MODAL ==================== */}
      <StageJumpModal
        show={showStageJumpModal}
        candidates={selectedCandidatesForJump}
        direction={jumpDirection}
        targetStage={targetJumpStage}
        feedback={jumpFeedback}
        assignmentScore={jumpAssignmentScore}
        availableStages={
          selectedCandidatesForJump.length > 0
            ? jumpDirection === 'forward'
              ? getAvailableForwardStages(selectedCandidatesForJump[0])
              : getAvailableBackwardStages(selectedCandidatesForJump[0])
            : []
        }
        onClose={() => {
          setShowStageJumpModal(false);
          setSelectedCandidatesForJump([]);
          setTargetJumpStage(null);
          setJumpFeedback('');
          setJumpAssignmentScore('');
        }}
        onTargetStageChange={setTargetJumpStage}
        onFeedbackChange={setJumpFeedback}
        onAssignmentScoreChange={setJumpAssignmentScore}
        onExecute={executeStageJump}
      />

      {/* ==================== STATUS ACTION MODAL ==================== */}
      <StatusActionModal
        show={showStatusActionModal}
        candidate={selectedStatusCandidate}
        action={selectedStatusAction}
        reason={statusReason}
        onClose={() => {
          setShowStatusActionModal(false);
          setSelectedStatusCandidate(null);
          setSelectedStatusAction(null);
          setStatusReason('');
        }}
        onReasonChange={setStatusReason}
        onExecute={async () => {
          if (!selectedStatusCandidate || !selectedStatusAction || !statusReason.trim()) return;

          let newStage: InterviewStage;
          if (selectedStatusAction === 'Reject') newStage = InterviewStage.REJECTED;
          else if (selectedStatusAction === 'Drop') newStage = InterviewStage.DROPPED;
          else if (selectedStatusAction === 'Hold') newStage = InterviewStage.ON_HOLD;
          else return;

          try {
            await CandidateService.updateCandidateStage({
              candidateId: selectedStatusCandidate.id,
              newStage,
              userId: currentUser?.id || 'admin',
              reason: statusReason.trim()
            });

            // Update local state to immediately show in UI
            setCandidates(prev => prev.map(c => c.id === selectedStatusCandidate.id ? { ...c, stage: newStage } : c));
          } catch (err) {
            console.error('Failed to update status:', err);
            // Could add toast notification here, optionally handled by the service in the future
          } finally {
            setShowStatusActionModal(false);
            setSelectedStatusCandidate(null);
            setSelectedStatusAction(null);
            setStatusReason('');
          }
        }}
      />

      {/* ==================== FEEDBACK REVIEW MODAL ==================== */}
      <FeedbackReviewModal
        show={showFeedbackReviewModal}
        candidate={selectedFeedbackCandidate}
        stage={selectedFeedbackStage}
        feedbackData={
          selectedFeedbackCandidate && selectedFeedbackStage
            ? getStageFeedback(selectedFeedbackCandidate, selectedFeedbackStage)
            : { exists: false, feedback: '', isEmpty: true }
        }
        stageHistory={selectedFeedbackCandidate?.stageHistory}
        onClose={() => {
          setShowFeedbackReviewModal(false);
          setSelectedFeedbackCandidate(null);
          setSelectedFeedbackStage(null);
        }}
      />
      {/* ==================== INTERVIEWER PICKER MODAL ==================== */}
      {showInterviewerPicker && interviewerPickerCandidate && interviewerPickerStage && (() => {
        const assignees = getStageAssignees(interviewerPickerStage);
        const stageName = interviewerPickerStage;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Select Interviewer</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Multiple interviewers are assigned to <span className="font-medium text-blue-600">{stageName}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowInterviewerPicker(false);
                    setInterviewerPickerCandidate(null);
                    setInterviewerPickerStage(null);
                    setSelectedInterviewerUserId(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Candidate info */}
              <div className="bg-blue-50 rounded-lg px-4 py-2.5 mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(interviewerPickerCandidate.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">{interviewerPickerCandidate.name || 'Candidate'}</p>
                  <p className="text-xs text-blue-600">moving → {stageName}</p>
                </div>
              </div>

              {/* Assignee list */}
              <div className="space-y-2 mb-6">
                {assignees.map(assignee => (
                  <button
                    key={assignee.id}
                    onClick={() => setSelectedInterviewerUserId(assignee.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedInterviewerUserId === assignee.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${selectedInterviewerUserId === assignee.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {assignee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{assignee.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{assignee.role}</p>
                    </div>
                    {selectedInterviewerUserId === assignee.id && (
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowInterviewerPicker(false);
                    setInterviewerPickerCandidate(null);
                    setInterviewerPickerStage(null);
                    setSelectedInterviewerUserId(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedInterviewerUserId}
                  onClick={() => {
                    if (!selectedInterviewerUserId) return;
                    // Close picker, proceed with stage jump modal
                    setShowInterviewerPicker(false);
                    setSelectedCandidatesForJump([interviewerPickerCandidate]);
                    setJumpDirection(pickerDirection);
                    setTargetJumpStage(interviewerPickerStage);
                    setJumpFeedback('');
                    setJumpAssignmentScore('');
                    // Store chosen interviewer in feedback prefix (will be visible in pipeline)
                    const chosen = assignees.find(a => a.id === selectedInterviewerUserId);
                    if (chosen) setJumpFeedback(`Assigned to: ${chosen.name} (${chosen.role})\n`);
                    setShowStageJumpModal(true);
                    setInterviewerPickerCandidate(null);
                    setInterviewerPickerStage(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm & Continue
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default PipelineBoard;
