import React, { useState } from 'react';
import { Settings, Plus, Search, Mail, FileText, MoreVertical } from 'lucide-react';
import SingleCandidateView from './SingleCandidateView';

interface Candidate {
  id: string;
  name: string;
  mobile: string;
  email: string;
  profile: string;
  totalExp: string;
  currentCompany: string;
  noticePeriod: string;
  currentSalary: string;
  expectedSalary: string;
  status: string;
  source: string;
  city: string;
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    mobile: '+91 9876543210',
    email: 'rahul.sharma@email.com',
    profile: 'Python Developer',
    totalExp: '3.5 years',
    currentCompany: 'TCS',
    noticePeriod: '30 days',
    currentSalary: '₹6.5 LPA',
    expectedSalary: '₹9 LPA',
    status: 'New',
    source: 'Naukri',
    city: 'Pune'
  },
  {
    id: '2',
    name: 'Priya Patel',
    mobile: '+91 9876543211',
    email: 'priya.patel@email.com',
    profile: 'Python Developer',
    totalExp: '2 years',
    currentCompany: 'Infosys',
    noticePeriod: '60 days',
    currentSalary: '₹5 LPA',
    expectedSalary: '₹7.5 LPA',
    status: 'Shortlisted',
    source: 'LinkedIn',
    city: 'Mumbai'
  }
];

const statusTabs = [
  { id: 'all', label: 'All', count: 135 },
  { id: 'new', label: 'New', count: 45 },
  { id: 'shortlisted', label: 'Shortlisted', count: 32 },
  { id: 'interview', label: 'Interview', count: 28 },
  { id: 'offered', label: 'Offered', count: 15 },
  { id: 'hired', label: 'Hired', count: 8 },
  { id: 'rejected', label: 'Rejected', count: 7 }
];

const ATSContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedCandidateForView, setSelectedCandidateForView] = useState<Candidate | null>(null);

  const handleStatusChange = (candidateId: string, newStatus: string) => {
    console.log(`Updating candidate ${candidateId} to status ${newStatus}`);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} for candidates:`, selectedCandidates);
  };

  if (selectedCandidateForView) {
    return (
      <SingleCandidateView 
        candidate={selectedCandidateForView}
        onBack={() => setSelectedCandidateForView(null)}
      />
    );
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Candidates (116)</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Pipeline Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option>All Experience</option>
            <option>0-2 years</option>
            <option>3-5 years</option>
            <option>5+ years</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCandidates.length > 0 && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-indigo-700">
              {selectedCandidates.length} candidate(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('email')}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Send Email
              </button>
              <button
                onClick={() => handleBulkAction('status')}
                className="px-3 py-1 bg-white text-indigo-600 text-sm rounded border border-indigo-600 hover:bg-indigo-50"
              >
                Change Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidates Table */}
      <div className="bg-white flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCandidates(mockCandidates.map(c => c.id));
                    } else {
                      setSelectedCandidates([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockCandidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidates([...selectedCandidates, candidate.id]);
                      } else {
                        setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4">
                  <div 
                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600"
                    onClick={() => setSelectedCandidateForView(candidate)}
                  >
                    {candidate.name}
                  </div>
                  <div className="text-sm text-gray-500">{candidate.profile}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{candidate.mobile}</div>
                  <div className="text-sm text-gray-500">{candidate.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {candidate.totalExp}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{candidate.currentCompany}</div>
                  <div className="text-sm text-gray-500">{candidate.noticePeriod}</div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={candidate.status}
                    onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="New">New</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Offered">Offered</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button 
                      className="p-1 hover:bg-gray-100 rounded" 
                      title="View CV"
                      onClick={() => setSelectedCandidateForView(candidate)}
                    >
                      <FileText className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded" 
                      title="Send Email"
                      onClick={() => setShowEmailModal(true)}
                    >
                      <Mail className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="More">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ATSContent;