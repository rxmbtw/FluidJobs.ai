import React, { useState, useEffect } from 'react';
import { Bell, Briefcase, FileText, Bookmark, Sun, Moon, ChevronDown, BellOff, User, MessageCircle, LogOut } from 'lucide-react';
import MyJobsView from './my-jobs/MyJobsView';
import MyResumeView from './my-resume/MyResumeView';
import NewUIContactSupport from './NewUIContactSupport';
import ViewProfilePage from './ViewProfilePage';
import EditProfilePage from './EditProfilePage';
import ChangePasswordModal from './change-password/ChangePasswordModal';
import { ThemeProvider } from './ThemeContext';

const DashboardContent: React.FC = () => {
  const [newUiTab, setNewUiTab] = useState<'alerts' | 'jobs' | 'resume' | 'contact' | 'profile' | 'editProfile'>('alerts');
  const [myJobsFilter, setMyJobsFilter] = useState<string>('All Jobs');
  const [themeState, setThemeState] = useState<'light' | 'dark'>('light');
  const [userName, setUserName] = useState('Loading User...');
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Shriram Surse',
    resumeUploaded: false,
    pictureUploaded: false,
    addressAdded: false
  });

  useEffect(() => {
    const userStr = sessionStorage.getItem('fluidjobs_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'User');
        setProfileData(prev => ({ ...prev, name: user.name || 'User' }));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('fluidjobs_token');
    sessionStorage.removeItem('fluidjobs_user');
    window.location.href = '/login';
  };

  const updateProfileStatus = (field: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const bgColor = themeState === 'light' ? '#F1F1F1' : '#1a1a1a';
  const textColor = themeState === 'light' ? '#000000' : '#FFFFFF';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="shadow-sm h-[116px] px-4 sm:px-8 lg:px-12 flex items-center justify-between z-10" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
        <div className="flex items-center space-x-3">
          <img 
            src='/images/FLuid Live Icon light theme.png' 
            alt="FluidJobs" 
            className="w-[59px] h-[59px]"
          />
          <h1 className="text-3xl font-extrabold" style={{
            fontFamily: 'Poppins, sans-serif',
            backgroundImage: 'linear-gradient(90deg, #4285F4 0%, #0060FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>FluidJobs.ai</h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex space-x-8 text-lg font-extrabold">
          <button 
            onClick={() => setNewUiTab('alerts')} 
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all font-bold ${
              newUiTab === 'alerts' 
                ? (themeState === 'light' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[rgba(37,99,235,0.2)] text-[#2563EB]')
                : (themeState === 'light' ? 'hover:bg-[#DBEAFE] text-black' : 'hover:bg-[rgba(37,99,235,0.2)] text-white')
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Alerts</span>
          </button>
          <button 
            onClick={() => setNewUiTab('jobs')} 
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all font-bold ${
              newUiTab === 'jobs' 
                ? (themeState === 'light' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[rgba(37,99,235,0.2)] text-[#2563EB]')
                : (themeState === 'light' ? 'hover:bg-[#DBEAFE] text-black' : 'hover:bg-[rgba(37,99,235,0.2)] text-white')
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>My Jobs</span>
          </button>
          <button 
            onClick={() => setNewUiTab('resume')} 
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all font-bold ${
              newUiTab === 'resume' 
                ? (themeState === 'light' ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[rgba(37,99,235,0.2)] text-[#2563EB]')
                : (themeState === 'light' ? 'hover:bg-[#DBEAFE] text-black' : 'hover:bg-[rgba(37,99,235,0.2)] text-white')
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>My Resume</span>
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={() => setThemeState(themeState === 'light' ? 'dark' : 'light')} 
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" 
            style={{ 
              backgroundColor: themeState === 'light' ? '#E5E7EB' : '#374151',
              color: themeState === 'light' ? '#374151' : '#9ca3af'
            }}
            title="Toggle Theme"
          >
            {themeState === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Saved Jobs Button */}
          <button 
            onClick={() => { setMyJobsFilter('Saved Jobs'); setNewUiTab('jobs'); }} 
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" 
            style={{ 
              backgroundColor: themeState === 'light' ? '#E5E7EB' : '#374151',
              color: themeState === 'light' ? '#374151' : '#9ca3af'
            }}
            title="Saved Jobs"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsLogoutOpen(!isLogoutOpen)} 
              className="flex items-center space-x-3 p-2 pr-6 rounded-full transition-all duration-300"
              style={{
                backgroundColor: themeState === 'light' ? '#DBEAFE' : 'rgba(37, 99, 235, 0.1)',
              }}
            >
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <User className="w-7 h-7" />
              </div>
              <span className="text-xl font-semibold" style={{ color: themeState === 'light' ? '#2563EB' : '#93C5FD' }}>{userName}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isLogoutOpen ? 'rotate-180' : 'rotate-0'}`} style={{ color: themeState === 'light' ? '#3B82F6' : '#93C5FD' }} />
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
                  style={{ color: '#2563EB' }}
                >
                  <User className="w-5 h-5" />
                  <span>View Profile</span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setNewUiTab('contact'); setIsLogoutOpen(false); }}
                  className="flex items-center space-x-3 p-3 font-semibold transition-colors" 
                  style={{ color: '#2563EB' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contact Support</span>
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
              <div className="lg:col-span-1 p-6 rounded-[25px] shadow-lg min-h-[500px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
                <h2 className="text-2xl font-extrabold mb-2" style={{ color: textColor }}>Complete your profile</h2>
                <p className="text-sm font-semibold text-gray-600 mb-6">
                  By completing your profile you can start applying to job openings in one click...
                </p>
                <div className="mb-6">
                  <span className="text-lg font-bold" style={{ color: textColor }}>
                    {Math.min(Math.round(((profileData.resumeUploaded ? 1 : 0) + (profileData.pictureUploaded ? 1 : 0) + (profileData.addressAdded ? 1 : 0)) / 3 * 100), 100)}%
                  </span>
                  <div className="relative w-full h-3 bg-gray-200 rounded-full mt-2">
                    <div 
                      className="absolute top-0 left-0 h-3 bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(Math.round(((profileData.resumeUploaded ? 1 : 0) + (profileData.pictureUploaded ? 1 : 0) + (profileData.addressAdded ? 1 : 0)) / 3 * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div 
                    onClick={() => updateProfileStatus('resumeUploaded')} 
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all hover:shadow-md ${profileData.resumeUploaded ? 'border-green-400' : 'border-gray-300'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${profileData.resumeUploaded ? 'bg-green-500' : 'bg-blue-500'}`}>
                      {profileData.resumeUploaded ? '✓' : '+'}
                    </div>
                    <span className={`ml-4 text-sm font-semibold flex-grow ${profileData.resumeUploaded ? 'text-green-600' : 'text-gray-600'}`}>
                      Upload resume
                    </span>
                  </div>
                  <div 
                    onClick={() => updateProfileStatus('pictureUploaded')} 
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all hover:shadow-md ${profileData.pictureUploaded ? 'border-green-400' : 'border-gray-300'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${profileData.pictureUploaded ? 'bg-green-500' : 'bg-blue-500'}`}>
                      {profileData.pictureUploaded ? '✓' : '+'}
                    </div>
                    <span className={`ml-4 text-sm font-semibold flex-grow ${profileData.pictureUploaded ? 'text-green-600' : 'text-gray-600'}`}>
                      Upload profile picture
                    </span>
                  </div>
                  <div 
                    onClick={() => updateProfileStatus('addressAdded')} 
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all hover:shadow-md ${profileData.addressAdded ? 'border-green-400' : 'border-gray-300'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${profileData.addressAdded ? 'bg-green-500' : 'bg-blue-500'}`}>
                      {profileData.addressAdded ? '✓' : '+'}
                    </div>
                    <span className={`ml-4 text-sm font-semibold flex-grow ${profileData.addressAdded ? 'text-green-600' : 'text-gray-600'}`}>
                      Add your address
                    </span>
                  </div>
                </div>
              </div>
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
      <DashboardContent />
    </ThemeProvider>
  );
};

export default CandidateDashboard;
