import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, UserCheck, Settings, LogOut, Search, X, Check, Plus, ChevronLeft, ChevronRight, ArrowUpDown, Briefcase, Filter, Upload, Mail, User, Camera, Download, Trash2 } from 'lucide-react';
import ManageCandidatesWrapper from './ManageCandidatesWrapper';
import JobOpeningsViewNew from './JobOpeningsView_new';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import ThemedBulkImport from './ThemedBulkImport';
import { ThemeProvider } from './ThemeContext';
import JobCreationForm from './JobCreationForm';
import AdminDashboardView from './dashboard/AdminDashboardView';
import Loader from './Loader';

import { safeClosest } from '../utils/domHelpers';

const CompanyDashboard: React.FC = () => {
  const admin = JSON.parse(sessionStorage.getItem('fluidjobs_user') || '{}');
  
  const [stats, setStats] = useState({ active_jobs: 0, active_candidates: 0, jobs_change: 0, candidates_change: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCandidateSubmenuOpen, setIsCandidateSubmenuOpen] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showJobFilters, setShowJobFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });
  const [profileData, setProfileData] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const navigate = useNavigate();

  // Handle stats update from AdminDashboardView
  const handleStatsUpdate = (updatedStats: any) => {
    setStats(updatedStats);
  };

  // Handle accounts update from AdminDashboardView
  const handleAccountsUpdate = (updatedAccounts: any[]) => {
    setAccounts(updatedAccounts);
  };

  // Refresh accounts when returning from AdminDashboardView
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'accounts' || tab === 'dashboard') {
      fetchAccounts(); // Refresh accounts when switching to accounts or dashboard
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsInitialLoading(true);
      // Add 2 second delay for initial loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      fetchStats();
      fetchUsers();
      fetchAccounts();
      fetchJobs(); // Fetch jobs on component mount
      fetchActiveJobs(); // Fetch active jobs for count
      setProfileData({ name: admin.name || '', email: admin.email || '', currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Debug: Log admin data
      console.log('🔍 Admin data from sessionStorage:', admin);
      console.log('🔍 Admin ID:', admin.id);
      console.log('🔍 Token from sessionStorage:', sessionStorage.getItem('fluidjobs_token'));
      
      setIsInitialLoading(false);
    };
    
    initializeDashboard();
    
    // Set up interval to refresh accounts and jobs every 30 seconds
    const interval = setInterval(() => {
      fetchAccounts();
      fetchJobs();
      fetchActiveJobs();
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isNewDropdownOpen && !safeClosest(target, '.new-dropdown-container')) {
        setIsNewDropdownOpen(false);
        setIsCandidateSubmenuOpen(false);
      }
      if (isProfileOpen && !safeClosest(target, '.profile-container')) {
        setIsProfileOpen(false);
      }
      if (showJobDropdown && !safeClosest(target, '.job-dropdown-container')) {
        setShowJobDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNewDropdownOpen, isProfileOpen, showJobDropdown]);

  React.useEffect(() => {
    if (showInviteModal) {
      fetchJobs();
    }
  }, [showInviteModal]);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/list`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.jobs) {
          setJobs(data.jobs);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchActiveJobs = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/active`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.jobs) {
          setActiveJobs(data.jobs);
        }
      }
    } catch (error) {
      console.error('Error fetching active jobs:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteName) {
      alert('Please enter both email and name');
      return;
    }

    try {
      setSendingInvite(true);
      
      const inviteResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates/send-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          phone: invitePhone,
          jobId: selectedJobId || null
        })
      });

      if (!inviteResponse.ok) {
        const error = await inviteResponse.json();
        alert(`Failed to send invitation: ${error.error || 'Unknown error'}`);
        return;
      }

      const message = selectedJobId 
        ? `Invitation sent successfully to ${inviteName} with job notification!`
        : `Invitation sent successfully to ${inviteName}!`;
      
      alert(message);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInvitePhone('');
      setSelectedJobId('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.get<typeof stats>('http://localhost:8000/api/jobs-enhanced/stats', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get<any[]>(`http://localhost:8000/api/auth/users?search=${searchQuery}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      if (!token) {
        console.log('No token found');
        return;
      }
      
      // Debug: Test token first
      try {
        const debugResponse = await axios.get<any>('http://localhost:8000/api/auth/debug-token', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('🔍 Debug token response:', debugResponse.data);
      } catch (debugError) {
        console.error('❌ Debug token error:', debugError);
      }
      
      const response = await axios.get<any[]>('http://localhost:8000/api/auth/my-accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Accounts response:', response.data);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin');
    sessionStorage.removeItem('fluidjobs_token');
    sessionStorage.removeItem('fluidjobs_user');
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {isInitialLoading ? (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <Loader themeState="light" />
        </div>
      ) : (
        <>
      {/* Fixed Top Header */}
      <header className="flex-shrink-0 bg-white shadow-md border-b border-gray-200" style={{ height: '73px' }}>
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
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className="fixed left-0 bottom-0 bg-white border-r-0 border-t-0 flex flex-col transition-all duration-300 z-40"
          style={{ 
            top: '73px',
            width: isSidebarExpanded ? '256px' : '80px',
            boxShadow: '1px 0 3px 0 rgba(0, 0, 0, 0.1), 1px 0 2px -1px rgba(0, 0, 0, 0.1), 0 -1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >

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
                  <button
                    onClick={() => {
                      setActiveTab('create-job');
                      setIsNewDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                  >
                    <Plus size={18} />
                    <span className="text-sm font-medium">Create Job</span>
                  </button>
                  <div className="relative">
                    <div 
                      onClick={() => setIsCandidateSubmenuOpen(!isCandidateSubmenuOpen)}
                      className="w-full flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <User size={18} />
                        <span className="text-sm font-medium">Create Candidate</span>
                      </div>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isCandidateSubmenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    {isCandidateSubmenuOpen && (
                      <div className="mt-1 ml-6 space-y-1">
                        <button
                          onClick={() => {
                            setActiveTab('send-invitation');
                            setIsNewDropdownOpen(false);
                            setIsCandidateSubmenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-blue-50 transition text-left text-sm"
                        >
                          <Mail size={16} />
                          <span>Send Invite</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('bulk-import');
                            setIsNewDropdownOpen(false);
                            setIsCandidateSubmenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-600 hover:bg-blue-50 transition text-left text-sm"
                        >
                          <Upload size={16} />
                          <span>Bulk Import</span>
                        </button>
                      </div>
                    )}
                  </div>
                </nav>
              </div>
            )}
          </div>

          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
          </button>

          <button
            onClick={() => handleTabChange('accounts')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'accounts' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : ''}`}>
              <Users size={20} className="flex-shrink-0" />
              {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Accounts</span>}
            </div>
            {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{accounts.length}</span>}
          </button>

          <button
            onClick={() => handleTabChange('job-openings')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'job-openings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`flex items-center ${isSidebarExpanded ? 'space-x-3' : ''}`}>
              <Briefcase size={20} className="flex-shrink-0" />
              {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Jobs</span>}
            </div>
            {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{jobs.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${
              activeTab === 'candidates' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Candidates</span>}
          </button>
        </nav>

        {/* Settings Direct Navigation */}
        <div className="px-4 mb-4" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', paddingTop: '16px', boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={20} className="flex-shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
          </button>
        </div>

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
                    <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{admin.name || 'Admin'}</p>
                    <p className="text-xs text-blue-600">Admin</p>
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
                  <span className="text-gray-900">Admin</span>
                </div>
                <div>
                  <span className="font-semibold text-blue-600">Email: </span>
                  <span className="text-gray-900">{admin.email || 'admin@fluidjobs.ai'}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile-settings');
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
        <div className={`flex-1 transition-all duration-300 ${
          isSidebarExpanded ? 'ml-64' : 'ml-20'
        } flex flex-col overflow-hidden`}>
          {activeTab === 'dashboard' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back {admin.name || 'Admin'}!</p>
              </div>
              <div className="flex-1 overflow-auto">
                <AdminDashboardView onTabChange={handleTabChange} onAccountsUpdate={handleAccountsUpdate} onStatsUpdate={handleStatsUpdate} />
              </div>
            </div>
          )}

          {activeTab === 'bulk-import' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Bulk Import Candidates</h1>
                <p className="text-gray-600">Import multiple candidates at once using CSV or Excel files</p>
              </div>
              <div className="flex-1 overflow-auto px-8 py-6">
                <ThemeProvider>
                  <ThemedBulkImport />
                </ThemeProvider>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">My Accounts</h1>
                <p className="text-gray-600">Accounts assigned to you for job management.</p>
              </div>

              <div className="flex-1 overflow-auto px-8 py-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {accounts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {accounts.map((account) => (
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
                            <span className="font-medium">Completed Jobs:</span> {account.completed_jobs || 0}
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
            </div>
          )}

          {activeTab === 'candidates' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Manage Candidates</h1>
                <p className="text-gray-600">View and manage candidates for your job openings.</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ManageCandidatesWrapper />
              </div>
            </div>
          )}

          {activeTab === 'job-openings' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <div className="mb-4">
                  <h1 className="text-3xl font-semibold text-gray-900">Job Openings</h1>
                  <p className="text-gray-600">View and Manage your job openings</p>
                </div>

                {/* Search Bar and Filter */}
                <div className="flex items-center justify-between">
                  <div className="relative" style={{ width: '400px' }}>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search job openings..."
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <button 
                    onClick={() => setShowJobFilters(!showJobFilters)}
                    className="p-3 hover:bg-gray-100 rounded-lg"
                  >
                    <Filter size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-8 py-6">
                <JobOpeningsViewNew hideHeader={true} searchQuery={jobSearchQuery} showFilters={showJobFilters} />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account settings</p>
              </div>

              <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Settings size={64} className="mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Admin Settings</h2>
                  <p className="text-gray-600">Admin settings will come here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile-settings' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Update your personal information</p>
              </div>

              <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        {profilePicture ? (
                          <img src={profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                        ) : (
                          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                            {admin.name?.charAt(0) || 'A'}
                          </div>
                        )}
                        <button
                          onClick={() => document.getElementById('profile-picture-input')?.click()}
                          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                        >
                          <Camera size={16} />
                        </button>
                        <input
                          id="profile-picture-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setProfilePicture(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Profile Picture</h4>
                        <p className="text-xs text-gray-600">JPG, PNG or GIF. Max size 2MB</p>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Change Password Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-base font-semibold text-gray-900 mb-4">Change Password</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <input
                            type="password"
                            value={profileData.currentPassword}
                            onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            value={profileData.newPassword}
                            onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={profileData.confirmPassword}
                            onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => {
                          setProfileData({ name: admin.name || '', email: admin.email || '', currentPassword: '', newPassword: '', confirmPassword: '' });
                          setProfilePicture(null);
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (!profileData.name || !profileData.email) {
                              setErrorMessage({
                                title: 'Validation Error',
                                message: 'Name and email are required'
                              });
                              setShowErrorModal(true);
                              return;
                            }

                            if (profileData.newPassword) {
                              if (!profileData.currentPassword) {
                                setErrorMessage({
                                  title: 'Validation Error',
                                  message: 'Current password is required to set new password'
                                });
                                setShowErrorModal(true);
                                return;
                              }
                              if (profileData.newPassword !== profileData.confirmPassword) {
                                setErrorMessage({
                                  title: 'Validation Error',
                                  message: 'New passwords do not match'
                                });
                                setShowErrorModal(true);
                                return;
                              }
                              if (profileData.newPassword.length < 8) {
                                setErrorMessage({
                                  title: 'Validation Error',
                                  message: 'Password must be at least 8 characters'
                                });
                                setShowErrorModal(true);
                                return;
                              }
                            }

                            const response = await axios.put<{
                              success: boolean;
                              message: string;
                              user: {
                                id: number;
                                name: string;
                                email: string;
                                profile_picture: string | null;
                              };
                            }>('http://localhost:8000/api/auth/profile', {
                              id: admin.id,
                              name: profileData.name,
                              email: profileData.email,
                              currentPassword: profileData.currentPassword || undefined,
                              newPassword: profileData.newPassword || undefined,
                              profilePicture: profilePicture || undefined
                            });

                            const updatedAdmin = {
                              ...admin,
                              name: response.data.user.name,
                              email: response.data.user.email,
                              profile_picture: response.data.user.profile_picture
                            };
                            sessionStorage.setItem('fluidjobs_user', JSON.stringify(updatedAdmin));

                            setProfileData({
                              ...profileData,
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });

                            setSuccessMessage({
                              title: 'Success!',
                              message: 'Profile updated successfully'
                            });
                            setShowSuccessModal(true);

                            setTimeout(() => {
                              window.location.reload();
                            }, 1500);
                          } catch (error: any) {
                            console.error('Error updating profile:', error);
                            setErrorMessage({
                              title: 'Error',
                              message: error.response?.data?.error || 'Failed to update profile'
                            });
                            setShowErrorModal(true);
                          }
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'create-job' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Create New Job</h1>
                <p className="text-gray-600">Create a new job opening for approval</p>
              </div>
              <div className="flex-1 overflow-auto px-8 py-6">
              <JobCreationForm 
                onBack={() => {
                  setActiveTab('dashboard');
                }} 
                isSuperAdmin={false} 
              />
              </div>
            </div>
          )}

          {activeTab === 'send-invitation' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Send Invitation</h1>
                <p className="text-gray-600">Invite candidates to apply for job openings</p>
              </div>
              <div className="flex-1 overflow-auto px-8 py-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Send Invitation</h2>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Enter candidate name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Opening</label>
                      <div className="relative job-dropdown-container">
                        <button
                          type="button"
                          onClick={() => setShowJobDropdown(!showJobDropdown)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between transition"
                        >
                          <span>{selectedJobId ? jobs.find(job => job.job_id.toString() === selectedJobId)?.job_title || 'Select a job opening' : 'Select a job opening'}</span>
                          <svg className={`w-5 h-5 transition-transform ${showJobDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {showJobDropdown && (
                          <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                            <div className="p-2">
                              <div
                                onClick={() => {
                                  setSelectedJobId('');
                                  setShowJobDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                              >
                                No job selected
                              </div>
                              {jobs.map((job) => (
                                <div
                                  key={job.job_id}
                                  onClick={() => {
                                    setSelectedJobId(job.job_id.toString());
                                    setShowJobDropdown(false);
                                  }}
                                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                >
                                  {job.job_title} - {Array.isArray(job.locations) ? job.locations.join(', ') : job.locations}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setInviteEmail('');
                        setInviteName('');
                        setInvitePhone('');
                        setSelectedJobId('');
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await handleSendInvite();
                        setActiveTab('dashboard');
                      }}
                      disabled={sendingInvite}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {sendingInvite ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          <span>Send Invite</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorMessage.title}
        message={errorMessage.message}
      />

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <JobCreationForm 
              onBack={() => {
                setShowCreateJobModal(false);
                setSuccessMessage({
                  title: 'Success!',
                  message: 'Job created and sent for approval successfully'
                });
                setShowSuccessModal(true);
                fetchStats();
              }} 
              isSuperAdmin={false} 
            />
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      {showInviteModal && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
          onClick={() => setShowInviteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Send Invitation</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Enter candidate name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job.job_id} value={job.job_id.toString()}>
                      {job.job_title} - {Array.isArray(job.locations) ? job.locations.join(', ') : job.locations}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSendInvite}
                disabled={sendingInvite}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {sendingInvite ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send Invite</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
        </>
      )}
    </div>
  );
};

export default CompanyDashboard;
