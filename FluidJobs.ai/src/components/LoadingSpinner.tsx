import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-indigo-600`}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-indigo-600`}></div>
      <p className="mt-2 text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;