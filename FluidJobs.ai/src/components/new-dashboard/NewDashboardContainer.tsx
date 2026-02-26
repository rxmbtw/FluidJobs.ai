import React, { useState, useEffect, useMemo, useCallback, memo, createContext, useContext } from 'react';
import { useNavigate, useLocation, useParams, useBlocker } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Kanban, TrendingUp, Settings, AlertTriangle, UserCircle, ChevronDown, Check } from 'lucide-react';

import AnalyticsWidget from './AnalyticsWidget';
import PipelineBoard from './PipelineBoard';
import CandidateTracker from './CandidateTracker';
import CandidateProfile from './CandidateProfile';
import StageAnalytics from './StageAnalytics';
import JobSettings from './JobSettings';
import ErrorBoundary from './ErrorBoundary';
import { ErrorToastContainer, useErrorHandler } from './ErrorHandler';
import { Candidate, InterviewStage, CandidateStatus } from './types';
import { CandidateService } from '../../services/candidateService';

// Context for hoisting header actions
export interface DashboardHeaderContextType {
  setHeaderActions: (actions: React.ReactNode) => void;
}

export const DashboardHeaderContext = createContext<DashboardHeaderContextType>({
  setHeaderActions: () => { },
});

export const useDashboardHeader = () => useContext(DashboardHeaderContext);

interface NewDashboardContainerProps {
  onBack: () => void;
  isSidebarExpanded?: boolean;
  jobId?: string;
  jobTitle?: string;
}

// Memoized menu item component
const MenuItem = memo(({
  item,
  isActive,
  onClick
}: {
  item: { id: string; label: string; icon: any };
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 border-b-2 transition-colors h-full ${isActive
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
  >
    <item.icon className="w-4 h-4" />
    <span className="text-sm font-medium">{item.label}</span>
  </button>
));

MenuItem.displayName = 'MenuItem';

const NewDashboardContainer: React.FC<NewDashboardContainerProps> = ({ onBack, isSidebarExpanded = false, jobId: propJobId, jobTitle }) => {
  const { view, jobSlug } = useParams<{ view: string; jobSlug: string }>();
  // If view is not present in URL, default to 'executive-summary'
  const activeView = view || 'executive-summary';

  // Role overriding logic
  const originalUser = useMemo(() => {
    return JSON.parse(sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('superadmin') || '{}');
  }, []);
  const originalRole = originalUser?.role?.toLowerCase() || 'recruiter';

  // viewRole overrides the effective role for context-aware testing
  const [viewRole, setViewRole] = useState<string>(originalRole);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const availableRoles = [
    { id: 'superadmin', label: 'Super Admin' },
    { id: 'admin', label: 'Admin' },
    { id: 'interviewer', label: 'Interviewer' },
    { id: 'recruiter', label: 'Recruiter' },
    { id: 'hr', label: 'HR' }
  ];

  // Restrict views based on effective role
  const isLimitedView = viewRole === 'interviewer';

  const navigate = useNavigate();

  // Extract ID from slug (format: id-title-slug or just id)
  // If propJobId is provided (from parent), check if it's a slug or ID.
  const effectiveJobId = useMemo(() => {
    const rawId = propJobId || jobSlug || '';
    // Try to extract ID from start of string (e.g. "42-ai-lead" -> "42")
    const match = rawId.match(/^(\d+)/);
    return match ? match[1] : rawId;
  }, [propJobId, jobSlug]);


  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);

  const { errors, addError, clearErrors } = useErrorHandler();

  // Memoized constants
  // Job Info State
  const [jobInfo, setJobInfo] = useState({
    title: jobTitle || 'Loading...',
    domain: 'Software Development',
    workType: 'Remote',
    schedule: 'Full-time',
    status: 'Active',
    icon: jobTitle ? jobTitle.substring(0, 2).toUpperCase() : 'JO'
  });

  const [jobStages, setJobStages] = useState<any[]>([]);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!effectiveJobId) return;
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/superadmin/jobs/${effectiveJobId}`);
        if (response.ok) {
          const data = await response.json();
          setJobInfo(prev => ({
            ...prev,
            title: data.job_title || data.title || prev.title,
            status: data.status || prev.status,
            domain: data.department || prev.domain,
            workType: data.location_type || prev.workType,
            schedule: data.employment_type || prev.schedule,
            icon: (data.job_title || data.title || 'JO').substring(0, 2).toUpperCase()
          }));

          if (data.stages || data.interview_stages) {
            setJobStages(data.stages || data.interview_stages);
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    fetchJobDetails();
  }, [effectiveJobId]);

  const menuItems = useMemo(() => {
    if (isLimitedView) {
      // Interviewers only get to see the Kanban board and their assigned candidates
      return [
        { id: 'hiring-pipeline', label: 'My Candidates', icon: Kanban }
      ];
    }
    return [
      { id: 'executive-summary', label: 'Executive Summary', icon: BarChart3 },
      { id: 'hiring-pipeline', label: 'Hiring Pipeline', icon: Kanban },
      { id: 'candidate-tracker', label: 'Candidate Tracker', icon: Users },
      { id: 'interview-analytics', label: 'Interview Analytics', icon: TrendingUp },
      { id: 'job-settings', label: 'Job Settings', icon: Settings }
    ]
  }, [isLimitedView]);

  // If role changes to limited and current view is not allowed, redirect
  useEffect(() => {
    if (isLimitedView && activeView !== 'hiring-pipeline' && activeView !== 'profile') {
      handleMenuClick('hiring-pipeline');
    }
  }, [isLimitedView, activeView]);

  // Memoized helper functions
  const getRandomHiringManager = useCallback(() => {
    if (users.length === 0) return 'Not Assigned';
    const hiringManagers = users.filter(user =>
      user.role === 'admin' || user.role === 'superadmin' || user.role === 'hr'
    );
    if (hiringManagers.length === 0) return users[0]?.full_name || 'Not Assigned';
    return hiringManagers[Math.floor(Math.random() * hiringManagers.length)]?.full_name || 'Not Assigned';
  }, [users]);

  const mapStageToBoard = useCallback((currentStage: string): string => {
    return currentStage;
  }, []);

  // Memoized pipeline candidates
  const pipelineCandidates = useMemo(() => {
    return candidates.map(candidate => ({
      ...candidate,
      stage: mapStageToBoard(candidate.currentStage),
      status: candidate.isOnHold ? CandidateStatus.ON_HOLD : CandidateStatus.ACTIVE,
      aging: Math.floor(Math.random() * 20) + 1,
      assignmentScore: Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 60 : undefined,
      interviewer: Math.random() > 0.5 ? 'Mark Chen' : null,
      interviewNote: null,
      hiringManager: getRandomHiringManager(),
      hmReview: mapStageToBoard(candidate.currentStage) === InterviewStage.HM_REVIEW ? {
        reviewStatus: Math.random() > 0.7 ? ('Reviewed' as const) : ('Pending Review' as const),
        hmDecision: Math.random() > 0.7 ? (Math.random() > 0.8 ? ('Reject' as const) : Math.random() > 0.5 ? ('Approve' as const) : ('On Hold' as const)) : undefined,
        hmFeedback: Math.random() > 0.7 ? 'Strong technical background with relevant experience. Good cultural fit.' : undefined,
        reviewedBy: Math.random() > 0.7 ? getRandomHiringManager() : undefined,
        reviewedOn: Math.random() > 0.7 ? new Date().toLocaleString() : undefined
      } : undefined
    }));
  }, [candidates, mapStageToBoard, getRandomHiringManager]);

  // Memoized fetch functions
  const fetchUsers = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      clearErrors();

      const result = await CandidateService.getCandidates(1, 1000);


      if (result.candidates && result.candidates.length > 0) {
        setCandidates(result.candidates);
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);

      addError({
        message: 'Failed to load candidates',
        details: 'Unable to fetch candidate data from the server. Please check your connection and try again.',
        retryable: true,
        onRetry: fetchCandidates
      });

      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [addError, clearErrors]);

  useEffect(() => {
    fetchUsers();
    fetchCandidates();
  }, [fetchUsers, fetchCandidates]);

  const handleViewProfile = useCallback((candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      setSelectedCandidateId(candidateId);
      // For profile view, we might want to keep the current view in URL or have a dedicated profile route.
      // For now, keeping internal state for profile modal/overlay behavior if it was overlay,
      // BUT properly we should navigate.
      // However, looking at the code, 'profile' IS a view.
      // So we should navigate to it. BUT wait, profile needs candidate ID.
      // The current routing structure supports /job-dashboard/:jobId/:view
      // It doesn't easily support /job-dashboard/:jobId/profile/:candidateId unless we add that route.
      // Let's keep profile as internal state for now OR Use a consistent pattern.
      // Given the requirement is about dashboard STAGES (Executive Summary, Pipeline etc), let's stick to those being URL driven.
      // If 'profile' is just a view in the switch, we can map it to 'profile' view but we lose the ID in URL.
      // Let's use query param for candidate? or just keep it internal for now as it wasn't explicitly requested to deep link CANDIDATES within JOB DASHBOARD (only global candidates).
      // actually user asked for "stages like Executive summary , Hiring pipeline , canditate tracker".
      // So let's focus on those.
      // setActiveView('profile'); // Removed as effectiveView handles this via selectedCandidate
    }
  }, [candidates]);



  const handleAddCandidate = useCallback(() => {
    console.log('Add candidate functionality');
  }, []);

  const handleStageUpdate = useCallback(async (candidateId: string, newStage: string) => {
    try {
      const targetStage = newStage as InterviewStage;

      const result = await CandidateService.updateCandidateStage({
        candidateId,
        newStage: targetStage,
        userId: 'current-user-id',
        reason: 'Stage progression via dashboard profile view'
      });

      if (result.success && result.candidate) {
        setCandidates(prev => prev.map(c =>
          c.id === candidateId ? result.candidate! : c
        ));

        if (selectedCandidate && selectedCandidate.id === candidateId) {
          setSelectedCandidate(result.candidate);
        }
      } else {
        addError({
          message: 'Failed to update candidate stage',
          details: result.error || 'An unexpected error occurred while updating the candidate stage.',
          retryable: true,
          onRetry: () => handleStageUpdate(candidateId, newStage)
        });
      }
    } catch (error) {
      console.error('Stage update failed:', error);

      addError({
        message: 'Stage update failed',
        details: error instanceof Error ? error.message : 'Network error occurred. Please check your connection and try again.',
        retryable: true,
        onRetry: () => handleStageUpdate(candidateId, newStage)
      });
    }
  }, [selectedCandidate, addError]);

  // Unsaved changes protection
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null);

  // useBlocker handles all React Router navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isProfileDirty && currentLocation.pathname !== nextLocation.pathname
  );

  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setIsProfileDirty(isDirty);
  }, []);

  // For internal state changes (manual protection)
  const initiateManualNavigation = (action: () => void) => {
    if (isProfileDirty) {
      setPendingNavigationAction(() => action);
      setShowNavigationWarning(true);
    } else {
      action();
    }
  };

  // Helper for both router blocker and manual navigation
  const handleConfirmNavigation = () => {
    setIsProfileDirty(false); // Reset dirty state

    // Handle Router Blocker
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }

    // Handle Manual Internal Navigation
    if (showNavigationWarning) {
      setShowNavigationWarning(false);
      if (pendingNavigationAction) {
        pendingNavigationAction();
        setPendingNavigationAction(null);
      }
    }
  };

  const handleCancelNavigation = () => {
    // Handle Router Blocker
    if (blocker.state === 'blocked') {
      blocker.reset();
    }

    // Handle Manual Internal Navigation
    if (showNavigationWarning) {
      setShowNavigationWarning(false);
      setPendingNavigationAction(null);
    }
  };

  const initiateNavigation = initiateManualNavigation; // Alias for backward compatibility if needed, or just use one.

  const handleMenuClick = useCallback((viewId: string) => {
    // Standard navigation - useBlocker will catch this automatically if dirty
    // But we need to calculate the URL first
    let urlSlug = effectiveJobId || 'default';
    if (jobInfo.title && jobInfo.title !== 'AI Lead') {
      const titleSlug = jobInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (titleSlug) {
        urlSlug = `${effectiveJobId}-${titleSlug}`;
      }
    }

    if (!propJobId && jobSlug) {
      urlSlug = jobSlug;
    }

    navigate(`/superadmin-dashboard/jobs/job-dashboard/${urlSlug}/${viewId}`);
  }, [navigate, effectiveJobId, jobInfo.title, jobSlug, propJobId]);

  const handleBackFromProfile = useCallback(() => {
    // This flips internal state (selectedCandidateId), so useBlocker WON'T see it.
    // We must use manual protection.
    initiateManualNavigation(() => {
      setSelectedCandidateId(null);
      setSelectedCandidate(null);
    });
  }, [isProfileDirty]);

  // Main Back Button (Top Left)
  const handleMainBack = () => {
    initiateManualNavigation(() => {
      onBack();
    });
  };

  const handleCandidateUpdate = useCallback((updatedCandidate: Candidate) => {
    setCandidates(prev => prev.map(c =>
      c.id === updatedCandidate.id ? updatedCandidate : c
    ));
    setSelectedCandidate(updatedCandidate);
  }, []);

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading candidates...</span>
        </div>
      );
    }

    // Determine effective view - if a candidate is selected, show profile regardless of URL view (unless we want to deep link profile too, but for now this hybrid approach works)
    const effectiveView = selectedCandidate ? 'profile' : activeView;

    switch (effectiveView) {
      case 'executive-summary':
        return (
          <ErrorBoundary>
            <AnalyticsWidget />
          </ErrorBoundary>
        );
      case 'hiring-pipeline':
        return (
          <ErrorBoundary>
            <PipelineBoard onViewProfile={handleViewProfile} candidates={pipelineCandidates} users={users} stages={jobStages} />
          </ErrorBoundary>
        );
      case 'candidate-tracker':
        return (
          <ErrorBoundary>
            <CandidateTracker onAddCandidate={handleAddCandidate} onViewProfile={handleViewProfile} />
          </ErrorBoundary>
        );
      case 'profile':
        return selectedCandidate ? (
          <ErrorBoundary>
            <CandidateProfile
              candidate={selectedCandidate}
              onBack={handleBackFromProfile}
              onStageUpdate={handleStageUpdate}
              onCandidateUpdate={handleCandidateUpdate}
              onDirtyChange={handleDirtyChange}
            />
          </ErrorBoundary>
        ) : null;
      case 'interview-analytics':
        return (
          <ErrorBoundary>
            <StageAnalytics />
          </ErrorBoundary>
        );
      case 'job-settings':
        return (
          <ErrorBoundary>
            <JobSettings onDirtyChange={handleDirtyChange} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <AnalyticsWidget />
          </ErrorBoundary>
        );
    }
  }, [loading, activeView, selectedCandidate, handleViewProfile, pipelineCandidates, users, handleAddCandidate, handleBackFromProfile, handleStageUpdate, handleCandidateUpdate, handleDirtyChange, jobStages]);

  // Reset actions when view changes
  useEffect(() => {
    setHeaderActions(null);
  }, [activeView, selectedCandidate]);

  // Clear selected candidate when user navigates to a different tab via URL
  useEffect(() => {
    if (selectedCandidate || selectedCandidateId) {
      setSelectedCandidate(null);
      setSelectedCandidateId(null);
    }
  }, [activeView]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidebarWidth = useMemo(() =>
    isSidebarExpanded ? 'ml-64' : 'ml-20',
    [isSidebarExpanded]
  );

  const showModal = blocker.state === 'blocked' || showNavigationWarning;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <ErrorToastContainer errors={errors} />

      {/* Navigation Warning Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-red-600" />
                {/* Reusing Settings icon or AlertTriangle if imported */}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unsaved Changes</h3>
              <p className="text-gray-500 mb-6">
                You have unsaved changes in the candidate profile. Are you sure you want to leave? Your changes will be lost.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancelNavigation}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Stay on Page
                </button>
                <button
                  onClick={handleConfirmNavigation}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Discard & Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleMainBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Jobs</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{jobInfo.icon}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-gray-900">{jobInfo.title}</h1>

                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {jobInfo.domain}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {jobInfo.workType}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {jobInfo.schedule}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${jobInfo.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {jobInfo.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* View As Hat Toggle */}
              {(originalRole === 'superadmin' || originalRole === 'admin') && (
                <div className="relative ml-8 z-[50]">
                  <button
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                  >
                    <UserCircle className="w-4 h-4 text-gray-500" />
                    <span>View As: <span className="text-blue-600 capitalize">{viewRole}</span></span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isRoleDropdownOpen && (
                    <div className="absolute top-full mt-1 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Simulate Role View
                      </div>
                      <div className="py-1">
                        {availableRoles.map(role => (
                          <button
                            key={role.id}
                            onClick={() => {
                              setViewRole(role.id);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${viewRole === role.id ? 'text-blue-600 bg-blue-50/50 font-medium' : 'text-gray-700'}`}
                          >
                            <span>{role.label}</span>
                            {viewRole === role.id && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {activeView !== 'profile' && (
          <div className="bg-white border-b border-gray-200 flex-shrink-0 flex flex-row justify-between items-center px-6 h-14">
            <div className="flex space-x-1 h-full">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isActive={activeView === item.id}
                  onClick={() => handleMenuClick(item.id)}
                />
              ))}
            </div>
            {/* Hoisted Actions Area */}
            <div id="dashboard-header-actions" className="flex items-center gap-2">
              {headerActions}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <DashboardHeaderContext.Provider value={{ setHeaderActions }}>
            {renderContent}
          </DashboardHeaderContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default memo(NewDashboardContainer);
