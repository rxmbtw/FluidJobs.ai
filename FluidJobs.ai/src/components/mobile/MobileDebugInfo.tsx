import React, { useState, useEffect } from 'react';

const MobileDebugInfo: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        fontSize: '12px',
        zIndex: 9999,
        borderBottomLeftRadius: '8px',
        fontFamily: 'monospace'
      }}
    >
      <div>Width: {windowWidth}px</div>
      <div>Mode: {isMobile ? '📱 Mobile' : '🖥️ Desktop'}</div>
    </div>
  );
};

export default MobileDebugInfo;
