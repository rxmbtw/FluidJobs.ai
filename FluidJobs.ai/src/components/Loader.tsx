import React, { useEffect, useState } from 'react';

interface LoaderProps {
  themeState?: 'light' | 'dark';
}

const Loader: React.FC<LoaderProps> = ({ themeState = 'light' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const increment = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Logo */}
      <div className="flex items-center mb-6">
        <img 
          src="/images/FLuid Live Icon light theme.png" 
          alt="FluidJobs" 
          style={{ width: '59px', height: '59px', marginRight: '12px' }}
        />
        <h1 style={{
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '30px',
          lineHeight: '45px',
          color: '#4285F4'
        }}>
          FluidJobs.ai
        </h1>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '263px',
        height: '10px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '10px',
          backgroundColor: '#A19FA8',
          borderRadius: '10px'
        }} />
        <div style={{
          position: 'absolute',
          width: `${progress}%`,
          height: '10px',
          backgroundColor: '#4285F4',
          borderRadius: '10px',
          transition: 'width 0.02s linear'
        }} />
      </div>
    </div>
  );
};

export default Loader;
