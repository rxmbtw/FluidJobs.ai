import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, UserCheck } from 'lucide-react';
import Loader from '../Loader';

interface DashboardStats {
  active_jobs: number;
  active_candidates: number;
  jobs_change: number;
  candidates_change: number;
}

interface ActiveJob {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface Account {
  account_id: number;
  account_name: string;
  status: string;
  locations: string;
  active_jobs: number;
  completed_jobs: number;
  assigned_users: number;
}

interface AdminDashboardViewProps {
  onTabChange: (tab: string) => void;
  onAccountsUpdate?: (accounts: Account[]) => void;
  onStatsUpdate?: (stats: DashboardStats) => void;
  dashboardDateRange?: { start: string; end: string };
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onTabChange, onAccountsUpdate, onStatsUpdate, dashboardDateRange }) => {
  const [stats, setStats] = useState<DashboardStats>({
    active_jobs: 0,
    active_candidates: 0,
    jobs_change: 0,
    candidates_change: 0
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [closedJobs, setClosedJobs] = useState<ActiveJob[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const admin = JSON.parse(sessionStorage.getItem('fluidjobs_user') || '{}');
  const adminName = admin.name || 'Admin';
  const userRole = admin.role || 'User';
  
  // Normalize role - handle special cases like HR (all caps)
  const normalizeRole = (role: string): string => {
    const upperRole = role.toUpperCase();
    // Special cases that should remain all caps
    if (upperRole === 'HR') return 'HR';
    // Standard capitalization for other roles
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };
  
  const normalizedRole = normalizeRole(userRole);
  
  // Debug logging
  console.log('AdminDashboardView - Original Role:', userRole);
  console.log('AdminDashboardView - Normalized Role:', normalizedRole);
  
  const isSalesRole = normalizedRole === 'Sales';
  const isInterviewerRole = normalizedRole === 'Interviewer';
  const hideCandidatesCard = isSalesRole || isInterviewerRole; // Hide for Sales and Interviewer
  const canCreateJobs = ['Admin', 'Recruiter', 'Sales'].includes(normalizedRole);
  const canManageCandidates = ['Admin', 'HR', 'Recruiter'].includes(normalizedRole);
  
  console.log('AdminDashboardView - canCreateJobs:', canCreateJobs);
  console.log('AdminDashboardView - canManageCandidates:', canManageCandidates);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchAccounts();
    fetchActiveJobs();
    fetchClosedJobs();
  }, [dashboardDateRange]);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      let url = 'http://localhost:8000/api/jobs-enhanced/stats';
      if (dashboardDateRange?.start && dashboardDateRange?.end) {
        url += `?startDate=${dashboardDateRange.start}&endDate=${dashboardDateRange.end}`;
      }
      const response = await axios.get<DashboardStats>(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setStats(response.data);
      // Update parent component with stats data
      if (onStatsUpdate) {
        onStatsUpdate(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      if (!token) return;
      
      const response = await axios.get<Account[]>('http://localhost:8000/api/auth/my-accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setAccounts(response.data);
      // Update parent component with accounts data
      if (onAccountsUpdate) {
        onAccountsUpdate(response.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchActiveJobs = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.get('http://localhost:8000/api/jobs-enhanced/active', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = response.data as { success: boolean; jobs: ActiveJob[] };
      if (data.success) {
        setActiveJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching active jobs:', error);
    }
  };

  const fetchClosedJobs = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.get('http://localhost:8000/api/jobs-enhanced/closed', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = response.data as { success: boolean; jobs: ActiveJob[] };
      if (data.success) {
        setClosedJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching closed jobs:', error);
    }
  };

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <div className="p-8">
      {/* Stats Cards */}
      <div className={`grid ${hideCandidatesCard ? 'grid-cols-3' : 'grid-cols-4'} gap-4 mb-8`}>
        <div 
          onClick={() => onTabChange('accounts')}
          className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-600 text-sm mb-2">My Accounts</p>
          <p className="text-4xl font-semibold text-gray-900">{accounts.length}</p>
        </div>

        <div 
          onClick={() => onTabChange('jobs')}
          className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-600 text-sm mb-2">Total Active Jobs</p>
          <p className="text-4xl font-semibold text-gray-900">{activeJobs.length}</p>
        </div>

        {!hideCandidatesCard && (
          <div 
            onClick={() => onTabChange('candidates')}
            className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <p className="text-gray-600 text-sm mb-2">Active Candidates</p>
            <p className="text-4xl font-semibold text-gray-900 mb-2">{stats.active_candidates}</p>
            {stats.candidates_change !== 0 && (
              <p className={`text-sm ${stats.candidates_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.candidates_change > 0 ? '↑' : '↓'} {stats.candidates_change > 0 ? '+' : ''}{stats.candidates_change}
              </p>
            )}
          </div>
        )}

        <div 
          onClick={() => onTabChange('jobs')}
          className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-600 text-sm mb-2">Closed Positions</p>
          <p className="text-4xl font-semibold text-gray-900">{closedJobs.length}</p>
        </div>
      </div>

      {/* My Accounts Section */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">My Accounts</h2>
          <button 
            onClick={() => onTabChange('accounts')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="p-6">
          {accounts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {accounts.slice(0, 3).map((account) => (
                <div key={account.account_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{account.account_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {account.status || 'Active'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Active Jobs:</span> {account.active_jobs || 0}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {account.locations || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Users:</span> {account.assigned_users || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Assigned</h3>
              <p className="text-gray-600">You don't have any accounts assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className={`grid ${(canCreateJobs && canManageCandidates) ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {canCreateJobs && (
            <button 
              onClick={() => onTabChange('create-job')}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
            >
              <Briefcase className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Create New Job</h3>
              <p className="text-sm text-gray-600 mt-1">Post a new job opening for approval</p>
            </button>
          )}
          
          {canManageCandidates && (
            <button 
              onClick={() => onTabChange('candidates')}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
            >
              <UserCheck className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Candidates</h3>
              <p className="text-sm text-gray-600 mt-1">Review and manage candidate applications</p>
            </button>
          )}
          
          {!canCreateJobs && !canManageCandidates && (
            <button 
              onClick={() => onTabChange('jobs')}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
            >
              <Briefcase className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Jobs</h3>
              <p className="text-sm text-gray-600 mt-1">Browse and access all job openings</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;