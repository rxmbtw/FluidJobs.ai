import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

interface DashboardStats {
  pending_approvals: number;
  total_pending_approvals: number;
  active_accounts: number;
  active_jobs: number;
  active_candidates: number;
  closed_positions: number;
  jobs_change: number;
  candidates_change: number;
}

interface ActiveJob {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface PendingJob {
  id: number;
  title: string;
  company: string;
  created_by_name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface SuperAdminDashboardViewProps {
  onTabChange: (tab: string) => void;
  dashboardDateRange?: { start: string; end: string };
}

const SuperAdminDashboardView: React.FC<SuperAdminDashboardViewProps> = ({ onTabChange, dashboardDateRange }) => {
  const [stats, setStats] = useState<DashboardStats>({
    pending_approvals: 0,
    total_pending_approvals: 0,
    active_accounts: 0,
    active_jobs: 0,
    active_candidates: 0,
    closed_positions: 0,
    jobs_change: 0,
    candidates_change: 0
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [closedJobs, setClosedJobs] = useState<ActiveJob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const admin = JSON.parse(localStorage.getItem('superadmin') || '{}');
  const adminName = admin.name || 'Admin';

  useEffect(() => {
    fetchStats();
    fetchAccounts();
    fetchUsers();
    fetchActiveJobs();
    fetchClosedJobs();
  }, [dashboardDateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStats = async () => {
    try {
      let url = 'http://localhost:8000/api/superadmin/stats';
      if (dashboardDateRange?.start && dashboardDateRange?.end) {
        url += `?startDate=${dashboardDateRange.start}&endDate=${dashboardDateRange.end}`;
      }
      const response = await axios.get<DashboardStats>(url);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get<any[]>('http://localhost:8000/api/superadmin/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>(`http://localhost:8000/api/superadmin/users?search=${searchQuery}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActiveJobs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/jobs-enhanced/active');
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
      const response = await axios.get('http://localhost:8000/api/jobs-enhanced/closed');
      const data = response.data as { success: boolean; jobs: ActiveJob[] };
      if (data.success) {
        setClosedJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching closed jobs:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => onTabChange('accounts')}
          className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-600 text-sm mb-2">Active Accounts</p>
          <p className="text-4xl font-semibold text-gray-900">{stats.active_accounts || accounts.filter(account => account.status === 'Active').length}</p>
        </div>

        <div 
          onClick={() => onTabChange('job-openings')}
          className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-600 text-sm mb-2">Total Active Jobs</p>
          <p className="text-4xl font-semibold text-gray-900">{stats.active_jobs || activeJobs.length}</p>
        </div>

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

        <div 
          onClick={() => onTabChange('job-openings')}
          className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-600 text-sm mb-2">Closed Positions</p>
          <p className="text-4xl font-semibold text-gray-900">{stats.closed_positions || closedJobs.length}</p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg border border-gray-200 flex flex-col" style={{ maxHeight: '500px' }}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <button 
            onClick={() => onTabChange('users')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="p-6 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 bg-gray-50">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 bg-gray-50">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 bg-gray-50">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 bg-gray-50">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.role || 'Admin'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardView;
