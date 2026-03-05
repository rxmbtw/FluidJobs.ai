import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, Settings, LogOut, Check, Plus, Briefcase, Mail, User, Building2, BarChart3 } from 'lucide-react';
import AdminBreadcrumbs from '../../components/admin/AdminBreadcrumbs';
import { DateFilterDropdown } from '../../components/DateFilterDropdown';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';

const AdminDashboard: React.FC = () => {
  const admin = JSON.parse(sessionStorage.getItem('fluidjobs_user') || '{}');
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({ active_jobs: 0, active_candidates: 0, jobs_change: 0, candidates_change: 0 });
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showJobFilters, setShowJobFilters] = useState(false);
  const [jobTab, setJobTab] = useState('all');
  const [dashboardDateRange, setDashboardDateRange] = useState({ start: '', end: '' });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Role-based access control
  const userRole = admin.role || 'User';
  const canCreateJobs = ['Admin', 'Recruiter'].includes(userRole);
  const canManageUsers = ['Admin'].includes(userRole);
  const canViewPermissions = ['HR', 'Interviewer', 'Sales'].includes(userRole);
  const canViewAccounts = ['Admin', 'Recruiter', 'HR'].includes(userRole);
  const canManageCandidates = ['Admin', 'HR', 'Recruiter'].includes(userRole);
  const canViewJobs = ['Admin', 'Recruiter', 'HR', 'Interviewer', 'Sales'].includes(userRole);
  const canSendInvites = ['Admin', 'HR', 'Recruiter'].includes(userRole);
  const canBulkImport = ['Admin', 'HR'].includes(userRole);

  const handleStatsUpdate = (updatedStats: any) => {
    setStats(updatedStats);
  };

  const handleAccountsUpdate = (updatedAccounts: any[]) => {
    setAccounts(updatedAccounts);
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      let url = 'http://localhost:8000/api/jobs-enhanced/stats';
      if (dashboardDateRange.start && dashboardDateRange.end) {
        url += `?startDate=${dashboardDateRange.start}&endDate=${dashboardDateRange.end}`;
      }
      const response = await axios.get<typeof stats>(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.get<{ success: boolean, data: any[] }>('http://localhost:8000/api/jobs-enhanced', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.data.success) {
        setJobs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchActiveJobs = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.get<{ success: boolean, data: any[] }>('http://localhost:8000/api/jobs-enhanced?status=Active', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.data.success) {
        setActiveJobs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching active jobs:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      if (!token) return;

      const response = await axios.get<any[]>('http://localhost:8000/api/auth/my-accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    }
  };

  useEffect(() => {
    if (location.pathname === '/admin-dashboard/overview') {
      fetchStats();
    }
  }, [dashboardDateRange, location.pathname]);

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsInitialLoading(true);
      // await new Promise(resolve => setTimeout(resolve, 2000)); // Maybe unnecessary delay
      fetchStats();
      fetchAccounts();
      fetchJobs();
      fetchActiveJobs();
      setIsInitialLoading(false);
    };

    initializeDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin');
    sessionStorage.removeItem('fluidjobs_token');
    sessionStorage.removeItem('fluidjobs_user');
    sessionStorage.clear();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="flex flex-1 overflow-hidden h-screen">
        {/* Sidebar */}
        <div
          className="fixed left-0 top-0 bottom-0 bg-white border-r-0 flex flex-col transition-all duration-300 z-40"
          style={{
            width: isSidebarExpanded ? '256px' : '80px',
            boxShadow: '1px 0 3px 0 rgba(0, 0, 0, 0.1), 1px 0 2px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          {/* Logo Header */}
          <div className="flex items-center px-4 py-4 border-b border-gray-200">
            <img
              src="/images/FLuid Live Icon light theme.png"
              alt="FluidJobs.ai Logo"
              className="object-contain flex-shrink-0"
              style={{ width: '2.5rem', height: '2.5rem' }}
            />
            {isSidebarExpanded && (
              <h1 className="ml-3 text-lg font-medium text-blue-600 whitespace-nowrap">FluidJobs.ai</h1>
            )}
          </div>

          <nav className="flex-1 px-4 overflow-hidden mt-4">
            {/* New Button with Dropdown */}
            <div className="relative mb-3 new-dropdown-container">
              <button
                onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
              >
                <Plus size={20} className="flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm font-semibold whitespace-nowrap">Create</span>}
              </button>

              {isSidebarExpanded && isNewDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl overflow-hidden z-20 border border-gray-200">
                  <nav className="p-2">
                    {canCreateJobs && (
                      <button
                        onClick={() => {
                          navigate('/admin-dashboard/create-job');
                          setIsNewDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                      >
                        <Briefcase size={18} />
                        <span className="text-sm font-medium">Create Job</span>
                      </button>
                    )}
                    {(canSendInvites || canBulkImport) && (
                      <button
                        onClick={() => {
                          navigate('/admin-dashboard/create-candidate');
                          setIsNewDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                      >
                        <User size={18} />
                        <span className="text-sm font-medium">Create Candidate</span>
                      </button>
                    )}
                  </nav>
                </div>
              )}
            </div>

            {/* Separator line */}
            <div className="-mx-4 mb-3" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', paddingTop: '16px', boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)' }}></div>

            <button
              onClick={() => navigate('/admin-dashboard/overview')}
              className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${isActive('/overview') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FileText size={20} className="flex-shrink-0" />
              {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
            </button>

            {canViewAccounts && (
              <button
                onClick={() => navigate('/admin-dashboard/accounts')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${isActive('/accounts') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : ''}`}>
                  <Building2 size={20} className="flex-shrink-0" />
                  {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Accounts</span>}
                </div>
                {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{accounts.length}</span>}
              </button>
            )}

            {canViewJobs && (
              <button
                onClick={() => navigate('/admin-dashboard/jobs')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${isActive('/jobs') && !isActive('/create-job') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : ''}`}>
                  <Briefcase size={20} className="flex-shrink-0" />
                  {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Jobs</span>}
                </div>
                {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{jobs.length}</span>}
              </button>
            )}

            {canManageCandidates && (
              <button
                onClick={() => navigate('/admin-dashboard/candidates')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${isActive('/candidates') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Users size={20} className="flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Candidates</span>}
              </button>
            )}

            {/* Recruiters Analytics */}
            {(userRole === 'Admin' || userRole === 'SuperAdmin') && (
              <button
                onClick={() => navigate('/admin-dashboard/recruiters')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${isActive('/recruiters') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <BarChart3 size={20} className="flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Recruiters Analytics</span>}
              </button>
            )}
          </nav>

          {/* Settings Direct Navigation */}
          {(canManageUsers || canViewPermissions) && (
            <div className="px-4 mb-4" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', paddingTop: '16px', boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
              <button
                onClick={() => navigate('/admin-dashboard/settings')}
                className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-2 text-left transition-all ${isActive('/settings') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Settings size={20} className="flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
              </button>

            </div>
          )}

          <div className="p-4 overflow-visible relative profile-container" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
            <div
              className={`flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} cursor-pointer hover:opacity-90 transition`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              {isSidebarExpanded ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {admin.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{admin.name || 'User'}</p>
                      <p className="text-xs text-blue-600">{admin.role || 'User'}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="text-red-500 hover:text-red-700">
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {admin.name?.charAt(0) || 'A'}
                </div>
              )}
            </div>

            {isSidebarExpanded && isProfileOpen && (
              <div className="absolute bottom-20 left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-20 border border-gray-200">
                <div className="p-6 space-y-3">
                  <div>
                    <span className="font-semibold text-blue-600">Role: </span>
                    <span className="text-gray-900">{admin.role || 'User'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-600">Email: </span>
                    <span className="text-gray-900">{admin.email || 'admin@fluidjobs.ai'}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/admin-dashboard/profile-settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'
          } flex flex-col overflow-hidden h-screen`}>

          {/* Breadcrumbs */}
          <div className="px-8 pt-6 pb-0">
            <AdminBreadcrumbs />
          </div>

          <Outlet context={{
            handleTabChange: (tab: string) => navigate(`/admin-dashboard/${tab}`), // Backward compat override
            handleAccountsUpdate,
            handleStatsUpdate,
            dashboardDateRange,
            setDashboardDateRange,
            admin,
            jobs,
            fetchJobs,
            activeJobs,
            accounts,
            jobSearchQuery,
            setJobSearchQuery,
            showJobFilters,
            setShowJobFilters,
            jobTab,
            setJobTab
          }} />

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
