import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardRouter: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('fluidjobs_user') || 'null');
    
    console.log('DashboardRouter - User data:', user);
    console.log('DashboardRouter - User role:', user?.role);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    // Add a small delay to ensure proper state management
    setTimeout(() => {
      if (user.role === 'Admin') {
        console.log('ADMIN DETECTED - Redirecting to main-unified-dashboard');
        window.location.replace('/main-unified-dashboard');
      } else {
        console.log('CANDIDATE DETECTED - Redirecting to candidate dashboard');
        window.location.replace('/dashboard');
      }
    }, 100);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardRouter;