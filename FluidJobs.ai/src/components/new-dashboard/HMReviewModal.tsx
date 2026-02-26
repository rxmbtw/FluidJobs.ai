import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, AlertCircle, ThumbsUp, ThumbsDown, Minus, User as UserIcon, Calendar, Briefcase } from 'lucide-react';
import { PipelineCandidate } from './types';

interface HMReviewModalProps {
    show: boolean;
    candidate: PipelineCandidate | null;
    onClose: () => void;
    onSubmit: (decision: 'Approve' | 'Reject' | 'On Hold', feedback: string) => void;
}

const QUICK_TAGS = {
    Approve: [
        "Strong Technical Skills",
        "Great Cultural Fit",
        "Good Communication",
        "Relevant Experience",
        "Leadership Potential"
    ],
    Reject: [
        "Lacks Required Experience",
        "Technical Mismatch",
        "Salary Expectations High",
        "Poor Communication",
        "Not Cultural Fit"
    ],
    'On Hold': [
        "Pending clearer requirements",
        "Waiting for other candidates",
        "Candidate requested time",
        "Budget Review"
    ]
};

const NEXT_STEPS = {
    Approve: "Candidate will move to the Assignment stage (or next defined stage). HR will be notified.",
    Reject: "Candidate will be moved to Rejected status. An automated rejection email draft will be prepared.",
    'On Hold': "Candidate remains in current stage but marked as 'On Hold'. Reminders will be paused."
};

export const HMReviewModal: React.FC<HMReviewModalProps> = ({ show, candidate, onClose, onSubmit }) => {
    const [decision, setDecision] = useState<'Approve' | 'Reject' | 'On Hold' | null>(null);
    const [feedback, setFeedback] = useState('');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

    // Reset state when modal opens/closes
    useEffect(() => {
        if (show) {
            setDecision(null);
            setFeedback('');
            setSelectedTags(new Set());
        }
    }, [show, candidate]);

    const handleTagToggle = (tag: string) => {
        const newTags = new Set(selectedTags);
        if (newTags.has(tag)) {
            newTags.delete(tag);
            setFeedback(prev => prev.replace(new RegExp(`\\n?- ${tag}`, 'g'), '').trim());
        } else {
            newTags.add(tag);
            setFeedback(prev => {
                const prefix = prev ? '\n' : '';
                return `${prev}${prefix}- ${tag}`;
            });
        }
        setSelectedTags(newTags);
    };

    const handleSubmit = () => {
        if (decision && feedback) {
            onSubmit(decision, feedback);
        }
    };

    if (!show || !candidate) return null;

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Candidate Review</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Hiring Manager Evaluation</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">

                                {/* Candidate Summary Card */}
                                <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl mb-8">
                                    <div className="relative">
                                        <img
                                            src={`https://i.pravatar.cc/150?u=${candidate.id}`}
                                            alt={candidate.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                                            <div className={`w-3 h-3 rounded-full ${candidate.stage === 'Applied' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                <span>{candidate.jobTitle || 'AI Engineer'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Applied: {candidate.appliedDate}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <UserIcon className="w-3.5 h-3.5" />
                                                <span>Exp: {candidate.experience || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decision Cards */}
                                <div className="mb-8">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Your Decision</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {/* Approve */}
                                        <button
                                            onClick={() => setDecision('Approve')}
                                            className={`relative group p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${decision === 'Approve'
                                                    ? 'border-green-500 bg-green-50/50'
                                                    : 'border-gray-100 hover:border-green-200 hover:bg-green-50/30'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${decision === 'Approve' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 group-hover:bg-green-100 group-hover:text-green-500'
                                                }`}>
                                                <ThumbsUp className="w-5 h-5" />
                                            </div>
                                            <span className={`font-semibold ${decision === 'Approve' ? 'text-green-700' : 'text-gray-600'}`}>Approve</span>
                                            {decision === 'Approve' && (
                                                <div className="absolute top-3 right-3 text-green-500">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>

                                        {/* Reject */}
                                        <button
                                            onClick={() => setDecision('Reject')}
                                            className={`relative group p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${decision === 'Reject'
                                                    ? 'border-red-500 bg-red-50/50'
                                                    : 'border-gray-100 hover:border-red-200 hover:bg-red-50/30'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${decision === 'Reject' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 group-hover:bg-red-100 group-hover:text-red-500'
                                                }`}>
                                                <ThumbsDown className="w-5 h-5" />
                                            </div>
                                            <span className={`font-semibold ${decision === 'Reject' ? 'text-red-700' : 'text-gray-600'}`}>Reject</span>
                                            {decision === 'Reject' && (
                                                <div className="absolute top-3 right-3 text-red-500">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>

                                        {/* On Hold */}
                                        <button
                                            onClick={() => setDecision('On Hold')}
                                            className={`relative group p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${decision === 'On Hold'
                                                    ? 'border-amber-500 bg-amber-50/50'
                                                    : 'border-gray-100 hover:border-amber-200 hover:bg-amber-50/30'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${decision === 'On Hold' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-500'
                                                }`}>
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <span className={`font-semibold ${decision === 'On Hold' ? 'text-amber-700' : 'text-gray-600'}`}>On Hold</span>
                                            {decision === 'On Hold' && (
                                                <div className="absolute top-3 right-3 text-amber-500">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Animated Feedback Section */}
                                <AnimatePresence mode="wait">
                                    {decision && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-6 overflow-hidden"
                                        >
                                            {/* Quick Tags */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-900">Quick Feedback</h4>
                                                    <span className="text-xs text-gray-500">Select to add</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {QUICK_TAGS[decision].map(tag => (
                                                        <button
                                                            key={tag}
                                                            onClick={() => handleTagToggle(tag)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTags.has(tag)
                                                                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Text Area */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Detailed Comments <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    placeholder="Provide specific details about your decision..."
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none min-h-[120px]"
                                                />
                                            </div>

                                            {/* Dynamic Info Box */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-4 rounded-xl border flex gap-3 ${decision === 'Approve' ? 'bg-blue-50 border-blue-100' :
                                                        decision === 'Reject' ? 'bg-red-50 border-red-100' :
                                                            'bg-amber-50 border-amber-100'
                                                    }`}
                                            >
                                                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${decision === 'Approve' ? 'text-blue-600' :
                                                        decision === 'Reject' ? 'text-red-600' :
                                                            'text-amber-600'
                                                    }`} />
                                                <div>
                                                    <h5 className={`text-sm font-semibold mb-1 ${decision === 'Approve' ? 'text-blue-900' :
                                                            decision === 'Reject' ? 'text-red-900' :
                                                                'text-amber-900'
                                                        }`}>What happens next?</h5>
                                                    <p className={`text-xs ${decision === 'Approve' ? 'text-blue-700' :
                                                            decision === 'Reject' ? 'text-red-700' :
                                                                'text-amber-700'
                                                        }`}>
                                                        {NEXT_STEPS[decision]}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Empty State Placeholder when no decision */}
                                {!decision && (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                        <p className="text-gray-400 text-sm">Select a decision above to proceed with the review.</p>
                                    </div>
                                )}

                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 pointer-events-auto">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!decision || !feedback.trim()}
                                    className={`px-6 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all flex items-center gap-2 ${!decision || !feedback.trim()
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : decision === 'Approve'
                                                ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5'
                                                : decision === 'Reject'
                                                    ? 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5'
                                                    : 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                >
                                    {decision === 'Approve' && <Check className="w-4 h-4" />}
                                    {decision === 'Reject' && <X className="w-4 h-4" />}
                                    {decision === 'On Hold' && <Clock className="w-4 h-4" />}
                                    Submit Review
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
