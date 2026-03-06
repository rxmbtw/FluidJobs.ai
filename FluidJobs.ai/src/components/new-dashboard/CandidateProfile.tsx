import React from 'react';
import { ArrowLeft, Download, Mail, Phone, Linkedin, FileText, UserMinus, MapPin, Calendar, Building, DollarSign, User, Clock, Briefcase, Check, X, AlertCircle, MessageSquare, XCircle, Eye } from 'lucide-react';
import { Candidate, InterviewStage, CandidateStatus } from './types';
import { CandidateService } from '../../services/candidateService';
import { ValidationService } from '../../services';

import { AuditAction, AuditLogEntry } from '../../services/auditService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SuccessModal from '../SuccessModal';

interface CandidateProfileProps {
  candidate: Candidate;
  onBack: () => void;
  onStageUpdate?: (candidateId: string, newStage: string) => void;
  onCandidateUpdate?: (updatedCandidate: Candidate) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({ candidate, onBack, onStageUpdate, onCandidateUpdate, onDirtyChange }) => {
  const [showMoveModal, setShowMoveModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedCandidate, setEditedCandidate] = React.useState<Candidate>(candidate);
  const [displayCandidate, setDisplayCandidate] = React.useState<Candidate>(candidate);
  const [showDiscardModal, setShowDiscardModal] = React.useState(false);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  // Feedback modal for Hiring Timeline "Move to Next Stage"
  const [showTimelineFeedbackModal, setShowTimelineFeedbackModal] = React.useState(false);
  const [timelineFeedbackText, setTimelineFeedbackText] = React.useState('');
  const [isMovingStage, setIsMovingStage] = React.useState(false);

  React.useEffect(() => {
    setDisplayCandidate(candidate);
    setEditedCandidate(candidate);
  }, [candidate]);

  // Check for unsaved changes
  React.useEffect(() => {
    if (!onDirtyChange) return;

    // Simple deep comparison
    const isDirty = isEditing && JSON.stringify(displayCandidate) !== JSON.stringify(editedCandidate);
    onDirtyChange(isDirty);

  }, [isEditing, displayCandidate, editedCandidate, onDirtyChange]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedCandidate({ ...displayCandidate });
  };

  const handleCancelClick = () => {
    setShowDiscardModal(true);
  };

  const handleConfirmDiscard = () => {
    setIsEditing(false);
    setEditedCandidate({ ...displayCandidate });
    setShowDiscardModal(false);
  };

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };



  const handleExportHistory = async (stageName: string) => {
    try {
      // Show loading indicator usually, here just proceed
      const { logs } = await CandidateService.getAuditLogs(candidate.id);

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Candidate History Report: ${candidate.name}`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Stage Context: ${stageName}`, 14, 27);

      const tableData = logs
        .filter(log => (log.action === AuditAction.CANDIDATE_UPDATED || log.action === AuditAction.CANDIDATE_CREATED) && log.newValues)
        .flatMap(log => {
          const date = new Date(log.timestamp).toLocaleString();
          const rows: any[] = [];

          if (log.action === AuditAction.CANDIDATE_CREATED) {
            rows.push([date, 'Creation', '-', 'Candidate Created']);
            return rows;
          }

          // For updates, iterate keys
          const newVals = log.newValues || {};
          const oldVals = log.oldValues || {};

          Object.keys(newVals).forEach(key => {
            const oldVal = oldVals[key];
            const newVal = newVals[key];

            // Skip if no change (redundant check if service does it right, but safe)
            // Also handle nested objects nicely if possible, or just stringify
            const oldStr = typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal !== undefined ? oldVal : '-');
            const newStr = typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal);

            if (oldStr !== newStr) {
              rows.push([date, key, oldStr, newStr]);
            }
          });
          return rows;
        });

      if (tableData.length === 0) {
        alert('No history changes found for this candidate.');
        return;
      }

      autoTable(doc, {
        head: [['Date', 'Field', 'Old Value', 'New Value']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40, fontStyle: 'bold' },
          2: { cellWidth: 50, textColor: [200, 50, 50] }, // Red for old
          3: { cellWidth: 50, textColor: [0, 100, 0], fontStyle: 'bold' } // Green/Bold for new
        }
      });

      doc.save(`${candidate.name.replace(/\s+/g, '_')}_History.pdf`);

    } catch (error) {
      console.error('Failed to generate history PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleConfirmSave = async () => {
    try {
      setIsSaving(true);
      const result = await CandidateService.saveCandidate(editedCandidate);
      if (result.success) {
        setIsEditing(false);
        setIsSaving(false);
        setShowSaveModal(false);

        // Use server response if available to get latest version/timestamps
        const finalCandidate = result.candidate || editedCandidate;

        setDisplayCandidate(finalCandidate);
        setEditedCandidate(finalCandidate); // Also update edited candidate to match latest
        setShowSuccessModal(true);

        // if (onStageUpdate && finalCandidate.currentStage !== candidate.currentStage) {
        //   // If stage changed during edit, notify parent
        //   // onStageUpdate(finalCandidate.id, finalCandidate.currentStage);
        // }

        if (onCandidateUpdate) {
          onCandidateUpdate(finalCandidate);
        }

        // Auto-close success modal after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } else {
        alert('Failed to save candidate: ' + result.error);
        setIsSaving(false);
        setShowSaveModal(false);
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      alert('Failed to save candidate');
      setIsSaving(false);
      setShowSaveModal(false);
    }
  };

  const handleInputChange = (field: keyof Candidate, value: any) => {
    setEditedCandidate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: keyof Candidate, field: string, value: any) => {
    setEditedCandidate(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  // Define the stage progression using the unified enum
  const BOARD_STAGES: string[] = [
    InterviewStage.APPLIED,
    InterviewStage.SCREENING,
    InterviewStage.CV_SHORTLIST,
    InterviewStage.HM_REVIEW,
    InterviewStage.ASSIGNMENT,
    InterviewStage.ASSIGNMENT_RESULT,
    InterviewStage.L1_TECHNICAL,
    InterviewStage.L2_TECHNICAL,
    InterviewStage.L3_TECHNICAL,
    InterviewStage.L4_TECHNICAL,
    InterviewStage.HR_ROUND,
    InterviewStage.MANAGEMENT_ROUND,
    InterviewStage.SELECTED,
    InterviewStage.JOINED,
    InterviewStage.REJECTED,
    InterviewStage.DROPPED,
    InterviewStage.NO_SHOW,
    InterviewStage.ON_HOLD
  ];

  // Terminal outcomes
  const TERMINAL_OUTCOMES: string[] = [
    InterviewStage.REJECTED,
    InterviewStage.DROPPED,
    InterviewStage.NO_SHOW
  ];

  // Helper function: Check if a specific stage has feedback
  const getStageFeedback = (stage: string): {
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

  // Helper function: Check for skipped stages
  const checkSkippedStages = (): { hasSkipped: boolean; skippedStages: string[] } => {
    const currentStageIndex = BOARD_STAGES.indexOf(candidate.currentStage);
    const skippedStages: string[] = [];

    // Check if candidate has stage history
    if (candidate.stageHistory && candidate.stageHistory.length > 0) {
      const visitedStages = new Set(candidate.stageHistory.map(h => h.toStage));

      // Check all stages before current
      for (let i = 0; i < currentStageIndex; i++) {
        const stage = BOARD_STAGES[i];

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

  // Helper function: Generate mock stage history
  const generateMockStageHistory = () => {
    const currentStageIndex = BOARD_STAGES.indexOf(candidate.currentStage);
    const history = [];

    // Calculate aging from lastUpdateDate or appliedDate
    const calculateAging = (): number => {
      const lastUpdate = candidate.lastUpdateDate || candidate.appliedDate;
      if (!lastUpdate) return 0;

      const lastUpdateDate = new Date(lastUpdate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastUpdateDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const aging = calculateAging();

    for (let i = 0; i <= currentStageIndex; i++) {
      const stage = BOARD_STAGES[i];
      const daysAgo = (currentStageIndex - i) * 3 + Math.floor(Math.random() * 3);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const stageFeedback = getStageFeedback(stage);

      history.push({
        stage,
        movedBy: candidate.hiringManager || 'System',
        timestamp: date.toISOString(),
        feedback: stageFeedback.exists ? stageFeedback.feedback : 'No feedback provided',
        hasFeedback: stageFeedback.exists && !stageFeedback.isEmpty,
        score: stage.includes('Technical') || stage === InterviewStage.ASSIGNMENT_RESULT
          ? candidate.assignmentScore || null
          : null,
        duration: i < currentStageIndex ? Math.floor(Math.random() * 5) + 1 : aging
      });
    }

    return history;
  };

  // Helper function: Get stage status for timeline
  const getStageStatus = (stage: string):
    'completed' | 'current' | 'pending' | 'skipped' | 'terminal' => {
    const currentStageIndex = BOARD_STAGES.indexOf(candidate.currentStage);
    const stageIndex = BOARD_STAGES.indexOf(stage);

    if (TERMINAL_OUTCOMES.includes(stage)) {
      return stage === candidate.currentStage ? 'terminal' : 'pending';
    }

    if (stageIndex < currentStageIndex) {
      // Check if stage was skipped
      const skippedCheck = checkSkippedStages();
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

  // Get current stage from candidate
  const getCurrentStage = (): string => {
    return candidate.currentStage;
  };

  // Get next stage
  const getNextStage = (): string => {
    const currentStage = getCurrentStage();
    const currentIndex = BOARD_STAGES.indexOf(currentStage);
    if (currentIndex < BOARD_STAGES.length - 1) {
      return BOARD_STAGES[currentIndex + 1];
    }
    return currentStage;
  };

  // Show the feedback modal first; actual move happens in executeTimelineMove
  const handleMoveToNextStage = () => {
    setTimelineFeedbackText('');
    setShowTimelineFeedbackModal(true);
    setShowMoveModal(false);
  };

  // Execute the actual stage move after feedback is collected
  const executeTimelineMove = async () => {
    try {
      setIsMovingStage(true);
      const user = {
        id: (JSON.parse(sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('superadmin') || '{}')).id || 'current-user',
        name: (JSON.parse(sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('superadmin') || '{}')).name || 'Admin',
        role: 'admin'
      } as any;
      const targetStage = getNextStage();

      const validationResult = ValidationService.validateStageTransition(candidate, targetStage, user);
      if (!validationResult.valid) {
        alert(validationResult.reason || 'Cannot move to next stage');
        setShowTimelineFeedbackModal(false);
        return;
      }

      const feedbackToUse = timelineFeedbackText.trim() || `Moved to ${targetStage} by admin`;

      const result = await CandidateService.updateCandidateStage({
        candidateId: candidate.id,
        newStage: targetStage,
        userId: user.id,
        reason: feedbackToUse
      });

      if (result.success) {
        // Build a new stageHistory entry with the feedback that was just entered
        const newHistoryEntry = {
          toStage: targetStage,
          fromStage: candidate.currentStage,
          stage: targetStage,
          changedBy: user.name,
          movedBy: user.name,
          timestamp: new Date().toISOString(),
          changedAt: new Date().toISOString(),
          reason: feedbackToUse,
          feedback: feedbackToUse,
          hasFeedback: true,
        };

        // Update candidate's stageHistory in-place so the timeline shows the feedback immediately
        if (candidate.stageHistory) {
          (candidate.stageHistory as any[]).push(newHistoryEntry);
        } else {
          (candidate as any).stageHistory = [newHistoryEntry];
        }

        if (onStageUpdate) {
          onStageUpdate(candidate.id, targetStage);
        }
        setShowTimelineFeedbackModal(false);
        setTimelineFeedbackText('');
      } else {
        alert(result.error || 'Failed to update stage');
      }
    } catch (error) {
      console.error('Stage update failed:', error);
      alert('Failed to update candidate stage. Please try again.');
    } finally {
      setIsMovingStage(false);
    }
  };

  // Check if candidate can move to next stage using production validation
  const canMoveToNextStage = (): boolean => {
    const user = { id: 'current-user', name: 'Current User', role: 'admin' } as any; // This should come from auth context
    const targetStage = getNextStage();

    const validationResult = ValidationService.validateStageTransition(candidate, targetStage, user);
    return validationResult.valid;
  };

  // Handle unsaved changes warning for browser actions (refresh/close)
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Logic for browser warning
      // Only warn if editing AND there are changes
      const isDirty = isEditing && JSON.stringify(displayCandidate) !== JSON.stringify(editedCandidate);

      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing, displayCandidate, editedCandidate]);

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Profile Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">

            {/* Edit Actions - Top Right */}
            <div className="absolute top-4 right-4 z-10">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelClick}
                    className="p-2 text-white/90 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
                    title="Discard Changes"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="p-2 text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 rounded-lg transition-all"
                    title="Save Changes"
                  >
                    {isSaving ? (
                      <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="p-2 text-white/90 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
                  title="Edit Profile"
                >
                  <span className="sr-only">Edit</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>

            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-6 pb-8 -mt-12 text-center">
              <img src={`https://picsum.photos/seed/${displayCandidate.id}/200/200`} alt={displayCandidate.name} className="w-24 h-24 rounded-2xl border-4 border-white mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900">{displayCandidate.name}</h2>
              <p className="text-sm font-medium text-slate-500 mb-4">{displayCandidate.position || displayCandidate.jobTitle}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                  {candidate.currentStage}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-100">
                  {candidate.source}
                </span>
                {candidate.isRestricted && (
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-100">
                    RESTRICTED
                  </span>
                )}
                {getCurrentStage() === 'HM Review' && !canMoveToNextStage() && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100">
                    ⚠️ NEEDS HM APPROVAL
                  </span>
                )}
              </div>

              <div className="flex gap-2 justify-center mb-8">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                  <Mail className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
                  <Linkedin className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-left pt-6 border-t border-slate-100">
                {/* Contact Information Section */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Information</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Email</span>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedCandidate.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-48"
                        />
                      ) : (
                        <a href={`mailto:${displayCandidate.email}`} className="text-blue-600 font-bold hover:underline text-xs">
                          {displayCandidate.email}
                        </a>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Mobile</span>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedCandidate.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-48"
                        />
                      ) : (
                        <a href={`tel:${displayCandidate.phone}`} className="text-blue-600 font-bold hover:underline">
                          {displayCandidate.phone}
                        </a>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Current City</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCandidate.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-48"
                        />
                      ) : (
                        <span className="text-slate-900 font-bold">{displayCandidate.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Employment Details Section */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Employment Details</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Profile</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCandidate.jobTitle || editedCandidate.position}
                          onChange={(e) => {
                            handleInputChange('jobTitle', e.target.value);
                            handleInputChange('position', e.target.value);
                          }}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-48"
                        />
                      ) : (
                        <span className="text-slate-900 font-bold text-right">{displayCandidate.position || displayCandidate.jobTitle}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Total Exp</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCandidate.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-20"
                        />
                      ) : (
                        <span className="text-slate-900 font-bold">{candidate.experience}</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Current Company</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCandidate.currentCompany || ''}
                          onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-48"
                          placeholder="Current Company"
                        />
                      ) : (
                        <span className="text-slate-900 font-bold text-right">{candidate.currentCompany || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Last Company</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCandidate.lastWorkingDay || ''}
                          onChange={(e) => handleInputChange('lastWorkingDay', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-48"
                          placeholder="Last Company"
                        />
                      ) : (
                        <span className="text-slate-900 font-bold text-right">{candidate.lastWorkingDay || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Work Mode in Prev Co</span>
                      {isEditing ? (
                        <select
                          value={editedCandidate.modeOfJob || ''}
                          onChange={(e) => handleInputChange('modeOfJob', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="">Select</option>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Remote">Remote</option>
                          <option value="Work From Home">Work From Home</option>
                        </select>
                      ) : (
                        <span className="text-slate-900 font-bold">{candidate.modeOfJob || 'Not specified'}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Working?</span>
                      {isEditing ? (
                        <select
                          value={editedCandidate.currentlyEmployed || ''}
                          onChange={(e) => handleInputChange('currentlyEmployed', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${candidate.currentlyEmployed?.toLowerCase() === 'yes'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                          }`}>
                          {candidate.currentlyEmployed || 'Not specified'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compensation & Availability Section */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Compensation & Availability</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Current CTC</span>
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">₹</span>
                          <input
                            type="number"
                            value={editedCandidate.ctc?.current || 0}
                            onChange={(e) => handleNestedInputChange('ctc', 'current', parseFloat(e.target.value) || 0)}
                            className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-24"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-900 font-bold">{candidate.currentSalary || (candidate.ctc?.currency ? `${candidate.ctc.currency} ${candidate.ctc.current?.toLocaleString() ?? 0}` : 'Not specified')}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Expected CTC</span>
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">₹</span>
                          <input
                            type="number"
                            value={editedCandidate.ctc?.expected || 0}
                            onChange={(e) => handleNestedInputChange('ctc', 'expected', parseFloat(e.target.value) || 0)}
                            className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-24"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-900 font-bold">{candidate.expectedSalary || (candidate.ctc?.currency ? `${candidate.ctc.currency} ${candidate.ctc.expected?.toLocaleString() ?? 0}` : 'Not specified')}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Notice Period</span>
                      {isEditing ? (
                        <select
                          value={editedCandidate.noticePeriod || 'Immediate'}
                          onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="45 Days">45 Days</option>
                          <option value="60 Days">60 Days</option>
                          <option value="90 Days">90 Days</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${candidate.noticePeriod?.toLowerCase() === 'immediate'
                          ? 'bg-green-100 text-green-700'
                          : candidate.noticePeriod?.includes('60') || candidate.noticePeriod?.includes('90')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}>
                          {candidate.noticePeriod}
                        </span>
                      )}
                    </div>
                    {/* Hide Earliest Date of Joining if Notice Period is "Immediate" */}
                    {/* Always show in edit mode if user wants to set it */}
                    {(isEditing || (candidate.noticePeriod?.toLowerCase() !== 'immediate' && candidate.joiningDate)) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Earliest DOJ</span>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editedCandidate.joiningDate || ''}
                            onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                            className="text-right border-b border-gray-300 focus:border-blue-500 outline-none w-32"
                          />
                        ) : (
                          <span className="text-slate-900 font-bold">{candidate.joiningDate}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Additional Information</p>
                  <div className="space-y-2">
                    {candidate.hiringManager && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Hiring Manager</span>
                        <span className="text-slate-900 font-bold flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-purple-600" />
                          {candidate.hiringManager}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Gender</span>
                      {isEditing ? (
                        <select
                          value={editedCandidate.gender || ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span className="text-slate-900 font-bold">{candidate.gender}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Marital Status</span>
                      {isEditing ? (
                        <select
                          value={editedCandidate.maritalStatus || ''}
                          onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                          className="text-right border-b border-gray-300 focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="">Select</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      ) : (
                        <span className="text-slate-900 font-bold">{candidate.maritalStatus}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Application Metadata Section - Reordered */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Application Metadata</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Application Time</span>
                      <span className="text-slate-500 text-xs font-medium">{candidate.applicationDate || candidate.appliedDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Source</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">{candidate.source}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Unique ID</span>
                      <span className="text-slate-400 text-[10px] font-mono select-all cursor-text" title="Click to copy">{candidate.id}</span>
                    </div>
                  </div>
                </div>

                {/* Key Skills Section */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Key Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills?.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resume Score Section */}
                <div className="pb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Resume Score</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-2xl font-bold ${(candidate.resumeScore || 0) >= 80 ? 'text-green-600' :
                      (candidate.resumeScore || 0) >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                      {candidate.resumeScore || 0}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Resume Section - Explicit text labels */}
              {candidate.resumeUrl && (
                <div className="space-y-2 mt-6">
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> View CV
                  </a>
                  <a
                    href={candidate.resumeUrl}
                    download
                    className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download CV
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content: Hiring Timeline & Journey */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold text-slate-900">Hiring Journey Timeline</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMoveModal(true)}
                  disabled={!canMoveToNextStage()}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${canMoveToNextStage()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  title={!canMoveToNextStage() ? 'HM approval required before moving to next stage' : ''}
                >
                  {canMoveToNextStage() ? 'Move to Next Stage' : 'HM Approval Required'}
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"><UserMinus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Enhanced Timeline - All 18 Stages */}
            <div className="space-y-1">
              {/* Active Stages Section */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Pipeline</h4>

                {BOARD_STAGES.filter(stage => !TERMINAL_OUTCOMES.includes(stage)).map((stage, index) => {
                  const stageStatus = getStageStatus(stage);
                  const stageHistory = generateMockStageHistory();
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
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded border border-blue-200 mt-1">
                                  Current Stage
                                </span>
                              )}
                              {stageStatus === 'skipped' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded border border-red-200 mt-1">
                                  Skipped
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              {stageData && stageStatus !== 'pending' && (
                                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                  {stageData.duration}d
                                </span>
                              )}
                              {(stage === 'Screening' || stage === 'CV Shortlist' || stage === 'HM Review') && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleExportHistory(stage); }}
                                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors border border-blue-200"
                                  title="Export update history PDF"
                                >
                                  <FileText className="w-3 h-3" />
                                  Old Data
                                </button>
                              )}
                            </div>
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
                                  <User className="w-3 h-3" />
                                  <span>{stageData.movedBy}</span>
                                </div>
                              </div>

                              {/* Score */}
                              {stageData.score && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Score:</span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stageData.score >= 80 ? 'bg-green-100 text-green-700 border border-green-200' :
                                    stageData.score >= 60 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                      'bg-red-100 text-red-700 border border-red-200'
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
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Terminal Outcomes</h4>

                {TERMINAL_OUTCOMES.map((stage, index) => {
                  const stageStatus = getStageStatus(stage);
                  const isActive = stage === candidate.currentStage;

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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded border border-red-200 mt-1">
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
              {candidate.status === CandidateStatus.ON_HOLD && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-900">On Hold</h4>
                  </div>
                  <p className="text-xs text-blue-700">
                    {candidate.onHoldReason || 'This candidate\'s application is currently on hold.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Internal Comments Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Internal Reviewer Comments</h3>
            <div className="space-y-6 mb-8">
              {candidate.comments && candidate.comments.length > 0 ? (
                candidate.comments.map((comment, i) => (
                  <div key={i} className="flex gap-4">
                    <img src={`https://picsum.photos/seed/user${i}/40/40`} className="w-10 h-10 rounded-full border border-slate-100 flex-shrink-0" />
                    <div className="flex-1 p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-900">Reviewer</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{candidate.appliedDate}</span>
                      </div>
                      <p className="text-sm text-slate-600">{comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">No comments yet</p>
                </div>
              )}
            </div>

            {/* Job Application Status */}
            {candidate.candidateJobStatuses && candidate.candidateJobStatuses.length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Job Application Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.candidateJobStatuses.map((status) => (
                    <span
                      key={`${status.job_id}-${status.status}`}
                      className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${status.status === 'shortlisted'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-400 text-green-900'
                        }`}
                    >
                      {status.status === 'shortlisted' ? 'Shortlisted' : 'Selected'} for: {status.job_title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <img src="https://picsum.photos/seed/user/40/40" className="w-10 h-10 rounded-full border border-slate-100 flex-shrink-0" />
              <div className="flex-1 relative">
                <textarea
                  placeholder="Add an internal note or feedback..."
                  className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                />
                <button className="absolute bottom-3 right-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Move to Next Stage Confirmation Modal */}
        {showMoveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Stage Update</h3>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {canMoveToNextStage() ? (
                    <p className="text-sm text-gray-700">
                      You are about to move <span className="font-semibold">{candidate.name}</span> from <span className="font-semibold">{getCurrentStage()}</span> to <span className="font-semibold">{getNextStage()}</span>.
                      Please confirm after reviewing the candidate details.
                    </p>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 mb-1">Cannot Move to Next Stage</p>
                          <p className="text-sm text-amber-700">
                            This candidate is in HM Review stage and requires hiring manager approval before proceeding to Assignment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show candidate info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Candidate Details:</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{candidate.name}</span>
                        <span className="text-gray-500">{getCurrentStage()} → {getNextStage()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {candidate.jobTitle} • Applied: {candidate.appliedDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setShowMoveModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMoveToNextStage}
                  disabled={!canMoveToNextStage()}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${canMoveToNextStage()
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-500 bg-gray-300 cursor-not-allowed'
                    }`}
                  title={!canMoveToNextStage() ? 'HM approval required' : ''}
                >
                  <Check className="w-4 h-4" />
                  {canMoveToNextStage() ? 'Confirm & Move' : 'HM Approval Required'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discard Changes Modal */}
        {showDiscardModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Discard Changes?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to discard your changes? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDiscardModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={handleConfirmDiscard}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Changes Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Changes?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to save the changes to the candidate profile?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────
            Timeline Stage Move Feedback Modal
            Mirrors the board-view StageJumpModal UX
        ──────────────────────────────────────────────── */}
        {showTimelineFeedbackModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Move to Next Stage</h3>
                    <p className="text-sm text-white/80">{candidate.name} → {getNextStage()}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowTimelineFeedbackModal(false); setTimelineFeedbackText(''); }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Stage info */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-xs font-medium text-gray-400 mb-1">Current</div>
                    <div className="text-sm font-semibold text-gray-900">{candidate.currentStage}</div>
                  </div>
                  <div className="flex items-center text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                    <div className="text-xs font-medium text-blue-400 mb-1">Moving To</div>
                    <div className="text-sm font-semibold text-blue-700">{getNextStage()}</div>
                  </div>
                </div>

                {/* Feedback textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage Notes / Feedback
                    <span className="ml-1 text-xs font-normal text-gray-400">(optional — recorded in audit trail)</span>
                  </label>
                  <textarea
                    value={timelineFeedbackText}
                    onChange={(e) => setTimelineFeedbackText(e.target.value)}
                    rows={4}
                    placeholder={`Add notes about moving ${candidate.name} to ${getNextStage()}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                    autoFocus
                  />
                </div>

                {/* Info banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">This action will update the pipeline stage and create an audit log entry.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 rounded-b-2xl">
                <button
                  onClick={() => { setShowTimelineFeedbackModal(false); setTimelineFeedbackText(''); }}
                  disabled={isMovingStage}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={executeTimelineMove}
                  disabled={isMovingStage}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  {isMovingStage ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Moving...</>
                  ) : (
                    <>Confirm &amp; Move</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Success"
          message="Candidate details updated successfully."
        />

      </div>
    </div>
  );
};

export default CandidateProfile;