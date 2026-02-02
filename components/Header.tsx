
import React from 'react';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200 sticky top-0 z-50" style={{ height: '73px' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <img
            src="/images/FLuid Live Icon light theme.svg"
            alt="FluidJobs.ai Logo"
            className="object-contain"
            style={{ width: '3rem', height: '3rem' }}
          />
          <h1 className="text-xl md:text-2xl font-semibold text-blue-600">FluidJobs.ai</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
