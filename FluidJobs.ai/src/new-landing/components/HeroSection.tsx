import React from 'react';
import UiverseButton from './UiverseButton';

interface HeroSectionProps {
  onNavigateToLogin: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateToLogin }) => {
  const logoUrl = '/images/Fluid Live Icon.png';
  
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center text-center px-4 pt-20 pb-20">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-0 z-50">
        <img src={logoUrl} alt="FluidJobs.ai Logo" className="h-36 w-36 object-cover" />
        <h2 className="text-5xl font-bold -mt-6 mb-8">
          <span className="brand-gradient-text">FluidJobs.ai</span>
        </h2>
      </div>
      
      <div className="relative z-10 flex flex-col items-center mt-52">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-light leading-tight tracking-tight mb-6">
          <span className="text-white">Find Your </span>
          <span className="brand-gradient-text font-medium">Future</span>
          <br />
          <span className="text-white">with,</span>
        </h1>

        <div className="hero-loader">
            <div className="words">
                <span className="word brand-static-accent font-medium">AI Matches</span>
                <span className="word brand-static-accent font-medium">New Roles</span>
                <span className="word brand-static-accent font-medium">Top Talent</span>
                <span className="word brand-static-accent font-medium">FluidJobs</span>
                <span className="word brand-static-accent font-medium">AI Matches</span>
            </div>
        </div>
        
        <p className="mt-8 max-w-xl text-lg text-gray-300">
          Make the best career moves with the best data. FluidJobs.ai leverages your unique skills to unlock the true value of AI in your job search.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-6">
          <UiverseButton onClick={onNavigateToLogin}>Find Jobs Now</UiverseButton>
          <UiverseButton onClick={onNavigateToLogin}>Hire Talent</UiverseButton>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
