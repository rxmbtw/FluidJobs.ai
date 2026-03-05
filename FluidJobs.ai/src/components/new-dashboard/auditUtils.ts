import { InterviewStage, PipelineCandidate, AuditFlag } from './types';

// SLA thresholds per stage (in days)
export const STAGE_SLA: { [key: string]: number } = {
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

export const SCORE_THRESHOLD = 70;

// Memoization cache for audit computations
const auditCache = new Map<string, {
  timestamp: number;
  result: {
    status: 'healthy' | 'warning' | 'critical';
    reasons: string[];
    feedbackViolations: number;
    flags: AuditFlag[];
    criticalCount: number;
    warningCount: number;
  };
}>();

const CACHE_TTL = 5000; // 5 seconds cache

// Generate cache key from candidate
function getCacheKey(candidate: PipelineCandidate): string {
  return `${candidate.id}-${candidate.stage}-${candidate.aging}-${candidate.lastUpdateDate || ''}`;
}

// Clear expired cache entries
export function clearExpiredCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  auditCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => auditCache.delete(key));
}

// Compute audit flags with memoization
export function computeAuditStatus(
  candidate: PipelineCandidate,
  boardStages: string[],
  getStageFeedback: (c: PipelineCandidate, stage: string) => any,
  checkFeedbackViolations: (c: PipelineCandidate) => any
): {
  status: 'healthy' | 'warning' | 'critical';
  reasons: string[];
  feedbackViolations: number;
  flags: AuditFlag[];
  criticalCount: number;
  warningCount: number;
} {
  const cacheKey = getCacheKey(candidate);
  const cached = auditCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const flags: AuditFlag[] = [];

  // Flag 1: Moved without feedback
  const feedbackCheck = checkFeedbackViolations(candidate);
  if (feedbackCheck.hasViolations) {
    flags.push({
      type: 'moved_without_feedback',
      severity: 'critical',
      message: `${feedbackCheck.violations.length} stage(s) missing feedback`,
      details: feedbackCheck.violations.map((v: any) => v.stage).join(', ')
    });
  }

  // Flag 2: Advanced despite low score
  const currentStageIndex = boardStages.indexOf(candidate.stage);
  if (candidate.assignmentScore && candidate.assignmentScore < SCORE_THRESHOLD) {
    const assignmentResultIndex = boardStages.indexOf(InterviewStage.ASSIGNMENT_RESULT);
    if (currentStageIndex > assignmentResultIndex) {
      flags.push({
        type: 'low_score_advanced',
        severity: 'critical',
        message: `Advanced with score < ${SCORE_THRESHOLD}%`,
        details: `Score: ${candidate.assignmentScore}%`
      });
    }
  }

  // Flag 3: Aging exceeds SLA
  const sla = STAGE_SLA[candidate.stage] || 7;
  if (candidate.aging > sla) {
    flags.push({
      type: 'aging_exceeds_sla',
      severity: 'warning',
      message: `Aging exceeds SLA (${candidate.aging}d > ${sla}d)`,
      details: `Current stage: ${candidate.stage}`
    });
  }

  // Flag 4: No hiring manager
  if (!candidate.hiringManager || candidate.hiringManager.trim() === '') {
    flags.push({
      type: 'no_hiring_manager',
      severity: 'warning',
      message: 'No hiring manager assigned',
      details: 'Candidate lacks ownership'
    });
  }

  // Flag 5: Skipped stages
  if (candidate.stageHistory && candidate.stageHistory.length > 0) {
    const visitedStages = new Set(candidate.stageHistory.map(h => h.toStage));
    const skippedStages: string[] = [];

    for (let i = 0; i < currentStageIndex; i++) {
      const stage = boardStages[i];
      if (stage === InterviewStage.SCREENING ||
        stage === InterviewStage.L3_TECHNICAL ||
        stage === InterviewStage.L4_TECHNICAL) {
        continue;
      }
      if (!visitedStages.has(stage)) {
        skippedStages.push(stage);
      }
    }

    if (skippedStages.length > 0) {
      flags.push({
        type: 'skipped_stage',
        severity: 'warning',
        message: `${skippedStages.length} stage(s) skipped`,
        details: skippedStages.join(', ')
      });
    }
  }

  const criticalFlags = flags.filter(f => f.severity === 'critical');
  const warningFlags = flags.filter(f => f.severity === 'warning');

  const reasons = flags.map(f => f.message);
  const feedbackViolations = feedbackCheck.hasViolations ? feedbackCheck.violations.length : 0;

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (criticalFlags.length > 0) {
    status = 'critical';
  } else if (warningFlags.length > 0) {
    status = 'warning';
  }

  const result = {
    status,
    reasons,
    feedbackViolations,
    flags,
    criticalCount: criticalFlags.length,
    warningCount: warningFlags.length
  };

  auditCache.set(cacheKey, {
    timestamp: Date.now(),
    result
  });

  return result;
}

// Batch compute audit status for multiple candidates
export function batchComputeAuditStatus(
  candidates: PipelineCandidate[],
  boardStages: string[],
  getStageFeedback: (c: PipelineCandidate, stage: string) => any,
  checkFeedbackViolations: (c: PipelineCandidate) => any
): Map<string, ReturnType<typeof computeAuditStatus>> {
  const results = new Map();

  for (const candidate of candidates) {
    results.set(
      candidate.id,
      computeAuditStatus(candidate, boardStages, getStageFeedback, checkFeedbackViolations)
    );
  }

  return results;
}
