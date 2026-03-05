import React, { memo } from 'react';
import { Eye, MoreHorizontal, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { PipelineCandidate, InterviewStage } from './types';

interface VirtualizedCandidateRowProps {
  candidate: PipelineCandidate;
  index: number;
  boardStages: InterviewStage[];
  auditStatus: {
    status: 'healthy' | 'warning' | 'critical';
    reasons: string[];
    feedbackViolations: number;
    flags: any[];
    criticalCount: number;
    warningCount: number;
  };
  feedbackStatus: 'submitted' | 'incomplete' | 'pending' | 'missing';
  latestFeedback: string;
  onViewProfile: (id: string) => void;
  style?: React.CSSProperties;
}

const VirtualizedCandidateRow: React.FC<VirtualizedCandidateRowProps> = memo(({
  candidate,
  index,
  boardStages,
  auditStatus,
  feedbackStatus,
  latestFeedback,
  onViewProfile,
  style
}) => {
  const currentStageIndex = boardStages.indexOf(candidate.stage as InterviewStage);
  const progressPercentage = ((currentStageIndex + 1) / boardStages.length) * 100;

  const getFeedbackIcon = (status: typeof feedbackStatus) => {
    switch (status) {
      case 'submitted':
        return { icon: '🟢', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
      case 'incomplete':
        return { icon: '🟡', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
      case 'pending':
        return { icon: '🟡', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
      case 'missing':
        return { icon: '🔴', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    }
  };

  const feedbackIconData = getFeedbackIcon(feedbackStatus);

  return (
    <tr
      style={style}
      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
        }`}
    >
      {/* Candidate Column */}
      <td className="px-8 py-6 sticky left-0 bg-inherit z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-gray-100 flex-shrink-0">
            {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => onViewProfile(candidate.id)}
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left truncate block max-w-[200px]"
              title={candidate.name}
            >
              {candidate.name}
            </button>
            <p className="text-xs text-gray-500 truncate max-w-[200px]" title={candidate.email}>
              {candidate.email}
            </p>
          </div>
        </div>
      </td>

      {/* Stage Column */}
      <td className="px-6 py-6">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 w-fit">
            {candidate.stage}
          </span>
          <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold w-fit ${candidate.aging <= 3 ? 'bg-gray-100 text-gray-600' :
              candidate.aging <= 7 ? 'bg-yellow-100 text-yellow-700' :
                candidate.aging <= 14 ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
            }`}>
            {candidate.aging}d in stage
          </div>
        </div>
      </td>

      {/* Progress Column */}
      <td className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 min-w-[40px] text-right">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </td>

      {/* Feedback Column */}
      <td className="px-6 py-6">
        <div className="flex flex-col gap-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border w-fit ${feedbackIconData.color} ${feedbackIconData.bgColor} ${feedbackIconData.borderColor}`}>
            <span>{feedbackIconData.icon}</span>
            <span className="capitalize">{feedbackStatus}</span>
          </div>
          {latestFeedback && latestFeedback !== 'No feedback available' && (
            <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[200px]" title={latestFeedback}>
              {latestFeedback}
            </p>
          )}
        </div>
      </td>

      {/* Score Column */}
      <td className="px-6 py-6">
        {candidate.assignmentScore ? (
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${candidate.assignmentScore >= 80 ? 'text-green-600' :
                candidate.assignmentScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
              }`} />
            <span className={`text-sm font-semibold ${candidate.assignmentScore >= 80 ? 'text-green-700' :
                candidate.assignmentScore >= 60 ? 'text-yellow-700' :
                  'text-red-700'
              }`}>
              {candidate.assignmentScore}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      {/* Audit Status Column */}
      <td className="px-6 py-6">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${auditStatus.status === 'healthy' ? 'bg-green-500' :
                auditStatus.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
              }`}
            title={auditStatus.reasons.join(', ') || 'No issues'}
          />
          {auditStatus.criticalCount > 0 && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 bg-red-50 text-red-700 text-[9px] font-bold rounded"
              title={`${auditStatus.feedbackViolations} stage(s) missing feedback`}
            >
              !{auditStatus.feedbackViolations}
            </span>
          )}
          {auditStatus.warningCount > 0 && auditStatus.criticalCount === 0 && (
            <div title={auditStatus.reasons.join(', ')}>
              <AlertTriangle className="w-3 h-3 text-yellow-600" />
            </div>
          )}
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-6 py-6">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onViewProfile(candidate.id)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
            title="View profile"
          >
            <Eye className="w-4 h-4" />
          </button>

        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.candidate.id === nextProps.candidate.id &&
    prevProps.candidate.stage === nextProps.candidate.stage &&
    prevProps.candidate.aging === nextProps.candidate.aging &&
    prevProps.candidate.lastUpdateDate === nextProps.candidate.lastUpdateDate &&
    prevProps.auditStatus.status === nextProps.auditStatus.status &&
    prevProps.feedbackStatus === nextProps.feedbackStatus
  );
});

VirtualizedCandidateRow.displayName = 'VirtualizedCandidateRow';

export default VirtualizedCandidateRow;
