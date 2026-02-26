import React, { memo } from 'react';
import { Minus, CheckCircle, AlertCircle, Info, Clock, Eye, FileText } from 'lucide-react';
import { PipelineCandidate, InterviewStage } from './types';
import { STATUS_COLORS } from './constants';

interface OptimizedCandidateRowProps {
  candidate: PipelineCandidate;
  index: number;
  boardStages: InterviewStage[];
  auditStatus: {
    status: 'healthy' | 'warning' | 'critical';
    reasons: string[];
    feedbackViolations: number;
    flags: Array<{
      type: string;
      severity: 'critical' | 'warning';
      message: string;
      details?: string;
    }>;
    criticalCount: number;
    warningCount: number;
  };
  feedbackStatus: 'submitted' | 'incomplete' | 'pending' | 'missing';
  skippedStages?: InterviewStage[];
  onViewProfile: (id: string) => void;
  onRowClick: (candidate: PipelineCandidate) => void;
  onStageJump?: (candidate: PipelineCandidate, direction: 'forward' | 'backward') => void;
  onViewFeedback?: (candidate: PipelineCandidate, stage: InterviewStage) => void;
}

const OptimizedCandidateRow: React.FC<OptimizedCandidateRowProps> = memo(({
  candidate,
  index,
  boardStages,
  auditStatus,
  feedbackStatus,
  skippedStages = [],
  onViewProfile,
  onRowClick,
  onStageJump,
  onViewFeedback
}) => {
  const currentStageIndex = boardStages.indexOf(candidate.stage as InterviewStage);
  const progressPercentage = ((currentStageIndex + 1) / boardStages.length) * 100;

  // Mock interview scores
  const interviewScores = {
    l1: currentStageIndex >= boardStages.indexOf(InterviewStage.L1_TECHNICAL) ? 85 : null,
    l2: currentStageIndex >= boardStages.indexOf(InterviewStage.L2_TECHNICAL) ? 78 : null,
    l3: currentStageIndex >= boardStages.indexOf(InterviewStage.L3_TECHNICAL) ? 82 : null,
    l4: currentStageIndex >= boardStages.indexOf(InterviewStage.L4_TECHNICAL) ? 90 : null,
  };

  return (
    <tr
      className={`group bg-white border-b border-gray-50 hover:bg-gray-50/50 hover:shadow-sm transition-all duration-200 cursor-pointer`}
      onClick={() => onRowClick(candidate)}
    >
      <td className="px-6 py-4" colSpan={7}>
        <div className="flex items-start gap-4">

          {/* Candidate (260px) */}
          <div className="w-[260px] flex-shrink-0 flex flex-col gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(candidate.id);
              }}
              className="text-left"
            >
              <span className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors duration-[120ms] line-clamp-1">
                {candidate.name}
              </span>
            </button>
            <span className="text-xs text-gray-500">Applied: {candidate.appliedDate}</span>
          </div>

          {/* Stage (280px) */}
          <div className="w-[280px] flex-shrink-0 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${STATUS_COLORS[candidate.stage as InterviewStage]
                ? STATUS_COLORS[candidate.stage as InterviewStage].replace('bg-', 'bg-opacity-50 bg-').replace('border-transparent', '')
                : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                {candidate.stage}
              </span>
              {/* Skip Badge */}
              {skippedStages.length > 0 && (
                <div className="group/skip relative">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full border border-amber-300 animate-in fade-in slide-in-from-left-2 duration-300">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                    {skippedStages.length} Skipped
                  </span>
                  {/* Tooltip */}
                  <div className="absolute z-20 bottom-full mb-2 left-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover/skip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    <div className="font-medium mb-1">Skipped Stages:</div>
                    {skippedStages.map(stage => (
                      <div key={stage} className="text-gray-300">• {stage}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 h-4">
              {/* Feedback Status */}
              {(feedbackStatus === 'missing' || feedbackStatus === 'incomplete') && (
                <div className="flex items-center gap-1 text-amber-600" title="Feedback Needed">
                  <AlertCircle className="w-3 h-3" />
                </div>
              )}

              {/* Aging */}
              <div className="flex items-center gap-1">
                <Clock className={`w-3 h-3 ${candidate.aging > 15 ? 'text-red-500' :
                  candidate.aging > 7 ? 'text-amber-500' :
                    'text-gray-400'
                  }`}
                />
                <span className={`text-[10px] font-medium ${candidate.aging > 15 ? 'text-red-600' :
                  candidate.aging > 7 ? 'text-amber-600' :
                    'text-gray-400'
                  }`}>
                  {candidate.aging}d
                </span>
              </div>
            </div>
          </div>

          {/* Progress (220px) */}
          <div className="w-[220px] flex-shrink-0 flex flex-col gap-1.5 justify-center pt-1">
            <div className="w-[160px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-gray-400 font-medium pl-1">
              Step {currentStageIndex + 1} of {boardStages.length}
            </span>
          </div>

          {/* Scores (220px) */}
          <div className="w-[220px] flex-shrink-0 flex items-center gap-1.5 pt-0.5">
            {[
              { label: 'L1', score: interviewScores.l1 },
              { label: 'L2', score: interviewScores.l2 },
              { label: 'L3', score: interviewScores.l3 },
              { label: 'L4', score: interviewScores.l4 }
            ].map(({ label, score }) => (
              score !== null ? (
                <div key={label} className="group/score relative">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${score >= 80 ? 'bg-green-50 text-green-700 border border-green-200' :
                    score >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {score}
                  </div>
                  <div className="absolute bottom-full mb-2 hidden group-hover/score:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {label}: {score}%
                  </div>
                </div>
              ) : (
                <div key={label} className="w-6 h-6 rounded flex items-center justify-center bg-gray-50 border border-gray-100">
                  <Minus className="w-2.5 h-2.5 text-gray-300" />
                </div>
              )
            ))}
          </div>

          {/* Audit (200px) */}
          <div className="w-[200px] flex-shrink-0 flex flex-col gap-1 items-start">
            {auditStatus.flags.length === 0 ? (
              <div className="h-6 flex items-center">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <CheckCircle className="w-3 h-3" />
                  Healthy
                </span>
              </div>
            ) : (
              <>
                {/* Primary Chip (First Issue) */}
                {(() => {
                  const firstFlag = auditStatus.flags[0];
                  const chipConfig = {
                    moved_without_feedback: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Missing Feedback' },
                    low_score_advanced: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Low Score' },
                    aging_exceeds_sla: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Aging Risk' },
                    no_hiring_manager: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'No Owner' },
                  }[firstFlag.type] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Audit Issue' };

                  return (
                    <div className="group/chip relative">
                      <span className={`inline-flex px-2 py-0.5 ${chipConfig.bg} ${chipConfig.text} text-[10px] font-medium rounded-full border ${chipConfig.border} whitespace-nowrap max-w-[150px] truncate`}>
                        {chipConfig.label}
                      </span>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover/chip:block bg-gray-900 text-white text-xs px-3 py-2 rounded z-10 w-48 whitespace-normal">
                        {firstFlag.message}
                      </div>
                    </div>
                  );
                })()}

                {/* +N Issues Line */}
                {auditStatus.flags.length > 1 && (
                  <span className="text-[10px] text-gray-400 pl-1 font-medium">
                    +{auditStatus.flags.length - 1} more issues
                  </span>
                )}
              </>
            )}
          </div>

          {/* Actions - icon only on hover (Enhanced) */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms] flex items-center gap-1 pr-2">
            {/* Skip Forward */}
            {onStageJump && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStageJump(candidate, 'forward');
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-[120ms] flex items-center justify-center"
                title="Skip Forward"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
            {/* Move Backward */}
            {onStageJump && candidate.stageHistory && candidate.stageHistory.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStageJump(candidate, 'backward');
                }}
                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-[120ms] flex items-center justify-center"
                title="Move Backward"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </button>
            )}
            {/* View Feedback */}
            {onViewFeedback && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewFeedback(candidate, candidate.stage as InterviewStage);
                }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-[120ms] flex items-center justify-center"
                title="View Feedback"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(candidate.id);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-[120ms] flex items-center justify-center"
              title="View Profile"
            >
              <Eye className="w-4 h-4" />
            </button>

          </div>

        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization - only re-render if these specific props change
  return (
    prevProps.candidate.id === nextProps.candidate.id &&
    prevProps.candidate.stage === nextProps.candidate.stage &&
    prevProps.candidate.aging === nextProps.candidate.aging &&
    prevProps.candidate.lastUpdateDate === nextProps.candidate.lastUpdateDate &&
    prevProps.auditStatus.status === nextProps.auditStatus.status &&
    prevProps.auditStatus.flags.length === nextProps.auditStatus.flags.length &&
    prevProps.feedbackStatus === nextProps.feedbackStatus
  );
});

OptimizedCandidateRow.displayName = 'OptimizedCandidateRow';

export default OptimizedCandidateRow;
