import React, { useState, useMemo, useEffect } from 'react';
import { Candidate, InterviewStage, CandidateStatus } from './types';
import { STATUS_COLORS } from './constants';
import GlobalFilters from './GlobalFilters';
import { CandidateService } from '../../services/candidateService';
import { Search, ArrowLeft, Download, Mail, Phone, FileText, Eye, Sparkles, Ban, Check, X, Briefcase, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface TrackerProps {
  onAddCandidate: () => void;
  onViewProfile: (id: string) => void;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
}

const CandidateTracker: React.FC<TrackerProps> = ({ onAddCandidate, onViewProfile }) => {
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
  const [availableJobs] = useState([
    { job_id: 1, job_title: 'Senior Frontend Engineer', locations: 'Remote' },
    { job_id: 2, job_title: 'Product Manager', locations: 'San Francisco' },
    { job_id: 3, job_title: 'Backend Developer', locations: 'New York' }
  ]);

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
      
      console.log('CandidateTracker: Fetching candidates from database...');
      const result = await CandidateService.getCandidates(1, 1000);
      
      if (result.candidates && result.candidates.length > 0) {
        setCandidates(result.candidates);
        console.log(`CandidateTracker: Successfully loaded ${result.candidates.length} candidates from database`);
      } else {
        setCandidates([]);
        console.log('CandidateTracker: No candidates found in database');
      }
    } catch (error) {
      console.error('CandidateTracker: Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

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
      const matchesQuery = c.name.toLowerCase().includes(q) || c.jobTitle.toLowerCase().includes(q);
      const matchesStatus = !activeFilters.status || c.currentStage === activeFilters.status;
      const matchesPosition = !activeFilters.position || c.jobTitle === activeFilters.position;
      const matchesNotice = !activeFilters.notice || c.noticePeriod === activeFilters.notice;
      const matchesLocation = !activeFilters.location || c.location === activeFilters.location;
      return matchesQuery && matchesStatus && matchesPosition && matchesNotice && matchesLocation;
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Candidate Tracker</h1>
          <p className="text-sm text-gray-600">Advanced global search capabilities and candidate management.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddCandidate}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
          >
            Add Candidate
          </button>
        </div>
      </div>

      <GlobalFilters onFilterChange={setActiveFilters} activeFilters={activeFilters} />

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
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      currentPage === pageNum
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

      {/* Clean Enterprise List View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Compensation</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
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
                
                return (
                  <tr
                    key={c.id}
                    className={`group hover:bg-gray-50/50 transition-all duration-200 cursor-pointer ${
                      index !== paginatedCandidates.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                    onClick={() => onViewProfile(c.id)}
                  >
                    {/* Candidate Column - Compact with small avatar */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://picsum.photos/seed/${c.id}/32/32`} 
                          className="w-8 h-8 rounded-full ring-2 ring-gray-100" 
                          alt={c.name}
                        />
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate">{c.name}</span>
                          <span className="text-xs text-gray-500 truncate">{c.position || c.jobTitle}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">{c.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stage Column - PRIMARY FOCAL POINT */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          STATUS_COLORS[c.currentStage] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {c.currentStage.replace(/_/g, ' ')}
                        </span>
                        {/* Aging Badge - Soft and subtle */}
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          agingDays > 30 ? 'bg-orange-50 text-orange-600' :
                          agingDays > 14 ? 'bg-yellow-50 text-yellow-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {agingDays}d ago
                        </span>
                      </div>
                    </td>

                    {/* Experience Column */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{c.experienceYears} yrs</span>
                          {c.currentlyEmployed && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              c.currentlyEmployed.toLowerCase() === 'yes' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-gray-50 text-gray-600'
                            }`}>
                              {c.currentlyEmployed.toLowerCase() === 'yes' ? 'Employed' : 'Available'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 truncate max-w-[160px]" title={displayCompany}>
                          {displayCompany}
                        </span>
                      </div>
                    </td>

                    {/* Compensation Column */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-gray-500">
                          Current: <span className="font-semibold text-gray-900">{c.currentSalary || `₹${c.ctc.current.toLocaleString('en-IN')}`}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Expected: <span className="font-semibold text-gray-900">{c.expectedSalary || `₹${c.ctc.expected.toLocaleString('en-IN')}`}</span>
                        </div>
                      </div>
                    </td>

                    {/* Availability Column */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          c.noticePeriod?.toLowerCase() === 'immediate' 
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                            : c.noticePeriod?.includes('60') || c.noticePeriod?.includes('90')
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                        }`}>
                          {c.noticePeriod}
                        </span>
                        {c.joiningDate && c.noticePeriod?.toLowerCase() !== 'immediate' && (
                          <span className="text-xs text-gray-500">
                            Can join: <span className="font-medium text-gray-700">{c.joiningDate}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Column - Audit indicator with tooltip */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="relative group/status">
                          <div className={`w-2.5 h-2.5 rounded-full ${getAuditStatusColor()} ring-2 ring-white shadow-sm`}></div>
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover/status:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                              {getAuditStatusText()}
                              <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{c.source}</span>
                      </div>
                    </td>

                    {/* Actions Column - Icon only, minimal */}
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProfile(c.id);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {c.resumeUrl && (
                          <a
                            href={c.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="View Resume"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reviewResume(c.id);
                          }}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="AI Resume Review"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
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