import React, { useState, useRef, useEffect } from 'react';
import { X, AlertCircle, MessageSquare, User as LucideUser, ChevronDown, Check, Clock } from 'lucide-react';
import { PipelineCandidate, InterviewStage, StageTransition } from './types';

// Custom Dropdown Component
interface CustomStageDropdownProps {
    value: string | null;
    options: string[];
    onChange: (stage: string) => void;
    placeholder: string;
    direction: 'forward' | 'backward';
}

const CustomStageDropdown: React.FC<CustomStageDropdownProps> = ({
    value,
    options,
    onChange,
    placeholder,
    direction
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isForward = direction === 'forward';
    const accentColor = isForward ? 'blue' : 'amber';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 bg-white border-2 rounded-lg flex items-center justify-between transition-all duration-200 ${isOpen
                    ? isForward
                        ? 'border-blue-500 ring-2 ring-blue-100'
                        : 'border-amber-500 ring-2 ring-amber-100'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {value || placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        } ${isOpen ? (isForward ? 'text-blue-600' : 'text-amber-600') : 'text-gray-400'}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                    {options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No stages available
                        </div>
                    ) : (
                        options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-all duration-150 ${value === option
                                    ? isForward
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'bg-amber-50 text-amber-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span>{option}</span>
                                {value === option && (
                                    <Check
                                        className={`w-4 h-4 ${isForward ? 'text-blue-600' : 'text-amber-600'
                                            }`}
                                    />
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};


interface StageJumpModalProps {
    show: boolean;
    candidate: PipelineCandidate | null;
    direction: 'forward' | 'backward';
    targetStage: string | null;
    feedback: string;
    availableStages: string[];
    onClose: () => void;
    onTargetStageChange: (stage: string) => void;
    onFeedbackChange: (feedback: string) => void;
    onExecute: () => void;
}

export const StageJumpModal: React.FC<StageJumpModalProps> = ({
    show,
    candidate,
    direction,
    targetStage,
    feedback,
    availableStages,
    onClose,
    onTargetStageChange,
    onFeedbackChange,
    onExecute
}) => {
    if (!show || !candidate) return null;

    const isForward = direction === 'forward';
    const headerColor = isForward
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
        : 'bg-gradient-to-r from-amber-600 to-orange-600';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between ${headerColor}`}>
                    <div className="flex items-center gap-3">
                        {isForward ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                {isForward ? 'Skip Forward' : 'Move Backward'}
                            </h3>
                            <p className="text-sm text-white/80">{candidate.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Current Stage Info */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-1">Current Stage</div>
                        <div className="text-sm font-semibold text-gray-900">{candidate.stage}</div>
                    </div>

                    {/* Stage Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isForward ? 'Skip to Stage' : 'Return to Stage'}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <CustomStageDropdown
                            value={targetStage}
                            options={availableStages}
                            onChange={onTargetStageChange}
                            placeholder="Select a stage..."
                            direction={direction}
                        />
                    </div>

                    {/* Reason/Feedback */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isForward ? 'Reason for Skipping' : 'Reason for Moving Back'}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => onFeedbackChange(e.target.value)}
                            rows={4}
                            placeholder={isForward
                                ? 'Explain why this stage is being skipped...'
                                : 'Explain why returning to this stage...'
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This will be recorded in the audit trail
                        </p>
                    </div>

                    {/* Warning for forward skip */}
                    {isForward && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                                Skipping stages will be flagged in audit reports. Ensure proper justification is provided.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onExecute}
                        disabled={!targetStage || !feedback.trim()}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${!targetStage || !feedback.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isForward
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                                : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow-md'
                            }`}
                    >
                        {isForward ? 'Skip Forward' : 'Move Back'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Feedback type categories
export type FeedbackType = 'hm_review' | 'skip' | 'stage_move' | 'assignment' | 'interview' | 'general';


interface FeedbackReviewModalProps {
    show: boolean;
    candidate: PipelineCandidate | null;
    stage: string | null;
    feedbackData: {
        exists: boolean;
        feedback: string;
        isEmpty: boolean;
        timestamp?: string;
        providedBy?: string;
    };
    feedbackType?: FeedbackType;
    stageHistory?: StageTransition[]; // New prop for history
    onClose: () => void;
}

// Helper function to get feedback type display info
const getFeedbackTypeInfo = (type: FeedbackType, stage: string | null) => {
    switch (type) {
        case 'hm_review':
            return {
                label: 'HM Review Feedback',
                color: 'purple',
                bgColor: 'bg-purple-100',
                textColor: 'text-purple-700',
                borderColor: 'border-purple-300',
                icon: '👤'
            };
        case 'skip':
            return {
                label: 'Skip Feedback',
                color: 'amber',
                bgColor: 'bg-amber-100',
                textColor: 'text-amber-700',
                borderColor: 'border-amber-300',
                icon: '⏭️'
            };
        case 'stage_move':
            return {
                label: 'Stage Move Feedback',
                color: 'blue',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-300',
                icon: '➡️'
            };
        case 'assignment':
            return {
                label: 'Assignment Feedback',
                color: 'green',
                bgColor: 'bg-green-100',
                textColor: 'text-green-700',
                borderColor: 'border-green-300',
                icon: '📝'
            };
        case 'interview':
            return {
                label: `${stage || 'Interview'} Feedback`,
                color: 'indigo',
                bgColor: 'bg-indigo-100',
                textColor: 'text-indigo-700',
                borderColor: 'border-indigo-300',
                icon: '💬'
            };
        default:
            return {
                label: 'General Feedback',
                color: 'gray',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-700',
                borderColor: 'border-gray-300',
                icon: '📋'
            };
    }
}

export const FeedbackReviewModal: React.FC<FeedbackReviewModalProps> = ({
    show,
    candidate,
    stage,
    feedbackData,
    feedbackType = 'general',
    stageHistory = [],
    onClose
}) => {
    if (!show || !candidate || !stage) return null;

    // Build a combined list of feedback entries from stageHistory (deduplicated, sorted oldest→newest)
    const feedbackEntries = stageHistory
        .filter(Boolean)
        .map((entry: any) => ({
            stageName: entry.toStage || entry.stage || stage,
            date: entry.timestamp || entry.changedAt || '',
            by: entry.movedBy || entry.changedBy || entry.userName || 'Admin',
            feedback: (entry.reason || entry.feedback || '').trim(),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-white" />
                        <div>
                            <h3 className="text-lg font-semibold text-white">Feedback History</h3>
                            <p className="text-sm text-blue-100">{candidate.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {feedbackEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="text-sm font-medium text-gray-500">No feedback recorded yet</p>
                            <p className="text-xs text-gray-400 mt-1">Feedback will appear here as the candidate progresses through stages.</p>
                        </div>
                    ) : (
                        feedbackEntries.map((entry, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                            >
                                {/* Row 1: stage badge + date */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                        {entry.stageName}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {entry.date
                                            ? new Date(entry.date).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })
                                            : '—'}
                                    </span>
                                </div>

                                {/* Row 2: by */}
                                <div className="flex items-center gap-1.5 mb-2">
                                    <LucideUser className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-500">By <span className="font-medium text-gray-700">{entry.by}</span></span>
                                </div>

                                {/* Row 3: feedback message */}
                                {entry.feedback ? (
                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-3 border border-gray-100">
                                        {entry.feedback}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic bg-white rounded-lg p-3 border border-gray-100">
                                        No feedback provided for this stage move.
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50 rounded-b-2xl flex-shrink-0">
                    <span className="text-xs text-gray-400">{feedbackEntries.length} stage{feedbackEntries.length !== 1 ? 's' : ''} with feedback</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

