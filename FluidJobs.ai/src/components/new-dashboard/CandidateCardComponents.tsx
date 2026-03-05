import React, { useState, useRef, useEffect } from 'react';
import { InterviewStage, PipelineCandidate } from './types';
import { MoreVertical, XCircle, MinusCircle, Clock } from 'lucide-react';

interface CandidateCardSkipBadgeProps {
    candidate: PipelineCandidate;
    skippedStages: string[];
}

export const CandidateCardSkipBadge: React.FC<CandidateCardSkipBadgeProps> = ({ candidate, skippedStages }) => {
    if (skippedStages.length === 0) return null;

    return (
        <div className="group/skip relative inline-block">
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
    );
};

interface CandidateCardActionsProps {
    candidate: PipelineCandidate;
    onViewFeedback: (candidate: PipelineCandidate, stage: string) => void;
    onStatusAction?: (candidate: PipelineCandidate, action: 'Reject' | 'Drop' | 'Hold') => void;
    onMoveStage?: (candidate: PipelineCandidate) => void;
}

export const CandidateCardActions: React.FC<CandidateCardActionsProps> = ({
    candidate,
    onViewFeedback,
    onStatusAction,
    onMoveStage
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isTerminal = ['Rejected', 'Dropped', 'No Show'].includes(candidate.stage);

    return (
        <div className="flex items-center gap-1">
            {/* View Feedback button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onViewFeedback(candidate, candidate.stage);
                }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                title="View Feedback"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>

            {/* Quick Actions Menu */}
            {!isTerminal && onStatusAction && (
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className={`p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-all ${isOpen ? 'bg-gray-100 text-gray-700' : ''}`}
                        title="Quick Actions"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-[60] animate-in fade-in slide-in-from-top-2">
                            {onMoveStage && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        onMoveStage(candidate);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    Move Stage
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    onStatusAction(candidate, 'Reject');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    onStatusAction(candidate, 'Drop');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <MinusCircle className="w-4 h-4" />
                                Drop
                            </button>
                            {candidate.stage !== 'On Hold' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        onStatusAction(candidate, 'Hold');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    Hold
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
