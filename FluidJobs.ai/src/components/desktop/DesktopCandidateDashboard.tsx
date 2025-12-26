import React, { useState, useEffect } from 'react';
import { Bell, Briefcase, FileText, Sun, Moon, ChevronDown, User, MessageCircle, LogOut, Bookmark } from 'lucide-react';
import DesktopAlertsPage from './DesktopAlertsPage';
import MyJobsView from '../../new-landing/candidate-dashboard/my-jobs/MyJobsView';
import MyResumeView from '../../new-landing/candidate-dashboard/my-resume/MyResumeView';
import DesktopViewProfilePage from './DesktopViewProfilePage';
import DesktopEditProfilePage from './DesktopEditProfilePage';
import DesktopContactSupport from './DesktopContactSupport';
import ChangePasswordModal from '../../new-landing/candidate-dashboard/change-password/ChangePasswordModal';
import { useProfileCompletion } from '../../hooks/useProfileCompletion';
import { useProfileCompletionContext } from '../../contexts/ProfileCompletionContext';

const DesktopCandidateDashboard: React.FC = () => {
  const [newUiTab, setNewUiTab] = useState<'alerts' | 'jobs' | 'resume' | 'contact' | 'profile' | 'editProfile'>('alerts');
  const [themeState, setThemeState] = useState<'light' | 'dark'>('light');
  const [userName, setUserName] = useState('Loading User...');
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [initialFilter, setInitialFilter] = useState<string>('all');
  const { profileCompletion, loading } = useProfileCompletion();
  const { triggerRefresh } = useProfileCompletionContext();
  const isProfileComplete = !loading && profileCompletion.completionPercentage === 100;

  useEffect(() => {
    if (newUiTab === 'alerts') {
      triggerRefresh();
    }
  }, [newUiTab]);

  const handleNavigateToEdit = () => {
    setNewUiTab('editProfile');
  };

  const handleNavigateToResume = () => {
    setNewUiTab('resume');
  };

  useEffect(() => {
    const userStr = sessionStorage.getItem('fluidjobs_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'User');
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const userStr = sessionStorage.getItem('fluidjobs_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserName(user.name || 'User');
          } catch (error) {
            console.error('Error parsing user:', error);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('fluidjobs_token');
    sessionStorage.removeItem('fluidjobs_user');
    window.location.reload();
  };

  const bgColor = themeState === 'light' ? '#F1F1F1' : '#1a1a1a';
  const textColor = themeState === 'light' ? '#000000' : '#FFFFFF';

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: bgColor, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <header className="flex shadow-sm h-[116px] px-8 lg:px-12 items-center justify-between z-10 gap-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', borderBottom: themeState === 'dark' ? '1px solid #374151' : 'none' }}>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <img 
            src='/images/FLuid Live Icon light theme.png' 
            alt="FluidJobs" 
            className="w-[59px] h-[59px]"
          />
          <h1 className="text-xl font-semibold" style={{
            fontFamily: 'Poppins, sans-serif',
            backgroundImage: 'linear-gradient(90deg, #4285F4 0%, #0060FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>FluidJobs.ai</h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-6 text-base lg:text-lg font-semibold flex-1 max-w-md">
          <button 
            onClick={() => setNewUiTab('alerts')} 
            className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all font-semibold whitespace-nowrap"
            style={{
              backgroundColor: newUiTab === 'alerts' ? (themeState === 'light' ? '#DBEAFE' : 'rgba(37, 99, 235, 0.2)') : 'transparent',
              color: newUiTab === 'alerts' ? '#2563EB' : (themeState === 'light' ? '#000000' : '#E5E7EB')
            }}
          >
            <Bell className="w-5 h-5" />
            <span>Alerts</span>
          </button>
          <button 
            onClick={() => setNewUiTab('jobs')} 
            className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all font-semibold whitespace-nowrap"
            style={{
              backgroundColor: newUiTab === 'jobs' ? (themeState === 'light' ? '#DBEAFE' : 'rgba(37, 99, 235, 0.2)') : 'transparent',
              color: newUiTab === 'jobs' ? '#2563EB' : (themeState === 'light' ? '#000000' : '#E5E7EB')
            }}
          >
            <Briefcase className="w-5 h-5" />
            <span>My Jobs</span>
          </button>
          <button 
            onClick={() => setNewUiTab('resume')} 
            className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all font-semibold whitespace-nowrap"
            style={{
              backgroundColor: newUiTab === 'resume' ? (themeState === 'light' ? '#DBEAFE' : 'rgba(37, 99, 235, 0.2)') : 'transparent',
              color: newUiTab === 'resume' ? '#2563EB' : (themeState === 'light' ? '#000000' : '#E5E7EB')
            }}
          >
            <FileText className="w-5 h-5" />
            <span>My Resume</span>
          </button>
        </nav>

        <div className="flex-none"></div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
          {/* Saved Jobs Icon */}
          <button
            onClick={() => {
              setInitialFilter('saved');
              setNewUiTab('jobs');
            }}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #6E6E6E'
            }}
          >
            <Bookmark 
              className="w-5 h-5" 
              style={{ 
                color: '#6E6E6E',
                strokeWidth: 2
              }} 
            />
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsLogoutOpen(!isLogoutOpen)} 
              className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 p-1.5 sm:p-2 pr-3 sm:pr-4 md:pr-6 rounded-full transition-all duration-300"
              style={{
                backgroundColor: themeState === 'light' ? '#DBEAFE' : 'rgba(37, 99, 235, 0.1)',
              }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <span className="hidden sm:inline text-sm sm:text-base md:text-xl font-semibold" style={{ color: themeState === 'light' ? '#2563EB' : '#93C5FD' }}>{userName}</span>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isLogoutOpen ? 'rotate-180' : 'rotate-0'}`} style={{ color: themeState === 'light' ? '#3B82F6' : '#93C5FD' }} />
            </button>

            {isLogoutOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden z-20" style={{ 
                backgroundColor: themeState === 'light' ? '#FFFFFF' : '#2d2d2d',
                border: `1px solid ${themeState === 'light' ? '#BFDBFE' : 'rgba(37, 99, 235, 0.3)'}`,
                boxShadow: themeState === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
              }}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setNewUiTab('profile'); setIsLogoutOpen(false); }} 
                  className="flex items-center space-x-3 p-3 font-semibold transition-colors" 
                  style={{ color: textColor }}
                >
                  <User className="w-5 h-5" />
                  <span>View Profile</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setNewUiTab('contact'); setIsLogoutOpen(false); }}
                  className="flex items-center space-x-3 p-3 font-semibold transition-colors" 
                  style={{ color: textColor }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contact Support</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setThemeState(themeState === 'light' ? 'dark' : 'light'); }}
                  className="flex items-center space-x-3 p-3 font-semibold transition-colors" 
                  style={{ color: textColor }}
                >
                  {themeState === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>Change theme</span>
                </a>
                <div className="h-px mx-3" style={{ backgroundColor: themeState === 'light' ? '#BFDBFE' : 'rgba(37, 99, 235, 0.3)' }}></div>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handleLogout(); }} 
                  className="flex items-center space-x-3 p-3 text-red-600 font-semibold transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ height: 'calc(100vh - 116px)', backgroundColor: bgColor, overflow: 'hidden' }}>
        {newUiTab === 'editProfile' ? (
          <DesktopEditProfilePage themeState={themeState} />
        ) : newUiTab === 'profile' ? (
          <DesktopViewProfilePage themeState={themeState} onChangePassword={() => setIsChangePasswordOpen(true)} onEditProfile={() => setNewUiTab('editProfile')} />
        ) : newUiTab === 'contact' ? (
          <DesktopContactSupport themeState={themeState} />
        ) : newUiTab === 'jobs' ? (
          <MyJobsView themeState={themeState} initialFilter={initialFilter} onFilterChange={() => setInitialFilter('all')} />
        ) : newUiTab === 'resume' ? (
          <MyResumeView themeState={themeState} />
        ) : (
          <DesktopAlertsPage 
            themeState={themeState}
            isProfileComplete={isProfileComplete}
            loading={loading}
            onNavigateToEdit={handleNavigateToEdit}
            onNavigateToResume={handleNavigateToResume}
          />
        )}
      </main>

      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} themeState={themeState} />
    </div>
  );
};

export default DesktopCandidateDashboard;
