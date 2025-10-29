import React, { useState } from 'react';
import { ArrowLeft, Users, Zap, Settings, MessageCircle, TestTube } from 'lucide-react';
import ManageCandidates from './ManageCandidates';

interface JobSpecificDashboardProps {
  jobTitle: string;
  onBack: () => void;
}

const JobSpecificDashboard: React.FC<JobSpecificDashboardProps> = ({ jobTitle, onBack }) => {
  const [activeSection, setActiveSection] = useState('manage-candidates');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'manage-candidates', label: 'Manage Candidates', icon: Users },
    { id: 'hiring-automation', label: 'Hiring Automation', icon: Zap },
    { id: 'job-settings', label: 'Job Settings', icon: Settings },
    { id: 'contact-us', label: 'Contact Us', icon: MessageCircle },
    { id: 'testing-environment', label: 'Testing Environment', icon: TestTube }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'manage-candidates':
        return <ManageCandidates />;
      case 'hiring-automation':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hiring Automation</h2>
            <p className="text-gray-600">Automated hiring workflows and processes.</p>
          </div>
        );
      case 'job-settings':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Settings</h2>
            <p className="text-gray-600">Job configuration and settings.</p>
          </div>
        );
      case 'contact-us':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">Contact information and support.</p>
          </div>
        );
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
    <div className="flex h-screen bg-gray-50">
      <div 
        className={`${isCollapsed ? 'w-16' : 'w-64'} bg-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out`}
        onMouseEnter={() => isCollapsed && setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-700">
          <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <img 
              src="/images/FuildJobs.ai logo.png" 
              alt="FluidJobs.ai Logo" 
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            {!isCollapsed && <span className="text-xl font-bold text-white">FluidJobs.ai</span>}
          </div>
          {!isCollapsed && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-gray-300 w-full text-left mt-4"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" />
              <h1 className="text-sm font-medium text-white leading-tight">
                {jobTitle}
              </h1>
            </button>
          )}
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              HR
            </div>
            {!isCollapsed && <span className="text-sm font-medium text-white">HR Manager</span>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default JobSpecificDashboard;