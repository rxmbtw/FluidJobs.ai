import React, { useEffect, useState } from 'react';

const JobsLoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <img 
          src="/images/FLuid Live Icon light theme.png" 
          alt="FluidJobs" 
          className="w-[59px] h-[59px]"
        />
        <h1 
          className="text-[30px] font-bold leading-[45px]"
          style={{
            fontFamily: 'Poppins, sans-serif',
            background: 'linear-gradient(90deg, #4285F4 0%, #0060FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          FluidJobs.ai
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="w-[263px] relative">
        {/* Background bar */}
        <div className="w-full h-[10px] bg-[#A19FA8] rounded-full"></div>
        {/* Progress bar */}
        <div 
          className="absolute top-0 left-0 h-[10px] bg-[#4285F4] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default JobsLoadingScreen;
