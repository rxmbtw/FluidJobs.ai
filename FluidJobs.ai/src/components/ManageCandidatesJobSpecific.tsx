import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, Eye, Mail, Phone, Linkedin, User, Briefcase } from 'lucide-react';
import { indianCities } from '../data/indianCities';

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

  React.useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    const filtered = candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.includes(searchTerm)
    );
    
    return filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }, [candidates, searchTerm, sortOrder]);

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
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-200 shadow-lg w-64 z-10 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Location</label>
                  <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                    <option>All Locations</option>
                    {indianCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
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
                <button 
                  className="flex items-center space-x-2 px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Verify Details</span>
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={handleShortlist}
                    disabled={isShortlisted}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition ${
                      isShortlisted
                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
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


    </div>
  );
};

export default ManageCandidatesJobSpecific;
