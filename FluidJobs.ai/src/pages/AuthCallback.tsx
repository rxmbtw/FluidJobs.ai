import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role') || 'Candidate';

    console.log('🔄 AuthCallback - Processing:', { token: token ? 'Present' : 'Missing', role });

    if (token) {
      try {
        // Store token directly without trying to decode
        sessionStorage.setItem('fluidjobs_token', token);
        
        // Try to decode token for user info, but don't fail if it doesn't work
        let user = {
          id: 'oauth-user',
          email: 'oauth@user.com',
          name: 'OAuth User',
          role: role
        };
        
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          user = {
            id: decodedToken.candidateId || decodedToken.id || 'oauth-user',
            email: decodedToken.email || 'oauth@user.com',
            name: decodedToken.name || decodedToken.fullName || 'OAuth User',
            role: decodedToken.role || role
          };
          console.log('✅ Decoded token successfully:', user);
        } catch (decodeError) {
          console.log('⚠️ Could not decode token, using defaults:', user);
        }
        
        sessionStorage.setItem('fluidjobs_user', JSON.stringify(user));
        
        // Navigate based on role
        if (user.role === 'Admin' || user.role === 'HR' || user.role === 'Sales') {
          console.log(`🔄 Redirecting ${user.role} to company-dashboard`);
          window.location.href = '/company-dashboard';
        } else {
          console.log('🔄 Redirecting Candidate to candidate-dashboard');
          window.location.href = '/candidate-dashboard';
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        // Still try to redirect to candidate dashboard with just the token
        sessionStorage.setItem('fluidjobs_token', token);
        window.location.href = '/candidate-dashboard';
      }
    } else {
      console.error('❌ No token found in callback');
      navigate('/login?error=no_token');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
