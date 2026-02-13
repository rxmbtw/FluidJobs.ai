import React from 'react';
import { ArrowLeft, Download, Mail, Phone, Linkedin, FileText, UserMinus, MapPin, Calendar, Building, DollarSign, User, Clock, Briefcase, Check, X, AlertCircle, MessageSquare, XCircle, Eye } from 'lucide-react';
import { Candidate, InterviewStage, CandidateStatus } from './types';
import { CandidateService } from '../../services/candidateService';
import { ValidationService } from '../../services';

interface CandidateProfileProps {
  candidate: Candidate;
  onBack: () => void;
  onStageUpdate?: (candidateId: string, newStage: string) => void;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({ candidate, onBack, onStageUpdate }) => {
  const [showMoveModal, setShowMoveModal] = React.useState(false);

  // Define the stage progression using the unified enum
  const BOARD_STAGES = [
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
  const TERMINAL_OUTCOMES = [
    InterviewStage.REJECTED,
    InterviewStage.DROPPED,
    InterviewStage.NO_SHOW
  ];

  // Helper function: Check if a specific stage has feedback
  const getStageFeedback = (stage: InterviewStage): { 
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
  const checkSkippedStages = (): { hasSkipped: boolean; skippedStages: InterviewStage[] } => {
    const currentStageIndex = BOARD_STAGES.indexOf(candidate.currentStage);
    const skippedStages: InterviewStage[] = [];
    
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
          ? candidate.assignmentScore || Math.floor(Math.random() * 30) + 70 
          : null,
        duration: i < currentStageIndex ? Math.floor(Math.random() * 5) + 1 : aging
      });
    }
    
    return history;
  };

  // Helper function: Get stage status for timeline
  const getStageStatus = (stage: InterviewStage): 
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
  const getCurrentStage = (): InterviewStage => {
    return candidate.currentStage;
  };

  // Get next stage
  const getNextStage = (): InterviewStage => {
    const currentStage = getCurrentStage();
    const currentIndex = BOARD_STAGES.indexOf(currentStage);
    if (currentIndex < BOARD_STAGES.length - 1) {
      return BOARD_STAGES[currentIndex + 1];
    }
    return currentStage;
  };

  const handleMoveToNextStage = async () => {
    try {
      // Use production validation
      const user = { id: 'current-user', name: 'Current User', role: 'admin' } as any; // This should come from auth context
      const targetStage = getNextStage();
      
      const validationResult = ValidationService.validateStageTransition(candidate, targetStage, user);
      
      if (!validationResult.valid) {
        alert(validationResult.reason || 'Cannot move to next stage');
        setShowMoveModal(false);
        return;
      }

      const result = await CandidateService.updateCandidateStage({
        candidateId: candidate.id,
        newStage: targetStage,
        userId: user.id,
        reason: 'Manual progression from candidate profile'
      });

      if (result.success) {
        if (onStageUpdate) {
          onStageUpdate(candidate.id, targetStage);
        }
        setShowMoveModal(false);
      } else {
        alert(result.error || 'Failed to update stage');
        setShowMoveModal(false);
      }
    } catch (error) {
      console.error('Stage update failed:', error);
      alert('Failed to update candidate stage. Please try again.');
      setShowMoveModal(false);
    }
  };

  // Check if candidate can move to next stage using production validation
  const canMoveToNextStage = (): boolean => {
    const user = { id: 'current-user', name: 'Current User', role: 'admin' } as any; // This should come from auth context
    const targetStage = getNextStage();
    
    const validationResult = ValidationService.validateStageTransition(candidate, targetStage, user);
    return validationResult.valid;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Profile Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-6 pb-8 -mt-12 text-center">
              <img src={`https://picsum.photos/seed/${candidate.id}/200/200`} alt={candidate.name} className="w-24 h-24 rounded-2xl border-4 border-white mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
              <p className="text-sm font-medium text-slate-500 mb-4">{candidate.jobTitle}</p>

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
                      <a href={`mailto:${candidate.email}`} className="text-blue-600 font-bold hover:underline text-xs">
                        {candidate.email}
                      </a>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Mobile</span>
                      <a href={`tel:${candidate.phone}`} className="text-blue-600 font-bold hover:underline">
                        {candidate.phone}
                      </a>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Current City</span>
                      <span className="text-slate-900 font-bold">{candidate.location}</span>
                    </div>
                  </div>
                </div>

                {/* Employment Details Section */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Employment Details</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Profile</span>
                      <span className="text-slate-900 font-bold text-right">{candidate.position || candidate.jobTitle}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Total Exp</span>
                      <span className="text-slate-900 font-bold">{candidate.experience}</span>
                    </div>
                    {/* Show Current Company if Working? = Yes, otherwise show Last Company */}
                    {candidate.currentlyEmployed?.toLowerCase() === 'yes' ? (
                      candidate.currentCompany && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-medium">Current Company</span>
                          <span className="text-slate-900 font-bold text-right">{candidate.currentCompany}</span>
                        </div>
                      )
                    ) : (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Last Company</span>
                        <span className="text-slate-900 font-bold text-right">{candidate.lastWorkingDay || candidate.currentCompany || 'Not specified'}</span>
                      </div>
                    )}
                    {/* If Current Company is empty but candidate is working, show Last Company as fallback */}
                    {candidate.currentlyEmployed?.toLowerCase() === 'yes' && !candidate.currentCompany && (candidate.lastWorkingDay || candidate.currentCompany) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Last Company</span>
                        <span className="text-slate-900 font-bold text-right">{candidate.lastWorkingDay || 'Not specified'}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Work Mode in Prev Co</span>
                      <span className="text-slate-900 font-bold">{candidate.modeOfJob || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Working?</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        candidate.currentlyEmployed?.toLowerCase() === 'yes' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {candidate.currentlyEmployed || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compensation & Availability Section */}
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Compensation & Availability</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Current CTC</span>
                      <span className="text-slate-900 font-bold">{candidate.currentSalary || `${candidate.ctc.currency} ${candidate.ctc.current.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Expected CTC</span>
                      <span className="text-slate-900 font-bold">{candidate.expectedSalary || `${candidate.ctc.currency} ${candidate.ctc.expected.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Notice Period</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        candidate.noticePeriod?.toLowerCase() === 'immediate' 
                          ? 'bg-green-100 text-green-700' 
                          : candidate.noticePeriod?.includes('60') || candidate.noticePeriod?.includes('90')
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {candidate.noticePeriod}
                      </span>
                    </div>
                    {/* Hide Earliest Date of Joining if Notice Period is "Immediate" */}
                    {candidate.noticePeriod?.toLowerCase() !== 'immediate' && candidate.joiningDate && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Earliest Date of Joining</span>
                        <span className="text-slate-900 font-bold">{candidate.joiningDate}</span>
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
                      <span className="text-slate-900 font-bold">{candidate.gender}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">Marital Status</span>
                      <span className="text-slate-900 font-bold">{candidate.maritalStatus}</span>
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
                     <span className={`text-2xl font-bold ${
                       (candidate.resumeScore || 0) >= 80 ? 'text-green-600' :
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
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    canMoveToNextStage()
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
                        <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${
                          stageStatus === 'completed' ? 'bg-green-300' :
                          stageStatus === 'current' ? 'bg-blue-300' :
                          stageStatus === 'skipped' ? 'bg-red-200' :
                          'bg-gray-200'
                        }`}></div>
                      )}

                      {/* Stage Item */}
                      <div className={`relative flex gap-4 pb-6 ${
                        stageStatus === 'current' ? 'bg-blue-50/50 -mx-4 px-4 py-3 rounded-lg' : ''
                      }`}>
                        {/* Stage Icon */}
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          stageStatus === 'completed' 
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
                              <h4 className={`text-sm font-semibold ${
                                stageStatus === 'current' ? 'text-blue-900' :
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
                                  <User className="w-3 h-3" />
                                  <span>{stageData.movedBy}</span>
                                </div>
                              </div>

                              {/* Score */}
                              {stageData.score && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Score:</span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                    stageData.score >= 80 ? 'bg-green-100 text-green-700 border border-green-200' :
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
                    <div key={stage} className={`relative flex gap-4 pb-4 ${
                      isActive ? 'bg-red-50/50 -mx-4 px-4 py-3 rounded-lg' : ''
                    }`}>
                      {/* Stage Icon */}
                      <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isActive 
                          ? 'bg-red-100 border-red-400 text-red-700 ring-4 ring-red-100' :
                          'bg-gray-50 border-gray-300 text-gray-400'
                      }`}>
                        {isActive ? <XCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                      </div>

                      {/* Stage Content */}
                      <div className="flex-1">
                        <h4 className={`text-sm font-semibold ${
                          isActive ? 'text-red-900' : 'text-gray-500'
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
                     className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${
                       status.status === 'shortlisted'
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
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  canMoveToNextStage()
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

    </div>
  </div>
  );
};

export default CandidateProfile;