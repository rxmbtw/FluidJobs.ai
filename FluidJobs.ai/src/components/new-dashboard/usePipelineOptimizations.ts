import { useMemo, useCallback } from 'react';
import { PipelineCandidate, InterviewStage } from './types';
import { computeAuditStatus, batchComputeAuditStatus, clearExpiredCache } from './auditUtils';

export function usePipelineOptimizations(
  candidates: PipelineCandidate[],
  searchQuery: string,
  stageFilter: string,
  auditFilters: Set<string>,
  agingFilter: number | null,
  boardStages: string[],
  getStageFeedback: (c: PipelineCandidate, stage: string) => any,
  checkFeedbackViolations: (c: PipelineCandidate) => any
) {
  // Memoize filtered candidates with debounced search
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = searchQuery === '' ||
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.interviewer && candidate.interviewer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (candidate.hiringManager && candidate.hiringManager.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage = !stageFilter || candidate.stage === stageFilter;

      let matchesAuditFilters = true;
      if (auditFilters.size > 0) {
        const auditStatus = computeAuditStatus(
          candidate,
          boardStages,
          getStageFeedback,
          checkFeedbackViolations
        );

        matchesAuditFilters = Array.from(auditFilters).some(filter => {
          switch (filter) {
            case 'missing-feedback':
              return auditStatus.flags.some(f => f.type === 'moved_without_feedback');
            case 'no-owner':
              return auditStatus.flags.some(f => f.type === 'no_hiring_manager');
            case 'low-score':
              return auditStatus.flags.some(f => f.type === 'low_score_advanced');
            case 'skipped-stage':
              return auditStatus.flags.some(f => f.type === 'skipped_stage');
            case 'assignment-gap':
              return auditStatus.flags.some(f => f.type === 'assignment_without_result');
            case 'sla-exceeded':
              return auditStatus.flags.some(f => f.type === 'aging_exceeds_sla');
            case 'critical':
              return auditStatus.status === 'critical';
            case 'warning':
              return auditStatus.status === 'warning';
            case 'healthy':
              return auditStatus.status === 'healthy';
            case 'aging-7':
              return candidate.aging > 7;
            default:
              return true;
          }
        });
      }

      const matchesAging = !agingFilter || candidate.aging > agingFilter;

      return matchesSearch && matchesStage && matchesAuditFilters && matchesAging;
    });
  }, [candidates, searchQuery, stageFilter, auditFilters, agingFilter, boardStages, getStageFeedback, checkFeedbackViolations]);

  // Batch compute audit status for all filtered candidates
  const auditStatusMap = useMemo(() => {
    return batchComputeAuditStatus(
      filteredCandidates,
      boardStages,
      getStageFeedback,
      checkFeedbackViolations
    );
  }, [filteredCandidates, boardStages, getStageFeedback, checkFeedbackViolations]);

  // Memoize health dashboard metrics
  const healthMetrics = useMemo(() => {
    const totalCandidates = filteredCandidates.length;

    const feedbackMissingCount = filteredCandidates.filter(c => {
      const auditStatus = auditStatusMap.get(c.id);
      return auditStatus && auditStatus.feedbackViolations > 0;
    }).length;

    const feedbackMissingPercent = totalCandidates > 0
      ? Math.round((feedbackMissingCount / totalCandidates) * 100)
      : 0;

    const totalAging = filteredCandidates.reduce((sum, c) => sum + (c.aging || 0), 0);
    const avgAging = totalCandidates > 0
      ? Math.round(totalAging / totalCandidates)
      : 0;

    // Find bottleneck stage
    const stageAgingMap = new Map<string, number>();
    filteredCandidates.forEach(c => {
      if (c.aging > 7) {
        const count = stageAgingMap.get(c.stage) || 0;
        stageAgingMap.set(c.stage, count + 1);
      }
    });

    let bottleneckStage = 'None';
    let maxAgingCount = 0;
    stageAgingMap.forEach((count, stage) => {
      if (count > maxAgingCount) {
        maxAgingCount = count;
        bottleneckStage = stage;
      }
    });

    const healthyCount = filteredCandidates.filter(c => {
      const auditStatus = auditStatusMap.get(c.id);
      return auditStatus && auditStatus.status === 'healthy';
    }).length;

    const criticalCount = filteredCandidates.filter(c => {
      const auditStatus = auditStatusMap.get(c.id);
      return auditStatus && auditStatus.status === 'critical';
    }).length;

    const healthyPercent = totalCandidates > 0
      ? Math.round((healthyCount / totalCandidates) * 100)
      : 0;

    const criticalPercent = totalCandidates > 0
      ? Math.round((criticalCount / totalCandidates) * 100)
      : 0;

    return {
      totalCandidates,
      feedbackMissingCount,
      feedbackMissingPercent,
      avgAging,
      bottleneckStage,
      maxAgingCount,
      healthyCount,
      healthyPercent,
      criticalCount,
      criticalPercent
    };
  }, [filteredCandidates, auditStatusMap]);

  // Cleanup expired cache periodically
  const cleanupCache = useCallback(() => {
    clearExpiredCache();
  }, []);

  return {
    filteredCandidates,
    auditStatusMap,
    healthMetrics,
    cleanupCache
  };
}
