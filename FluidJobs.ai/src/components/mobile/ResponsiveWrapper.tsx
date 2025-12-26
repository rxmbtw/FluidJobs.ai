import React from 'react';
import { useIsMobile } from './MobileDetector';

interface ResponsiveWrapperProps {
  mobileComponent: React.ReactNode;
  desktopComponent: React.ReactNode;
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({ 
  mobileComponent, 
  desktopComponent 
}) => {
  const isMobile = useIsMobile();

  return <>{isMobile ? mobileComponent : desktopComponent}</>;
};

export default ResponsiveWrapper;
