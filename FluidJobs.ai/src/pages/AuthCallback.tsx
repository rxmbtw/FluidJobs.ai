import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const roleParam = searchParams.get('role');

    console.log('=== AUTH CALLBACK DEBUG ===');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Error:', error);
    console.log('Role param:', roleParam);
    console.log('Full URL:', window.location.href);
    console.log('Search params:', window.location.search);

    if (token) {
      try {
        // Decode JWT to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        console.log('JWT Payload:', payload);
        
        // Determine user role with clear priority
        let userRole = 'Candidate'; // Default
        const urlSearch = window.location.search;
        
        console.log('=== ROLE DETECTION ===');
        console.log('Available sources:');
        console.log('- URL role param:', roleParam);
        console.log('- JWT role:', payload.role);
        console.log('- URL search:', urlSearch);
        
        // Check all possible sources for Admin role
        if (roleParam === 'Admin' || 
            payload.role === 'Admin' || 
            urlSearch.includes('role=Admin') || 
            urlSearch.includes('redirect=admin')) {
          userRole = 'Admin';
          console.log('✅ ADMIN ROLE DETECTED');
        } else {
          userRole = 'Candidate';
          console.log('✅ CANDIDATE ROLE ASSIGNED');
        }
        
        console.log('=== FINAL ROLE ASSIGNMENT ===');
        console.log('Final user role:', userRole);
        console.log('Role sources checked:');
        console.log('- roleParam === "Admin":', roleParam === 'Admin');
        console.log('- payload.role === "Admin":', payload.role === 'Admin');
        console.log('- URL contains role=Admin:', urlSearch.includes('role=Admin'));
        console.log('- URL contains redirect=admin:', urlSearch.includes('redirect=admin'));
        
        // Clean email format (remove mailto: prefix if present)
        const cleanEmail = payload.email?.replace('mailto:', '') || payload.email;
        
        const user = {
          id: payload.candidateId,
          email: cleanEmail,
          name: payload.name || cleanEmail.split('@')[0],
          role: userRole
        };
        
        console.log('User object created:', user);
        
        // Store authentication data
        sessionStorage.setItem('fluidjobs_token', token);
        sessionStorage.setItem('fluidjobs_user', JSON.stringify(user));
        
        // Store profile data
        const profileData = {
          fullName: payload.name || cleanEmail.split('@')[0],
          phone: '',
          email: cleanEmail,
          gender: '',
          maritalStatus: '',
          workStatus: 'Professional',
          currentCompany: '',
          noticePeriod: '',
          currentCTC: '',
          lastCompany: '',
          previousCTC: '',
          city: '',
          workMode: '',
          candidateId: payload.candidateId,
          profileImage: null,
          profileImageLarge: null,
          profileImageMedium: null,
          profileImageThumb: null,
          coverImage: null,
          cvUrl: null,
          cvName: null,
          resumes: []
        };
        sessionStorage.setItem('fluidjobs_profile', JSON.stringify(profileData));
        
        // Redirect based on role
        console.log('=== REDIRECT DECISION ===');
        console.log('User role for redirect:', userRole);
        console.log('Is Admin?', userRole === 'Admin');
        
        if (userRole === 'Admin') {
          console.log('🔄 Redirecting to ADMIN dashboard (main-unified-dashboard)');
          console.log('Target route: /main-unified-dashboard');
          navigate('/main-unified-dashboard', { replace: true });
        } else {
          console.log('🔄 Redirecting to CANDIDATE dashboard');
          console.log('Target route: /dashboard');
          navigate('/dashboard', { replace: true });
        }
        
      } catch (err) {
        console.error('❌ Token decode error:', err);
        navigate('/login?error=invalid_token', { replace: true });
      }
    } else if (error) {
      console.error('❌ Authentication failed:', error);
      navigate('/login?error=' + error, { replace: true });
    } else {
      console.warn('⚠️ No token or error, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;