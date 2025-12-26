import React from 'react';
import { useIsMobile } from '../components/mobile/MobileDetector';
import MobileMyResume from '../components/mobile/MobileMyResume';
import DesktopMyResume from '../components/desktop/DesktopMyResume';

const MyResume: React.FC = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileMyResume />;
  }
  
  return <DesktopMyResume />;
};

export default MyResume;
