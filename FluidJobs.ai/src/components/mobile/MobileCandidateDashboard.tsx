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
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);
  const { triggerRefresh } = useProfileCompletionContext();
  
  useEffect(() => {
    // Check if we should show edit profile from navigation state
    if (location.state?.showEditProfile) {
      setShowEditProfile(true);
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true });
    }
    // Check if we should show contact support from navigation state
    if (location.state?.showContactSupport) {
      setShowContactSupport(true);
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true });
    }
    // Check if we should set active tab from navigation state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      setShowEditProfile(false);
      setShowContactSupport(false);
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);
  
  useEffect(() => {
    const token = sessionStorage.getItem('fluidjobs_token');
    console.log('🔍 MobileCandidateDashboard - Token check:', token ? 'Found' : 'Missing');
    if (!token) {
      console.log('❌ No token found, but allowing access for now');
      // Don't redirect to login, just continue without token
    }
    console.log('✅ Loading dashboard');
    setTimeout(() => {
      console.log('✅ Dashboard loaded successfully');
      setLoading(false);
    }, 500);
  }, [navigate]);
  
  // Check if we're on edit profile or contact support page
  const isEditProfile = location.pathname === '/edit-profile';
  const isContactSupport = location.pathname === '/mobile-contact-support';
  
  // Handle tab change with navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowEditProfile(false); // Reset edit profile state when changing tabs
    setShowContactSupport(false); // Reset contact support state when changing tabs
    // Trigger refresh when navigating to alerts tab
    if (tab === 'alerts') {
      triggerRefresh();
    }
    // Navigate away from edit profile or contact support if on those pages
    if (isEditProfile || isContactSupport) {
      navigate('/candidate-dashboard');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <MobileLoader />;
    }
    
    // Show edit profile page if triggered from profile page
    if (showEditProfile) {
      return <MobileEditProfilePage />;
    }
    
    // Show contact support page if triggered from profile page
    if (showContactSupport) {
      return <MobileContactSupportPage />;
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
      <MobileBottomNav activeTab={(isEditProfile || isContactSupport || showEditProfile || showContactSupport) ? 'profile' : activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default MobileCandidateDashboard;
