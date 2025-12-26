import React from 'react';
import { useAuth } from '../contexts/AuthProvider';
import CandidateDashboard from '../new-landing/candidate-dashboard/CandidateDashboard';
import CompanyDashboard from '../new-landing/company-dashboard/CompanyDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === 'Candidate') {
    return <CandidateDashboard />;
  }

  if (['Admin', 'HR', 'Sales'].includes(user.role)) {
    return <CompanyDashboard />;
  }

  return <div>Unauthorized</div>;
};

export default DashboardRouter;
