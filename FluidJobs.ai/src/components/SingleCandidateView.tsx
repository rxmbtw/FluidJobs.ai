import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Building, Calendar, DollarSign } from 'lucide-react';

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

interface ActivityItem {
  id: string;
  type: 'status_change' | 'email' | 'note' | 'interview';
  description: string;
  timestamp: string;
  user: string;
}

interface SingleCandidateViewProps {
  candidate: Candidate;
  onBack: () => void;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'status_change',
    description: 'Status changed from New to Shortlisted',
    timestamp: '2024-01-15 10:30 AM',
    user: 'HR Manager'
  },
  {
    id: '2',
    type: 'email',
    description: 'Interview invitation email sent',
    timestamp: '2024-01-14 2:15 PM',
    user: 'HR Manager'
  },
  {
    id: '3',
    type: 'note',
    description: 'Strong technical background in Python and Django',
    timestamp: '2024-01-14 11:45 AM',
    user: 'Technical Lead'
  }
];

const SingleCandidateView: React.FC<SingleCandidateViewProps> = ({ candidate, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
            <p className="text-sm text-gray-600">{candidate.profile}</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Pane - Candidate Details */}
        <div className="w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{candidate.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Mobile</p>
                <p className="text-sm text-gray-600">{candidate.mobile}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{candidate.city}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Building className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Current Company</p>
                <p className="text-sm text-gray-600">{candidate.currentCompany}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Experience</p>
                <p className="text-sm text-gray-600">{candidate.totalExp}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Notice Period</p>
                <p className="text-sm text-gray-600">{candidate.noticePeriod}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Current Salary</p>
                <p className="text-sm text-gray-600">{candidate.currentSalary}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Expected Salary</p>
                <p className="text-sm text-gray-600">{candidate.expectedSalary}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Current Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {candidate.status}
              </span>
            </div>

            <div className="pt-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Source</p>
              <p className="text-sm text-gray-600">{candidate.source}</p>
            </div>
          </div>
        </div>

        {/* Middle Pane - Activity Timeline */}
        <div className="w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
          
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    {activity.type === 'status_change' && <Calendar className="w-4 h-4 text-indigo-600" />}
                    {activity.type === 'email' && <Mail className="w-4 h-4 text-indigo-600" />}
                    {activity.type === 'note' && <Building className="w-4 h-4 text-indigo-600" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user} • {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Note Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Add Note</h3>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Add a note about this candidate..."
            />
            <button className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
              Add Note
            </button>
          </div>
        </div>

        {/* Right Pane - Resume Viewer */}
        <div className="w-1/3 bg-white p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
          
          {/* Mock Resume Viewer */}
          <div className="border border-gray-300 rounded-lg h-full min-h-[600px] bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2">Resume Preview</p>
              <p className="text-xs text-gray-500">
                {candidate.name}_Resume.pdf
              </p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCandidateView;