import React, { useState } from 'react';
import { 
  Plus, 
  Eye, 
  Users, 
  MessageCircle,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JobPublishingAssistant from './JobPublishingAssistant';
import JobOpenings from '../pages/JobOpenings';
import JobSpecificDashboard from './JobSpecificDashboard';
import BulkImportSection from './BulkImportSection';
import ManageCandidates from '../pages/ManageCandidates';

interface JobOpeningsContentProps {
  onJobSelect: (jobTitle: string) => void;
}

const JobOpeningsContent: React.FC<JobOpeningsContentProps> = ({ onJobSelect }) => (
  <JobOpenings onJobSelect={onJobSelect} />
);



const UnifiedJobDashboard: React.FC = () => {
  console.log('UnifiedJobDashboard component loaded - Admin dashboard is showing');
  const [activeNav, setActiveNav] = useState('view_opening');
  const [showCreateJob, setShowCreateJob] = useState(() => {
    return localStorage.getItem('showCreateJob') === 'true';
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showJobSpecificDashboard, setShowJobSpecificDashboard] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'create_job', label: 'Create Job', icon: Plus },
    { id: 'view_opening', label: 'View Openings', icon: Eye },
    { id: 'manage_candidates', label: 'Manage Candidates', icon: Users },
    { id: 'bulk_import', label: 'Bulk Import', icon: Upload },
    { id: 'contact_us', label: 'Contact Us', icon: MessageCircle, path: '/contact' }
  ];



  const handleNavClick = (navId: string, path?: string) => {
    if (navId === 'create_job') {
      setShowCreateJob(true);
      setActiveNav(navId);
      localStorage.setItem('showCreateJob', 'true');
    } else if (navId === 'view_opening' || navId === 'manage_candidates' || navId === 'bulk_import') {
      setActiveNav(navId);
    } else if (path) {
      navigate(path);
    }
  };

  const handleLogoClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleBackToDashboard = () => {
    setShowCreateJob(false);
    setActiveNav('view_opening');
    localStorage.removeItem('showCreateJob');
    localStorage.removeItem('jobFormData');
    localStorage.removeItem('jobFormStep');
  };

  if (showCreateJob) {
    return <JobPublishingAssistant onBack={handleBackToDashboard} />;
  }

  if (showJobSpecificDashboard) {
    return (
      <JobSpecificDashboard 
        jobTitle={selectedJobTitle}
        onBack={() => {
          setShowJobSpecificDashboard(false);
          setSelectedJobTitle('');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${isCollapsed ? 'w-16' : 'w-64'} bg-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out`}
        onMouseEnter={() => isCollapsed && setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-700">
          <button
            onClick={handleLogoClick}
            className={`flex items-center w-full text-left hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          >
            <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                src="/images/2024-04-04.webp" 
                alt="FluidJobs.ai Logo" 
                className="w-full h-full object-cover"
                style={{ transform: 'scale(1.5)' }}
              />
            </div>
            {!isCollapsed && <span className="text-xl font-bold text-white">FluidJobs.ai</span>}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.path)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-left transition-colors ${
                  activeNav === item.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              AD
            </div>
            {!isCollapsed && <span className="font-medium">Admin</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeNav === 'view_opening' ? (
          <div className="-m-8">
            <JobOpeningsContent 
              onJobSelect={(jobTitle: string) => {
                setSelectedJobTitle(jobTitle);
                setShowJobSpecificDashboard(true);
              }}
            />
          </div>
        ) : activeNav === 'manage_candidates' ? (
          <div className="-m-8">
            <ManageCandidates />
          </div>
        ) : activeNav === 'bulk_import' ? (
          <BulkImportSection />
        ) : (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <Eye className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">HR Dashboard</h1>
              <p className="text-gray-600 mb-8">Use the sidebar to navigate between different sections.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedJobDashboard;