import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Candidate, InterviewStage, CandidateStatus } from './types';
import { STATUS_COLORS } from './constants';
import { useDashboardHeader } from './NewDashboardContainer';
import { CandidateService } from '../../services/candidateService';
import { Search, FileText, Eye, Sparkles, X, Briefcase, User, ChevronLeft, ChevronRight, Clock, UserCheck, Loader2, CheckSquare, Square, Users, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const getToken = () => sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');

interface CandidateAssignment {
  candidate_id: number;
  recruiter_id: number;
  recruiter_name: string;
  assigned_at: string;
}

interface TrackerProps {
  onAddCandidate: () => void;
  onViewProfile: (id: string) => void;
  jobId?: string;
  isReadOnly?: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
}

const CandidateTracker: React.FC<TrackerProps> = ({ onAddCandidate, onViewProfile, jobId, isReadOnly = false }) => {
  const { setHeaderActions } = useDashboardHeader();
  const currentUser = JSON.parse(sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('superadmin') || '{}');
  const isSalesRole = currentUser.role?.toLowerCase() === 'sales';
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Modal states
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [showUnrestrictModal, setShowUnrestrictModal] = useState(false);
  const [restrictReason, setRestrictReason] = useState('');
  const [unrestrictReason, setUnrestrictReason] = useState('');
  const [showJobNotificationModal, setShowJobNotificationModal] = useState(false);
  const [selectedJobForNotification, setSelectedJobForNotification] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [availableJobs] = useState([
    { job_id: 1, job_title: 'Senior Frontend Engineer', locations: 'Remote' },
    { job_id: 2, job_title: 'Product Manager', locations: 'San Francisco' },
    { job_id: 3, job_title: 'Backend Developer', locations: 'New York' }
  ]);

  // ── Batch-select / Claim state (Recruiter role) ────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<CandidateAssignment[]>([]);
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimToast, setClaimToast] = useState('');

  // Current user session - use the currentUser already declared above
  const userRole: string = currentUser.role || '';
  const isRecruiter = userRole === 'Recruiter';
  const isAdminLike = ['Admin', 'SuperAdmin'].includes(userRole);
  const currentUserId: number | null = currentUser.id || null;

  // Active job ID from filters (if recruiter has a job in context)
  const activeJobId = activeFilters.jobId && activeFilters.jobId !== 'all' ? Number(activeFilters.jobId) : null;

  // Helper functions
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Helper function to calculate relative time
  const getRelativeTime = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 30) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper functions from ManageCandidates
  const getPositionFromEmail = (email: string | null | undefined) => {
    const positions = ['Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer'];
    if (!email) return positions[0];
    return positions[email.length % positions.length];
  };

  const getRandomStage = () => {
    const stages = [InterviewStage.SCREENING, InterviewStage.CV_SHORTLISTED, InterviewStage.L1_TECHNICAL, InterviewStage.L2_TECHNICAL, InterviewStage.SELECTED];
    return stages[Math.floor(Math.random() * stages.length)];
  };

  // Fetch candidates from database using CandidateService
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const result = jobId
        ? await CandidateService.getJobCandidates(jobId)
        : (await CandidateService.getCandidates(1, 1000)).candidates;

      if (result && result.length > 0) {
        setCandidates(result);
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.error('CandidateTracker: Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing assignments for the active job
  const fetchAssignments = useCallback(async (jobId: number) => {
    try {
      const res = await axios.get<{ success: boolean; assignments: CandidateAssignment[] }>(
        `${API_URL}/api/candidate-assignments/${jobId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (res.data?.assignments) setAssignments(res.data.assignments);
    } catch (err) {
      console.error('Failed to fetch candidate assignments:', err);
    }
  }, []);

  // Claim selected candidates
  const handleClaim = async () => {
    if (!activeJobId || selectedIds.size === 0) return;
    try {
      setClaimBusy(true);
      const res = await axios.post<{ success: boolean; claimed: number[]; alreadyClaimed: number[]; message: string }>(
        `${API_URL}/api/candidate-assignments/claim`,
        { jobId: activeJobId, candidateIds: Array.from(selectedIds).map(Number) },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setClaimToast(res.data.message || `${selectedIds.size} candidate(s) claimed.`);
      setTimeout(() => setClaimToast(''), 3000);
      setSelectedIds(new Set());
      await fetchAssignments(activeJobId);
    } catch (err) {
      setClaimToast('Failed to claim candidates. Please try again.');
      setTimeout(() => setClaimToast(''), 3000);
    } finally {
      setClaimBusy(false);
    }
  };

  // Toggle single candidate checkbox
  const toggleSelect = (id: string, blocked: boolean) => {
    if (blocked) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select-all on current page
  const toggleSelectAll = (pageIds: string[]) => {
    const allSelected = pageIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  // Get assignment info for a candidate
  const getAssignment = (candidateId: string | number): CandidateAssignment | undefined =>
    assignments.find(a => String(a.candidate_id) === String(candidateId));

  // Sample data fallback
  const loadSampleData = () => {
    const sampleCandidates = [
      {
        id: '1',
        jobId: 'sample-job-1',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        phone: '+1 555-0123',
        jobTitle: 'Senior Frontend Engineer',
        department: 'Engineering',
        source: 'LinkedIn',
        currentStage: InterviewStage.L2_TECHNICAL,
        status: CandidateStatus.ACTIVE,
        hiringManagerId: 'hm-1',
        appliedDate: '2024-03-01',
        lastUpdateDate: '2024-03-20',
        experience: '6.5 Years',
        location: 'Austin, TX (Remote)',
        // Required audit fields
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-20'),
        createdBy: 'system',
        updatedBy: 'system',
        version: 1,
        stageHistory: [],
        cvStatusRecruiter: 'Shortlisted' as const,
        cvStatusHM: 'Shortlisted' as const,
        interviews: {
          l1: { interviewer: 'Mark Chen', date: '2024-03-05', feedbackDate: '2024-03-05', status: 'Cleared' as const, score: 4.5 },
          l2: { interviewer: 'Alice Wong', date: '2024-03-10', feedbackDate: '', status: 'Scheduled' as const },
          l3: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
          l4: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
          hr: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
          management: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
        },
        ctc: { current: 145000, expected: 165000, currency: 'USD' },
        noticePeriod: '30 Days',
        comments: ['Strong React skills'],
        resumeUrl: 'https://example.com/resume1.pdf',
        applicationDate: '2024-03-01',
        gender: 'Female',
        position: 'Senior Frontend Engineer',
        experienceYears: 6.5,
        currentlyEmployed: 'Yes',
        currentCompany: 'Tech Corp Inc.',
        currentSalary: '$145,000',
        expectedSalary: '$165,000',
        maritalStatus: 'Single',
        resumeScore: 85,
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        isRestricted: false,
        candidateJobStatuses: [
          { job_id: 1, job_title: 'Senior Frontend Engineer', status: 'shortlisted' }
        ]
      }
    ];
    setCandidates(sampleCandidates);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Re-fetch assignments when job filter changes
  useEffect(() => {
    if (activeJobId) fetchAssignments(activeJobId);
    else setAssignments([]);
    setSelectedIds(new Set()); // clear selection on job change
  }, [activeJobId, fetchAssignments]);

  useEffect(() => {
    // Don't show Add Candidate button for Sales role (read-only)
    if (isReadOnly || isSalesRole) {
      setHeaderActions(null);
      return;
    }
    
    setHeaderActions(
      <button
        onClick={onAddCandidate}
        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
      >
        Add Candidate
      </button>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions, onAddCandidate, isReadOnly, isSalesRole]);

  const reviewResume = async (candidateId: string) => {
    console.log('AI Resume Review for candidate:', candidateId);
    // Implement AI review functionality
  };

  const handleRestrictCandidate = () => {
    if (restrictReason.trim() && selectedCandidate) {
      console.log('Restricting candidate:', selectedCandidate.name, 'Reason:', restrictReason);
      setShowRestrictModal(false);
      setRestrictReason('');
    }
  };

  const handleUnrestrictCandidate = () => {
    if (unrestrictReason.trim() && selectedCandidate) {
      console.log('Unrestricting candidate:', selectedCandidate.name, 'Reason:', unrestrictReason);
      setShowUnrestrictModal(false);
      setUnrestrictReason('');
    }
  };

  const sendJobNotification = () => {
    if (selectedCandidate && selectedJobForNotification) {
      console.log('Sending job notification to:', selectedCandidate.name, 'for job:', selectedJobForNotification);
      setShowJobNotificationModal(false);
      setSelectedJobForNotification('');
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const q = activeFilters.query?.toLowerCase() || '';
      const matchesQuery = c.name.toLowerCase().includes(q) || c.jobTitle.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);

      const matchesSource = !activeFilters.source || c.source?.toLowerCase() === activeFilters.source.toLowerCase();
      const matchesJob = !activeFilters.jobId || activeFilters.jobId === 'all' || c.jobId?.toString() === activeFilters.jobId.toString();

      // Legacy Filters Logic
      const matchesExperience = !activeFilters.experience || (() => {
        const exp = c.experienceYears || 0;
        const [min, max] = activeFilters.experience.split('-').map(Number);
        if (activeFilters.experience === '8+') return exp >= 8;
        return exp >= min && exp <= (max || 100);
      })();

      const matchesLocation = !activeFilters.location || (c.location || c.currentCompany || '').toLowerCase().includes(activeFilters.location.toLowerCase());

      let matchesDate = true;
      if (activeFilters.fromDate) {
        matchesDate = matchesDate && new Date(c.applicationDate || c.appliedDate) >= new Date(activeFilters.fromDate);
      }
      if (activeFilters.toDate) {
        // Add one day to toDate to make it inclusive/end of day
        const toDate = new Date(activeFilters.toDate);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(c.applicationDate || c.appliedDate) <= toDate;
      }

      return matchesQuery && matchesSource && matchesJob && matchesDate && matchesExperience && matchesLocation;
    }).sort((a, b) => {
      if (activeFilters.sort === 'oldest') {
        return new Date(a.applicationDate || a.appliedDate).getTime() - new Date(b.applicationDate || b.appliedDate).getTime();
      }
      if (activeFilters.sort === 'experience_high') {
        return (b.experienceYears || 0) - (a.experienceYears || 0);
      }
      if (activeFilters.sort === 'experience_low') {
        return (a.experienceYears || 0) - (b.experienceYears || 0);
      }
      // Default Newest
      return new Date(b.applicationDate || b.appliedDate).getTime() - new Date(a.applicationDate || a.appliedDate).getTime();
    });
  }, [candidates, activeFilters]);

  // Pagination calculations
  const paginationInfo = useMemo((): PaginationInfo => {
    const totalItems = filteredCandidates.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startItem,
      endItem
    };
  }, [filteredCandidates.length, currentPage, itemsPerPage]);

  // Get paginated candidates
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationInfo.totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 ${(isReadOnly || isSalesRole) ? 'tracker-readonly' : ''}`}>
      {/* View Only Banner for Sales */}
      {(isReadOnly || isSalesRole) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800 font-medium">View Only Mode - You cannot add or edit candidates</span>
        </div>
      )}
      
      <style>{`
        .tracker-readonly input[type="checkbox"] {
          display: none;
        }
      `}</style>

      {/* Unified Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center gap-3">
        {/* Search - Flex Grow */}
        <div className="relative flex-1 min-w-[240px] w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search candidates by name, email, or skills..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setActiveFilters((prev: any) => ({ ...prev, query: e.target.value }))}
            value={activeFilters.query || ''}
          />
        </div>

        {/* Filters Group - Horizontal Scroll on mobile, Flex wrap on desktop */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">

          {/* Job Filter */}
          <div className="relative">
            <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
            <select
              className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-colors"
              value={activeFilters.jobId || 'all'}
              onChange={(e) => setActiveFilters((prev: any) => ({ ...prev, jobId: e.target.value }))}
            >
              <option value="all">All Jobs</option>
              {availableJobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.job_title}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="relative">
            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
            <select
              className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-colors"
              value={activeFilters.experience || ''}
              onChange={(e) => setActiveFilters((prev: any) => ({ ...prev, experience: e.target.value }))}
            >
              <option value="">Experience</option>
              <option value="0-2">0-2 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5-8">5-8 Years</option>
              <option value="8+">8+ Years</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
            <select
              className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-colors"
              value={activeFilters.source || ''}
              onChange={(e) => setActiveFilters((prev: any) => ({ ...prev, source: e.target.value }))}
            >
              <option value="">Source</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Naukri">Naukri</option>
              <option value="Indeed">Indeed</option>
              <option value="Agency">Agency</option>
              <option value="Referral">Referral</option>
              <option value="Career Page">Career Page</option>
              <option value="Database">Database</option>
            </select>
          </div>

          {/* Location Filter - Input style */}
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <input
              type="text"
              placeholder="Location"
              className="pl-8 pr-3 py-2 w-[140px] bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-gray-300 transition-colors"
              value={activeFilters.location || ''}
              onChange={(e) => setActiveFilters((prev: any) => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden lg:block" />

          {/* Sort Filter */}
          <div className="relative">
            <select
              className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-gray-300 transition-colors"
              onChange={(e) => setActiveFilters((prev: any) => ({ ...prev, sort: e.target.value }))}
              value={activeFilters.sort || 'newest'}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="experience_high">Exp: High-Low</option>
              <option value="experience_low">Exp: Low-High</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>

          {/* Clear Button */}
          {(activeFilters.query || activeFilters.jobId || activeFilters.experience || activeFilters.source || activeFilters.location) && (
            <button
              onClick={() => setActiveFilters({})}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Summary and Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl border border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{paginationInfo.startItem}</span> to{' '}
            <span className="font-medium text-gray-900">{paginationInfo.endItem}</span> of{' '}
            <span className="font-medium text-gray-900">{paginationInfo.totalItems}</span> candidates
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>

        {/* Pagination Controls */}
        {paginationInfo.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {/* Show page numbers with ellipsis for large page counts */}
              {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                let pageNum: number;
                if (paginationInfo.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= paginationInfo.totalPages - 2) {
                  pageNum = paginationInfo.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationInfo.totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Claim toast */}
      {claimToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-lg">
          {claimToast}
        </div>
      )}

      {/* Floating Claim Action Bar */}
      {isRecruiter && activeJobId && selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-2xl px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{selectedIds.size}</span>
            </div>
            <span className="text-sm font-medium text-slate-700">
              {selectedIds.size} candidate{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <button
            onClick={handleClaim}
            disabled={claimBusy}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60"
          >
            {claimBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
            Claim Batch
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recruiter Assignment Info Banner */}
      {(isRecruiter || isAdminLike) && activeJobId && assignments.length > 0 && (
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p className="text-[13px] text-blue-700">
            <span className="font-semibold">{assignments.length}</span> candidates claimed by recruiters for this job.
            {isRecruiter && <span className="ml-1 text-blue-600">Select unclaimed candidates to add them to your batch.</span>}
          </p>
        </div>
      )}

      {/* Clean Enterprise List View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {isRecruiter && activeJobId && (
                  <th className="pl-4 pr-2 py-3 bg-gray-50 w-10">
                    <button
                      onClick={() => toggleSelectAll(paginatedCandidates.map(c => c.id))}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Select all on this page"
                    >
                      {paginatedCandidates.length > 0 && paginatedCandidates.every(c => selectedIds.has(c.id))
                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                )}
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Experience</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">CTC</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Notice Period</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Hiring Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Source</th>
                {(isRecruiter || isAdminLike) && activeJobId && (
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Assigned To</th>
                )}
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCandidates.map((c, index) => {
                // Determine company to display based on Working? status
                let displayCompany = 'Not specified';

                if (c.currentlyEmployed?.toLowerCase() === 'yes') {
                  displayCompany = c.currentCompany || c.lastWorkingDay || 'Not specified';
                } else {
                  displayCompany = c.lastWorkingDay || c.currentCompany || 'Not specified';
                }

                // Calculate aging in days
                const agingDays = Math.floor((new Date().getTime() - new Date(c.applicationDate || c.appliedDate).getTime()) / (1000 * 60 * 60 * 24));

                // Determine audit status color
                const getAuditStatusColor = () => {
                  if (c.isRestricted) return 'bg-red-500';
                  if (c.currentStage === InterviewStage.SELECTED) return 'bg-green-500';
                  if (c.currentStage === InterviewStage.REJECTED) return 'bg-gray-400';
                  if (agingDays > 30) return 'bg-orange-500';
                  return 'bg-blue-500';
                };

                const getAuditStatusText = () => {
                  if (c.isRestricted) return 'Restricted';
                  if (c.currentStage === InterviewStage.SELECTED) return 'Selected';
                  if (c.currentStage === InterviewStage.REJECTED) return 'Rejected';
                  if (agingDays > 30) return 'Aging - Needs attention';
                  return 'Active in pipeline';
                };

                // Assignment info
                const assignment = getAssignment(c.id);
                const isClaimedByMe = assignment && currentUserId && assignment.recruiter_id === currentUserId;
                const isClaimedByOther = assignment && (!currentUserId || assignment.recruiter_id !== currentUserId);
                const isChecked = selectedIds.has(c.id);
                const isBlocked = isRecruiter && !!isClaimedByOther;

                return (
                  <tr
                    key={c.id}
                    className={`group transition-all duration-200 cursor-pointer ${isBlocked ? 'opacity-60' : 'hover:bg-gray-50/50'
                      } ${index !== paginatedCandidates.length - 1 ? 'border-b border-gray-50' : ''} ${isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    onClick={() => !isRecruiter && onViewProfile(c.id)}
                  >
                    {/* CHECKBOX (Recruiter only) */}
                    {isRecruiter && activeJobId && (
                      <td className="pl-4 pr-2 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id, isBlocked); }}>
                        {isClaimedByOther ? (
                          <span title={`Claimed by ${assignment?.recruiter_name}`}><UserCheck className="w-4 h-4 text-slate-300" /></span>
                        ) : (
                          <button className={`transition-colors ${isChecked ? 'text-blue-600' : 'text-gray-300 hover:text-blue-400'}`}>
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                    )}
                    {/* NAME Column */}
                    <td className="px-6 py-4" onClick={() => onViewProfile(c.id)}>
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://picsum.photos/seed/${c.id}/32/32`}
                          className="w-10 h-10 rounded-full ring-2 ring-gray-100 object-cover"
                          alt={c.name}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate" title={c.name}>{c.name}</span>
                          <span className="text-xs text-gray-500 truncate" title={c.jobTitle}>{c.jobTitle}</span>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-900 truncate max-w-[200px]" title={c.email}>{c.email}</span>
                        {c.phone && (
                          <span className="text-xs text-gray-500">{c.phone}</span>
                        )}
                      </div>
                    </td>

                    {/* EXPERIENCE Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-900">{c.experienceYears} Years</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={displayCompany}>
                          {displayCompany}
                        </div>
                      </div>
                    </td>

                    {/* CTC (Current, Expected) Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm text-gray-900">
                          Current: {c.currentSalary || (c.ctc?.current ? `INR ${c.ctc.current.toLocaleString()}` : 'INR 0')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Expected: {c.expectedSalary || (c.ctc?.expected ? `INR ${c.ctc.expected.toLocaleString()}` : 'INR 0')}
                        </div>
                      </div>
                    </td>

                    {/* NOTICE PERIOD Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.noticePeriod?.toLowerCase() === 'immediate' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-gray-50 text-gray-700 border border-gray-100'
                        }`}>
                        {c.noticePeriod || 'Not specified'}
                      </span>
                    </td>

                    {/* HIRING STATUS Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[c.currentStage] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {c.currentStage.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* SOURCE Column */}
                    <td className="px-6 py-4" onClick={() => onViewProfile(c.id)}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {c.source || 'Database'}
                      </span>
                    </td>

                    {/* ASSIGNED TO Column (when job is selected) */}
                    {(isRecruiter || isAdminLike) && activeJobId && (
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {assignment ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${isClaimedByMe
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            <UserCheck className="w-3 h-3" />
                            {isClaimedByMe ? 'You' : assignment.recruiter_name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Unclaimed</span>
                        )}
                      </td>
                    )}

                    {/* ACTIONS Column — 3-dot menu */}
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === c.id ? null : c.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                            title="Actions"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openMenuId === c.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCandidate(c);
                                  setOpenMenuId(null);
                                  setShowRestrictModal(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Restrict
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCandidate(c);
                                  setOpenMenuId(null);
                                  setShowUnrestrictModal(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Unrestrict
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {paginatedCandidates.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Search className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium text-gray-500">No candidates match your current filter criteria.</p>
              {paginationInfo.totalItems > 0 && (
                <p className="text-xs text-gray-400">
                  Try adjusting your filters or changing the page size.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals remain the same for restrict/unrestrict functionality */}
      {showRestrictModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Restrict Candidate</h2>
              <button
                onClick={() => setShowRestrictModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Restricting: <strong>{selectedCandidate.name}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Restriction *</label>
                <textarea
                  value={restrictReason}
                  onChange={(e) => setRestrictReason(e.target.value)}
                  placeholder="Enter reason for restricting this candidate..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleRestrictCandidate}
                disabled={!restrictReason.trim()}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Restrict Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unrestrict Modal */}
      {showUnrestrictModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Unrestrict Candidate</h2>
              <button
                onClick={() => setShowUnrestrictModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Unrestricting: <strong>{selectedCandidate.name}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Unrestriction *</label>
                <textarea
                  value={unrestrictReason}
                  onChange={(e) => setUnrestrictReason(e.target.value)}
                  placeholder="Enter reason for unrestricting this candidate..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleUnrestrictCandidate}
                disabled={!unrestrictReason.trim()}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unrestrict Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Notification Modal */}
      {showJobNotificationModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Send Job Notification</h2>
              <button
                onClick={() => setShowJobNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Sending notification to: <strong>{selectedCandidate.name}</strong> ({selectedCandidate.email})
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
                <select
                  value={selectedJobForNotification}
                  onChange={(e) => setSelectedJobForNotification(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a job</option>
                  {availableJobs.map((job) => (
                    <option key={job.job_id} value={job.job_id.toString()}>
                      {job.job_title} - {job.locations}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={sendJobNotification}
                disabled={!selectedJobForNotification}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateTracker;