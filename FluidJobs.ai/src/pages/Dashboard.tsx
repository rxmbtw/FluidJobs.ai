import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CandidateDashboard from '../components/CandidateDashboard';
import ClientDashboard from '../components/ClientDashboard';


const Dashboard = () => {
  // Get user from sessionStorage directly
  const user = JSON.parse(sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('fluidjobs_user') || 'null');

  console.log('Dashboard - Current user:', user);
  console.log('Dashboard - User role:', user?.role);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Admin users should be redirected by DashboardRouter, not handled here
  // This component only handles Candidate dashboard

  // Use DashboardLayout for other roles
  const renderDashboard = () => {
    switch (user.role) {
      case 'Candidate':
        return <CandidateDashboard />;
      case 'Client':
        return <ClientDashboard />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Invalid Role</h2>
              <p className="text-gray-500">Your account role is not recognized. Please contact support.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;
