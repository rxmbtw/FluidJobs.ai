import React from 'react';
import NewHomePage from './NewHomePage';
import NewCandidateDashboard from './dashboard-v2/NewCandidateDashboard';

const CandidateDashboard: React.FC = () => {
  const path = window.location.pathname;
  if (path === '/dashboard-v2') {
    return <NewCandidateDashboard />;
  }
  return <NewHomePage />;
};

export default CandidateDashboard;