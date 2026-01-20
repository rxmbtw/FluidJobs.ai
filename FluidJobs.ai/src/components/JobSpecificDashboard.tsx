import React, { useState } from 'react';
import { ArrowLeft, Users, Zap, Settings, MessageCircle, TestTube } from 'lucide-react';
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
  console.log('JobSpecificDashboard received props:', { jobTitle, jobId });
  const [currentJobTitle, setCurrentJobTitle] = useState(jobTitle);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [finalSelectedCandidates, setFinalSelectedCandidates] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [numberOfOpenings, setNumberOfOpenings] = useState(0);
  
  // Debug: Log jobId to ensure it's being passed correctly
  console.log('JobSpecificDashboard jobId for JobSettings:', jobId);

  const handleJobUpdate = (updatedJob: any) => {
    setCurrentJobTitle(updatedJob.title);
    if (onJobUpdate) {
      onJobUpdate(updatedJob);
    }
  };

  // Fetch job details including number of openings
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

  // Fetch candidate job status for this specific job
  const fetchCandidateJobStatus = async (candidateId: string) => {
    if (!jobId) return;
    
    try {
      const [shortlistedRes, selectedRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/shortlisted/${jobId}`),
        fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/selected/${jobId}`)
      ]);
      
      let status = '';
      
      if (shortlistedRes.ok) {
        const data = await shortlistedRes.json();
        const isShortlisted = data.candidates.some((c: any) => c.candidate_id === candidateId);
        if (isShortlisted) status = 'shortlisted';
      }
      
      if (selectedRes.ok) {
        const data = await selectedRes.json();
        const isSelected = data.candidates.some((c: any) => c.candidate_id === candidateId);
        if (isSelected) status = 'selected';
      }
      
      setCandidateJobStatus(status);
    } catch (error) {
      console.error('Error fetching candidate job status:', error);
    }
  };

  // Fetch shortlisted candidates for this job
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

  // Fetch selected candidates for this job
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

  // Shortlist candidate for this job
  const handleShortlistCandidate = async () => {
    if (!selectedJobCandidate || !jobId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/shortlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, candidateId: selectedJobCandidate.id })
      });
      
      if (response.ok) {
        setCandidateJobStatus('shortlisted');
        // Add candidate to shortlisted (keep in all candidates)
        setShortlistedCandidates([...shortlistedCandidates, selectedJobCandidate]);
        showToastNotification('Candidate shortlisted successfully');
      }
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
    }
  };
  const fetchJobCandidates = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates?page=1&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.candidates) {
          const formattedCandidates = data.data.candidates.map((candidate: any) => ({
            id: candidate.candidate_id,
            applicationDate: new Date().toLocaleDateString('en-GB'),
            name: candidate.full_name,
            phone: candidate.phone_number || '',
            email: candidate.email,
            gender: candidate.gender || 'Male',
            position: 'Applied for this job',
            experience: parseFloat(candidate.experience_years) || 0,
            currentlyEmployed: candidate.currently_employed || 'No',
            currentCompany: candidate.current_company || 'Not specified',
            noticePeriod: candidate.notice_period || 'Not specified',
            lastWorkingDay: '',
            currentSalary: candidate.current_ctc ? `₹${parseFloat(candidate.current_ctc).toLocaleString('en-IN')}` : 'Not specified',
            expectedSalary: candidate.expected_ctc ? `₹${parseFloat(candidate.expected_ctc).toLocaleString('en-IN')}` : 'Not specified',
            location: candidate.location || 'Not specified',
            source: 'Database',
            resumeUrl: candidate.resume_link || '',
            maritalStatus: candidate.marital_status || 'Not specified',
            resumeScore: candidate.resume_score || 0
          }));
          setAllJobCandidates(formattedCandidates);
          if (formattedCandidates.length > 0) {
            setSelectedJobCandidate(formattedCandidates[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching job candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-Select Dropdown Component
  const MultiSelectDropdown: React.FC<{
    label: string;
    selectedItems: string[];
    options: string[];
    onChange: (items: string[]) => void;
    dropdownKey: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    placeholder: string;
  }> = ({ label, selectedItems, options, onChange, dropdownKey, searchValue, onSearchChange, placeholder }) => {
    const isOpen = openDropdown === dropdownKey;
    
    const filteredOptions = searchValue
      ? options.filter(option => option.toLowerCase().includes(searchValue.toLowerCase()))
      : options;
    
    const handleToggleItem = (item: string) => {
      if (selectedItems.includes(item)) {
        onChange(selectedItems.filter(i => i !== item));
      } else {
        onChange([...selectedItems, item]);
      }
    };
    
    const handleRemoveItem = (item: string) => {
      onChange(selectedItems.filter(i => i !== item));
    };
    
    const clearAll = () => {
      onChange([]);
      onSearchChange('');
    };
    
    return (
      <div className="custom-dropdown relative">
        <label className="text-xs font-medium text-gray-700 block mb-1">{label}</label>
        <div className="border border-gray-300 rounded-lg bg-white min-h-[40px] p-2">
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedItems.map((item) => (
              <span key={item} className="inline-flex items-center px-2 py-1 rounded bg-blue-500 text-white text-xs">
                {item}
                <button onClick={() => handleRemoveItem(item)} className="ml-1 text-white hover:text-gray-200">×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setOpenDropdown(dropdownKey)}
            placeholder={selectedItems.length === 0 ? placeholder : ''}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>
        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleToggleItem(option)}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 transition flex items-center justify-between ${
                      selectedItems.includes(option) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{option}</span>
                    {selectedItems.includes(option) && <span className="text-blue-600">✓</span>}
                  </div>
                ))}
                {selectedItems.length > 0 && (
                  <div className="border-t border-gray-200 p-2">
                    <button onClick={clearAll} className="text-xs text-blue-600 hover:text-blue-800">Clear all</button>
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const CustomDropdown: React.FC<{
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    dropdownKey: string;
    searchable?: boolean;
  }> = ({ label, value, options, onChange, dropdownKey, searchable = false }) => {
    const isOpen = openDropdown === dropdownKey;
    const [localSearch, setLocalSearch] = useState('');
    
    const filteredOptions = searchable && localSearch
      ? options.filter(option => option.toLowerCase().includes(localSearch.toLowerCase()))
      : options;
    
    return (
      <div className="custom-dropdown relative">
        <label className="text-xs font-medium text-gray-700 block mb-1">{label}</label>
        {searchable ? (
          <input
            type="text"
            value={isOpen ? localSearch : value}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              if (!isOpen) setOpenDropdown(dropdownKey);
            }}
            onFocus={() => setOpenDropdown(dropdownKey)}
            placeholder={value}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white cursor-pointer hover:border-blue-400 transition focus:outline-none focus:border-blue-400"
          />
        ) : (
          <div
            onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white cursor-pointer hover:border-blue-400 transition"
          >
            {value}
          </div>
        )}
        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    onChange(option);
                    setOpenDropdown(null);
                    setLocalSearch('');
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-100 transition ${
                    value === option ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
    );
  };



  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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

  // Set default active section based on user role or defaultTab prop
  const getDefaultSection = () => {
    if (defaultTab) {
      return defaultTab;
    }
    if (userRole === 'Sales') {
      return 'job-settings'; // Sales can only see Job Settings
    }
    return 'manage-candidates'; // Default for Admin/HR
  };

  const [activeSection, setActiveSection] = useState(getDefaultSection());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shortlistedCandidates, setShortlistedCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [allJobCandidates, setAllJobCandidates] = useState<Candidate[]>([]);
  const [selectedJobCandidate, setSelectedJobCandidate] = useState<Candidate | null>(null);
  const [candidateJobStatus, setCandidateJobStatus] = useState<string>(''); // 'shortlisted', 'selected', or ''
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedCandidates, setCheckedCandidates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState<Candidate | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState('All Jobs');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState('All Experience');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState('Default');
  const [locationSearch, setLocationSearch] = useState('');
  const [skillsSearch, setSkillsSearch] = useState('');

  // Fetch data when component mounts or jobId changes
  React.useEffect(() => {
    if (jobId) {
      fetchJobDetails();
      fetchJobCandidates();
      fetchShortlistedCandidates();
      fetchSelectedCandidates();
    }
  }, [jobId]);

  // Fetch candidates when active section changes
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

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  // Get candidates for current tab
  const getCurrentTabCandidates = () => {
    switch (activeSection) {
      case 'shortlisted':
        return shortlistedCandidates;
      case 'selected':
        return selectedCandidates;
      default:
        return filteredCandidates;
    }
  };

  // Filter candidates
  const filteredCandidates = React.useMemo(() => {
    return allJobCandidates.filter(candidate => {
      const matchesSearch = (candidate.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.currentCompany || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPosition = selectedPosition === 'All Jobs' || candidate.position === selectedPosition;
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.some(loc => candidate.location.toLowerCase().includes(loc.toLowerCase()));
      const matchesExperience = selectedExperience === 'All Experience' || 
        (selectedExperience === '0-2 years' && candidate.experience <= 2) ||
        (selectedExperience === '3-5 years' && candidate.experience >= 3 && candidate.experience <= 5);
      const matchesSkills = selectedSkills.length === 0;
      
      return matchesSearch && matchesPosition && matchesLocation && matchesExperience && matchesSkills;
    });
  }, [allJobCandidates, searchTerm, selectedPosition, selectedLocations, selectedExperience, selectedSkills]);

  const renderContent = () => {
    switch (activeSection) {
      case 'manage-candidates':
        return (
          <div className="flex bg-gray-50 font-sans overflow-hidden" style={{ height: 'calc(100% - 16px)', margin: '8px' }}>
            {/* Filters Section - Leftmost */}
            <div className="w-48 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-3">
                  <CustomDropdown
                    label="Position"
                    value={selectedPosition}
                    options={['All Jobs', 'Python Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist']}
                    onChange={setSelectedPosition}
                    dropdownKey="position"
                    searchable={true}
                  />
                  
                  <MultiSelectDropdown
                    label="Location"
                    selectedItems={selectedLocations}
                    options={['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow']}
                    onChange={setSelectedLocations}
                    dropdownKey="location"
                    searchValue={locationSearch}
                    onSearchChange={setLocationSearch}
                    placeholder="Select locations..."
                  />
                  
                  <CustomDropdown
                    label="Experience"
                    value={selectedExperience}
                    options={['All Experience', '0-2 years', '3-5 years']}
                    onChange={setSelectedExperience}
                    dropdownKey="experience"
                  />
                  
                  <MultiSelectDropdown
                    label="Skills"
                    selectedItems={selectedSkills}
                    options={['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes']}
                    onChange={setSelectedSkills}
                    dropdownKey="skills"
                    searchValue={skillsSearch}
                    onSearchChange={setSkillsSearch}
                    placeholder="Select skills..."
                  />
                  
                  <CustomDropdown
                    label="Sort"
                    value={selectedSort}
                    options={['Default', 'A → Z', 'Z → A']}
                    onChange={setSelectedSort}
                    dropdownKey="sort"
                  />
                </div>
                <div className="flex flex-col space-y-2 mt-4">
                  <button className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">
                    Apply
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPosition('All Jobs');
                      setSelectedLocations([]);
                      setSelectedExperience('All Experience');
                      setSelectedSkills([]);
                      setSelectedSort('Default');
                      setLocationSearch('');
                      setSkillsSearch('');
                      setSearchTerm('');
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Candidates List */}
            <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 p-4">
                <h2 className="text-sm font-medium text-gray-900 mb-4">
                  Candidates ({getCurrentTabCandidates().length})
                </h2>
                <div className="flex items-center mb-4">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-8">
                {loading ? (
                  <div className="text-center text-gray-500 py-12">
                    <p className="text-sm">Loading candidates...</p>
                  </div>
                ) : getCurrentTabCandidates().length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <p className="text-sm">No candidates found for this job</p>
                  </div>
                ) : (
                  getCurrentTabCandidates().map((candidate) => {
                    const getInitials = (name: string) => {
                      if (!name) return 'N/A';
                      return name.split(' ').map(n => n[0]).join('').toUpperCase();
                    };
                    const getAvatarColor = (name: string) => {
                      const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
                      const index = (name || '').length % colors.length;
                      return colors[index];
                    };
                    
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => {
                          setSelectedJobCandidate(candidate);
                          // Check if this candidate is in shortlisted or selected arrays
                          if (shortlistedCandidates.some(sc => sc.id === candidate.id)) {
                            setCandidateJobStatus('shortlisted');
                          } else if (selectedCandidates.some(sc => sc.id === candidate.id)) {
                            setCandidateJobStatus('selected');
                          } else {
                            setCandidateJobStatus('');
                          }
                        }}
                        className={`mb-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedJobCandidate?.id === candidate.id ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(candidate.name)} flex items-center justify-center text-white font-medium text-sm`}>
                            {getInitials(candidate.name || '')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{candidate.name || 'Unknown'}</h3>
                            <p className="text-xs text-gray-500">{candidate.experience} Yrs | {candidate.currentCompany || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Candidate Details */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedJobCandidate ? (
                <>
                  {/* Top Header - Candidate Profile Card */}
                  <div className="flex-shrink-0 bg-white border-b border-gray-100 p-3 shadow-sm">
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition">
                          <svg width="20" height="20" viewBox="0 0 26 26" fill="none" className="flex-shrink-0">
                            <path d="M3 3L23 23" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M10.9 10.9C10.4 11.4 10 12.1 10 13C10 14.7 11.3 16 13 16C13.9 16 14.6 15.6 15.1 15.1" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M7.5 7.5C5.5 9 4 11 4 13C4 14.5 7 19 13 19C15 19 16.5 18.5 18 17.5" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M20 14C21 12.5 22 11.5 22 13C22 14.5 19 19 13 19" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M13 7C17 7 20 10 22 13" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <span>Restrict</span>
                        </button>
                        <button className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-medium bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Unrestrict</span>
                        </button>
                      </div>
                      <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#28860B" strokeWidth="1.5"/>
                            <polyline points="8,12 11,15 16,9" stroke="#28860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                          <span>Active</span>
                        </button>
                        <button className="px-6 py-2.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
                          Send Job Notification
                        </button>
                        {candidateJobStatus === '' && (
                          <button 
                            onClick={handleShortlistCandidate}
                            className="px-6 py-2.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                          >
                            Shortlist
                          </button>
                        )}
                        {candidateJobStatus === 'shortlisted' && (
                          <button 
                            onClick={async () => {
                              try {
                                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-stages/select`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ jobId, candidateId: selectedJobCandidate.id })
                                });
                                if (response.ok) {
                                  setCandidateJobStatus('selected');
                                  setSelectedCandidates([...selectedCandidates, selectedJobCandidate]);
                                  showToastNotification('Candidate selected successfully');
                                }
                              } catch (error) {
                                console.error('Error selecting candidate:', error);
                              }
                            }}
                            className="px-6 py-2.5 rounded-full text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Candidate Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold`}>
                        {(selectedJobCandidate.name || '').split(' ').map(n => n[0] || '').join('').toUpperCase() || 'N/A'}
                      </div>
                      <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">{selectedJobCandidate.name || 'Unknown'}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {selectedJobCandidate.email}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {selectedJobCandidate.phone}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Social Links:</div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 overflow-y-scroll bg-gray-50 p-6" style={{ overflowX: 'hidden' }}>
                    <div className="space-y-3" style={{ paddingBottom: '3rem' }}>
                      {/* Work Experience - Full Width */}
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Work Experience</h3>
                        <div className="space-y-2">
                          {selectedJobCandidate.currentCompany && selectedJobCandidate.currentCompany !== 'Not specified' && (
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600">{selectedJobCandidate.currentCompany}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Skills and Resume - Side by Side */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Skills */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-sm font-semibold text-gray-900">Skills</h3>
                          <p className="text-xs text-gray-500 mt-1">No skills listed</p>
                        </div>

                        {/* Resume */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">Resume</h3>
                          {selectedJobCandidate.resumeUrl ? (
                            <a
                              href={selectedJobCandidate.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View Resume</span>
                            </a>
                          ) : (
                            <p className="text-xs text-gray-500">No resume available</p>
                          )}
                        </div>
                      </div>

                      {/* Job Application Status */}
                      {candidateJobStatus && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Job Application Status
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${
                              candidateJobStatus === 'shortlisted'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-green-400 text-green-900'
                            }`}>
                              {candidateJobStatus === 'shortlisted' ? 'Shortlisted' : 'Selected'} for: {currentJobTitle}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Candidate Information */}
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Candidate Information</h3>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Gender</span>
                            <span className="text-sm text-gray-900">{selectedJobCandidate.gender?.toUpperCase() || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Currently Employed</span>
                            <span className="text-sm text-gray-900">{selectedJobCandidate.currentlyEmployed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Marital Status</span>
                            <span className="text-sm text-gray-900">{selectedJobCandidate.maritalStatus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Location</span>
                            <span className="text-sm text-gray-900">{selectedJobCandidate.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Notice Period</span>
                            <span className="text-sm text-gray-900">{selectedJobCandidate.noticePeriod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Current Salary</span>
                            <span className="text-sm text-gray-900">{selectedJobCandidate.currentSalary}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Expected Salary</span>
                            <span className="text-sm text-gray-900">{selectedJobCandidate.expectedSalary}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Full-Time Experience</span>
                            <span className="text-sm text-gray-900">{selectedJobCandidate.experience} years</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-shrink-0 bg-white border-b border-gray-100 p-6">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Select a candidate to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
            // Move candidates from shortlisted to selected
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
                              // Move candidate from shortlisted to selected
                              setSelectedCandidates([...selectedCandidates, candidate]);
                              setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== candidate.id));
                              // Update status if this candidate is currently selected in details
                              if (selectedJobCandidate?.id === candidate.id) {
                                setCandidateJobStatus('selected');
                              }
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
                              // Remove candidate from shortlisted (keep in all candidates)
                              setShortlistedCandidates(shortlistedCandidates.filter(c => c.id !== candidate.id));
                              // Update status if this candidate is currently selected in details
                              if (selectedJobCandidate?.id === candidate.id) {
                                setCandidateJobStatus('');
                              }
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
            
            {/* Candidate Details Modal */}
            {selectedCandidateDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCandidateDetails(null)}>
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCandidateDetails.name || 'Unknown'}</h2>
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
                            // Move candidate back to shortlisted
                            setShortlistedCandidates([...shortlistedCandidates, candidate]);
                            setSelectedCandidates(selectedCandidates.filter(c => c.id !== candidate.id));
                            // Update status if this candidate is currently selected in details
                            if (selectedJobCandidate?.id === candidate.id) {
                              setCandidateJobStatus('shortlisted');
                            }
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
            )
            }
            
            {/* Candidate Details Modal for Selected Tab */}
            {selectedCandidateDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCandidateDetails(null)}>
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCandidateDetails.name || 'Unknown'}</h2>
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
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Back Button and Job Title */}
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
              <div className="relative group">
                <button
                  onClick={() => {
                    if (selectedCandidates.length < numberOfOpenings || isCompleted) return;
                    if (selectedCandidates.length > numberOfOpenings) {
                      setShowSelectionModal(true);
                      setFinalSelectedCandidates([]);
                    } else {
                      setShowCompletedModal(true);
                    }
                  }}
                  disabled={selectedCandidates.length < numberOfOpenings || isCompleted}
                  className="px-6 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: isCompleted ? '#10B981' : selectedCandidates.length >= numberOfOpenings ? '#E5E7EB' : '#F3F4F6',
                    color: isCompleted ? '#FFFFFF' : selectedCandidates.length >= numberOfOpenings ? '#374151' : '#9CA3AF',
                    cursor: selectedCandidates.length < numberOfOpenings || isCompleted ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isCompleted ? '✓ Job Completed' : 'Mark as Completed'}
                </button>
                {selectedCandidates.length < numberOfOpenings && !isCompleted && (
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Need {numberOfOpenings - selectedCandidates.length} more selected candidate{numberOfOpenings - selectedCandidates.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
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

      {/* Candidate Selection Modal */}
      {showSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select {numberOfOpenings} Candidates</h2>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              You have selected {selectedCandidates.length} candidates but only {numberOfOpenings} position{numberOfOpenings > 1 ? 's are' : ' is'} available. Please select exactly {numberOfOpenings} candidate{numberOfOpenings > 1 ? 's' : ''} to proceed.
            </p>

            <div className="space-y-3 mb-6">
              {selectedCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={finalSelectedCandidates.includes(candidate.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (finalSelectedCandidates.length < numberOfOpenings) {
                          setFinalSelectedCandidates([...finalSelectedCandidates, candidate.id]);
                        }
                      } else {
                        setFinalSelectedCandidates(finalSelectedCandidates.filter(id => id !== candidate.id));
                      }
                    }}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                    {(candidate.name || '').split(' ').map(n => n[0] || '').join('').toUpperCase() || 'N/A'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{candidate.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    <p className="text-xs text-gray-500">{candidate.experience} Yrs | {candidate.currentCompany}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Selected: {finalSelectedCandidates.length}/{numberOfOpenings}
              </span>
              <button
                onClick={() => {
                  if (finalSelectedCandidates.length === numberOfOpenings) {
                    setShowSelectionModal(false);
                    setShowCompletedModal(true);
                  }
                }}
                disabled={finalSelectedCandidates.length !== numberOfOpenings}
                className="px-6 py-3 rounded-lg font-semibold transition"
                style={{
                  backgroundColor: finalSelectedCandidates.length === numberOfOpenings ? '#3B82F6' : '#E5E7EB',
                  color: finalSelectedCandidates.length === numberOfOpenings ? '#FFFFFF' : '#9CA3AF',
                  cursor: finalSelectedCandidates.length === numberOfOpenings ? 'pointer' : 'not-allowed'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Confirmation Modal */}
      {showCompletedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mark Job as Completed</h2>
              <button
                onClick={() => setShowCompletedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to mark <strong>"{currentJobTitle}"</strong> as completed?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCompletedModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsCompleted(true);
                  setShowCompletedModal(false);
                  setSuccessMessage({
                    title: 'Job Completed!',
                    message: `Job "${currentJobTitle}" marked as completed successfully. All positions have been filled.`
                  });
                  setShowSuccessModal(true);
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
      />

      {/* Toast Notification */}
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