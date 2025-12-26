import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 shadow-md bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <img 
            src="/images/FLuid Live Icon light theme.png" 
            alt="FluidJobs.ai Logo" 
            className="object-contain" 
            style={{ width: '3rem', height: '3rem' }}
          />
          <h1 className="text-xl md:text-3xl font-medium text-blue-600">FluidJobs.ai</h1>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
