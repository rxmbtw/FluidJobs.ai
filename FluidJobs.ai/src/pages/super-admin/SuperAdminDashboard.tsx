import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import SuperAdminSidebar from '../../components/super-admin/SuperAdminSidebar';
import SuperAdminBreadcrumbs from '../../components/super-admin/SuperAdminBreadcrumbs';
import Loader from '../../components/Loader';

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('superadmin') || '{}');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    activeAccounts: 0,
    activeJobs: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats and accounts count
        const [statsRes, accountsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/superadmin/stats'),
          axios.get('http://localhost:8000/api/superadmin/accounts')
        ]);

        setStats({
          pendingApprovals: (statsRes.data as any).pending_approvals || 0,
          activeJobs: (statsRes.data as any).active_jobs || 0,
          activeAccounts: (accountsRes.data as any[]).length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader themeState="light" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SuperAdminSidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        adminName={admin.name}
        adminEmail={admin.email}
        stats={stats}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'
          } flex flex-col overflow-hidden h-screen`}
      >
        <div className="p-6 pb-0">
          <SuperAdminBreadcrumbs />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
