import React, { useState } from 'react';
import { ArrowLeft, Users, Zap, Settings, MessageCircle, TestTube } from 'lucide-react';
import ManageCandidatesJobSpecific from './ManageCandidatesJobSpecific';
import JobSettings from './JobSettings';

interface JobSpecificDashboardProps {
  jobTitle: string;
  jobId?: string;
  onBack: () => void;
  onJobUpdate?: (updatedJob: any) => void;
}

interface Candidate {
  id: string;
  applicationDate: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  position: string;
  experience: number;
  currentlyEmployed: string;
  currentCompany: string;
  noticePeriod: string;
  lastWorkingDay: string;
  currentSalary: string;
  expectedSalary: string;
  location: string;
  source: string;
  resumeUrl: string;
  maritalStatus: string;
  resumeScore: number;
}

const JobSpecificDashboard: React.FC<JobSpecificDashboardProps> = ({ jobTitle, jobId, onBack, onJobUpdate }) => {
  console.log('JobSpecificDashboard received props:', { jobTitle, jobId });
  const [currentJobTitle, setCurrentJobTitle] = useState(jobTitle);
  
  // Debug: Log jobId to ensure it's being passed correctly
  console.log('JobSpecificDashboard jobId for JobSettings:', jobId);

  const handleJobUpdate = (updatedJob: any) => {
    setCurrentJobTitle(updatedJob.title);
    if (onJobUpdate) {
      onJobUpdate(updatedJob);
    }
  };

  // Fetch shortlisted and selected candidates
  const fetchCandidateStages = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      const [shortlistedRes, selectedRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/shortlisted/${jobId}`),
        fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/selected/${jobId}`)
      ]);
      
      if (shortlistedRes.ok) {
        const data = await shortlistedRes.json();
        const formatted = data.candidates.map((c: any) => ({
          id: c.candidate_id,
          applicationDate: '',
          name: c.name,
          phone: c.phone || '',
          email: c.email,
          gender: c.gender || '',
          position: '',
          experience: parseFloat(c.experience) || 0,
          currentlyEmployed: c.currentlyemployed || '',
          currentCompany: c.currentcompany || '',
          noticePeriod: c.noticeperiod || '',
          lastWorkingDay: '',
          currentSalary: c.currentsalary || '',
          expectedSalary: c.expectedsalary || '',
          location: c.location || '',
          source: '',
          resumeUrl: c.resumeurl || '',
          maritalStatus: c.maritalstatus || '',
          resumeScore: 0
        }));
        setShortlistedCandidates(formatted);
      }
      
      if (selectedRes.ok) {
        const data = await selectedRes.json();
        const formatted = data.candidates.map((c: any) => ({
          id: c.candidate_id,
          applicationDate: '',
          name: c.name,
          phone: c.phone || '',
          email: c.email,
          gender: c.gender || '',
          position: '',
          experience: parseFloat(c.experience) || 0,
          currentlyEmployed: c.currentlyemployed || '',
          currentCompany: c.currentcompany || '',
          noticePeriod: c.noticeperiod || '',
          lastWorkingDay: '',
          currentSalary: c.currentsalary || '',
          expectedSalary: c.expectedsalary || '',
          location: c.location || '',
          source: '',
          resumeUrl: c.resumeurl || '',
          maritalStatus: c.maritalstatus || '',
          resumeScore: 0
        }));
        setSelectedCandidates(formatted);
      }
    } catch (error) {
      console.error('Error fetching candidate stages:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCandidateStages();
  }, [jobId]);
  // Get user role from sessionStorage
  const getUserRole = () => {
    try {
      const userStr = sessionStorage.getItem('fluidjobs_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.role;
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
    return null;
  };

  const userRole = getUserRole();

  // Set default active section based on user role
  const getDefaultSection = () => {
    if (userRole === 'Sales') {
      return 'job-settings'; // Sales can only see Job Settings
    }
    return 'manage-candidates'; // Default for Admin/HR
  };

  const [activeSection, setActiveSection] = useState(getDefaultSection());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shortlistedCandidates, setShortlistedCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedCandidates, setCheckedCandidates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState<Candidate | null>(null);

  const allMenuItems = [
    { id: 'manage-candidates', label: 'Manage Candidates', icon: Users, roles: ['Admin', 'HR'] },
    { id: 'shortlisted', label: 'Shortlisted', icon: Zap, roles: ['Admin', 'HR'] },
    { id: 'selected', label: 'Selected', icon: Users, roles: ['Admin', 'HR'] },
    { id: 'job-settings', label: 'Job Settings', icon: Settings, roles: ['Admin', 'HR', 'Sales'] }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'manage-candidates':
        return (
          <ManageCandidatesJobSpecific 
            jobId={jobId}
            shortlistedCandidates={shortlistedCandidates}
            onShortlist={async (candidate: Candidate) => {
              try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/shortlist`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jobId, candidateId: candidate.id })
                });
                if (response.ok) {
                  setShortlistedCandidates([...shortlistedCandidates, candidate]);
                }
              } catch (error) {
                console.error('Error shortlisting candidate:', error);
              }
            }}
            onUnshortlist={async (candidateId: string) => {
              try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/shortlist/${jobId}/${candidateId}`, {
                  method: 'DELETE'
                });
                if (response.ok) {
                  setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== candidateId));
                }
              } catch (error) {
                console.error('Error removing from shortlist:', error);
              }
            }}
          />
        );
      case 'shortlisted':
        const handleSelectAll = () => {
          if (selectAll) {
            setCheckedCandidates([]);
          } else {
            setCheckedCandidates(shortlistedCandidates.map(c => c.id));
          }
          setSelectAll(!selectAll);
        };

        const handleCheckboxChange = (candidateId: string) => {
          if (checkedCandidates.includes(candidateId)) {
            setCheckedCandidates(checkedCandidates.filter(id => id !== candidateId));
          } else {
            setCheckedCandidates([...checkedCandidates, candidateId]);
          }
        };

        const handleBulkSelect = async () => {
          if (checkedCandidates.length === 0) return;
          
          try {
            await Promise.all(
              checkedCandidates.map(candidateId =>
                fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/select`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jobId, candidateId })
                })
              )
            );
            
            const movedCandidates = shortlistedCandidates.filter(c => checkedCandidates.includes(c.id));
            setSelectedCandidates([...selectedCandidates, ...movedCandidates]);
            setShortlistedCandidates(shortlistedCandidates.filter(c => !checkedCandidates.includes(c.id)));
            setCheckedCandidates([]);
            setSelectAll(false);
          } catch (error) {
            console.error('Error bulk selecting candidates:', error);
          }
        };

        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shortlisted Candidates</h2>
              {shortlistedCandidates.length > 0 && (
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Select All</span>
                  </label>
                  {checkedCandidates.length > 0 && (
                    <button
                      onClick={handleBulkSelect}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      Move to Selected ({checkedCandidates.length})
                    </button>
                  )}
                </div>
              )}
            </div>
            {shortlistedCandidates.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-lg">No shortlisted candidates yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {shortlistedCandidates.map((candidate) => (
                  <div key={candidate.id} className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:shadow-md transition">
                    <div 
                      className="flex items-center space-x-4 flex-1 cursor-pointer"
                      onClick={() => setSelectedCandidateDetails(candidate)}
                    >
                      <input
                        type="checkbox"
                        checked={checkedCandidates.includes(candidate.id)}
                        onChange={() => handleCheckboxChange(candidate.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                        <p className="text-sm text-gray-500">{candidate.experience} Yrs | {candidate.currentCompany}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Send Test clicked for candidate:', candidate.id);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Send Test
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/select`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ jobId, candidateId: candidate.id })
                            });
                            if (response.ok) {
                              setSelectedCandidates([...selectedCandidates, candidate]);
                              setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== candidate.id));
                            }
                          } catch (error) {
                            console.error('Error selecting candidate:', error);
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        Select
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/shortlist/${jobId}/${candidate.id}`, {
                              method: 'DELETE'
                            });
                            if (response.ok) {
                              setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== candidate.id));
                            }
                          } catch (error) {
                            console.error('Error removing from shortlist:', error);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                        title="Remove from shortlist"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Candidate Details Modal */}
            {selectedCandidateDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCandidateDetails(null)}>
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCandidateDetails.name}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{selectedCandidateDetails.email}</span>
                        <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{selectedCandidateDetails.phone}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCandidateDetails(null)} className="p-2 hover:bg-gray-100 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Work Experience</h3>
                      {selectedCandidateDetails.currentCompany && selectedCandidateDetails.currentCompany !== 'Not specified' ? (
                        <p className="text-sm text-gray-700">{selectedCandidateDetails.currentCompany}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not specified</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
                        <p className="text-sm text-gray-500">No skills listed</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Resume</h3>
                        {selectedCandidateDetails.resumeUrl ? (
                          <a href={selectedCandidateDetails.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            View Resume
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500">No resume available</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Candidate Information</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-xs text-gray-600">Gender:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.gender || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Currently Employed:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.currentlyEmployed || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Marital Status:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.maritalStatus || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Location:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.location || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Notice Period:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.noticePeriod || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Current Salary:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.currentSalary || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Expected Salary:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.expectedSalary || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Experience:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.experience} years</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'selected':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Selected Candidates</h2>
            {selectedCandidates.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-lg">No selected candidates yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedCandidates.map((candidate) => (
                  <div key={candidate.id} className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:shadow-md transition">
                    <div 
                      className="flex items-center space-x-4 flex-1 cursor-pointer"
                      onClick={() => setSelectedCandidateDetails(candidate)}
                    >
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                        {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                        <p className="text-sm text-gray-500">{candidate.experience} Yrs | {candidate.currentCompany}</p>
                      </div>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/select/${jobId}/${candidate.id}`, {
                            method: 'DELETE'
                          });
                          if (response.ok) {
                            setShortlistedCandidates([...shortlistedCandidates, candidate]);
                            setSelectedCandidates(selectedCandidates.filter(c => c.id !== candidate.id));
                          }
                        } catch (error) {
                          console.error('Error moving back to shortlist:', error);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                      title="Move back to shortlisted"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )
            }
            
            {/* Candidate Details Modal for Selected Tab */}
            {selectedCandidateDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCandidateDetails(null)}>
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCandidateDetails.name}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{selectedCandidateDetails.email}</span>
                        <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{selectedCandidateDetails.phone}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCandidateDetails(null)} className="p-2 hover:bg-gray-100 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Work Experience</h3>
                      {selectedCandidateDetails.currentCompany && selectedCandidateDetails.currentCompany !== 'Not specified' ? (
                        <p className="text-sm text-gray-700">{selectedCandidateDetails.currentCompany}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not specified</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
                        <p className="text-sm text-gray-500">No skills listed</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Resume</h3>
                        {selectedCandidateDetails.resumeUrl ? (
                          <a href={selectedCandidateDetails.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            View Resume
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500">No resume available</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Candidate Information</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-xs text-gray-600">Gender:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.gender || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Currently Employed:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.currentlyEmployed || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Marital Status:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.maritalStatus || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Location:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.location || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Notice Period:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.noticePeriod || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Current Salary:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.currentSalary || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Expected Salary:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.expectedSalary || 'Not specified'}</span></div>
                        <div><span className="text-xs text-gray-600">Experience:</span> <span className="text-sm font-medium text-gray-900">{selectedCandidateDetails.experience} years</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'job-settings':
        console.log('Passing jobId to JobSettings:', jobId);
        return <JobSettings jobTitle={currentJobTitle} jobId={jobId} onJobUpdate={handleJobUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Header with Back Button and Job Title */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Openings</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">{currentJobTitle}</h1>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-1 px-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  activeSection === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default JobSpecificDashboard;