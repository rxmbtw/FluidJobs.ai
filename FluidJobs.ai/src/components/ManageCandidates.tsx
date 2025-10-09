import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, FileText, Eye, MoreVertical, Download, Mail, Phone, MapPin, Calendar, Building, DollarSign, Linkedin, User, Clock, Briefcase } from 'lucide-react';

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
    id: 40,
    applicationDate: '15/05/2024 12:02:21',
    name: 'Paritosh Jadhav',
    phone: '+91 90040 82675',
    email: 'paritosh.jadhav@outlook.com',
    gender: 'Male',
    position: 'Python Developer',
    experience: 4,
    currentlyEmployed: false,
    currentCompany: 'VTOL Aviation India',
    noticePeriod: '',
    lastWorkingDay: '20/05/2024',
    currentSalary: '₹26,000.00',
    expectedSalary: '₹70,000.00',
    location: 'Pune (Mah), India',
    source: 'Direct',
    resumeUrl: 'https://s3.amazonaws.com/pf-user-files-01/u-92896/uploads/2024-05-15/l222q6u/Paritosh-Jadhav-resume-v5.pdf',
    maritalStatus: 'Unmarried'
  },
  {
    id: 41,
    applicationDate: '18/05/2024 10:26:37',
    name: 'Jaibhan Singh Gaur',
    phone: '+91 79744 58718',
    email: 'jaybhan8718@gmail.com',
    gender: 'Male',
    position: 'Python-Developer',
    experience: 4,
    currentlyEmployed: true,
    currentCompany: 'Jio Platforms Limited',
    noticePeriod: '60 Days',
    lastWorkingDay: '',
    currentSalary: '₹42,000.00',
    expectedSalary: '₹80,000.00',
    location: 'Navi mumbai',
    source: 'Naukri',
    resumeUrl: 'https://s3.amazonaws.com/pf-user-files-01/u-92896/uploads/2024-05-18/w12300z/Jaibhan_Singh_Gaur%27s_Resume.pdf',
    maritalStatus: 'Unmarried'
  },
  {
    id: 42,
    applicationDate: '20/05/2024 11:47:51',
    name: 'Mayur Suradkar',
    phone: '+91 77560 33455',
    email: 'msuradkar6.ms@gmail.com',
    gender: 'Male',
    position: 'Python-Developer',
    experience: 4,
    currentlyEmployed: true,
    currentCompany: 'Mavenir systems',
    noticePeriod: '90 Days',
    lastWorkingDay: '',
    currentSalary: '₹120,000.00',
    expectedSalary: '₹200,000.00',
    location: 'Nagpur',
    source: 'Naukri',
    resumeUrl: 'https://s3.amazonaws.com/pf-user-files-01/u-92896/uploads/2024-05-20/8704o2b/Mayur_Suradkar_CV_1_2024.pdf',
    maritalStatus: 'Unmarried'
  }
];

const ManageCandidates: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(candidatesData[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Application');
  const [selectedStage, setSelectedStage] = useState('Resume Review');

  const filteredCandidates = useMemo(() => {
    return candidatesData.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone.includes(searchTerm)
    );
  }, [searchTerm]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="flex h-full bg-gray-50 font-sans">
      {/* Left Sidebar - Candidates List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Candidates (116)</h2>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Filter className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm transition-all"
            />
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate)}
              className={`p-5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedCandidate?.id === candidate.id ? 'bg-blue-50 border-r-3 border-r-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-11 h-11 rounded-full ${getAvatarColor(candidate.name)} flex items-center justify-center text-white font-medium text-sm shadow-sm`}>
                  {getInitials(candidate.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">{candidate.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{candidate.experience} Yrs | {candidate.currentCompany || 'Not specified'}</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    48%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedCandidate && (
          <>
            {/* Top Header - Candidate Profile Card */}
            <div className="bg-white border-b border-gray-100 p-8 shadow-sm">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-1 mr-6">
                  <div className="flex items-center space-x-5">
                    <div className={`w-16 h-16 rounded-full ${getAvatarColor(selectedCandidate.name)} flex items-center justify-center text-white font-semibold text-lg shadow-md`}>
                      {getInitials(selectedCandidate.name)}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{selectedCandidate.name}</h1>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <a href={`mailto:${selectedCandidate.email}`} className="flex items-center hover:text-blue-600 transition-colors">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedCandidate.email}
                        </a>
                        <a href={`tel:${selectedCandidate.phone}`} className="flex items-center hover:text-blue-600 transition-colors">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedCandidate.phone}
                        </a>
                        <button className="flex items-center hover:text-blue-600 transition-colors">
                          <Linkedin className="w-4 h-4 mr-2 text-gray-400" />
                          LinkedIn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium shadow-sm transition-all hover:shadow-md">
                  <Users className="w-4 h-4" />
                  <span>Invite Candidates</span>
                </button>
              </div>

              {/* Stage Progress */}
              <div className="flex items-center space-x-12">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">STAGE 1</p>
                    <p className="text-sm font-semibold text-gray-900">Resume Review</p>
                  </div>
                </div>
                <div className="w-16 h-0.5 bg-gray-200 relative">
                  <div className="absolute left-0 top-0 w-8 h-0.5 bg-blue-500"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">STAGE 2</p>
                    <p className="text-sm font-medium text-gray-400">Manual Review</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white border-b border-gray-100">
              <div className="flex space-x-8 px-8">
                {['Application', 'Resume Review'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex bg-gray-50">
              {/* Left Panel - Candidate Details */}
              <div className="w-1/2 p-8 overflow-y-auto bg-white">
                {/* Work Experience */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Work Experience</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-base mb-1">{selectedCandidate.position}</h4>
                        <p className="text-sm text-gray-600 font-medium mb-2">{selectedCandidate.currentCompany}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          1 Mar '22 - {selectedCandidate.currentlyEmployed ? 'Present' : selectedCandidate.lastWorkingDay}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Education</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                        <Building className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-base mb-1">Data Science</h4>
                        <p className="text-sm text-gray-600 font-medium mb-1">Btech Bachelor Of Technology</p>
                        <p className="text-sm text-gray-600 mb-2">Apeejay Dy Patil University, Pune</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          1 Jan '18 - 31 Dec '22 • CGPA: 8.33
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Information */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Candidate Information</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Gender</p>
                        <p className="text-sm text-gray-900 font-medium">{selectedCandidate.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Application Date</p>
                        <p className="text-sm text-gray-900 font-medium">{selectedCandidate.applicationDate.split(' ')[0]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience Details */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Experience</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Full-Time Experience:</p>
                          <p className="text-sm text-gray-900 font-medium">{selectedCandidate.experience} years</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Notice Period:</p>
                          <p className="text-sm text-gray-900 font-medium">{selectedCandidate.noticePeriod || 'Immediate'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Current Salary:</p>
                          <p className="text-sm text-gray-900 font-medium">{selectedCandidate.currentSalary}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Technical Skills</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {['Python', 'Django', 'React', 'PostgreSQL', 'AWS', 'Docker'].map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Resume Viewer */}
              <div className="w-1/2 border-l border-gray-100 p-8 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">Resume</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 font-medium">88%</span>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                {/* Embedded PDF Viewer */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full min-h-[700px] overflow-hidden">
                  <iframe
                    src={`${selectedCandidate.resumeUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    className="w-full h-full"
                    title={`${selectedCandidate.name} Resume`}
                    style={{ minHeight: '700px' }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageCandidates;