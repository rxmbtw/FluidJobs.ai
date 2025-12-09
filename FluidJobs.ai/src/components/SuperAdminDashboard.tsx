import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, UserCheck, Settings, LogOut, Search, X, Check, Moon, Plus, ChevronLeft, ChevronRight, ArrowUpDown, Briefcase, Filter } from 'lucide-react';
import ManageCandidatesWrapper from './ManageCandidatesWrapper';
import JobOpeningsViewNew from './JobOpeningsView_new';

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ pending_approvals: 0, active_jobs: 0, active_candidates: 0 });
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [approvalTab, setApprovalTab] = useState('pending');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem('superadmin') || '{}');

  useEffect(() => {
    fetchStats();
    fetchPendingApprovals();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get<{ pending_approvals: number; active_jobs: number; active_candidates: number }>('http://localhost:8000/api/superadmin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await axios.get<any[]>('http://localhost:8000/api/superadmin/pending-approvals');
      setPendingApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get<any[]>(`http://localhost:8000/api/superadmin/users?search=${searchQuery}`);
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

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin');
    navigate('/superadmin/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Top Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <img 
              src="/images/FLuid Live Icon light theme.png" 
              alt="FluidJobs.ai Logo" 
              className="object-contain" 
              style={{ width: '3rem', height: '3rem' }}
            />
            <h1 className="text-xl md:text-3xl font-medium text-blue-600">FluidJobs.ai</h1>
          </div>
          <button className="p-2 rounded-full transition-all duration-200 hover:scale-110 bg-gray-100">
            <Moon className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
            isSidebarExpanded ? 'w-64' : 'w-20'
          }`}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >

        <nav className="flex-1 px-4 overflow-hidden mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'accounts' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : ''}`}>
              <Users size={20} className="flex-shrink-0" />
              {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Accounts</span>}
            </div>
            {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">32</span>}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserCheck size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">User Management</span>}
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'candidates' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Manage Candidates</span>}
          </button>

          <button
            onClick={() => setActiveTab('job-openings')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'job-openings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : ''}`}>
              <Briefcase size={20} className="flex-shrink-0" />
              {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Job Openings</span>}
            </div>
            {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{stats.active_jobs}</span>}
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'approvals' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : ''}`}>
              <Check size={20} className="flex-shrink-0" />
              {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Approvals</span>}
            </div>
            {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">5</span>}
          </button>

          <button
            onClick={() => setActiveTab('ai-policies')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'ai-policies' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">AI Policies</span>}
          </button>
        </nav>

        <div className="border-t border-gray-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 text-left transition-all ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
          </button>
        </div>

        <div className="p-4 border-t border-gray-200 overflow-hidden">
          <div className={`flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
            {isSidebarExpanded ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {admin.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{admin.name || 'D Sodhi'}</p>
                    <p className="text-xs text-blue-600">Super Admin</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {admin.name?.charAt(0) || 'D'}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">SuperAdmin Dashboard</h1>
                  <p className="text-gray-600">Welcome back {admin.name || 'D Sodhi'}!</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Create New User
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Pending JD Approvals</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.pending_approvals}</p>
              <p className="text-green-600 text-sm">↑ +2 this week</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Total Active Jobs</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.active_jobs}</p>
              <p className="text-green-600 text-sm">↑ +2</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-2">Active Candidates</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.active_candidates}</p>
              <p className="text-red-600 text-sm">↓ -3%</p>
            </div>
          </div>

              {/* Pending Approvals */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Approvals</h2>
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
              <button className="text-gray-600 text-sm hover:text-gray-900">Show more</button>
            </div>
          </div>

              {/* User Management */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by name, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
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
                    <tr key={user.candidate_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{user.full_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.role || 'Candidate'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              </div>
            </>
          )}

          {activeTab === 'accounts' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
                  <p className="text-gray-600">Manage client accounts and their dedicated hiring managers.</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Create New Account</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search users by name or user..."
                    className="w-full max-w-md pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Accounts Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span>Account Name</span>
                          <ArrowUpDown size={14} className="text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span>Assigned Users</span>
                          <ArrowUpDown size={14} className="text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <ArrowUpDown size={14} className="text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span>Active Jobs</span>
                          <ArrowUpDown size={14} className="text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span>Date Created</span>
                          <ArrowUpDown size={14} className="text-gray-400" />
                        </div>
                      </th>
                      <th className="py-4 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* BGIC Row */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium">BGIC</td>
                      <td className="py-4 px-4">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                          <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                          <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">5</td>
                      <td className="py-4 px-4 text-sm text-gray-600">20-11-2025</td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                    {/* AdoSolve Row */}
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium">AdoSolve</td>
                      <td className="py-4 px-4">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                          <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium">Inactive</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">2</td>
                      <td className="py-4 px-4 text-sm text-gray-600">05-08-2025</td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">Showing 1 to 10 of 32 results</p>
                  <div className="flex space-x-2">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                  <p className="text-gray-600">Manage user accounts and their roles.</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Plus size={20} />
                  <span>Create New User</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search users by name, email or role..."
                    className="w-full max-w-md pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          <ArrowUpDown size={14} className="text-gray-400" />
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Email</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Role</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Date Joined</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Status</th>
                      <th className="py-4 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">Deepak K</td>
                      <td className="py-4 px-4 text-sm text-gray-600">deepak@fluid.live</td>
                      <td className="py-4 px-4 text-sm text-gray-600">HR Head</td>
                      <td className="py-4 px-4 text-sm text-gray-600">20-11-2025</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">Shriram Surse</td>
                      <td className="py-4 px-4 text-sm text-gray-600">ram@fluid.live</td>
                      <td className="py-4 px-4 text-sm text-gray-600">AI Team</td>
                      <td className="py-4 px-4 text-sm text-gray-600">05-08-2025</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">Rohnit Roy</td>
                      <td className="py-4 px-4 text-sm text-gray-600">rohnit@fluid.live</td>
                      <td className="py-4 px-4 text-sm text-gray-600">AI Team</td>
                      <td className="py-4 px-4 text-sm text-gray-600">05-08-2025</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">Meet Pandya</td>
                      <td className="py-4 px-4 text-sm text-gray-600">meet@fluid.live</td>
                      <td className="py-4 px-4 text-sm text-gray-600">AI Team</td>
                      <td className="py-4 px-4 text-sm text-gray-600">05-08-2025</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">Shobhit Shukla</td>
                      <td className="py-4 px-4 text-sm text-gray-600">shobhit@fluid.live</td>
                      <td className="py-4 px-4 text-sm text-gray-600">AI Team</td>
                      <td className="py-4 px-4 text-sm text-gray-600">05-08-2025</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">Showing 1 to 5 of 5 results</p>
                  <div className="flex space-x-2">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'candidates' && (
            <div className="h-full">
              <ManageCandidatesWrapper />
            </div>
          )}

          {activeTab === 'job-openings' && (
            <>
              {/* Custom Header - Centered White Box */}
              <div className="bg-white rounded-xl p-6 mb-4 text-center shadow-sm border border-gray-200">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">View Openings</h1>
                <p className="text-gray-500">View and Manage all the openings created under your organization</p>
              </div>

              {/* Search Bar and Filter */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative" style={{ width: '400px' }}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search job openings..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="p-3 hover:bg-gray-100 rounded-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button className="p-3 hover:bg-gray-100 rounded-lg">
                    <Filter size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Job Cards - Hide built-in header */}
              <JobOpeningsViewNew hideHeader={true} />
            </>
          )}

          {activeTab === 'approvals' && (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
                <p className="text-gray-600">Manage all the approvals of users</p>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={() => setApprovalTab('pending')}
                  className={`px-8 py-3 rounded-full text-sm font-medium transition ${
                    approvalTab === 'pending'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setApprovalTab('approved')}
                  className={`px-8 py-3 rounded-full text-sm font-medium transition ${
                    approvalTab === 'approved'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setApprovalTab('declined')}
                  className={`px-8 py-3 rounded-full text-sm font-medium transition ${
                    approvalTab === 'declined'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Declined
                </button>
              </div>

              {/* Content Area */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 min-h-[500px]">
                {approvalTab === 'pending' && (
                  <div className="text-center text-gray-500 py-12">
                    <p>No pending approvals</p>
                  </div>
                )}
                {approvalTab === 'approved' && (
                  <div className="text-center text-gray-500 py-12">
                    <p>No approved items</p>
                  </div>
                )}
                {approvalTab === 'declined' && (
                  <div className="text-center text-gray-500 py-12">
                    <p>No declined items</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'ai-policies' && (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">AI Policies</h1>
                <p className="text-gray-600">Manage all the AI Policies</p>
              </div>

              {/* Policy Cards */}
              <div className="space-y-6">
                {/* Restrict Candidate Policy */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Restrict Candidate Policy</h2>
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                      <Plus size={18} />
                      <span>Upload Policy</span>
                    </button>
                  </div>
                </div>

                {/* AI Interviewer Policy */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">AI Interviewer Policy</h2>
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                      <Plus size={18} />
                      <span>Upload Policy</span>
                    </button>
                  </div>
                </div>

                {/* AI Call Policy */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">AI Call Policy</h2>
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                      <Plus size={18} />
                      <span>Upload Policy</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
