import React, { useState } from 'react';
import { ArrowLeft, Users, Zap, Settings, MessageCircle, TestTube } from 'lucide-react';
import ManageCandidates from './ManageCandidates';
import JobSettings from './JobSettings';

interface JobSpecificDashboardProps {
  jobTitle: string;
  jobId?: string;
  onBack: () => void;
  onJobUpdate?: (updatedJob: any) => void;
}

const JobSpecificDashboard: React.FC<JobSpecificDashboardProps> = ({ jobTitle, jobId, onBack, onJobUpdate }) => {
  console.log('JobSpecificDashboard received props:', { jobTitle, jobId });
  const [currentJobTitle, setCurrentJobTitle] = useState(jobTitle);
  
  // Debug: Log jobId to ensure it's being passed correctly
  console.log('JobSpecificDashboard jobId for JobSettings:', jobId);

  const handleJobUpdate = (updatedJob: any) => {
    setCurrentJobTitle(updatedJob.title);
    if (onJobUpdate) {
      onJobUpdate(updatedJob);
    }
  };
  const [activeSection, setActiveSection] = useState('manage-candidates');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'manage-candidates', label: 'Manage Candidates', icon: Users },
    { id: 'hiring-automation', label: 'Hiring Automation', icon: Zap },
    { id: 'job-settings', label: 'Job Settings', icon: Settings },
    { id: 'testing-environment', label: 'Testing Environment', icon: TestTube }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'manage-candidates':
        return <ManageCandidates isJobSpecific={true} />;
      case 'hiring-automation':
        return (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-4xl font-bold text-gray-400">Coming Soon !</h2>
          </div>
        );
      case 'job-settings':
        console.log('Passing jobId to JobSettings:', jobId);
        return <JobSettings jobTitle={currentJobTitle} jobId={jobId} onJobUpdate={handleJobUpdate} />;

      case 'testing-environment':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Testing Environment</h2>
            <p className="text-gray-600">Testing tools and environment setup.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Header with Back Button and Job Title */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Openings</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">{currentJobTitle}</h1>
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
    </div>
  );
};

export default JobSpecificDashboard;