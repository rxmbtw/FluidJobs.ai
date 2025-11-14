import React from 'react';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from './ThemeToggle';

interface DashboardHeaderProps {
  userName: string;
  userInitials: string;
  activeTab: 'alerts' | 'jobs' | 'resume' | 'contact';
  onTabChange: (tab: 'alerts' | 'jobs' | 'resume' | 'contact') => void;
  onSavedJobsClick: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onContactSupport?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  userInitials,
  activeTab,
  onTabChange,
  onSavedJobsClick,
  onLogout,
  theme,
  onThemeToggle,
  onContactSupport
}) => {
  return (
    <header className="bg-white shadow-sm h-[116px] px-4 sm:px-8 lg:px-12 flex items-center justify-between z-10">
      <div className="flex items-center space-x-3">
        <svg width="59" height="59" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="59" height="59" rx="10" fill="url(#paint0_linear_2_2)"/>
          <path d="M29.5 15.5C21.78 15.5 15.5 21.78 15.5 29.5C15.5 37.22 21.78 43.5 29.5 43.5C37.22 43.5 43.5 37.22 43.5 29.5C43.5 21.78 37.22 15.5 29.5 15.5Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M29.5 22.5V36.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22.5 29.5H36.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="paint0_linear_2_2" x1="0" y1="0" x2="59" y2="59" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4285F4"/>
              <stop offset="1" stopColor="#0060FF"/>
            </linearGradient>
          </defs>
        </svg>
        <h1 className="text-3xl font-extrabold font-['Poppins']" style={{
          backgroundImage: 'linear-gradient(90deg, #4285F4 0%, #0060FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          FluidJobs.ai
        </h1>
      </div>

      <nav className="hidden md:flex space-x-8 text-lg font-extrabold">
        <button
          onClick={() => onTabChange('alerts')}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeTab === 'alerts' ? 'text-blue-600 bg-blue-100 font-bold' : 'text-gray-400 hover:text-blue-600'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => onTabChange('jobs')}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeTab === 'jobs' ? 'text-blue-600 bg-blue-100 font-bold' : 'text-gray-400 hover:text-blue-600'
          }`}
        >
          My Jobs
        </button>
        <button
          onClick={() => onTabChange('resume')}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeTab === 'resume' ? 'text-blue-600 bg-blue-100 font-bold' : 'text-gray-400 hover:text-blue-600'
          }`}
        >
          My Resume
        </button>
      </nav>

      <div className="flex items-center space-x-4">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <button
          onClick={onSavedJobsClick}
          className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
          title="Saved Jobs"
        >
          Saved Jobs
        </button>
        <ProfileDropdown userName={userName} userInitials={userInitials} onLogout={onLogout} onContactSupport={onContactSupport} />
      </div>
    </header>
  );
};

export default DashboardHeader;
