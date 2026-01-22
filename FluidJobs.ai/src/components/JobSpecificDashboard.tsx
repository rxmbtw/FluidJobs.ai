import React, { useState } from 'react';
import { ArrowLeft, Users, Zap, Settings } from 'lucide-react';
import ManageCandidatesJobSpecific from './ManageCandidatesJobSpecific';
import JobSettings from './JobSettings';
import SuccessModal from './SuccessModal';

interface JobSpecificDashboardProps {
  jobTitle: string;
  jobId?: string;
  onBack: () => void;
  onJobUpdate?: (updatedJob: any) => void;
  defaultTab?: string;
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

const JobSpecificDashboard: React.FC<JobSpecificDashboardProps> = ({ jobTitle, jobId, onBack, onJobUpdate, defaultTab }) => {
  const [currentJobTitle, setCurrentJobTitle] = useState(jobTitle);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [finalSelectedCandidates, setFinalSelectedCandidates] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [numberOfOpenings, setNumberOfOpenings] = useState(0);

  const handleJobUpdate = (updatedJob: any) => {
    setCurrentJobTitle(updatedJob.title);
    if (onJobUpdate) {
      onJobUpdate(updatedJob);
    }
  };

  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/list`);
      if (response.ok) {
        const data = await response.json();
        const job = data.jobs?.find((j: any) => j.job_id.toString() === jobId.toString());
        if (job && job.number_of_openings) {
          setNumberOfOpenings(parseInt(job.number_of_openings) || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const fetchShortlistedCandidates = async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/shortlisted/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedCandidates = data.candidates.map((candidate: any) => ({
          id: candidate.candidate_id,
          applicationDate: new Date().toLocaleDateString('en-GB'),
          name: candidate.full_name || candidate.name || 'Unknown',
          phone: candidate.phone_number || candidate.phone || '',
          email: candidate.email,
          gender: candidate.gender || 'Male',
          position: 'Applied for this job',
          experience: parseFloat(candidate.experience_years || candidate.experience) || 0,
          currentlyEmployed: candidate.currently_employed || 'No',
          currentCompany: candidate.current_company || candidate.currentCompany || 'Not specified',
          noticePeriod: candidate.notice_period || candidate.noticePeriod || 'Not specified',
          lastWorkingDay: '',
          currentSalary: candidate.current_ctc ? `₹${parseFloat(candidate.current_ctc).toLocaleString('en-IN')}` : 'Not specified',
          expectedSalary: candidate.expected_ctc ? `₹${parseFloat(candidate.expected_ctc).toLocaleString('en-IN')}` : 'Not specified',
          location: candidate.location || 'Not specified',
          source: 'Database',
          resumeUrl: candidate.resume_link || candidate.resumeUrl || '',
          maritalStatus: candidate.marital_status || candidate.maritalStatus || 'Not specified',
          resumeScore: candidate.resume_score || candidate.resumeScore || 0
        }));
        setShortlistedCandidates(formattedCandidates);
      }
    } catch (error) {
      console.error('Error fetching shortlisted candidates:', error);
    }
  };

  const fetchSelectedCandidates = async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/selected/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        const formattedCandidates = data.candidates.map((candidate: any) => ({
          id: candidate.candidate_id,
          applicationDate: new Date().toLocaleDateString('en-GB'),
          name: candidate.full_name || candidate.name || 'Unknown',
          phone: candidate.phone_number || candidate.phone || '',
          email: candidate.email,
          gender: candidate.gender || 'Male',
          position: 'Applied for this job',
          experience: parseFloat(candidate.experience_years || candidate.experience) || 0,
          currentlyEmployed: candidate.currently_employed || 'No',
          currentCompany: candidate.current_company || candidate.currentCompany || 'Not specified',
          noticePeriod: candidate.notice_period || candidate.noticePeriod || 'Not specified',
          lastWorkingDay: '',
          currentSalary: candidate.current_ctc ? `₹${parseFloat(candidate.current_ctc).toLocaleString('en-IN')}` : 'Not specified',
          expectedSalary: candidate.expected_ctc ? `₹${parseFloat(candidate.expected_ctc).toLocaleString('en-IN')}` : 'Not specified',
          location: candidate.location || 'Not specified',
          source: 'Database',
          resumeUrl: candidate.resume_link || candidate.resumeUrl || '',
          maritalStatus: candidate.marital_status || candidate.maritalStatus || 'Not specified',
          resumeScore: candidate.resume_score || candidate.resumeScore || 0
        }));
        setSelectedCandidates(formattedCandidates);
      }
    } catch (error) {
      console.error('Error fetching selected candidates:', error);
    }
  };

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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

  const getDefaultSection = () => {
    if (defaultTab) {
      return defaultTab;
    }
    if (userRole === 'Sales') {
      return 'job-settings';
    }
    return 'manage-candidates';
  };

  const [activeSection, setActiveSection] = useState(getDefaultSection());
  const [shortlistedCandidates, setShortlistedCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState<Candidate | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [checkedCandidates, setCheckedCandidates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  React.useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchShortlistedCandidates();
      fetchSelectedCandidates();
    }
  }, [jobId]);

  React.useEffect(() => {
    if (jobId) {
      if (activeSection === 'shortlisted') {
        fetchShortlistedCandidates();
      } else if (activeSection === 'selected') {
        fetchSelectedCandidates();
      }
    }
  }, [activeSection, jobId]);

  const allMenuItems = [
    { id: 'manage-candidates', label: 'Manage Candidates', icon: Users, roles: ['Admin', 'HR'] },
    { id: 'shortlisted', label: 'Shortlisted', icon: Zap, roles: ['Admin', 'HR'] },
    { id: 'selected', label: 'Selected', icon: Users, roles: ['Admin', 'HR'] },
    { id: 'job-settings', label: 'Job Settings', icon: Settings, roles: ['Admin', 'HR', 'Sales'] }
  ];

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
            onShortlist={(candidate) => {
              setShortlistedCandidates([...shortlistedCandidates, candidate]);
              showToastNotification('Candidate shortlisted successfully');
            }}
            onUnshortlist={(candidateId) => {
              setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== candidateId));
              showToastNotification('Candidate removed from shortlist');
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
            showToastNotification(`${movedCandidates.length} candidate${movedCandidates.length !== 1 ? 's' : ''} moved to selected`);
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
                        {(candidate.name || '').split(' ').map(n => n[0] || '').join('').toUpperCase() || 'N/A'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{candidate.name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                        <p className="text-sm text-gray-500">{candidate.experience} Yrs | {candidate.currentCompany}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
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
                              showToastNotification('Candidate selected successfully');
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
                              showToastNotification('Candidate removed from shortlist');
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
                        {(candidate.name || '').split(' ').map(n => n[0] || '').join('').toUpperCase() || 'N/A'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{candidate.name || 'Unknown'}</h3>
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
                            showToastNotification('Candidate moved back to shortlisted');
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
            )}
          </div>
        );
      case 'job-settings':
        return <JobSettings jobTitle={currentJobTitle} jobId={jobId} onJobUpdate={handleJobUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Openings</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{currentJobTitle}</h1>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedCandidates.length}/{numberOfOpenings} positions filled
              </span>
            </div>
          </div>
        </div>

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

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
      />

      {showToast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSpecificDashboard;