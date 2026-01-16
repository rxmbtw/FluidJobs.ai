import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CandidateDashboard from '../components/CandidateDashboard';
import ClientDashboard from '../components/ClientDashboard';
import CompanyDashboard from '../components/CompanyDashboard';
import { useAuth } from '../contexts/AuthProvider';
import Loader from '../components/Loader';

const Dashboard = () => {
  // Use AuthContext instead of direct sessionStorage access
  const { user } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  console.log('Dashboard - Current user:', user);
  console.log('Dashboard - User role:', user?.role);

  if (isInitialLoading) {
    return <Loader />;
  }

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

  // For Candidate role, return new design without DashboardLayout
  if (user.role === 'Candidate') {
    return <CandidateDashboard />;
  }

  // Use DashboardLayout for other roles
  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;
