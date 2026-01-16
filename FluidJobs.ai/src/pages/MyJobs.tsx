import React from 'react';
import { useIsMobile } from '../components/mobile/MobileDetector';
import MobileMyJobs from '../components/mobile/MobileMyJobs';
import MyJobsView from '../new-landing/candidate-dashboard/my-jobs/MyJobsView';

const MyJobs: React.FC = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileMyJobs />;
  }
  
  return <MyJobsView themeState="light" />;
};

export default MyJobs;
