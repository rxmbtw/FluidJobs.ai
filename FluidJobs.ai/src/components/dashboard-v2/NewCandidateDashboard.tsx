import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import AlertsSection from './AlertsSection';
import ProfileCompletionCard from './ProfileCompletionCard';
import ContactSupportView from './ContactSupportView';

const NewCandidateDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'jobs' | 'resume' | 'contact'>('alerts');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profileData, setProfileData] = useState({
    resumeUploaded: false,
    pictureUploaded: false,
    addressAdded: false
  });

  const user = JSON.parse(sessionStorage.getItem('fluidjobs_user') || '{}');
  const userName = user.name || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    sessionStorage.removeItem('fluidjobs_token');
    sessionStorage.removeItem('fluidjobs_user');
    window.location.href = '/login';
  };

  const handleContactSupport = () => {
    console.log('Contact Support clicked, switching to contact tab');
    setActiveTab('contact');
  };

  const handleToggleStep = (step: 'resume' | 'picture' | 'address') => {
    setProfileData(prev => ({
      ...prev,
      resumeUploaded: step === 'resume' ? !prev.resumeUploaded : prev.resumeUploaded,
      pictureUploaded: step === 'picture' ? !prev.pictureUploaded : prev.pictureUploaded,
      addressAdded: step === 'address' ? !prev.addressAdded : prev.addressAdded
    }));
  };

  const bgColor = theme === 'light' ? '#F1F1F1' : '#1a1a1a';
  const cardBg = theme === 'light' ? '#ffffff' : '#2d2d2d';
  const textColor = theme === 'light' ? '#000000' : '#ffffff';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, fontFamily: 'Inter, sans-serif' }}>
      <DashboardHeader
        userName={userName}
        userInitials={userInitials}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSavedJobsClick={() => console.log('Saved jobs clicked')}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        onContactSupport={handleContactSupport}
      />

      <main className="w-full" style={{ minHeight: 'calc(100vh - 116px)', backgroundColor: activeTab === 'contact' ? '#FFFFFF' : bgColor }}>
        {activeTab === 'contact' ? (
          <ContactSupportView />
        ) : (
          <div className="p-4 sm:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <AlertsSection />
              <ProfileCompletionCard
                resumeUploaded={profileData.resumeUploaded}
                pictureUploaded={profileData.pictureUploaded}
                addressAdded={profileData.addressAdded}
                onToggleStep={handleToggleStep}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewCandidateDashboard;
