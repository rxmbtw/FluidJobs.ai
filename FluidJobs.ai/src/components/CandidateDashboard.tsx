import React from 'react';
import { useIsMobile } from './mobile/MobileDetector';
import MobileCandidateDashboard from './mobile/MobileCandidateDashboard';
import DesktopCandidateDashboard from './desktop/DesktopCandidateDashboard';

const CandidateDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  
  console.log('📱 Device detection:', { isMobile, width: window.innerWidth });

  if (isMobile) {
    console.log('📱 Rendering MobileCandidateDashboard');
    return <MobileCandidateDashboard />;
  }

  console.log('🖥️ Rendering DesktopCandidateDashboard');
  return <DesktopCandidateDashboard />;
};

export default CandidateDashboard;
