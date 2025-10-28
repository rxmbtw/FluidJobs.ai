import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Star,
  MoreVertical,
  Plus,
  RefreshCw,
  User
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  experience: string;
  company: string;
  skills: string[];
  status: 'Active' | 'Inactive' | 'Hired' | 'Rejected';
  rating: number;
  appliedDate: string;
  resumeUrl?: string;
  matchScore: number;
  avatar: string;
}

const ManageCandidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState('All Jobs');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [skillsFilter, setSkillsFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('resume');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockCandidates: Candidate[] = [
      {
        id: '1',
        name: 'Sachin Sharma',
        email: 'sachin.sharma@email.com',
        phone: '+91 98765 43210',
        location: 'Delhi, India',
        position: 'Frontend Developer',
        experience: '6.4 Yrs',
        company: 'Collegedunia',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        status: 'Active',
        rating: 4.6,
        appliedDate: '2024-01-15',
        resumeUrl: '/resumes/sachin-sharma.pdf',
        matchScore: 92,
        avatar: 'SS'
      },
      {
        id: '2',
        name: 'Tawseef Ahmad Bhat',
        email: 'tawseef.bhat@email.com',
        phone: '+91 98765 43211',
        location: 'Kashmir, India',
        position: 'Backend Developer',
        experience: '9.7 Yrs',
        company: 'Genesys Bengaluru',
        skills: ['Node.js', 'Express', 'MongoDB', 'API'],
        status: 'Active',
        rating: 4.2,
        appliedDate: '2024-01-12',
        resumeUrl: '/resumes/tawseef-bhat.pdf',
        matchScore: 88,
        avatar: 'TB'
      },
      {
        id: '3',
        name: 'SIDDHARTH MARAT',
        email: 'siddharth.marat@email.com',
        phone: '+91 98765 43212',
        location: 'Mumbai, India',
        position: 'Fullstack Developer',
        experience: '10.8 Yrs',
        company: 'AgroStar',
        skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        status: 'Active',
        rating: 4.1,
        appliedDate: '2024-01-10',
        resumeUrl: '/resumes/siddharth-marat.pdf',
        matchScore: 85,
        avatar: 'SM'
      },
      {
        id: '4',
        name: 'Supriya Pasupuleti',
        email: 'supriya.pasupuleti@email.com',
        phone: '+91 98765 43213',
        location: 'Hyderabad, India',
        position: 'Data Scientist',
        experience: '5.9 Yrs',
        company: 'Saama Technologies',
        skills: ['Python', 'Machine Learning', 'SQL', 'Tableau'],
        status: 'Active',
        rating: 3.5,
        appliedDate: '2024-01-08',
        resumeUrl: '/resumes/supriya-pasupuleti.pdf',
        matchScore: 78,
        avatar: 'SP'
      },
      {
        id: '5',
        name: 'VEDHAS PATIL',
        email: 'vedhas.patil@email.com',
        phone: '+91 98765 43214',
        location: 'Pune, India',
        position: 'UX Designer',
        experience: '2.6 Yrs',
        company: 'Go Digital',
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        status: 'Active',
        rating: 3.5,
        appliedDate: '2024-01-05',
        resumeUrl: '/resumes/vedhas-patil.pdf',
        matchScore: 72,
        avatar: 'VP'
      },
      {
        id: '6',
        name: 'Rahul Kumar',
        email: 'rahul.kumar@email.com',
        phone: '+91 98765 43215',
        location: 'Bangalore, India',
        position: 'DevOps Engineer',
        experience: '4.2 Yrs',
        company: 'TechCorp',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
        status: 'Active',
        rating: 4.0,
        appliedDate: '2024-01-03',
        resumeUrl: '/resumes/rahul-kumar.pdf',
        matchScore: 68,
        avatar: 'RK'
      }
    ];
    
    setTimeout(() => {
      setCandidates(mockCandidates);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;
    const matchesJob = selectedJob === 'All Jobs' || candidate.position === selectedJob;
    
    const expYears = parseFloat(candidate.experience);
    const matchesExperience = experienceFilter === 'All' || 
      (experienceFilter === '0-2' && expYears <= 2) ||
      (experienceFilter === '3-5' && expYears >= 3 && expYears <= 5) ||
      (experienceFilter === '6-10' && expYears >= 6 && expYears <= 10) ||
      (experienceFilter === '10+' && expYears > 10);
    
    const matchesLocation = locationFilter === 'All' || candidate.location.includes(locationFilter);
    
    const matchesSkills = skillsFilter === 'All' || 
      candidate.skills.some(skill => skill.toLowerCase().includes(skillsFilter.toLowerCase()));
    
    const matchesScore = scoreFilter === 'All' ||
      (scoreFilter === '80+' && candidate.matchScore >= 80) ||
      (scoreFilter === '60-79' && candidate.matchScore >= 60 && candidate.matchScore < 80) ||
      (scoreFilter === '40-59' && candidate.matchScore >= 40 && candidate.matchScore < 60) ||
      (scoreFilter === '<40' && candidate.matchScore < 40);
    
    return matchesSearch && matchesStatus && matchesJob && matchesExperience && matchesLocation && matchesSkills && matchesScore;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
      'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'
    ];
    return colors[name.length % colors.length];
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Filters */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Manage Candidates</h1>
          <p className="text-sm text-gray-500">All Job Applications</p>
          <button className="mt-3 flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100">
            <Plus className="w-4 h-4" />
            <span>Invite</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Job Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by Job</h3>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="All Jobs">All Jobs</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Fullstack Developer">Fullstack Developer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="UX Designer">UX Designer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Product Manager">Product Manager</option>
          </select>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </h3>
            <button 
              onClick={() => {
                setExperienceFilter('All');
                setLocationFilter('All');
                setSkillsFilter('All');
                setScoreFilter('All');
                setStatusFilter('All');
                setSelectedJob('All Jobs');
                setSearchTerm('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          </div>

          {/* Filter Options */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="text-sm text-gray-700 block mb-2">Experience Level</label>
              <select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded p-1">
                <option value="All">All</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="text-sm text-gray-700 block mb-2">Location</label>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded p-1">
                <option value="All">All</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Kashmir">Kashmir</option>
              </select>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="text-sm text-gray-700 block mb-2">Skills</label>
              <select value={skillsFilter} onChange={(e) => setSkillsFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded p-1">
                <option value="All">All</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="AWS">AWS</option>
                <option value="Docker">Docker</option>
              </select>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="text-sm text-gray-700 block mb-2">Match Score</label>
              <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded p-1">
                <option value="All">All</option>
                <option value="80+">80% and above</option>
                <option value="60-79">60-79%</option>
                <option value="40-59">40-59%</option>
                <option value="<40">Below 40%</option>
              </select>
            </div>
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="text-sm text-gray-700 block mb-2">Application Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full text-xs border border-gray-300 rounded p-1">
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('application')}
              className={`text-sm pb-1 ${activeTab === 'application' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Application
            </button>
            <button 
              onClick={() => setActiveTab('resume')}
              className={`text-sm pb-1 ${activeTab === 'resume' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Resume Review
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 p-6">
          {filteredCandidates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          ) : activeTab === 'resume' ? (
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => (
                <div key={candidate.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedCandidate(candidate); setShowProfile(true); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${getAvatarColor(candidate.name)} flex items-center justify-center text-white font-medium text-sm`}>
                        {candidate.avatar}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.experience} | {candidate.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(candidate.matchScore)}`}>
                          {candidate.matchScore}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedCandidate(candidate); setShowProfile(true); }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(candidate.name)} flex items-center justify-center text-white font-medium text-xs`}>
                            {candidate.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{candidate.position}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{candidate.experience}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{candidate.location}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          candidate.status === 'Active' ? 'bg-green-100 text-green-800' :
                          candidate.status === 'Hired' ? 'bg-blue-100 text-blue-800' :
                          candidate.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{new Date(candidate.appliedDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {showProfile && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Candidate Profile</h2>
                <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full ${getAvatarColor(selectedCandidate.name)} flex items-center justify-center text-white font-medium text-xl`}>
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedCandidate.name}</h3>
                    <p className="text-gray-600">{selectedCandidate.position}</p>
                    <div className={`text-2xl font-bold ${getScoreColor(selectedCandidate.matchScore)} mt-1`}>
                      Match Score: {selectedCandidate.matchScore}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedCandidate.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">{selectedCandidate.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <p className="text-gray-900">{selectedCandidate.experience}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-gray-900">{selectedCandidate.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedCandidate.status === 'Active' ? 'bg-green-100 text-green-800' :
                      selectedCandidate.status === 'Hired' ? 'bg-blue-100 text-blue-800' :
                      selectedCandidate.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCandidate.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Schedule Interview
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                    Download Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;