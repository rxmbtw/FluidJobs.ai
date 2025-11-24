import React from 'react';

interface LoaderProps {
  themeState?: 'light' | 'dark';
}

const Loader: React.FC<LoaderProps> = ({ themeState = 'light' }) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="loader" style={{
        display: 'block',
        width: '130px',
        height: '4px',
        borderRadius: '30px',
        backgroundColor: themeState === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
        position: 'relative'
      }}>
        <style>{`
          .loader::before {
            content: "";
            position: absolute;
            background: #0071e2;
            top: 0;
            left: 0;
            width: 0%;
            height: 100%;
            border-radius: 30px;
            animation: moving 1s ease-in-out infinite;
          }

          @keyframes moving {
            50% {
              width: 100%;
            }
            100% {
              width: 0;
              right: 0;
              left: unset;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Loader;
