import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Check } from 'lucide-react';

interface DashboardStats {
  pending_approvals: number;
  total_pending_approvals: number;
  active_jobs: number;
  active_candidates: number;
  jobs_change: number;
  candidates_change: number;
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

const SuperAdminDashboardView: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
  const [stats, setStats] = useState<DashboardStats>({
    pending_approvals: 0,
    total_pending_approvals: 0,
    active_jobs: 0,
    active_candidates: 0,
    jobs_change: 0,
    candidates_change: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState<PendingJob[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const admin = JSON.parse(localStorage.getItem('superadmin') || '{}');
  const adminName = admin.name || 'Admin';

  useEffect(() => {
    fetchStats();
    fetchPendingApprovals();
    fetchUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStats = async () => {
    try {
      const response = await axios.get<DashboardStats>('http://localhost:8000/api/superadmin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get<PendingJob[]>('http://localhost:8000/api/superadmin/pending-approvals');
      setPendingApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
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

  const handleApprove = async (id: number) => {
    try {
      await axios.post(`http://localhost:8000/api/superadmin/approve-job/${id}`);
      fetchPendingApprovals();
      fetchStats();
    } catch (error) {
      console.error('Error approving job:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.post(`http://localhost:8000/api/superadmin/reject-job/${id}`);
      fetchPendingApprovals();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">SuperAdmin Dashboard</h1>
        <p className="text-gray-600">Welcome back {adminName}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => onTabChange('approvals')}
          className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-600 text-sm mb-2">Pending Approvals</p>
          <p className="text-4xl font-semibold text-gray-900">{stats.total_pending_approvals}</p>
        </div>

        <div 
          onClick={() => onTabChange('job-openings')}
          className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <p className="text-gray-600 text-sm mb-2">Total Active Jobs</p>
          <p className="text-4xl font-semibold text-gray-900 mb-2">{stats.active_jobs}</p>
          {stats.jobs_change !== 0 && (
            <p className={`text-sm ${stats.jobs_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.jobs_change > 0 ? '↑' : '↓'} {stats.jobs_change > 0 ? '+' : ''}{stats.jobs_change}
            </p>
          )}
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
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approvals</h2>
        <div className="space-y-3">
          {pendingApprovals.slice(0, 2).map((job) => (
            <div key={job.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{job.title}</p>
                <p className="text-sm text-gray-600">{job.company}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleReject(job.id)}
                  className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={() => handleApprove(job.id)}
                  className="p-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50"
                >
                  <Check size={20} />
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => onTabChange('approvals')}
            className="text-gray-600 text-sm hover:text-gray-900"
          >
            Show more
          </button>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map((user) => (
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
