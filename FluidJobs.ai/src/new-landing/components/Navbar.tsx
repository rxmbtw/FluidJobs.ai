import React, { useState } from 'react';

interface NavbarProps {
  onNavigateToLogin: () => void;
}

const MenuIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ onNavigateToLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoUrl = 'https://i.postimg.cc/HkJ0kCDM/FLuid-Live-Icon.png';

  return (
    <>
      <nav className="fixed top-6 w-full z-50 flex justify-center px-4">
        <div className="bg-black/20 backdrop-blur-xl border border-gray-700/30 rounded-full px-6 py-3 shadow-lg flex items-center justify-between gap-8 min-w-fit">
          <div className="flex items-center space-x-3">
            <img src={logoUrl} alt="FluidJobs.ai Logo" className="h-8 w-8" />
            <span className="font-bold text-white text-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>FluidJobs.ai</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>Features</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>About</a>
            <button 
              onClick={onNavigateToLogin}
              className="text-gray-300 hover:text-white transition-colors"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Login
            </button>
          </div>
          
          <button 
            onClick={onNavigateToLogin}
            className="hidden md:block uiverse-button uiverse-button-medium"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            <div className="blob1"></div>
            <div className="inner">Get Started</div>
          </button>

          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden fixed top-24 left-4 right-4 bg-black/80 backdrop-blur-xl border border-gray-700/30 rounded-2xl shadow-lg z-40">
          <div className="px-6 py-4 space-y-4">
            <a href="#features" className="block text-gray-300 hover:text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>Features</a>
            <a href="#about" className="block text-gray-300 hover:text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>About</a>
            <button 
              onClick={onNavigateToLogin}
              className="block w-full text-left text-gray-300 hover:text-white"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Login
            </button>
            <button 
              onClick={onNavigateToLogin}
              className="block w-full uiverse-button uiverse-button-medium"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              <div className="blob1"></div>
              <div className="inner">Get Started</div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
