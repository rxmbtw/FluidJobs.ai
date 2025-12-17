import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: decodedToken.candidateId,
          email: decodedToken.email,
          name: decodedToken.name,
          role: decodedToken.role || role || 'Candidate'
        };
        
        sessionStorage.setItem('fluidjobs_token', token);
        sessionStorage.setItem('fluidjobs_user', JSON.stringify(user));
        
        console.log('✅ Auth callback - User:', user);
        
        // Navigate based on role
        if (user.role === 'Admin' || user.role === 'HR' || user.role === 'Sales') {
          console.log(`🔄 Redirecting ${user.role} to company-dashboard`);
          navigate('/company-dashboard');
        } else {
          console.log('🔄 Redirecting Candidate to dashboard');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=auth_failed');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
