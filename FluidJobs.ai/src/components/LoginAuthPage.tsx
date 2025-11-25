import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthProvider';
import { authService } from '../services/authService';
import CandidateRegistrationForm from './CandidateRegistrationForm';

const LoginAuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showRoleError, setShowRoleError] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: '' as UserRole | ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from password reset
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    if (isSignUp && !formData.fullName) {
      setError('Full name is required');
      return;
    }
    
    try {
      if (isSignUp) {
        await signup(formData.fullName, formData.email, formData.password, 'Candidate');
      } else {
        await login(formData.email, formData.password, 'Candidate' as UserRole);
      }
      
      // Get role from saved user (backend determines role)
      const savedUser = authService.getCurrentUser();
      const finalRole = savedUser?.role || 'Candidate';

      console.log('LoginAuthPage - User role from backend:', finalRole);

      if (finalRole === 'Admin') {
        console.log('Redirecting Admin to company-dashboard');
        navigate('/company-dashboard');
      } else {
        // Non-admins may have a returnTo or jobId from previous flow
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('returnTo');
        const jobId = urlParams.get('jobId');

        if (returnTo) {
          navigate(returnTo);
        } else if (jobId) {
          navigate(`/careers/${jobId}`);
        } else {
          console.log('Redirecting to dashboard with role:', finalRole);
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    
    if (provider === 'google') {
      console.log('🔄 Starting Google login - role will be determined by backend');
      window.location.href = `${backendUrl}/api/auth/google`;
    } else if (provider === 'linkedin') {
      console.log('🔄 Starting LinkedIn login - role will be determined by backend');
      window.location.href = `${backendUrl}/api/auth/linkedin`;
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-2">
      {/* Left Column - Branding */}
      <div className="relative animated-gradient-bg flex flex-col p-12">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)' }}></div>
        
        {/* Back Button and Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mb-8"
        >
          <div className="flex items-center space-x-3">
            <img 
              src="/images/FLuid Live Icon.png" 
              alt="FluidJobs.ai Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-heading font-bold text-2xl" style={{ color: 'rgba(66, 133, 244, 1)' }}>FluidJobs.ai</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center flex-1 flex flex-col justify-center"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight" style={{ color: 'rgba(0, 0, 0, 1)' }}>
            Find Your Next Opportunity, Faster
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: 'rgba(96, 96, 96, 1)' }}>
            Join thousands of professionals who trust <span style={{ color: 'rgba(66, 133, 244, 1)' }}>FluidJobs.ai</span> to accelerate their career growth and hiring success.
          </p>
        </motion.div>



        {/* Floating Elements */}
        <div className="absolute top-1/4 right-8 w-32 h-32 rounded-full blur-xl" style={{ backgroundColor: 'rgba(199, 220, 255, 0.3)' }}></div>
        <div className="absolute bottom-1/3 left-8 w-24 h-24 rounded-full blur-xl" style={{ backgroundColor: 'rgba(66, 133, 244, 0.2)' }}></div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-12" style={{ border: '1px solid rgba(99, 99, 99, 0.2)' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-heading font-bold mb-2" style={{ color: 'rgba(0, 0, 0, 1)' }}>
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p style={{ color: 'rgba(96, 96, 96, 1)' }}>
                {isSignUp ? 'Join FluidJobs.ai and start your journey' : 'Sign in to access your dashboard'}
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-white hover:bg-gray-50 transition-colors"
                style={{ border: '1px solid rgba(99, 99, 99, 0.2)' }}
                title="Always shows account selection for security"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin('linkedin')}
                className="w-full flex items-center justify-center px-4 py-3 text-white rounded-xl transition-colors"
                style={{ backgroundColor: 'rgba(66, 133, 244, 1)', border: '1px solid rgba(99, 99, 99, 0.2)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 1)'}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Continue with LinkedIn
              </motion.button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'rgba(99, 99, 99, 0.2)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white" style={{ color: 'rgba(96, 96, 96, 1)' }}>OR</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
                  {successMessage}
                </div>
              )}



              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:outline-none transition-all"
                    style={{ border: '1px solid rgba(99, 99, 99, 0.2)' }}
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.2)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                </div>
              )}

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Email Address or Phone Number"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:outline-none transition-all"
                  style={{ border: '1px solid rgba(99, 99, 99, 0.2)' }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.2)'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 rounded-xl focus:bg-white focus:outline-none transition-all"
                  style={{ border: '1px solid rgba(99, 99, 99, 0.2)' }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(66, 133, 244, 0.2)'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(66, 133, 244, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-white py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center group"
                style={{ backgroundColor: 'rgba(66, 133, 244, 1)' }}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>



            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              {!isSignUp && (
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm"
                  style={{ color: 'rgba(66, 133, 244, 1)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(66, 133, 244, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(66, 133, 244, 1)'}
                >
                  Forgot your password?
                </button>
              )}
              <div className="text-sm" style={{ color: 'rgba(96, 96, 96, 1)' }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    if (isSignUp) {
                      setIsSignUp(false);
                    } else {
                      navigate('/candidate-registration');
                    }
                  }}
                  className="font-medium"
                  style={{ color: 'rgba(66, 133, 244, 1)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(66, 133, 244, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(66, 133, 244, 1)'}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      

    </div>
  );
};

export default LoginAuthPage;