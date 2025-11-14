import React from 'react';
import { useSearchParams } from 'react-router-dom';
import GoogleAuth from '../components/GoogleAuth';

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <img 
              src="/images/FLuid Live Icon.png" 
              alt="FluidJobs.ai Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'rgba(0, 0, 0, 1)' }}>
            Sign in to <span style={{ color: 'rgba(66, 133, 244, 1)' }}>FluidJobs.ai</span>
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'rgba(96, 96, 96, 1)' }}>
            Find your perfect job with AI-powered matching
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Authentication failed. Please try again.
            </div>
          )}
          
          <GoogleAuth />
          
          <div className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;