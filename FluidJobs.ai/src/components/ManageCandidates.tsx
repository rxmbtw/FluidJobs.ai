import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, FileText, Eye, MoreVertical, Download, Mail, Phone, MapPin, Calendar, Building, DollarSign, Linkedin, User, Clock, Briefcase, Plus } from 'lucide-react';

interface Candidate {
  id: number;
  applicationDate: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  position: string;
  experience: number;
  currentlyEmployed: boolean;
  currentCompany: string;
  noticePeriod: string;
  lastWorkingDay: string;
  currentSalary: string;
  expectedSalary: string;
  location: string;
  source: string;
  resumeUrl: string;
  maritalStatus: string;
}

const candidatesData: Candidate[] = [
  {
    id: 1,
    applicationDate: '27 Sep 25',
    name: 'Sachin Sharma',
    phone: '9999187459',
    email: 'sachin.sharma51051@gmail.com',
    gender: 'Male',
    position: 'Senior Software Engineer',
    experience: 6.4,
    currentlyEmployed: true,
    currentCompany: 'Collegedunia Web Private Limited',
    noticePeriod: '60 Days',
    lastWorkingDay: '',
    currentSalary: '₹8,50,000',
    expectedSalary: '₹12,00,000',
    location: 'Delhi, India',
    source: 'Bulk Upload',
    resumeUrl: 'https://example.com/resume1.pdf',
    maritalStatus: 'Unmarried'
  },
  {
    id: 2,
    applicationDate: '25 Sep 25',
    name: 'Tawseef Ahmad Bhat',
    phone: '+91 98765 43211',
    email: 'tawseef.bhat@email.com',
    gender: 'Male',
    position: 'Backend Developer',
    experience: 9.7,
    currentlyEmployed: true,
    currentCompany: 'Genesys Bengaluru',
    noticePeriod: '90 Days',
    lastWorkingDay: '',
    currentSalary: '₹15,00,000',
    expectedSalary: '₹18,00,000',
    location: 'Kashmir, India',
    source: 'Naukri',
    resumeUrl: 'https://example.com/resume2.pdf',
    maritalStatus: 'Married'
  },
  {
    id: 3,
    applicationDate: '23 Sep 25',
    name: 'SIDDHARTH MARAT',
    phone: '+91 98765 43212',
    email: 'siddharth.marat@email.com',
    gender: 'Male',
    position: 'Full Stack Developer',
    experience: 10.8,
    currentlyEmployed: true,
    currentCompany: 'AgroStar',
    noticePeriod: '30 Days',
    lastWorkingDay: '',
    currentSalary: '₹18,00,000',
    expectedSalary: '₹22,00,000',
    location: 'Mumbai, India',
    source: 'LinkedIn',
    resumeUrl: 'https://example.com/resume3.pdf',
    maritalStatus: 'Married'
  },
  {
    id: 4,
    applicationDate: '20 Sep 25',
    name: 'Supriya Pasupuleti',
    phone: '+91 98765 43213',
    email: 'supriya.pasupuleti@email.com',
    gender: 'Female',
    position: 'Data Scientist',
    experience: 5.9,
    currentlyEmployed: true,
    currentCompany: 'Saama Technologies',
    noticePeriod: '60 Days',
    lastWorkingDay: '',
    currentSalary: '₹12,00,000',
    expectedSalary: '₹15,00,000',
    location: 'Hyderabad, India',
    source: 'Direct',
    resumeUrl: 'https://example.com/resume4.pdf',
    maritalStatus: 'Unmarried'
  },
  {
    id: 5,
    applicationDate: '18 Sep 25',
    name: 'VEDHAS PATIL',
    phone: '+91 98765 43214',
    email: 'vedhas.patil@email.com',
    gender: 'Male',
    position: 'UX Designer',
    experience: 2.6,
    currentlyEmployed: true,
    currentCompany: 'Go Digital',
    noticePeriod: '30 Days',
    lastWorkingDay: '',
    currentSalary: '₹6,00,000',
    expectedSalary: '₹8,00,000',
    location: 'Pune, India',
    source: 'Referral',
    resumeUrl: 'https://example.com/resume5.pdf',
    maritalStatus: 'Unmarried'
  },
  {
    id: 6,
    applicationDate: '15 Sep 25',
    name: 'Priyanshu Agrawal',
    phone: '+91 98765 43215',
    email: 'priyanshu.agrawal@email.com',
    gender: 'Male',
    position: 'DevOps Engineer',
    experience: 7.1,
    currentlyEmployed: true,
    currentCompany: 'Delivery',
    noticePeriod: '90 Days',
    lastWorkingDay: '',
    currentSalary: '₹14,00,000',
    expectedSalary: '₹17,00,000',
    location: 'Bangalore, India',
    source: 'Naukri',
    resumeUrl: 'https://example.com/resume6.pdf',
    maritalStatus: 'Married'
  },
  {
    id: 7,
    applicationDate: '12 Sep 25',
    name: 'Jaibhan Singh Gaur',
    phone: '+91 98765 43216',
    email: 'jaibhan.gaur@email.com',
    gender: 'Male',
    position: 'Frontend Developer',
    experience: 6.3,
    currentlyEmployed: true,
    currentCompany: 'Jio Platforms',
    noticePeriod: '60 Days',
    lastWorkingDay: '',
    currentSalary: '₹11,00,000',
    expectedSalary: '₹14,00,000',
    location: 'Mumbai, India',
    source: 'LinkedIn',
    resumeUrl: 'https://example.com/resume7.pdf',
    maritalStatus: 'Unmarried'
  },
  {
    id: 8,
    applicationDate: '10 Sep 25',
    name: 'Shubham Tomar',
    phone: '+91 98765 43217',
    email: 'shubham.tomar@email.com',
    gender: 'Male',
    position: 'Backend Developer',
    experience: 2.7,
    currentlyEmployed: true,
    currentCompany: 'Bajaj Finserv',
    noticePeriod: '30 Days',
    lastWorkingDay: '',
    currentSalary: '₹7,50,000',
    expectedSalary: '₹10,00,000',
    location: 'Pune, India',
    source: 'Direct',
    resumeUrl: 'https://example.com/resume8.pdf',
    maritalStatus: 'Unmarried'
  },
  {
    id: 9,
    applicationDate: '8 Sep 25',
    name: 'Kalpnath Singh Kumar',
    phone: '+91 98765 43218',
    email: 'kalpnath.kumar@email.com',
    gender: 'Male',
    position: 'Senior Full Stack Developer',
    experience: 20.1,
    currentlyEmployed: true,
    currentCompany: 'Wells Fargo',
    noticePeriod: '90 Days',
    lastWorkingDay: '',
    currentSalary: '₹25,00,000',
    expectedSalary: '₹30,00,000',
    location: 'Hyderabad, India',
    source: 'Referral',
    resumeUrl: 'https://example.com/resume9.pdf',
    maritalStatus: 'Married'
  }
];

const ManageCandidates: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(candidatesData[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Application');
  const [selectedStage, setSelectedStage] = useState('Resume Review');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCandidates = useMemo(() => {
    return candidatesData.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.includes(searchTerm)
    );
  }, [searchTerm]);

  // Initialize with first candidate if none selected
  React.useEffect(() => {
    if (!selectedCandidate && filteredCandidates.length > 0) {
      setSelectedCandidate(filteredCandidates[0]);
    }
  }, [filteredCandidates, selectedCandidate]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Left Sidebar - Filters and Candidates List */}
      <div className="w-[42.5%] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded border border-gray-300">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded">
              <User className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <h2 className="text-sm font-medium text-gray-900 mb-4">Candidates ({filteredCandidates.length})</h2>
          
          {/* Filter Button and Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded border border-gray-300 flex-shrink-0"
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
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
        


        {/* Filter and Candidates Container */}
        <div className="flex-1 flex">
          {/* Filter Panel */}
          <div className={`bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden ${showFilters ? 'w-64' : 'w-0'}`}>
            {showFilters && (
              <div className="p-4 w-64">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Position</label>
                    <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                      <option>All Jobs</option>
                      <option>Python Developer</option>
                      <option>Frontend Developer</option>
                      <option>Backend Developer</option>
                      <option>Full Stack Developer</option>
                      <option>DevOps Engineer</option>
                      <option>Data Scientist</option>
                      <option>UX Designer</option>
                      <option>Java Developer</option>
                      <option>React Developer</option>
                      <option>Node.js Developer</option>
                      <option>Software Engineer</option>
                      <option>Senior Software Engineer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Location</label>
                    <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                      <option>All Locations</option>
                      <option>Delhi</option>
                      <option>Mumbai</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Experience</label>
                    <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                      <option>All Experience</option>
                      <option>0-2 years</option>
                      <option>3-5 years</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Skills</label>
                    <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs">
                      <option>All Skills</option>
                      <option>React</option>
                      <option>Node.js</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Candidates List */}
          <div className="flex-1 overflow-y-auto px-4">
          {filteredCandidates.map((candidate, index) => {
            const matchPercentages = [46, 42, 41, 35, 35, 35, 35, 35, 35];
            const matchPercentage = matchPercentages[index] || 35;
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
                      <p className="text-xs text-gray-500">{candidate.experience} Yrs | {candidate.currentCompany}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 relative">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray={`${matchPercentage}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-red-600">{matchPercentage}%</span>
                      </div>
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
      <div className="flex-1 flex flex-col">
        {selectedCandidate && (
          <>
            {/* Top Header - Candidate Profile Card */}
            <div className="bg-white border-b border-gray-100 p-6">
              {/* Stage Progress */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">STAGE 1</p>
                      <p className="text-sm font-semibold text-gray-900">Resume Review</p>
                    </div>
                  </div>
                  <div className="w-12 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase">STAGE 2</p>
                      <p className="text-sm font-medium text-gray-400">Manual Review</p>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  <span>Invite</span>
                </button>
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
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase mb-1">STAGE 1</div>
                  <div className="text-sm font-semibold text-gray-900">Resume Review</div>
                  <div className={`text-2xl font-bold mt-1 ${
                    (() => {
                      const matchPercentages = [46, 42, 31, 35, 35, 35, 33, 29, 31];
                      const index = candidatesData.findIndex(c => c.id === selectedCandidate.id);
                      const percentage = matchPercentages[index] || 30;
                      return percentage >= 40 ? 'text-red-600' : percentage >= 30 ? 'text-orange-600' : 'text-gray-600';
                    })()
                  }`}>
                    {(() => {
                      const matchPercentages = [46, 42, 31, 35, 35, 35, 33, 29, 31];
                      const index = candidatesData.findIndex(c => c.id === selectedCandidate.id);
                      return matchPercentages[index] || 30;
                    })()}%
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white border-b border-gray-100">
              <div className="flex space-x-6 px-6">
                {['Application', 'Resume Review'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-all ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white">
              <div className="h-full overflow-y-auto">
                {activeTab === 'Application' ? (
                  <div className="flex h-full">
                    {/* Left Column */}
                    <div className="w-1/2 p-8 border-r border-gray-100">
                      <div className="max-w-2xl">
                        {/* Work Experience */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{selectedCandidate.position}</h4>
                                <p className="text-sm text-gray-600 mb-1">{selectedCandidate.currentCompany}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  1 Nov '22 - Present
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                                <Briefcase className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">Software Engineer</h4>
                                <p className="text-sm text-gray-600 mb-1">Collegedunia Web Private Limited</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  1 Jun '19 - 30 Nov '22
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Candidate Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Gender</span>
                              <span className="text-sm text-gray-900">{selectedCandidate.gender.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Candidate Source</span>
                              <span className="text-sm text-gray-900">{selectedCandidate.source}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Application Date</span>
                              <span className="text-sm text-gray-900">{selectedCandidate.applicationDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Full-Time Experience</span>
                              <span className="text-sm text-gray-900">{selectedCandidate.experience} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Internship Experience</span>
                              <span className="text-sm text-gray-900">N/A</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Relevant Experience</span>
                              <span className="text-sm text-gray-900">{selectedCandidate.experience} years</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-1/2 p-8">
                      <div className="max-w-2xl">
                        {/* Education */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                              <Building className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">Computer Science Engineering</h4>
                              <p className="text-sm text-gray-600 mb-1">Btech Bachelor Of Technology</p>
                              <p className="text-sm text-gray-600 mb-1">Jaypee Institute of Information Technology</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                1 May '15 - 31 Dec '19 • CGPA: 7.0
                              </div>
                            </div>
                          </div>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageCandidates;