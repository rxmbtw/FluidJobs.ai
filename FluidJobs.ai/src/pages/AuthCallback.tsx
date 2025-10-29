import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
    // Handle both encoded and non-encoded URLs
    const urlParams = new URLSearchParams(window.location.search.replace(/&amp;/g, '&'));
    const token = urlParams.get('token') || searchParams.get('token');
    const error = urlParams.get('error') || searchParams.get('error');
    const roleParam = urlParams.get('role') || searchParams.get('role');

    console.log('=== AUTH CALLBACK DEBUG ===');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Error:', error);
    console.log('Role param:', roleParam);
    console.log('Full URL:', window.location.href);
    console.log('Search params:', window.location.search);

    if (token) {
      try {
        // Store token and get user info from backend
        sessionStorage.setItem('fluidjobs_token', token);
        
        // Get user info from backend API
        const response = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const userData = await response.json();
        const payload = {
          candidateId: userData.candidate_id,
          email: userData.email,
          name: userData.full_name,
          role: roleParam || 'Candidate'
        };
        
        console.log('JWT Payload:', payload);
        
        // Determine user role with clear priority
        let userRole = 'Candidate'; // Default
        const urlSearch = window.location.search;
        console.log('=== ROLE DETECTION ===');
        console.log('Available sources:');
        console.log('- URL role param:', roleParam);
        console.log('- JWT role:', payload.role);
        console.log('- URL search:', urlSearch);
        
        // Check all possible sources for Admin role with comprehensive detection
        const isAdminFromParam = roleParam === 'Admin';
        const isAdminFromJWT = payload.role === 'Admin';
        const isAdminFromURL = urlSearch.includes('role=Admin');
        const isAdminFromRedirect = urlSearch.includes('redirect=admin');
        const isAdminFromAnySource = isAdminFromParam || isAdminFromJWT || isAdminFromURL || isAdminFromRedirect;
        
        if (isAdminFromAnySource) {
          userRole = 'Admin';
          console.log('✅ ADMIN ROLE DETECTED from:', {
            param: isAdminFromParam,
            jwt: isAdminFromJWT, 
            url: isAdminFromURL,
            redirect: isAdminFromRedirect
          });
        } else {
          userRole = 'Candidate';
          console.log('✅ CANDIDATE ROLE ASSIGNED - no admin indicators found');
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
        
        console.log('=== USER OBJECT CREATION ===');
        console.log('Creating user with role:', userRole);
        console.log('User object:', user);
        console.log('Comparing with red button format - role match:', user.role === 'Admin');
        
        console.log('User object created:', user);
        
        // Store authentication data
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
    };
    handleAuth();
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