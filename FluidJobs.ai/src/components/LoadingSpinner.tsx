import React from 'react';
import Loader from './Loader';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader themeState="light" />
    </div>
  );
};

export default LoadingSpinner;