import React, { useState, useEffect } from 'react';
import { Bell, Briefcase, FileText, Bookmark, Sun, Moon, ChevronDown, BellOff, User, MessageCircle, LogOut } from 'lucide-react';
import MyJobsView from './my-jobs/MyJobsView';
import MyResumeView from './my-resume/MyResumeView';
import NewUIContactSupport from './NewUIContactSupport';
import ViewProfilePage from './ViewProfilePage';
import EditProfilePage from './EditProfilePage';
import ChangePasswordModal from './change-password/ChangePasswordModal';
import ProfileCompletion from '../../components/ProfileCompletion';
import { ThemeProvider } from './ThemeContext';
import { ProfileCompletionProvider } from '../../contexts/ProfileCompletionContext';

const DashboardContent: React.FC = () => {
  const [newUiTab, setNewUiTab] = useState<'alerts' | 'jobs' | 'resume' | 'contact' | 'profile' | 'editProfile'>('alerts');
  const [myJobsFilter, setMyJobsFilter] = useState<string>('All Jobs');
  const [themeState, setThemeState] = useState<'light' | 'dark'>('light');
  const [userName, setUserName] = useState('Loading User...');
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem('fluidjobs_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'User');
        console.log('User loaded from session:', user);
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, []);

  // Refresh user data when tab becomes visible (handles Google login updates)
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
    <div className="min-h-screen" style={{ backgroundColor: bgColor, fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <header className="shadow-sm min-h-[80px] sm:h-[116px] px-2 sm:px-4 md:px-8 lg:px-12 flex items-center justify-between z-10 gap-2 sm:gap-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <img 
            src='/images/FLuid Live Icon light theme.png' 
            alt="FluidJobs" 
            className="w-10 h-10 sm:w-[59px] sm:h-[59px]"
          />
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold" style={{
            fontFamily: 'Poppins, sans-serif',
            backgroundImage: 'linear-gradient(90deg, #4285F4 0%, #0060FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>FluidJobs.ai</h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex overflow-x-auto scrollbar-hide space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 text-xs sm:text-sm md:text-base lg:text-lg font-extrabold flex-1 max-w-md" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <button 
            onClick={() => setNewUiTab('alerts')} 
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all font-bold whitespace-nowrap flex-shrink-0 ${
              newUiTab === 'alerts' 
                ? (themeState === 'light' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[rgba(37,99,235,0.2)] text-[#2563EB]')
                : (themeState === 'light' ? 'hover:bg-[#DBEAFE] text-black' : 'hover:bg-[rgba(37,99,235,0.2)] text-white')
            }`}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Alerts</span>
          </button>
          <button 
            onClick={() => setNewUiTab('jobs')} 
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all font-bold whitespace-nowrap flex-shrink-0 ${
              newUiTab === 'jobs' 
                ? (themeState === 'light' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[rgba(37,99,235,0.2)] text-[#2563EB]')
                : (themeState === 'light' ? 'hover:bg-[#DBEAFE] text-black' : 'hover:bg-[rgba(37,99,235,0.2)] text-white')
            }`}
          >
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>My Jobs</span>
          </button>
          <button 
            onClick={() => setNewUiTab('resume')} 
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all font-bold whitespace-nowrap flex-shrink-0 ${
              newUiTab === 'resume' 
                ? (themeState === 'light' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[rgba(37,99,235,0.2)] text-[#2563EB]')
                : (themeState === 'light' ? 'hover:bg-[#DBEAFE] text-black' : 'hover:bg-[rgba(37,99,235,0.2)] text-white')
            }`}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>My Resume</span>
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
          {/* Profile Dropdown */}
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

            {/* Dropdown Menu */}
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
      <main style={{ minHeight: 'calc(100vh - 116px)' }}>
        {newUiTab === 'editProfile' ? (
          <EditProfilePage themeState={themeState} />
        ) : newUiTab === 'profile' ? (
          <ViewProfilePage themeState={themeState} onChangePassword={() => setIsChangePasswordOpen(true)} onEditProfile={() => setNewUiTab('editProfile')} />
        ) : newUiTab === 'contact' ? (
          <NewUIContactSupport themeState={themeState} />
        ) : newUiTab === 'jobs' ? (
          <MyJobsView initialFilter={myJobsFilter} themeState={themeState} />
        ) : newUiTab === 'resume' ? (
          <MyResumeView themeState={themeState} />
        ) : (
          /* Alerts Tab - Default */
          <div className="p-4 sm:p-8 lg:p-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Alerts Section */}
              <div className="lg:col-span-2 p-8 rounded-[25px] shadow-lg flex flex-col min-h-[500px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
                <h2 className="text-3xl font-extrabold mb-4" style={{ color: textColor }}>
                  Alerts
                </h2>
                <div className="flex flex-col items-center justify-center text-center flex-1 p-10">
                  <BellOff className="w-20 h-20 text-gray-300 mb-6" />
                  <p className="text-lg font-semibold text-gray-600 max-w-sm">
                    Complete your profile to start getting announcements of the latest job openings!
                  </p>
                </div>
              </div>

              {/* Profile Completion Card */}
              <ProfileCompletion 
                themeState={themeState}
                onNavigateToEdit={() => setNewUiTab('editProfile')}
                onNavigateToResume={() => setNewUiTab('resume')}
              />
            </div>
          </div>
        )}
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
    </div>
  );
};

const CandidateDashboard: React.FC = () => {
  return (
    <ThemeProvider>
      <ProfileCompletionProvider>
        <DashboardContent />
      </ProfileCompletionProvider>
    </ThemeProvider>
  );
};

export default CandidateDashboard;
