import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import MobileLoader from './MobileLoader';
import MobileAlertsPage from './MobileAlertsPage';
import MobileProfilePage from './MobileProfilePage';
import MobileEditProfilePage from './MobileEditProfilePage';
import MobileContactSupportPage from './MobileContactSupportPage';
import MobileMyJobs from './MobileMyJobs';
import MobileMyResume from './MobileMyResume';
import { useProfileCompletionContext } from '../../contexts/ProfileCompletionContext';

const MobileCandidateDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('alerts');
  const [loading, setLoading] = useState(true);
  const { triggerRefresh } = useProfileCompletionContext();
  
  useEffect(() => {
    const token = sessionStorage.getItem('fluidjobs_token');
    if (!token) {
      navigate('/login');
      return;
    }
    setTimeout(() => setLoading(false), 2000);
  }, [navigate]);
  
  // Check if we're on edit profile or contact support page
  const isEditProfile = location.pathname === '/edit-profile';
  const isContactSupport = location.pathname === '/mobile-contact-support';
  
  // Handle tab change with navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Trigger refresh when navigating to alerts tab
    if (tab === 'alerts') {
      triggerRefresh();
    }
    // Navigate away from edit profile or contact support if on those pages
    if (isEditProfile || isContactSupport) {
      navigate('/dashboard');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <MobileLoader />;
    }
    
    // Show edit profile page if on that route
    if (isEditProfile) {
      return <MobileEditProfilePage />;
    }

    // Show contact support page if on that route
    if (isContactSupport) {
      return <MobileContactSupportPage />;
    }

    switch (activeTab) {
      case 'profile':
        return <MobileProfilePage />;
      
      case 'alerts':
        return <MobileAlertsPage />;
      
      case 'jobs':
        return <MobileMyJobs />;
      
      case 'resume':
        return <MobileMyResume />;
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="mobile-view min-h-screen w-full relative overflow-x-hidden"
      style={{ background: '#F1F1F1', paddingBottom: '100px' }}
    >
      {/* Content */}
      <div className="min-h-screen w-full">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab={(isEditProfile || isContactSupport) ? 'profile' : activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default MobileCandidateDashboard;
