import React, { useState, useEffect } from 'react';
import BackgroundVisuals from './components/BackgroundVisuals';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesSection from './components/FeaturesSection';
import TestimonialsSection from './components/TestimonialsSection';
import CommunitySection from './components/CommunitySection';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import SectionDivider from './components/SectionDivider';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import CandidateDashboard from './candidate-dashboard/CandidateDashboard';
import CompanyDashboard from './company-dashboard/CompanyDashboard';
import ComingSoon from './components/ComingSoon';
import RegistrationSuccess from './components/RegistrationSuccess';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('landing');

  useEffect(() => {
    // Check if user is already authenticated
    const token = sessionStorage.getItem('fluidjobs_token');
    const userStr = sessionStorage.getItem('fluidjobs_user');
    
    if (token && userStr && currentPage === 'landing') {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin' || user.role === 'Admin' || user.role === 'HR') {
          setCurrentPage('company-dashboard');
        } else {
          setCurrentPage('dashboard');
        }
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    } else if (!token && currentPage === 'landing') {
      // If no token and on landing, redirect to login
      setCurrentPage('login');
    }

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const callbackToken = params.get('token');
    if (callbackToken) {
      try {
        const decodedToken = JSON.parse(atob(callbackToken.split('.')[1]));
        const user = {
          id: decodedToken.candidateId,
          email: decodedToken.email,
          name: decodedToken.name,
          role: decodedToken.role
        };
        sessionStorage.setItem('fluidjobs_token', callbackToken);
        sessionStorage.setItem('fluidjobs_user', JSON.stringify(user));
        window.history.replaceState({}, document.title, window.location.pathname);
        if (user.role === 'admin' || user.role === 'Admin' || user.role === 'HR') {
          setCurrentPage('company-dashboard');
        } else {
          setCurrentPage('dashboard');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    }
  }, []);

  const navigateToLogin = () => {
    setCurrentPage('login');
  };

  const navigateToLanding = () => {
    setCurrentPage('landing');
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const navigateToCompanyDashboard = () => {
    setCurrentPage('company-dashboard');
  };

  const navigateToComingSoon = () => {
    setCurrentPage('coming-soon');
  };

  const navigateToRegistrationSuccess = () => {
    setCurrentPage('registration-success');
  };

  if (currentPage === 'login') {
    return <LoginPage onNavigateHome={navigateToLanding} onNavigateToDashboard={navigateToDashboard} onNavigateToCompanyDashboard={navigateToCompanyDashboard} onNavigateToComingSoon={navigateToComingSoon} onNavigateToRegistrationSuccess={navigateToRegistrationSuccess} />;
  }

  if (currentPage === 'coming-soon') {
    return <ComingSoon onNavigateToLogin={navigateToLogin} />;
  }

  if (currentPage === 'registration-success') {
    return <RegistrationSuccess onNavigateToLogin={navigateToLogin} />;
  }

  if (currentPage === 'dashboard') {
    return <CandidateDashboard />;
  }

  if (currentPage === 'company-dashboard') {
    return <CompanyDashboard />;
  }

  return (
    <div className="bg-[#050505] min-h-screen">
      <BackgroundVisuals />
      <div className="relative w-full" style={{ zIndex: 10 }}>
        <main>
          <HeroSection onNavigateToLogin={navigateToLogin} />
          <HowItWorksSection />
          <SectionDivider />
          <FeaturesSection />
          <SectionDivider />
          <TestimonialsSection />
          <SectionDivider />
          <CommunitySection />
          <SectionDivider />
          <CtaSection onNavigateToLogin={navigateToLogin} />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
