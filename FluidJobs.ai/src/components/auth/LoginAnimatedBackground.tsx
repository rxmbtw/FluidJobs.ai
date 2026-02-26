import React from 'react';

const LoginAnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        <div 
          className="w-full h-full gradient-animation"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, #4F00BC 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #2A48D9 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, #8B5CF6 0%, transparent 50%),
              linear-gradient(135deg, #4F00BC 0%, #2A48D9 100%)
            `
          }}
        />
      </div>
      <style>{`
        .gradient-animation {
          animation: gradientShift 20s ease-in-out infinite;
        }
        @keyframes gradientShift {
          0%, 100% { filter: hue-rotate(0deg) brightness(1) saturate(1); }
          50% { filter: hue-rotate(15deg) brightness(1.1) saturate(1.2); }
        }
      `}</style>
    </div>
  );
};

export default LoginAnimatedBackground;