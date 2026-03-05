import React from 'react';
import { useIsMobile } from '../components/mobile/MobileDetector';
import MobileMyResume from '../components/mobile/MobileMyResume';
import MyResumeView from '../components/candidate/my-resume/MyResumeView';

const MyResume: React.FC = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileMyResume />;
  }

  return <MyResumeView themeState="light" />;
};

export default MyResume;
