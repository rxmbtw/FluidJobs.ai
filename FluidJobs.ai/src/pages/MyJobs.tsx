import React from 'react';
import { useIsMobile } from '../components/mobile/MobileDetector';
import MobileMyJobs from '../components/mobile/MobileMyJobs';
import DesktopMyJobs from '../components/desktop/DesktopMyJobs';

const MyJobs: React.FC = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileMyJobs />;
  }
  
  return <DesktopMyJobs />;
};

export default MyJobs;
