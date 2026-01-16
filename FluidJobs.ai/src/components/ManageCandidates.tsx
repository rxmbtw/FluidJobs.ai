import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, FileText, Eye, MoreVertical, Download, Mail, Phone, MapPin, Calendar, Building, DollarSign, Linkedin, User, Clock, Briefcase, Plus, Trash2, Ban, Check } from 'lucide-react';
import { indianCities } from '../data/indianCities';
import SuccessModal from './SuccessModal';
import Loader from './Loader';

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



interface ManageCandidatesProps {
  isJobSpecific?: boolean;
  isSuperAdmin?: boolean;
}

const ManageCandidates: React.FC<ManageCandidatesProps> = ({ isJobSpecific = false, isSuperAdmin = false }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Application');
  const [selectedStage, setSelectedStage] = useState('Resume Review');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [showUnrestrictModal, setShowUnrestrictModal] = useState(false);
  const [restrictReason, setRestrictReason] = useState('');
  const [unrestrictReason, setUnrestrictReason] = useState('');
  const [submittingRestriction, setSubmittingRestriction] = useState(false);
  const [submittingUnrestriction, setSubmittingUnrestriction] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [candidateJobStatuses, setCandidateJobStatuses] = useState<{job_id: number, job_title: string, status: string}[]>([]);
  const [showJobNotificationModal, setShowJobNotificationModal] = useState(false);
  const [selectedJobForNotification, setSelectedJobForNotification] = useState('');
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  
  // Custom dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState('All Jobs');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState('All Experience');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState('Default');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [skillsSearch, setSkillsSearch] = useState('');

  // Fetch available jobs
  const fetchAvailableJobs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/list`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.jobs) {
          setAvailableJobs(data.jobs);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Send Job Notification function
  const sendJobNotification = async () => {
    if (!selectedCandidate || !selectedJobForNotification) {
      alert('Please select a job');
      return;
    }

    try {
      setSendingNotification(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates/send-job-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          email: selectedCandidate.email,
          name: selectedCandidate.name,
          jobId: selectedJobForNotification
        })
      });

      if (response.ok) {
        setShowJobNotificationModal(false);
        setSelectedJobForNotification('');
        setSuccessMessage({
          title: 'Success!',
          message: `Job notification sent successfully to ${selectedCandidate.name}!`
        });
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        alert(`Failed to send notification: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending job notification:', error);
      alert('Failed to send job notification. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

  // Send Invite function
  const sendInvite = async () => {
    if (!selectedCandidate) return;
    
    try {
      setSendingInvite(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates/send-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId: selectedCandidate.id,
          email: selectedCandidate.email,
          name: selectedCandidate.name
        })
      });
      
      if (response.ok) {
        setSuccessMessage({
          title: 'Success!',
          message: `Invite sent successfully to ${selectedCandidate.name}!`
        });
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        alert(`Failed to send invite: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Failed to send invite. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  };

  // AI Resume Review function
  const reviewResume = async (candidateId: string) => {
    try {
      setParsing(true);
      const jobDescription = `We are looking for a skilled Frontend Developer with expertise in React, TypeScript, and modern web technologies. The ideal candidate should have 3+ years of experience in building responsive web applications, knowledge of state management, and experience with REST APIs.`;
      
      const response = await fetch(`http://localhost:5001/api/gemini/review/${candidateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ jobDescription })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update candidate score in state
        setCandidates(prev => prev.map(c => 
          c.id === candidateId ? { ...c, resumeScore: data.score } : c
        ));
        setSuccessMessage({
          title: 'AI Review Complete!',
          message: `Score: ${data.score}/100`
        });
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error reviewing resume:', error);
      alert('Failed to review resume');
    } finally {
      setParsing(false);
    }
  };

  // Fetch candidates from database
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Add 2 second delay for loader
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates?page=1&limit=1000`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.candidates && data.data.candidates.length > 0) {
          const formattedCandidates = data.data.candidates.map((candidate: any) => ({
            id: candidate.candidate_id,
            applicationDate: new Date().toLocaleDateString('en-GB'),
            name: candidate.full_name,
            phone: candidate.phone_number || '',
            email: candidate.email,
            gender: candidate.gender || 'Male',
            position: getPositionFromEmail(candidate.email),
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
          setCandidates(formattedCandidates);
          if (formattedCandidates.length > 0) {
            setSelectedCandidate(formattedCandidates[0]);
          }
        } else {
          // Fallback to sample data if no database data
          loadSampleData();
        }
      } else {
        // Fallback to sample data if API fails
        loadSampleData();
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Fallback to sample data if error
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getPositionFromEmail = (email: string | null | undefined) => {
    const positions = ['Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer'];
    if (!email) return positions[0];
    return positions[email.length % positions.length];
  };

  const getRandomCompany = () => {
    const companies = ['Collegedunia Web Private Limited', 'Genesys Bengaluru', 'AgroStar', 'Saama Technologies', 'Go Digital', 'Jio Platforms', 'Wells Fargo'];
    return companies[Math.floor(Math.random() * companies.length)];
  };

  const getRandomNoticePeriod = () => {
    const periods = ['30 Days', '60 Days', '90 Days', 'Immediate'];
    return periods[Math.floor(Math.random() * periods.length)];
  };

  const getRandomSalary = () => {
    const salaries = ['₹6,00,000', '₹8,50,000', '₹12,00,000', '₹15,00,000', '₹18,00,000'];
    return salaries[Math.floor(Math.random() * salaries.length)];
  };

  const getRandomExpectedSalary = () => {
    const salaries = ['₹8,00,000', '₹12,00,000', '₹15,00,000', '₹18,00,000', '₹22,00,000'];
    return salaries[Math.floor(Math.random() * salaries.length)];
  };

  const getRandomLocation = () => {
    const locations = ['Delhi, India', 'Mumbai, India', 'Bangalore, India', 'Pune, India', 'Hyderabad, India', 'Chennai, India'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  // Sample data fallback
  const loadSampleData = () => {
    const sampleCandidates = [
      {
        id: '1', applicationDate: '27 Sep 25', name: 'Sachin Sharma', phone: '9999187459',
        email: 'sachin.sharma51051@gmail.com', gender: 'Male', position: 'Senior Software Engineer',
        experience: 6.4, currentlyEmployed: 'Yes', currentCompany: 'Collegedunia Web Private Limited',
        noticePeriod: '60 Days', lastWorkingDay: '', currentSalary: '₹8,50,000',
        expectedSalary: '₹12,00,000', location: 'Delhi, India', source: 'Sample Data',
        resumeUrl: '', maritalStatus: 'Unmarried', resumeScore: 75
      },
      {
        id: '2', applicationDate: '25 Sep 25', name: 'Tawseef Ahmad Bhat', phone: '+91 98765 43211',
        email: 'tawseef.bhat@email.com', gender: 'Male', position: 'Backend Developer',
        experience: 9.7, currentlyEmployed: 'Yes', currentCompany: 'Genesys Bengaluru',
        noticePeriod: '90 Days', lastWorkingDay: '', currentSalary: '₹15,00,000',
        expectedSalary: '₹18,00,000', location: 'Kashmir, India', source: 'Sample Data',
        resumeUrl: '', maritalStatus: 'Married', resumeScore: 82
      }
    ];
    setCandidates(sampleCandidates);
    setSelectedCandidate(sampleCandidates[0]);
  };

  const handleRestrictClick = () => {
    setShowRestrictModal(true);
  };

  const handleUnrestrictClick = () => {
    setShowUnrestrictModal(true);
  };

  const handleRestrictSubmit = async () => {
    if (!restrictReason.trim()) {
      alert('Please enter a reason for restriction');
      return;
    }

    try {
      setSubmittingRestriction(true);
      const userStr = sessionStorage.getItem('fluidjobs_user');
      const userId = userStr ? JSON.parse(userStr).id : 1;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidate-restrictions/restrict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: selectedCandidate?.id,
          userId: userId,
          reason: restrictReason
        })
      });

      if (response.ok) {
        setIsRestricted(true);
        setShowRestrictModal(false);
        setRestrictReason('');
        setSuccessMessage({
          title: 'Success!',
          message: 'Candidate restricted successfully'
        });
        setShowSuccessModal(true);
      } else {
        alert('Failed to restrict candidate');
      }
    } catch (error) {
      console.error('Error restricting candidate:', error);
      alert('Failed to restrict candidate');
    } finally {
      setSubmittingRestriction(false);
    }
  };

  const handleUnrestrictSubmit = async () => {
    if (!unrestrictReason.trim()) {
      alert('Please enter a reason for unrestriction');
      return;
    }

    try {
      setSubmittingUnrestriction(true);
      const userStr = sessionStorage.getItem('fluidjobs_user');
      const userId = userStr ? JSON.parse(userStr).id : 1;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidate-restrictions/unrestrict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: selectedCandidate?.id,
          userId: userId,
          reason: unrestrictReason
        })
      });

      if (response.ok) {
        setIsRestricted(false);
        setShowUnrestrictModal(false);
        setUnrestrictReason('');
        setSuccessMessage({
          title: 'Success!',
          message: 'Candidate unrestricted successfully'
        });
        setShowSuccessModal(true);
      } else {
        alert('Failed to unrestrict candidate');
      }
    } catch (error) {
      console.error('Error unrestricting candidate:', error);
      alert('Failed to unrestrict candidate');
    } finally {
      setSubmittingUnrestriction(false);
    }
  };

  const fetchCandidateJobStatuses = async (candidateId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidate-job-status/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setCandidateJobStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Error fetching candidate job statuses:', error);
    }
  };

  const fetchRestrictionStatus = async (candidateId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidate-restrictions/status/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setIsRestricted(data.isRestricted);
      }
    } catch (error) {
      console.error('Error fetching restriction status:', error);
    }
  };

  React.useEffect(() => {
    const userStr = sessionStorage.getItem('fluidjobs_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || '');
    }
    fetchCandidates();
  }, []);

  React.useEffect(() => {
    if (selectedCandidate) {
      fetchCandidateJobStatuses(selectedCandidate.id);
      fetchRestrictionStatus(selectedCandidate.id);
    }
  }, [selectedCandidate]);
  
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
          {/* Selected items as tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded bg-blue-500 text-white text-xs"
              >
                {item}
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {/* Search input */}
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
                    {selectedItems.includes(option) && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </div>
                ))}
                {selectedItems.length > 0 && (
                  <div className="border-t border-gray-200 p-2">
                    <button
                      onClick={clearAll}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
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
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.custom-dropdown::-webkit-scrollbar { display: none; }`}</style>
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

  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      // Search term filter
      const matchesSearch = (candidate.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (candidate.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (candidate.phone || '').includes(searchTerm);
      
      // Position filter
      const matchesPosition = selectedPosition === 'All Jobs' || candidate.position === selectedPosition;
      
      // Location filter
      const matchesLocation = selectedLocations.length === 0 || 
        selectedLocations.some(loc => candidate.location.toLowerCase().includes(loc.toLowerCase()));
      
      // Experience filter
      const matchesExperience = selectedExperience === 'All Experience' || 
        (selectedExperience === '0-2 years' && candidate.experience <= 2) ||
        (selectedExperience === '3-5 years' && candidate.experience >= 3 && candidate.experience <= 5);
      
      // Skills filter (assuming candidate has skills property - you may need to adjust this)
      const matchesSkills = selectedSkills.length === 0;
      
      return matchesSearch && matchesPosition && matchesLocation && matchesExperience && matchesSkills;
    });
    
    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });
  }, [candidates, searchTerm, selectedPosition, selectedLocations, selectedExperience, selectedSkills, sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader themeState="light" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="flex bg-gray-50 font-sans overflow-hidden border-2 border-gray-200 rounded-lg" style={{ height: 'calc(100% - 16px)', margin: '8px' }}>
      {/* New Filters Section - Leftmost */}
      <div className="w-48 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
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
              options={indianCities}
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
              onChange={(value) => {
                setSelectedSort(value);
                if (value === 'A → Z') setSortOrder('asc');
                else if (value === 'Z → A') setSortOrder('desc');
                else setSortOrder('');
              }}
              dropdownKey="sort"
            />
          </div>
          
          <div className="flex flex-col space-y-2 mt-4">
            <button className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">
              Apply
            </button>
            <button 
              onClick={() => setSearchTerm('')}
              className="w-full px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Left Sidebar - Candidates List */}
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            Candidates ({filteredCandidates.length})
          </h2>
          
          {/* Search Bar */}
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
        


        {/* Candidates Container */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Candidates List */}
          <div className="flex-1 overflow-y-scroll px-4 pb-8" style={{ minHeight: 0, overflowX: 'hidden' }}>

          {filteredCandidates.map((candidate, index) => {
            const matchPercentage = candidate.resumeScore || 35;
            const getMatchColor = (percentage: number) => {
              if (percentage >= 40) return 'bg-red-100 text-red-700';
              return 'bg-red-100 text-red-700';
            };
            
            return (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className={`mb-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedCandidate?.id === candidate.id ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(candidate.name)} flex items-center justify-center text-white font-medium text-sm`}>
                      {getInitials(candidate.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{candidate.name}</h3>
                      <p className="text-xs text-gray-500">{candidate.experience} Yrs | {candidate.currentCompany || 'Not specified'}</p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedCandidate && (
          <>
            {/* Top Header - Candidate Profile Card */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100 p-3 shadow-sm" style={{ minHeight: 0 }}>
              {/* Action Buttons */}
              <div className="flex justify-between items-center mb-6">
                {(userRole === 'Admin' || isSuperAdmin) && (
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleRestrictClick}
                      disabled={isRestricted}
                      className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-medium transition border ${
                        isRestricted ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg width="20" height="20" viewBox="0 0 26 26" fill="none" className="flex-shrink-0">
                        <path d="M3 3L23 23" stroke={isRestricted ? '#D1D5DB' : '#6B6B6B'} strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M10.9 10.9C10.4 11.4 10 12.1 10 13C10 14.7 11.3 16 13 16C13.9 16 14.6 15.6 15.1 15.1" stroke={isRestricted ? '#D1D5DB' : '#6B6B6B'} strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M7.5 7.5C5.5 9 4 11 4 13C4 14.5 7 19 13 19C15 19 16.5 18.5 18 17.5" stroke={isRestricted ? '#D1D5DB' : '#6B6B6B'} strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M20 14C21 12.5 22 11.5 22 13C22 14.5 19 19 13 19" stroke={isRestricted ? '#D1D5DB' : '#6B6B6B'} strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M13 7C17 7 20 10 22 13" stroke={isRestricted ? '#D1D5DB' : '#6B6B6B'} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>Restrict</span>
                    </button>
                    <button 
                      onClick={handleUnrestrictClick}
                      disabled={!isRestricted}
                      className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-medium transition border ${
                        !isRestricted ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                      <span>Unrestrict</span>
                    </button>
                  </div>
                )}
                {(userRole !== 'Admin' && !isSuperAdmin) && <div></div>}
                <div className="flex space-x-3">
                  <button 
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-medium ${
                      isRestricted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {isRestricted ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#FF0004" strokeWidth="1.5"/>
                        <circle cx="12" cy="8" r="0.75" fill="#FF0004"/>
                        <line x1="12" y1="12" x2="12" y2="16" stroke="#FF0004" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#28860B" strokeWidth="1.5"/>
                        <polyline points="8,12 11,15 16,9" stroke="#28860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                    <span>{isRestricted ? 'Inactive' : 'Active'}</span>
                  </button>
                  <button 
                    disabled={isRestricted}
                    onClick={() => {
                      if (!isRestricted) {
                        fetchAvailableJobs();
                        setShowJobNotificationModal(true);
                      }
                    }}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition ${
                      isRestricted 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Send Job Notification
                  </button>
                </div>
              </div>

              {/* Candidate Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${getAvatarColor(selectedCandidate.name)} flex items-center justify-center text-white font-semibold`}>
                  {getInitials(selectedCandidate.name)}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {selectedCandidate.email}
                    </span>
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {selectedCandidate.phone}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Social Links:</div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>

              </div>
            </div>



            {/* Main Content */}
            <div className="flex-1 overflow-y-scroll bg-gray-50 p-6" style={{ overflowX: 'hidden' }}>
                {activeTab === 'Application' ? (
                  <div className="space-y-3" style={{ paddingBottom: '3rem' }}>
                    {/* Work Experience - Full Width */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Work Experience</h3>
                      <div className="space-y-2">
                        {selectedCandidate.currentCompany && selectedCandidate.currentCompany !== 'Not specified' && (
                          <div className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Briefcase className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-600">{selectedCandidate.currentCompany}</p>
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
                      </div>

                      {/* Resume */}
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Resume</h3>
                        {selectedCandidate.resumeUrl ? (
                          <a
                            href={selectedCandidate.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Resume</span>
                          </a>
                        ) : (
                          <p className="text-xs text-gray-500">No resume available</p>
                        )}
                      </div>
                    </div>

                    {/* Job Status Badges */}
                    {candidateJobStatuses.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Job Application Status
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {candidateJobStatuses.map((status) => (
                            <button
                              key={`${status.job_id}-${status.status}`}
                              onClick={() => {
                                console.log('Navigate to job:', status.job_id);
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer ${
                                status.status === 'shortlisted'
                                  ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                                  : 'bg-green-400 text-green-900 hover:bg-green-500'
                              }`}
                            >
                              {status.status === 'shortlisted' ? 'Shortlisted' : 'Selected'} for: {status.job_title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Candidate Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Candidate Information</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Gender</span>
                          <span className="text-sm text-gray-900">{selectedCandidate.gender.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Currently Employed</span>
                          <span className="text-sm text-gray-900">{selectedCandidate.currentlyEmployed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Marital Status</span>
                          <span className="text-sm text-gray-900">{selectedCandidate.maritalStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Location</span>
                          <span className="text-sm text-gray-900">{selectedCandidate.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Notice Period</span>
                          <span className="text-sm text-gray-900">{selectedCandidate.noticePeriod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Current Salary</span>
                          <span className="text-sm text-gray-900">{selectedCandidate.currentSalary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Expected Salary</span>
                          <span className="text-sm text-gray-900">{selectedCandidate.expectedSalary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Full-Time Experience</span>
                          <span className="text-sm text-gray-900">{selectedCandidate.experience} years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full">
                    {/* Left Column - Resume Review */}
                    <div className="w-1/2 p-8 border-r border-gray-100">
                      <div className="max-w-3xl">
                        {/* Full-time Experience Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Full-time Experience</h3>
                            <span className="text-sm text-gray-500">62/100</span>
                          </div>
                          
                          <div className="flex space-x-2 mb-6">
                            <button className="px-4 py-2 bg-black text-white rounded-full text-sm">Section 1</button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">Section 2</button>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">SUB-BUCKET</th>
                                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">CRITERIA</th>
                                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">RATING</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-4 text-sm text-gray-700">UI UX</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">Design Libraries</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">0/100</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-4 text-sm text-gray-700"></td>
                                  <td className="py-3 px-4 text-sm text-gray-700">CSS Mastery</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">0/100</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-4 text-sm text-gray-700"></td>
                                  <td className="py-3 px-4 text-sm text-gray-700">Cross-Browser Compatibility</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">0/100</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-4 text-sm text-gray-700">Web Standards</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">Accessibility</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">0/100</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-4 text-sm text-gray-700"></td>
                                  <td className="py-3 px-4 text-sm text-gray-700">Testing and Unit tests</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">0/100</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-4 text-sm text-gray-700">Past Company Calibres</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">Past company calibre, culture and pace of work</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">96/100</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-4 text-sm text-gray-700">Generic Competency</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">Programming & CS Fundamentals</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">97/100</td>
                                </tr>
                                <tr>
                                  <td className="py-3 px-4 text-sm text-gray-700"></td>
                                  <td className="py-3 px-4 text-sm text-gray-700">Software Engineering Practices</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">55/100</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Profile Match */}
                    <div className="w-1/2 p-8">
                      <div className="max-w-2xl">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-purple-600">Profile Match</h3>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl font-bold text-gray-900">46<span className="text-2xl text-gray-500">/100</span></div>
                            </div>
                          </div>

                          {/* Score Summary */}
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Score Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                              <div className="font-medium text-gray-600">OVERALL</div>
                              <div></div>
                              <div className="font-medium text-gray-600">SKILL BASED</div>
                              <div></div>
                              <div className="font-medium text-gray-600">JD BASED</div>
                              <div></div>
                            </div>
                            
                            {/* Radar Chart Placeholder */}
                            <div className="flex justify-center">
                              <div className="w-48 h-48 bg-gray-50 rounded-lg flex items-center justify-center border">
                                <div className="text-center text-gray-500">
                                  <div className="w-24 h-24 mx-auto mb-2 bg-pink-100 rounded-full flex items-center justify-center">
                                    <div className="w-12 h-12 bg-pink-200 rounded-full"></div>
                                  </div>
                                  <p className="text-sm">Radar Chart</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Potential Mismatches */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Potential Mismatches</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-700">Resume Pages</span>
                                <span className="text-sm text-gray-600 text-right max-w-xs">The number of pages is 1, so no issue detected.</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-700">Switches</span>
                                <span className="text-sm text-gray-600 text-right max-w-xs">No frequent switch of roles detected.</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </>
        )}
      </div>

      {/* Job Notification Modal */}
      {showJobNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Send Job Notification</h2>
              <button
                onClick={() => setShowJobNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Sending notification to: <strong>{selectedCandidate?.name}</strong> ({selectedCandidate?.email})
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
                      {job.job_title} - {Array.isArray(job.locations) ? job.locations.join(', ') : job.locations}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={sendJobNotification}
                disabled={sendingNotification || !selectedJobForNotification}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingNotification ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unrestrict Modal */}
      {showUnrestrictModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Unrestrict Candidate</h2>
              <button
                onClick={() => setShowUnrestrictModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Unrestricting: <strong>{selectedCandidate?.name}</strong>
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
                onClick={handleUnrestrictSubmit}
                disabled={submittingUnrestriction || !unrestrictReason.trim()}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingUnrestriction ? 'Unrestricting...' : 'Unrestrict Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrict Modal */}
      {showRestrictModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Restrict Candidate</h2>
              <button
                onClick={() => setShowRestrictModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Restricting: <strong>{selectedCandidate?.name}</strong>
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
                onClick={handleRestrictSubmit}
                disabled={submittingRestriction || !restrictReason.trim()}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingRestriction ? 'Restricting...' : 'Restrict Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
      />
    </div>
  );
};

export default ManageCandidates;