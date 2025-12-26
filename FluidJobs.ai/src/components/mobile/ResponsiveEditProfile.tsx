import React from 'react';
import { useIsMobile } from './MobileDetector';
import MobileEditProfilePage from './MobileEditProfilePage';
import EditProfilePage from '../../pages/EditProfilePage';

const ResponsiveEditProfile: React.FC = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileEditProfilePage />;
  }

  return <EditProfilePage />;
};

export default ResponsiveEditProfile;
