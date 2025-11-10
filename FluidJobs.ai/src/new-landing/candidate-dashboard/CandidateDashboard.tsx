import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import AnnouncementsSection from './AnnouncementsSection';
import ProfileCompletionCard from './ProfileCompletionCard';
import JobOpeningsView from './job-openings/JobOpeningsView';
import SavedJobsView from './saved-jobs/SavedJobsView';
import MyApplicationsView from './my-applications/MyApplicationsView';
import ContactUsView from './contact-us/ContactUsView';
import ProfileView from './profile/ProfileView';
import EditProfileView from './edit-profile/EditProfileView';
import ChangePasswordModal from './change-password/ChangePasswordModal';
import { ThemeProvider, useTheme, getThemeColors } from './ThemeContext';

const DashboardContent: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [currentView, setCurrentView] = useState('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userName, setUserName] = useState('Loading User...');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [profileData, setProfileData] = useState({
    name: 'Shriram Surse',
    resumeUploaded: false,
    pictureUploaded: false,
    addressAdded: false
  });

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const updateProfileStatus = (field: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  useEffect(() => {
    setUserName(profileData.name);
  }, [profileData.name]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  if (currentView === 'jobs') {
    return (
      <>
        <JobOpeningsView savedJobIds={savedJobIds} onToggleSave={toggleSaveJob} onNavigate={setCurrentView} />
        <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      </>
    );
  }

  if (currentView === 'savedJobs') {
    return (
      <>
        <SavedJobsView savedJobIds={savedJobIds} onToggleSave={toggleSaveJob} onNavigate={setCurrentView} />
        <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      </>
    );
  }

  if (currentView === 'applications') {
    return (
      <>
        <MyApplicationsView onNavigate={setCurrentView} />
        <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      </>
    );
  }

  if (currentView === 'contact') {
    return (
      <>
        <ContactUsView onNavigate={setCurrentView} />
        <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      </>
    );
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
        <DashboardHeader onMenuClick={toggleMobileSidebar} onSavedJobsClick={() => setCurrentView('savedJobs')} />
        <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <Sidebar userName={userName} onNavigate={setCurrentView} currentView={currentView} onChangePassword={() => setIsChangePasswordOpen(true)} />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
            <ProfileView onNavigateToEdit={() => setCurrentView('editProfile')} />
          </main>
        </div>
        <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      </div>
    );
  }

  if (currentView === 'editProfile') {
    return (
      <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
        <DashboardHeader onMenuClick={toggleMobileSidebar} onSavedJobsClick={() => setCurrentView('savedJobs')} />
        <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <Sidebar userName={userName} onNavigate={setCurrentView} currentView={currentView} onChangePassword={() => setIsChangePasswordOpen(true)} />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
            <EditProfileView />
          </main>
        </div>
        <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
      <DashboardHeader onMenuClick={toggleMobileSidebar} onSavedJobsClick={() => setCurrentView('savedJobs')} />
      
      <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <Sidebar userName={userName} onNavigate={setCurrentView} currentView={currentView} onChangePassword={() => setIsChangePasswordOpen(true)} />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={toggleMobileSidebar}
          userName={userName}
        />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <AnnouncementsSection profileData={profileData} />
            <ProfileCompletionCard 
              profileData={profileData}
              onUpdateStatus={updateProfileStatus}
            />
          </div>
        </main>
      </div>
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
