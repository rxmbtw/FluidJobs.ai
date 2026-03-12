import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NewDashboardContainer from '../../components/new-dashboard/NewDashboardContainer';

const AdminJobDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobSlug } = useParams<{ jobSlug: string }>();

  const handleBack = () => {
    navigate('..');
  };

  return (
    <NewDashboardContainer 
      onBack={handleBack}
      isSidebarExpanded={false}
      jobId={jobSlug}
    />
  );
};

export default AdminJobDashboard;
