import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Liquid Waves */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          <path
            d="M0,400 C300,300 600,500 1200,350 L1200,800 L0,800 Z"
            fill="url(#wave1)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -20,-10; 15,20; -10,-15; 0,0"
              dur="20s"
              repeatCount="indefinite"
            />
          </path>
          
          <path
            d="M0,500 C400,350 800,600 1200,450 L1200,800 L0,800 Z"
            fill="url(#wave2)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 25,-20; -15,15; 0,0"
              dur="25s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* Network Lines */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Animated network lines */}
          <g filter="url(#glow)">
            <line x1="100" y1="100" x2="300" y2="200" stroke="#8b5cf6" strokeWidth="1" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="300" y1="200" x2="500" y2="150" stroke="#6366f1" strokeWidth="1" opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.7;0.2" dur="5s" repeatCount="indefinite" />
            </line>
            <line x1="500" y1="150" x2="700" y2="300" stroke="#3b82f6" strokeWidth="1" opacity="0.4">
              <animate attributeName="opacity" values="0.1;0.6;0.1" dur="6s" repeatCount="indefinite" />
            </line>
            <line x1="200" y1="400" x2="600" y2="350" stroke="#8b5cf6" strokeWidth="1" opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="7s" repeatCount="indefinite" />
            </line>
            <line x1="800" y1="200" x2="1000" y2="400" stroke="#6366f1" strokeWidth="1" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
            </line>
          </g>
          
          {/* Network nodes */}
          <g filter="url(#glow)">
            <circle cx="100" cy="100" r="3" fill="#8b5cf6" opacity="0.8">
              <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="200" r="2" fill="#6366f1" opacity="0.7">
              <animate attributeName="r" values="1;3;1" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="500" cy="150" r="3" fill="#3b82f6" opacity="0.6">
              <animate attributeName="r" values="2;5;2" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="700" cy="300" r="2" fill="#8b5cf6" opacity="0.8">
              <animate attributeName="r" values="1;4;1" dur="6s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>


    </div>
  );
};

export default AnimatedBackground;