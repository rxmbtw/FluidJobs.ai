import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { ArrowLeft, BarChart3, Users, Kanban, TrendingUp, Settings } from 'lucide-react';
import Dashboard from './Dashboard';
import PipelineBoard from './PipelineBoard';
import CandidateTracker from './CandidateTracker';
import CandidateProfile from './CandidateProfile';
import StageAnalytics from './StageAnalytics';
import JobSettings from './JobSettings';
import ErrorBoundary from './ErrorBoundary';
import { ErrorToastContainer, useErrorHandler } from './ErrorHandler';
import { Candidate, InterviewStage, CandidateStatus } from './types';
import { CandidateService } from '../../services/candidateService';

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
    className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${isActive
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
  >
    <item.icon className="w-4 h-4" />
    <span className="text-sm font-medium">{item.label}</span>
  </button>
));

MenuItem.displayName = 'MenuItem';

const NewDashboardContainer: React.FC<NewDashboardContainerProps> = ({ onBack, isSidebarExpanded = false, jobId, jobTitle }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { errors, addError, clearErrors } = useErrorHandler();

  // Memoized constants
  const jobInfo = useMemo(() => ({
    title: jobTitle || 'AI Lead',
    domain: 'Software Development',
    workType: 'Remote',
    schedule: 'Full-time',
    status: 'Active',
    icon: jobTitle ? jobTitle.substring(0, 2).toUpperCase() : 'AI'
  }), [jobTitle]);

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: 'Executive Summary', icon: BarChart3 },
    { id: 'pipeline', label: 'Hiring Pipeline', icon: Kanban },
    { id: 'candidates', label: 'Candidate Tracker', icon: Users },
    { id: 'analytics', label: 'Interview Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Job Settings', icon: Settings }
  ], []);

  // Memoized helper functions
  const getRandomHiringManager = useCallback(() => {
    if (users.length === 0) return 'Not Assigned';
    const hiringManagers = users.filter(user =>
      user.role === 'admin' || user.role === 'superadmin' || user.role === 'hr'
    );
    if (hiringManagers.length === 0) return users[0]?.full_name || 'Not Assigned';
    return hiringManagers[Math.floor(Math.random() * hiringManagers.length)]?.full_name || 'Not Assigned';
  }, [users]);

  const mapStageToBoard = useCallback((currentStage: InterviewStage): InterviewStage => {
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      setActiveView('profile');
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

  const handleBackFromProfile = useCallback(() => {
    setSelectedCandidateId(null);
    setSelectedCandidate(null);
    setActiveView('candidates');
  }, []);

  const handleMenuClick = useCallback((viewId: string) => {
    setActiveView(viewId);
  }, []);

  // Memoized content rendering
  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading candidates...</span>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        );
      case 'pipeline':
        return (
          <ErrorBoundary>
            <PipelineBoard onViewProfile={handleViewProfile} candidates={pipelineCandidates} users={users} />
          </ErrorBoundary>
        );
      case 'candidates':
        return (
          <ErrorBoundary>
            <CandidateTracker onAddCandidate={handleAddCandidate} onViewProfile={handleViewProfile} />
          </ErrorBoundary>
        );
      case 'profile':
        return selectedCandidate ? (
          <ErrorBoundary>
            <CandidateProfile candidate={selectedCandidate} onBack={handleBackFromProfile} onStageUpdate={handleStageUpdate} />
          </ErrorBoundary>
        ) : null;
      case 'analytics':
        return (
          <ErrorBoundary>
            <StageAnalytics />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary>
            <JobSettings />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        );
    }
  }, [loading, activeView, selectedCandidate, handleViewProfile, pipelineCandidates, users, handleAddCandidate, handleBackFromProfile, handleStageUpdate]);

  const sidebarWidth = useMemo(() =>
    isSidebarExpanded ? 'ml-64' : 'ml-20',
    [isSidebarExpanded]
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <ErrorToastContainer errors={errors} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
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
            </div>
          </div>
        </div>

        {activeView !== 'profile' && (
          <div className="bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex space-x-1 px-6">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isActive={activeView === item.id}
                  onClick={() => handleMenuClick(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {renderContent}
        </div>
      </div>
    </div>
  );
};

export default memo(NewDashboardContainer);
