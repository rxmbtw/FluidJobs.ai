import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { PipelineCandidate, InterviewStage } from './types';

interface HMStageChecklistModalProps {
    show: boolean;
    candidates: PipelineCandidate[];
    users: any[]; // Team members assigned to this job
    activeStages: string[]; // Added: the actual pipeline stages for this job
    onClose: () => void;
    onSubmit: (targetStage: string, assignments: { stage: string; interviewerId: string }[]) => Promise<void>;
}

export const HMStageChecklistModal: React.FC<HMStageChecklistModalProps> = ({ show, candidates, users, activeStages, onClose, onSubmit }) => {
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [assignments, setAssignments] = useState<{ [stage: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine remaining stages after HM_REVIEW
    const hmReviewIndex = activeStages.indexOf(InterviewStage.HM_REVIEW);
    const REMAINING_STAGES = hmReviewIndex >= 0
        ? activeStages.slice(hmReviewIndex + 1).filter(s => ![InterviewStage.SELECTED, InterviewStage.JOINED, InterviewStage.REJECTED, InterviewStage.DROPPED, InterviewStage.ON_HOLD].includes(s as InterviewStage))
        : [];

    useEffect(() => {
        if (show) {
            setSelectedStages([]);
            setAssignments({});
            setIsSubmitting(false);
        }
    }, [show]);

    const handleToggleStage = (stage: string) => {
        // Now it's a single select dropdown, but we pretend it's still an array for state compatibility
        setSelectedStages([stage]);
        const newAssignments = { ...assignments };
        setAssignments(newAssignments);
    };

    const isFormValid = selectedStages.length > 0 && selectedStages.every(stage => assignments[stage]);

    const handleSubmit = async () => {
        if (!isFormValid) return;
        setIsSubmitting(true);
        try {
            const targetStage = selectedStages[0];

            const payload = selectedStages.map(stage => ({
                stage,
                interviewerId: assignments[stage]
            }));

            await onSubmit(targetStage, payload);
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to process assignments');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Stage Selection Checklist</h3>
                            <p className="text-sm text-gray-500">Select upcoming technical stages and assign interviewers.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-sm text-blue-800">
                            You are configuring pipeline stages for <strong>{candidates.length} candidate{candidates.length === 1 ? '' : 's'}</strong> moving out of HM Review.
                        </div>

                        <div className="border rounded-xl p-4 border-blue-300 bg-blue-50/30">
                            <label htmlFor="targetStageSelector" className="block text-sm font-medium text-gray-700 mb-2">Target Stage <span className="text-red-500">*</span></label>
                            <select
                                id="targetStageSelector"
                                className="w-full text-sm border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 border bg-white"
                                value={selectedStages[0] || ''}
                                onChange={(e) => handleToggleStage(e.target.value)}
                            >
                                <option value="" disabled>Select the next stage...</option>
                                {REMAINING_STAGES.map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>

                            {selectedStages.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <label htmlFor={`interviewer-select-target`} className="block text-sm font-medium text-gray-700 mb-1">Assign Interviewer / Reviewer <span className="text-red-500">*</span></label>
                                    <select
                                        id={`interviewer-select-target`}
                                        className="w-full text-sm border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 border bg-white"
                                        value={assignments[selectedStages[0]] || ''}
                                        onChange={(e) => setAssignments({ ...assignments, [selectedStages[0]]: e.target.value })}
                                    >
                                        <option value="" disabled>Select a team member...</option>
                                        {users?.map(user => (
                                            <option key={user.id} value={user.id}>{user.name || user.fullName || user.email}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSubmitting}
                            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2 ${!isFormValid || isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                                }`}
                        >
                            {isSubmitting ? 'Processing...' : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Confirm & Move
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
};
