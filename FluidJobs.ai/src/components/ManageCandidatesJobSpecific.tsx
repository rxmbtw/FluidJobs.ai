import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, Eye, Mail, Phone, Linkedin, User, Briefcase, Ban, Check } from 'lucide-react';
import { indianCities } from '../data/indianCities';
import SuccessModal from './SuccessModal';

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

interface ManageCandidatesJobSpecificProps {
  jobId?: string;
  shortlistedCandidates?: Candidate[];
  onShortlist?: (candidate: Candidate) => void;
  onUnshortlist?: (candidateId: string) => void;
}

const ManageCandidatesJobSpecific: React.FC<ManageCandidatesJobSpecificProps> = ({ 
  jobId,
  shortlistedCandidates = [], 
  onShortlist, 
  onUnshortlist 
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');
  const [isRestricted, setIsRestricted] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [showUnrestrictModal, setShowUnrestrictModal] = useState(false);
  const [restrictReason, setRestrictReason] = useState('');
  const [unrestrictReason, setUnrestrictReason] = useState('');
  const [submittingRestriction, setSubmittingRestriction] = useState(false);
  const [submittingUnrestriction, setSubmittingUnrestriction] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  
  const [filters, setFilters] = useState({
    location: '',
    minExperience: '',
    maxExperience: '',
    currentlyEmployed: '',
    noticePeriod: '',
    minSalary: '',
    maxSalary: '',
    gender: '',
    maritalStatus: ''
  });


  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates?page=1&limit=1000`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.candidates?.length > 0) {
          const formattedCandidates = data.data.candidates.map((candidate: any) => ({
            id: candidate.candidate_id,
            applicationDate: new Date().toLocaleDateString('en-GB'),
            name: candidate.full_name,
            phone: candidate.phone_number || '',
            email: candidate.email,
            gender: candidate.gender || 'Male',
            position: 'Software Engineer',
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
        }
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = () => {
    console.log('Shortlist clicked', { selectedCandidate, jobId, onShortlist });
    if (selectedCandidate && onShortlist) {
      onShortlist(selectedCandidate);
    }
  };

  const isShortlisted = selectedCandidate ? shortlistedCandidates.some(c => c.id === selectedCandidate.id) : false;

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
      const user = userStr ? JSON.parse(userStr) : { id: 1, name: 'Admin', role: 'SuperAdmin' };
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidate-restrictions/restrict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: selectedCandidate?.id,
          userId: user.id,
          reason: restrictReason,
          userName: user.name || user.username || 'Unknown User',
          userRole: user.role || 'SuperAdmin',
          candidateName: selectedCandidate?.name
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
      const user = userStr ? JSON.parse(userStr) : { id: 1, name: 'Admin', role: 'SuperAdmin' };
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/superadmin/unrestrict-candidate/${selectedCandidate?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: unrestrictReason,
          unrestricted_by_user_id: user.id,
          unrestricted_by_name: user.name || user.username || 'Unknown User',
          unrestricted_by_role: user.role || 'SuperAdmin'
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
    fetchCandidates();
  }, []);

  React.useEffect(() => {
    if (selectedCandidate) {
      fetchRestrictionStatus(selectedCandidate.id);
    }
  }, [selectedCandidate]);

  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone.includes(searchTerm);
      
      if (!matchesSearch) return false;
      
      if (filters.location && candidate.location !== filters.location) return false;
      if (filters.minExperience && candidate.experience < parseFloat(filters.minExperience)) return false;
      if (filters.maxExperience && candidate.experience > parseFloat(filters.maxExperience)) return false;
      if (filters.currentlyEmployed && candidate.currentlyEmployed !== filters.currentlyEmployed) return false;
      if (filters.noticePeriod && candidate.noticePeriod !== filters.noticePeriod) return false;
      if (filters.gender && candidate.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;
      if (filters.maritalStatus && candidate.maritalStatus !== filters.maritalStatus) return false;
      
      if (filters.minSalary) {
        const currentSalary = parseFloat(candidate.currentSalary.replace(/[^0-9]/g, ''));
        if (currentSalary < parseFloat(filters.minSalary)) return false;
      }
      if (filters.maxSalary) {
        const currentSalary = parseFloat(candidate.currentSalary.replace(/[^0-9]/g, ''));
        if (currentSalary > parseFloat(filters.maxSalary)) return false;
      }
      
      return true;
    });
    
    return filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }, [candidates, searchTerm, sortOrder, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[35%] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={fetchCandidates}
                className="p-2 hover:bg-gray-100 rounded border border-gray-300"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded">
              <User className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            Candidates ({filteredCandidates.length})
          </h2>
          
          <div className="flex items-center space-x-2 mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded border border-gray-300 flex-shrink-0"
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-shrink-0"
            >
              <option value="">Sort</option>
              <option value="asc">Alphabetical Asc. (A → Z)</option>
              <option value="desc">Alphabetical Desc. (Z → A)</option>
            </select>
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

        <div className="flex-1 flex relative">
          {showFilters && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-200 shadow-lg w-64 z-10 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Location</label>
                  <select 
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="">All Locations</option>
                    {indianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Experience (Years)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minExperience}
                      onChange={(e) => setFilters({...filters, minExperience: e.target.value})}
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxExperience}
                      onChange={(e) => setFilters({...filters, maxExperience: e.target.value})}
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Currently Employed</label>
                  <select
                    value={filters.currentlyEmployed}
                    onChange={(e) => setFilters({...filters, currentlyEmployed: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="">All</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Notice Period</label>
                  <select
                    value={filters.noticePeriod}
                    onChange={(e) => setFilters({...filters, noticePeriod: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="">All</option>
                    <option value="Immediate">Immediate</option>
                    <option value="15 days">15 days</option>
                    <option value="30 days">30 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Salary Range (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minSalary}
                      onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxSalary}
                      onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters({...filters, gender: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Marital Status</label>
                  <select
                    value={filters.maritalStatus}
                    onChange={(e) => setFilters({...filters, maritalStatus: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="">All</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                <button
                  onClick={() => setFilters({
                    location: '',
                    minExperience: '',
                    maxExperience: '',
                    currentlyEmployed: '',
                    noticePeriod: '',
                    minSalary: '',
                    maxSalary: '',
                    gender: '',
                    maritalStatus: ''
                  })}
                  className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto px-4">
            {filteredCandidates.map((candidate) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedCandidate && (
          <>
            <div className="bg-white border-b border-gray-100 p-3">
              <div className="flex justify-between items-center mb-6">
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
                    onClick={handleShortlist}
                    disabled={isShortlisted || isRestricted}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition ${
                      isShortlisted
                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                        : isRestricted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                  </button>
                </div>
              </div>

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

            <div className="flex-1 bg-white overflow-y-auto">
              <div className="p-6 space-y-3">
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <h3 className="text-sm font-semibold text-gray-900">Skills</h3>
                  </div>

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
            </div>
          </>
        )}
      </div>


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

export default ManageCandidatesJobSpecific;
