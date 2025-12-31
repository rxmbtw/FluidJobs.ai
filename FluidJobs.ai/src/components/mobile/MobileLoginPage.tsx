import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MobileLoader from './MobileLoader';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574c0,0,0,0,0,0l6.19,5.238c-0.438-0.382,6.355-5.938,6.355-15.812C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const MobileLoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE}/api/auth/google?role=Candidate`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <MobileLoader />;
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <img 
          src="/images/FLuid Live Icon light theme.png" 
          alt="FluidJobs.ai" 
          className="h-16 w-16 mx-auto mb-4"
        />
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '30px', color: '#111827', marginBottom: '8px' }}>Welcome Back</h1>
        <p style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', color: '#4B5563' }}>Sign in to continue</p>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded-t-3xl shadow-xl px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Email or Phone
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Poppins', fontSize: '14px' }}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'Poppins', fontSize: '14px' }}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button type="button" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors"
            style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px' }}
          >
            Log In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', color: '#6B7280', padding: '0 16px' }}>Or continue with</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <GoogleIcon />
          <span style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', color: '#374151' }}>Sign in with Google</span>
        </button>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <span style={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '14px', color: '#4B5563' }}>Don't have an account? </span>
          <button style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;
