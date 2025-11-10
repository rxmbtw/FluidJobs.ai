import React from 'react';
import UiverseButton from './UiverseButton';

interface CtaSectionProps {
  onNavigateToLogin: () => void;
}

const CtaSection: React.FC<CtaSectionProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="w-full py-32 px-4 text-center">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-light text-white">
          Join the <span className="brand-gradient-text font-medium">Future of Hiring</span>
        </h2>
        <p className="mt-6 text-lg text-gray-400">
          Whether you're finding a job or finding talent, do it smarter with FluidJobs.ai.
          Get started today.
        </p>
        <UiverseButton className="mt-10" onClick={onNavigateToLogin}>
          Get Started Today
        </UiverseButton>
      </div>
    </div>
  );
};

export default CtaSection;
