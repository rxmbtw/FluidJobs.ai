import React from 'react';
import { useIsMobile } from './MobileDetector';
import MobileCandidateDashboard from './MobileCandidateDashboard';

interface ResponsiveCandidateDashboardProps {
  desktopDashboard: React.ReactNode;
}

const ResponsiveCandidateDashboard: React.FC<ResponsiveCandidateDashboardProps> = ({ desktopDashboard }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileCandidateDashboard />;
  }

  return <>{desktopDashboard}</>;
};

export default ResponsiveCandidateDashboard;
