import React from 'react';

const Header: React.FC = () => {
  const logoUrl = 'https://i.postimg.cc/HkJ0kCDM/FLuid-Live-Icon.png';
  
  return (
    <header className="absolute top-10 z-50 w-full px-4 sm:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-4">
            <img src={logoUrl} alt="FluidJobs.ai Logo" className="h-10 w-10" />
            <h1 className="text-3xl font-bold text-white">
                FluidJobs<span className="brand-static-accent">.ai</span>
            </h1>
        </div>
    </header>
  );
};

export default Header;
