import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useSearchParams, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, UserCheck, Settings, LogOut, Search, X, Check, Plus, ChevronLeft, ChevronRight, ArrowUpDown, Briefcase, Filter, Upload, Mail, User, Camera, Download, Trash2, Sparkles } from 'lucide-react';
import CandidatesWrapper from '../../components/admin/CandidatesWrapper';
import JobOpeningsViewNew from '../../components/admin/JobOpeningsView_new';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import SuperAdminDashboardView from '../../components/dashboard/SuperAdminDashboardView';
import ThemedBulkImport from '../../components/admin/ThemedBulkImport';
import { ThemeProvider } from '../../components/candidate/ThemeContext';
import PhoneInput from '../../components/PhoneInput';
import JobCreationForm from '../../components/admin/JobCreationForm';
import Loader from '../../components/Loader';
import { DateFilterDropdown } from '../../components/DateFilterDropdown';
import NewDashboardContainer from '../../components/new-dashboard/NewDashboardContainer';
import AnalyticsWidget from '../../components/new-dashboard/AnalyticsWidget';

const SuperAdminDefaultView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('superadmin') || '{}');

  // Helper function for safe DOM traversal
  const safeClosest = (element: HTMLElement | null, selector: string): HTMLElement | null => {
    if (!element) return null;
    try {
      return element.closest(selector);
    } catch {
      return null;
    }
  };

  // DEBUG: Verify this component is loading
  console.log('🟢 SuperAdminDashboard LOADED - Version 2026-01-17 FINAL FIX');
  console.log('🟢 Fixed: Accounts & Users in scrollable containers');
  console.log('🟢 Fixed: All page headings are now fixed (flex-shrink-0)');
  console.log('🟢 Fixed: Content areas use overflow-hidden + h-full overflow-auto');

  const [stats, setStats] = useState({ pending_approvals: 0, total_pending_approvals: 0, active_jobs: 0, active_candidates: 0, jobs_change: 0, candidates_change: 0 });
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  const formatSalary = (salaryRange: string) => {
    if (!salaryRange) return 'N/A';
    const parts = salaryRange.split('-').map(s => s.trim());
    if (parts.length === 2) {
      const min = parseInt(parts[0]).toLocaleString('en-IN');
      const max = parseInt(parts[1]).toLocaleString('en-IN');
      return `₹${min} - ₹${max}`;
    }
    return salaryRange;
  };
  const [approvedJobs, setApprovedJobs] = useState<any[]>([]);
  const [rejectedJobs, setRejectedJobs] = useState<any[]>([]);
  const [allApprovals, setAllApprovals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { status, jobSlug } = useParams<{ status: string; jobSlug: string }>();

  // Determine activeTab from path or search params
  const getActiveTabFromPath = (path: string) => {
    if (path.includes('/superadmin-dashboard/approvals')) return 'approvals';
    if (path.includes('/superadmin-dashboard/accounts')) return 'accounts';

    // Jobs
    if (path.includes('/superadmin-dashboard/jobs')) return 'job-openings';

    // Candidates
    if (path.includes('/superadmin-dashboard/candidates')) return 'candidates';

    // Create Candidate Nested Routes
    if (path.includes('/superadmin-dashboard/create-candidate/invite')) return 'send-invitation';
    if (path.includes('/superadmin-dashboard/create-candidate/import')) return 'bulk-import';
    if (path.includes('/superadmin-dashboard/create-candidate')) return 'create-candidate';

    if (path.includes('/superadmin-dashboard/users')) return 'users';
    if (path.includes('/superadmin-dashboard/create-job')) return 'create-job';
    if (path.includes('/superadmin-dashboard/create-user')) return 'create-user-page';
    if (path.includes('/superadmin-dashboard/create-account')) return 'create-account-page';

    // Legacy support (redirects handled in App.tsx but good to have)
    if (path.includes('/superadmin-dashboard/send-invitation')) return 'send-invitation';
    if (path.includes('/superadmin-dashboard/bulk-import')) return 'bulk-import';

    // Job Dashboard
    if (path.includes('/superadmin-dashboard/jobs/job-dashboard/')) return 'job-dashboard';

    // Jobs
    if (path.includes('/superadmin-dashboard/jobs')) return 'job-openings';
    if (path.includes('/superadmin-dashboard/profile')) return 'profile-settings';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath(location.pathname) !== 'dashboard'
    ? getActiveTabFromPath(location.pathname)
    : (searchParams.get('tab') || 'dashboard');

  const setActiveTab = (tab: string) => {
    if (tab === 'dashboard') navigate('/superadmin-dashboard');
    else if (tab === 'approvals') navigate('/superadmin-dashboard/approvals');
    else if (tab === 'accounts') navigate('/superadmin-dashboard/accounts');
    else if (tab === 'job-openings') navigate('/superadmin-dashboard/jobs');
    else if (tab === 'candidates') navigate('/superadmin-dashboard/candidates');
    else if (tab === 'users') navigate('/superadmin-dashboard/users');
    else if (tab === 'create-job') navigate('/superadmin-dashboard/create-job');
    else if (tab === 'create-user-page') navigate('/superadmin-dashboard/create-user');
    else if (tab === 'create-account-page') navigate('/superadmin-dashboard/create-account');

    // Create Candidate Navigation
    else if (tab === 'create-candidate') navigate('/superadmin-dashboard/create-candidate');
    else if (tab === 'send-invitation') navigate('/superadmin-dashboard/create-candidate/invite');
    else if (tab === 'bulk-import') navigate('/superadmin-dashboard/create-candidate/import');

    else if (tab === 'settings-ai-policies') navigate('/superadmin-dashboard/settings/policies');
    else if (tab === 'settings-audit-logs') navigate('/superadmin-dashboard/settings/audit-logs');
    else if (tab === 'profile-settings') navigate('/superadmin-dashboard/profile');
    else setSearchParams({ tab });
  };
  // These are controlled by URL parameters or local state if they are sub-features
  const [showProfileSettingsPage, setShowProfileSettingsPage] = useState(false);

  // Legacy states - kept for compatibility but should be refactored
  // const [approvalTab, setApprovalTab] = useState('pending'); // Derived from URL now
  // Derived states from URL parameters
  const jobTab = activeTab === 'job-openings' ? (status || 'all') : 'all';
  const approvalTab = activeTab === 'approvals' ? (status || 'pending') : 'pending';
  const approvalFilter = 'all'; // Keep this simple for now, or move to URL if needed

  // Sidebar state removed as it is handled by layout
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [uploadingPolicy, setUploadingPolicy] = useState<string | null>(null);
  const [policies, setPolicies] = useState<{ [key: string]: { name: string, uploadedAt: string } | null }>({
    'restrict-candidate': null,
    'ai-interviewer': null,
    'ai-call': null
  });
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: boolean }>({});
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [showDeleteUserConfirmModal, setShowDeleteUserConfirmModal] = useState(false);
  const [userToDeleteSimple, setUserToDeleteSimple] = useState<any>(null);
  const [transferTargetUserId, setTransferTargetUserId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });
  const [deletingUser, setDeletingUser] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', status: 'Active', locations: [] as string[], assignedUsers: [admin?.id].filter(Boolean) as number[] });
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // const [jobTab, setJobTab] = useState('all'); // Derived from URL now
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showJobFilters, setShowJobFilters] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showAIPolicies, setShowAIPolicies] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditSettings, setAuditSettings] = useState({ retention_days: 90, auto_purge_enabled: true });
  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [profileData, setProfileData] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [dashboardDateRange, setDashboardDateRange] = useState({ start: '', end: '' });
  const [approvalsDateRange, setApprovalsDateRange] = useState({ start: '', end: '' });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [jobToReject, setJobToReject] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);

  React.useEffect(() => {
    setProfileData({ name: admin.name || '', email: admin.email || '', currentPassword: '', newPassword: '', confirmPassword: '' });
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isNewDropdownOpen && !safeClosest(target, '.new-dropdown-container')) {
        setIsNewDropdownOpen(false);
      }
      if (isProfileOpen && !safeClosest(target, '.profile-container')) {
        setIsProfileOpen(false);
      }
      if (isSettingsOpen && !safeClosest(target, '.settings-container')) {
        setIsSettingsOpen(false);
      }
      if (showRoleDropdown && !safeClosest(target, '.role-dropdown-container')) {
        setShowRoleDropdown(false);
      }
      if (showJobDropdown && !safeClosest(target, '.job-dropdown-container')) {
        setShowJobDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNewDropdownOpen, isProfileOpen, isSettingsOpen, showJobDropdown]);

  React.useEffect(() => {
    if (showInviteModal || activeTab === 'send-invitation') {
      fetchJobs();
    }
  }, [showInviteModal, activeTab]);

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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/active`);
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
      alert('Please enter both name and email');
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

  const fetchRolePermissions = async (role: string) => {
    if (!role) {
      setAvailablePermissions([]);
      setSelectedPermissions({});
      return;
    }

    try {
      const response = await axios.get<{ permissions: any[] }>(`http://localhost:8000/api/superadmin/roles/${role}/permissions`);
      if (response.data && response.data.permissions) {
        setAvailablePermissions(response.data.permissions);
        // Set default permissions based on role defaults
        const defaultPermissions: { [key: string]: boolean } = {};
        response.data.permissions.forEach((perm: any) => {
          defaultPermissions[perm.name] = perm.has_permission;
        });
        setSelectedPermissions(defaultPermissions);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const handlePermissionToggle = (permissionName: string, granted: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionName]: granted
    }));
  };

  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailError('');
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email })
      });
      const data = await response.json();

      if (data.exists) {
        setEmailError('This email is already registered.');
      } else {
        setEmailError('');
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  const locationOptions = [
    'Mumbai, Maharashtra', 'Delhi, Delhi', 'Bangalore, Karnataka', 'Hyderabad, Telangana', 'Ahmedabad, Gujarat', 'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Surat, Gujarat', 'Pune, Maharashtra', 'Jaipur, Rajasthan',
    'Lucknow, Uttar Pradesh', 'Kanpur, Uttar Pradesh', 'Nagpur, Maharashtra', 'Indore, Madhya Pradesh', 'Thane, Maharashtra', 'Bhopal, Madhya Pradesh', 'Visakhapatnam, Andhra Pradesh', 'Pimpri-Chinchwad, Maharashtra', 'Patna, Bihar', 'Vadodara, Gujarat',
    'Ghaziabad, Uttar Pradesh', 'Ludhiana, Punjab', 'Agra, Uttar Pradesh', 'Nashik, Maharashtra', 'Faridabad, Haryana', 'Meerut, Uttar Pradesh', 'Rajkot, Gujarat', 'Kalyan-Dombivali, Maharashtra', 'Vasai-Virar, Maharashtra', 'Varanasi, Uttar Pradesh',
    'Srinagar, Jammu and Kashmir', 'Aurangabad, Maharashtra', 'Dhanbad, Jharkhand', 'Amritsar, Punjab', 'Navi Mumbai, Maharashtra', 'Allahabad, Uttar Pradesh', 'Ranchi, Jharkhand', 'Howrah, West Bengal', 'Coimbatore, Tamil Nadu', 'Jabalpur, Madhya Pradesh',
    'Gwalior, Madhya Pradesh', 'Vijayawada, Andhra Pradesh', 'Jodhpur, Rajasthan', 'Madurai, Tamil Nadu', 'Raipur, Chhattisgarh', 'Kota, Rajasthan', 'Chandigarh, Chandigarh', 'Guwahati, Assam', 'Solapur, Maharashtra', 'Hubli-Dharwad, Karnataka',
    'Mysore, Karnataka', 'Tiruchirappalli, Tamil Nadu', 'Bareilly, Uttar Pradesh', 'Aligarh, Uttar Pradesh', 'Tiruppur, Tamil Nadu', 'Moradabad, Uttar Pradesh', 'Jalandhar, Punjab', 'Bhubaneswar, Odisha', 'Salem, Tamil Nadu', 'Warangal, Telangana',
    'Mira-Bhayandar, Maharashtra', 'Thiruvananthapuram, Kerala', 'Bhiwandi, Maharashtra', 'Saharanpur, Uttar Pradesh', 'Guntur, Andhra Pradesh', 'Amravati, Maharashtra', 'Bikaner, Rajasthan', 'Noida, Uttar Pradesh', 'Jamshedpur, Jharkhand', 'Bhilai, Chhattisgarh',
    'Cuttack, Odisha', 'Firozabad, Uttar Pradesh', 'Kochi, Kerala', 'Nellore, Andhra Pradesh', 'Bhavnagar, Gujarat', 'Dehradun, Uttarakhand', 'Durgapur, West Bengal', 'Asansol, West Bengal', 'Rourkela, Odisha', 'Nanded, Maharashtra',
    'Kolhapur, Maharashtra', 'Ajmer, Rajasthan', 'Akola, Maharashtra', 'Gulbarga, Karnataka', 'Jamnagar, Gujarat', 'Ujjain, Madhya Pradesh', 'Loni, Uttar Pradesh', 'Siliguri, West Bengal', 'Jhansi, Uttar Pradesh', 'Ulhasnagar, Maharashtra',
    'Jammu, Jammu and Kashmir', 'Sangli-Miraj, Maharashtra', 'Mangalore, Karnataka', 'Erode, Tamil Nadu', 'Belgaum, Karnataka', 'Ambattur, Tamil Nadu', 'Tirunelveli, Tamil Nadu', 'Malegaon, Maharashtra', 'Gaya, Bihar', 'Jalgaon, Maharashtra',
    'Udaipur, Rajasthan', 'Maheshtala, West Bengal', 'Davanagere, Karnataka', 'Kozhikode, Kerala', 'Kurnool, Andhra Pradesh', 'Rajpur Sonarpur, West Bengal', 'Rajahmundry, Andhra Pradesh', 'Bokaro, Jharkhand', 'South Dumdum, West Bengal', 'Bellary, Karnataka',
    'Patiala, Punjab', 'Gopalpur, Odisha', 'Agartala, Tripura', 'Bhagalpur, Bihar', 'Muzaffarnagar, Uttar Pradesh', 'Bhatpara, West Bengal', 'Panihati, West Bengal', 'Latur, Maharashtra', 'Dhule, Maharashtra', 'Tirupati, Andhra Pradesh',
    'Rohtak, Haryana', 'Korba, Chhattisgarh', 'Bhilwara, Rajasthan', 'Berhampur, Odisha', 'Muzaffarpur, Bihar', 'Ahmednagar, Maharashtra', 'Mathura, Uttar Pradesh', 'Kollam, Kerala', 'Avadi, Tamil Nadu', 'Kadapa, Andhra Pradesh',
    'Kamarhati, West Bengal', 'Sambalpur, Odisha', 'Bilaspur, Chhattisgarh', 'Shahjahanpur, Uttar Pradesh', 'Satara, Maharashtra', 'Bijapur, Karnataka', 'Rampur, Uttar Pradesh', 'Shivamogga, Karnataka', 'Chandrapur, Maharashtra', 'Junagadh, Gujarat',
    'Thrissur, Kerala', 'Alwar, Rajasthan', 'Bardhaman, West Bengal', 'Kulti, West Bengal', 'Kakinada, Andhra Pradesh', 'Nizamabad, Telangana', 'Parbhani, Maharashtra', 'Tumkur, Karnataka', 'Khammam, Telangana', 'Ozhukarai, Puducherry',
    'Bihar Sharif, Bihar', 'Panipat, Haryana', 'Darbhanga, Bihar', 'Bally, West Bengal', 'Aizawl, Mizoram', 'Dewas, Madhya Pradesh', 'Ichalkaranji, Maharashtra', 'Karnal, Haryana', 'Bathinda, Punjab', 'Jalna, Maharashtra',
    'Eluru, Andhra Pradesh', 'Kirari Suleman Nagar, Delhi', 'Barasat, West Bengal', 'Purnia, Bihar', 'Satna, Madhya Pradesh', 'Mau, Uttar Pradesh', 'Sonipat, Haryana', 'Farrukhabad, Uttar Pradesh', 'Sagar, Madhya Pradesh',
    'Durg, Chhattisgarh', 'Imphal, Manipur', 'Ratlam, Madhya Pradesh', 'Hapur, Uttar Pradesh', 'Arrah, Bihar', 'Karimnagar, Telangana', 'Anantapur, Andhra Pradesh', 'Etawah, Uttar Pradesh', 'Ambernath, Maharashtra', 'North Dumdum, West Bengal',
    'Bharatpur, Rajasthan', 'Begusarai, Bihar', 'New Delhi, Delhi', 'Gandhidham, Gujarat', 'Baranagar, West Bengal', 'Tiruvottiyur, Tamil Nadu', 'Puducherry, Puducherry', 'Sikar, Rajasthan', 'Thoothukudi, Tamil Nadu',
    'Nagercoil, Tamil Nadu', 'Thanjavur, Tamil Nadu', 'Murwara, Madhya Pradesh', 'Naihati, West Bengal', 'Sambhal, Uttar Pradesh', 'Nadiad, Gujarat', 'Yamunanagar, Haryana', 'English Bazar, West Bengal', 'Unnao, Uttar Pradesh', 'Raiganj, West Bengal'
  ];


  useEffect(() => {
    const initializeDashboard = async () => {
      setIsInitialLoading(true);

      fetchStats();
      fetchPendingApprovals();
      fetchUsers();
      fetchPolicies();
      fetchAccounts();
      fetchActiveJobs();

      setIsInitialLoading(false);
    };

    initializeDashboard();
  }, []);

  // Add effect to refetch data when dashboard date range changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [dashboardDateRange]);

  // Add effect to refetch data when approvals date range changes
  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingApprovals();
      if (approvalTab === 'approved') {
        fetchApprovedJobs();
      } else if (approvalTab === 'declined') {
        fetchRejectedJobs();
      }
      if (approvalFilter === 'all') {
        fetchApprovedJobs();
        fetchRejectedJobs();
      }
    }
  }, [approvalsDateRange]);

  useEffect(() => {
    if (activeTab === 'approvals') {
      console.log('🔍 Approvals tab active, current approvalTab:', approvalTab);
      // Always fetch all data to support the "All" filter
      fetchPendingApprovals();
      if (approvalTab === 'approved') {
        console.log('📋 Fetching approved jobs...');
        fetchApprovedJobs();
      } else if (approvalTab === 'declined') {
        console.log('📋 Fetching rejected jobs...');
        fetchRejectedJobs();
      }
      // Fetch all data when "All" filter might be used
      if (approvalFilter === 'all') {
        fetchApprovedJobs();
        fetchRejectedJobs();
      }
    } else if (activeTab === 'settings-audit-logs') {
      // Load audit logs when the audit logs tab is opened
      const loadAuditLogs = async () => {
        try {
          const [logsRes, settingsRes] = await Promise.all([
            axios.get<{ logs: any[] }>(`http://localhost:8000/api/superadmin/audit-logs?page=${auditPage}`),
            axios.get<{ retention_days: number; auto_purge_enabled: boolean }>('http://localhost:8000/api/superadmin/audit-settings')
          ]);
          setAuditLogs(logsRes.data.logs);
          setAuditSettings(settingsRes.data);
        } catch (error) {
          console.error('Error fetching audit logs:', error);
        }
      };
      loadAuditLogs();
    }
  }, [activeTab, approvalTab, approvalFilter, auditPage]);

  const fetchStats = async () => {
    try {
      let url = 'http://localhost:8000/api/superadmin/stats';
      if (dashboardDateRange.start && dashboardDateRange.end) {
        url += `?startDate=${dashboardDateRange.start}&endDate=${dashboardDateRange.end}`;
      }
      const response = await axios.get<typeof stats>(url);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      let url = 'http://localhost:8000/api/superadmin/pending-approvals';
      if (approvalsDateRange.start && approvalsDateRange.end) {
        url += `?startDate=${approvalsDateRange.start}&endDate=${approvalsDateRange.end}`;
      }
      const response = await axios.get<any[]>(url);
      setPendingApprovals(response.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const fetchApprovedJobs = async () => {
    try {
      let url = 'http://localhost:8000/api/superadmin/approved-jobs';
      if (approvalsDateRange.start && approvalsDateRange.end) {
        url += `?startDate=${approvalsDateRange.start}&endDate=${approvalsDateRange.end}`;
      }
      const response = await axios.get<any[]>(url);
      // Sort by approved_at descending - latest first
      const sortedJobs = response.data.sort((a, b) => {
        const dateA = new Date(a.approved_at).getTime();
        const dateB = new Date(b.approved_at).getTime();
        return dateB - dateA;
      });
      setApprovedJobs(sortedJobs);
    } catch (error) {
      console.error('Error fetching approved jobs:', error);
    }
  };

  const fetchRejectedJobs = async () => {
    try {
      console.log('🔄 Fetching rejected jobs from API...');
      let url = 'http://localhost:8000/api/superadmin/rejected-jobs';
      if (approvalsDateRange.start && approvalsDateRange.end) {
        url += `?startDate=${approvalsDateRange.start}&endDate=${approvalsDateRange.end}`;
      }
      const response = await axios.get<any[]>(url);
      console.log('✅ Rejected jobs response:', response.data);
      // Sort by approved_at (rejection date) descending - latest first
      const sortedJobs = response.data.sort((a, b) => {
        const dateA = new Date(a.approved_at).getTime();
        const dateB = new Date(b.approved_at).getTime();
        return dateB - dateA;
      });
      setRejectedJobs(sortedJobs);
    } catch (error) {
      console.error('❌ Error fetching rejected jobs:', error);
    }
  };

  const fetchAllApprovals = async () => {
    try {
      console.log('🔄 Fetching all approvals from API...');
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        axios.get<any[]>('http://localhost:8000/api/superadmin/pending-approvals'),
        axios.get<any[]>('http://localhost:8000/api/superadmin/approved-jobs'),
        axios.get<any[]>('http://localhost:8000/api/superadmin/rejected-jobs')
      ]);

      console.log('✅ All approvals responses:', {
        pending: pendingRes.data.length,
        approved: approvedRes.data.length,
        rejected: rejectedRes.data.length
      });

      const pending = pendingRes.data.map(job => ({ ...job, status: 'pending', priority: 1 }));
      const approved = approvedRes.data.map(job => ({ ...job, status: 'approved', priority: 2 }));
      const rejected = rejectedRes.data.map(job => ({ ...job, status: 'rejected', priority: 3 }));

      const combined = [...pending, ...approved, ...rejected];

      // Sort by priority first, then by date (latest first within each priority)
      const sorted = combined.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        const dateA = new Date(a.created_at || a.approved_at).getTime();
        const dateB = new Date(b.created_at || b.approved_at).getTime();
        return dateB - dateA;
      });

      console.log('✅ All approvals sorted:', sorted.length, 'total jobs');
      setAllApprovals(sorted);
    } catch (error) {
      console.error('❌ Error fetching all approvals:', error);
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

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get<{ [key: string]: { name: string, uploadedAt: string } | null }>('http://localhost:8000/api/superadmin/policies');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
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

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin');
    navigate('/login');
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`http://localhost:8000/api/superadmin/users/${selectedUser.id}`, selectedUser);
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleApprove = async (id: number, approvalType: string = 'job') => {
    try {
      if (approvalType === 'candidate_restriction') {
        await axios.post(`http://localhost:8000/api/superadmin/approve-candidate-restriction/${id}`);
      } else {
        await axios.post(`http://localhost:8000/api/superadmin/approve-job/${id}`);
      }

      fetchPendingApprovals();
      fetchStats();
      if (approvalTab === 'all') {
        fetchAllApprovals();
      }
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleReject = async (id: number, approvalType: string = 'job') => {
    if (approvalType === 'candidate_restriction') {
      // Direct rejection for candidate restrictions without reason modal
      try {
        const response = await axios.post(`http://localhost:8000/api/superadmin/reject-candidate-restriction/${id}`);

        if (response.status === 200) {
          fetchPendingApprovals();
          fetchStats();
          if (approvalTab === 'all') {
            fetchAllApprovals();
          }
        }
      } catch (error) {
        console.error('Error rejecting candidate restriction:', error);
        alert('Failed to reject. Please try again.');
      }
    } else {
      // Show modal for job rejections
      const item = pendingApprovals.find(j => j.id === id) || allApprovals.find(j => j.id === id);
      setJobToReject({ ...item, approval_type: approvalType });
      setShowRejectModal(true);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a reason for rejection');
      return;
    }

    try {
      setSubmittingRejection(true);

      if (jobToReject.approval_type === 'candidate_restriction') {
        const response = await axios.post(`http://localhost:8000/api/superadmin/reject-candidate-restriction/${jobToReject.id}`, {
          reason: rejectionReason
        });

        if (response.status === 200) {
          fetchPendingApprovals();
          fetchStats();
          if (approvalTab === 'all') {
            fetchAllApprovals();
          }
          setShowRejectModal(false);
          setJobToReject(null);
          setRejectionReason('');
        }
      } else {
        const response = await axios.post(`http://localhost:8000/api/superadmin/reject-job/${jobToReject.id}`, {
          reason: rejectionReason
        });

        if (response.status === 200) {
          fetchPendingApprovals();
          fetchStats();
          if (approvalTab === 'all') {
            fetchAllApprovals();
          }
          setShowRejectModal(false);
          setJobToReject(null);
          setRejectionReason('');
        }
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject. Please try again.');
    } finally {
      setSubmittingRejection(false);
    }
  };

  // Filter approvals based on selected filter and fetch all data when needed
  const getFilteredApprovals = () => {
    if (approvalTab === 'pending') {
      return filterApprovals(pendingApprovals);
    } else if (approvalTab === 'approved') {
      return filterApprovals([...approvedJobs, ...pendingApprovals.filter(item => item.status === 'approved')]);
    } else if (approvalTab === 'declined') {
      return filterApprovals(rejectedJobs);
    }
    return [];
  };

  // Get all approvals for the "All" filter
  const getAllApprovalsForFilter = () => {
    const pending = pendingApprovals.map(job => ({ ...job, status: 'pending', priority: 1 }));
    const approved = approvedJobs.map(job => ({ ...job, status: 'approved', priority: 2 }));
    const rejected = rejectedJobs.map(job => ({ ...job, status: 'rejected', priority: 3 }));

    const combined = [...pending, ...approved, ...rejected];

    // Sort by priority first, then by date (latest first within each priority)
    return combined.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      const dateA = new Date(a.created_at || a.approved_at).getTime();
      const dateB = new Date(b.created_at || b.approved_at).getTime();
      return dateB - dateA;
    });
  };

  // Filter approvals based on selected filter
  const filterApprovals = (approvals: any[]) => {
    if (approvalFilter === 'all') {
      // When "All" filter is selected, show all types of approvals from all tabs
      return getAllApprovalsForFilter().filter(item => {
        if (approvalTab === 'pending') return item.status === 'pending';
        if (approvalTab === 'approved') return item.status === 'approved';
        if (approvalTab === 'declined') return item.status === 'rejected';
        return true;
      });
    }
    if (approvalFilter === 'jobs') return approvals.filter(item => item.approval_type === 'job' || !item.approval_type);
    if (approvalFilter === 'candidates') return approvals.filter(item => item.approval_type === 'candidate_restriction');
    return approvals;
  };

  const handlePolicyUpload = async (policyType: string, file: File) => {
    setUploadingPolicy(policyType);
    try {
      const formData = new FormData();
      formData.append('policy', file);
      formData.append('type', policyType);

      await axios.post('http://localhost:8000/api/superadmin/upload-policy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPolicies(prev => ({
        ...prev,
        [policyType]: {
          name: file.name,
          uploadedAt: new Date().toLocaleDateString()
        }
      }));
      setSuccessMessage({
        title: 'Success!',
        message: 'Policy uploaded successfully'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error uploading policy:', error);
      setErrorMessage({
        title: 'Error',
        message: 'Failed to upload policy'
      });
      setShowErrorModal(true);
    } finally {
      setUploadingPolicy(null);
    }
  };

  const triggerFileUpload = (policyType: string) => {
    fileInputRefs.current[policyType]?.click();
  };

  const handleFileChange = (policyType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'text/plain'];
      if (validTypes.includes(file.type)) {
        handlePolicyUpload(policyType, file);
      } else {
        alert('Please upload only PDF or text files.');
      }
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      setErrorMessage({
        title: 'Missing Fields',
        message: 'Please fill in all required fields'
      });
      setShowErrorModal(true);
      return;
    }

    if (emailError) {
      setErrorMessage({
        title: 'Email Error',
        message: 'Please use a different email address'
      });
      setShowErrorModal(true);
      return;
    }

    setCreatingUser(true);
    try {
      const response = await axios.post('http://localhost:8000/api/superadmin/create-user', {
        ...newUser,
        customPermissions: Object.entries(selectedPermissions).map(([name, granted]) => ({ name, granted }))
      });
      setNewUser({ name: '', email: '', phone: '', role: '' });
      setEmailError('');
      setAvailablePermissions([]);
      setSelectedPermissions({});
      fetchUsers();
      setSuccessMessage({
        title: 'User Created & Invited!',
        message: `User created successfully! An email invitation has been sent to ${newUser.email}.`
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMsg = error.response?.data?.error || 'Error creating user';
      setErrorMessage({
        title: 'Error',
        message: errorMsg
      });
      setShowErrorModal(true);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleEditAccount = async (account: any) => {
    setSelectedAccount({
      ...account,
      locations: account.locations ? [account.locations] : []
    });
    setSelectedUserIds(account.assignedUsers?.map((u: any) => u.id) || []);
    await fetchUsers();
    setAvailableUsers(users);
    setLocationSearch('');
    setShowLocationDropdown(false);
    setShowEditAccountModal(true);
  };

  const handleDeleteAccount = (account: any) => {
    setAccountToDelete(account);
    setDeleteConfirmText('');
    setShowDeleteAccountModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/superadmin/accounts/${accountToDelete.id}`);
      setShowDeleteAccountModal(false);
      setAccountToDelete(null);
      fetchAccounts();
      setSuccessMessage({
        title: 'Success!',
        message: 'Account set to inactive successfully'
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      const errorMsg = error.response?.data?.error || 'Error deleting account';
      setShowDeleteAccountModal(false);
      setAccountToDelete(null);
      setErrorMessage({
        title: 'Error',
        message: errorMsg
      });
      setShowErrorModal(true);
    }
  };

  const handleUpdateAccount = async () => {
    try {
      await axios.put(`http://localhost:8000/api/superadmin/accounts/${selectedAccount.id}`, {
        name: selectedAccount.name,
        status: selectedAccount.status,
        locations: selectedAccount.locations && selectedAccount.locations.length > 0 ? selectedAccount.locations[0] : null,
        assignedUsers: selectedUserIds
      });
      setShowEditAccountModal(false);
      fetchAccounts();
      setSuccessMessage({
        title: 'Success!',
        message: 'Account updated successfully'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating account:', error);
      setErrorMessage({
        title: 'Error',
        message: 'Error updating account'
      });
      setShowErrorModal(true);
    }
  };

  const toggleUserAssignment = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleDeleteUser = async (user: any) => {
    try {
      const response = await axios.get<{ hasAccounts: boolean, accounts: any[] }>(`http://localhost:8000/api/superadmin/users/${user.id}/accounts`);
      if (response.data.hasAccounts) {
        setUserToDelete(user);
        setUserAccounts(response.data.accounts);
        setShowDeleteUserModal(true);
      } else {
        setUserToDeleteSimple(user);
        setShowDeleteUserConfirmModal(true);
      }
    } catch (error) {
      console.error('Error checking user accounts:', error);
      setErrorMessage({
        title: 'Error',
        message: 'Error deleting user'
      });
      setShowErrorModal(true);
    }
  };

  const handleTransferAndDelete = async () => {
    setDeletingUser(true);
    try {
      if (transferTargetUserId) {
        await axios.post(`http://localhost:8000/api/superadmin/users/${userToDelete.id}/transfer-accounts`, {
          targetUserId: parseInt(transferTargetUserId)
        });
      } else {
        await axios.post(`http://localhost:8000/api/superadmin/users/${userToDelete.id}/transfer-accounts`, {
          targetUserId: admin.id
        });
      }
      await axios.delete(`http://localhost:8000/api/superadmin/users/${userToDelete.id}`);
      setShowDeleteUserModal(false);
      setUserToDelete(null);
      setUserAccounts([]);
      setTransferTargetUserId('');
      fetchUsers();
      setSuccessMessage({
        title: 'Success!',
        message: transferTargetUserId
          ? 'User deleted and accounts transferred successfully'
          : 'User deleted and accounts assigned to SuperAdmin successfully'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage({
        title: 'Error',
        message: 'Error deleting user'
      });
      setShowErrorModal(true);
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {isInitialLoading ? (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <Loader themeState="light" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          {activeTab === 'dashboard' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Super Admin Dashboard</h1>
                    <p className="text-gray-600">Welcome back {admin.name || 'Super Admin'}!</p>
                  </div>
                  <DateFilterDropdown onDateRangeChange={(start, end) => setDashboardDateRange({ start, end })} />
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <SuperAdminDashboardView onTabChange={setActiveTab} dashboardDateRange={dashboardDateRange} />
              </div>
            </div>
          )}

          {
            activeTab === 'create-candidate' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <h1 className="text-3xl font-semibold text-gray-900">Create Candidate</h1>
                  <p className="text-gray-600">Choose how you want to add candidates to the system</p>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Send Invite Container */}
                    <div
                      onClick={() => setActiveTab('send-invitation')}
                      className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                          <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Send Invite</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Send personalized invitations to candidates via email. Include job details and application links.
                        </p>
                        <div className="mt-6">
                          <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium group-hover:bg-blue-700 transition-colors">
                            Invite
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bulk Import Container */}
                    <div
                      onClick={() => setActiveTab('bulk-import')}
                      className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                          <Upload className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Bulk Import</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Import multiple candidates at once using CSV or Excel files. Perfect for large-scale recruitment.
                        </p>
                        <div className="mt-6">
                          <span className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium group-hover:bg-green-700 transition-colors">
                            Import
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab === 'bulk-import' && (
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
            )
          }

          {
            activeTab === 'accounts' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-semibold text-gray-900">Client Companies</h1>
                      <p className="text-gray-600">Manage client companies and their dedicated hiring managers.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('create-account-page')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>Create New Company</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
                  <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
                    <div className="flex-1 overflow-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/6">Account Name</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/4">Assigned Users</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/8">Status</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/8">Active Jobs</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/6">Date Created</th>
                            <th className="py-4 px-4 w-1/6"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {accounts.map((account) => (
                            <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4 text-sm text-gray-900 font-medium w-1/6">{account.name}</td>
                              <td className="py-4 px-4 w-1/4">
                                {account.assignedUsers && account.assignedUsers.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {account.assignedUsers.map((user: any) => (
                                      <span key={user.id} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                        {user.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">No users assigned</span>
                                )}
                              </td>
                              <td className="py-4 px-4 w-1/8">
                                <span className={`px-3 py-1 rounded-md text-sm font-medium ${account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                  {account.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 w-1/8">{account.activeJobs}</td>
                              <td className="py-4 px-4 text-sm text-gray-600 w-1/6">{account.dateCreated}</td>
                              <td className="py-4 px-4 text-right w-1/6">
                                <div className="flex items-center justify-end space-x-3">
                                  <button
                                    onClick={() => handleEditAccount(account)}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAccount(account)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab === 'users' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h1 className="text-3xl font-semibold text-gray-900">Users</h1>
                      <p className="text-gray-600">Manage user accounts and their roles.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('create-user-page')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>Create New User</span>
                    </button>
                  </div>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search users by name, email or role..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value === '') fetchUsers();
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                      className="w-full max-w-md pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-hidden px-8 py-6">
                  <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
                    <div className="flex-1 overflow-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/5">
                              <div className="flex items-center space-x-1">
                                <span>Name</span>
                                <ArrowUpDown size={14} className="text-gray-400" />
                              </div>
                            </th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/4">Email</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/8">Role</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/6">Date Joined</th>
                            <th className="text-left py-4 px-4 text-sm font-medium text-gray-900 w-1/8">Status</th>
                            <th className="py-4 px-4 w-1/6"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4 text-sm text-gray-900 w-1/5">{user.name}</td>
                              <td className="py-4 px-4 text-sm text-gray-600 w-1/4">{user.email}</td>
                              <td className="py-4 px-4 text-sm text-gray-600 w-1/8">{user.role || 'Admin'}</td>
                              <td className="py-4 px-4 text-sm text-gray-600 w-1/6">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-4 w-1/8">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                              </td>
                              <td className="py-4 px-4 text-right w-1/6">
                                <div className="flex items-center justify-end space-x-3">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab === 'candidates' && (
              <div className="flex flex-col h-full">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <h1 className="text-3xl font-semibold text-gray-900">Manage Candidates</h1>
                  <p className="text-gray-600">View and manage all candidates across all accounts.</p>
                </div>
                <div className="flex-1 overflow-auto">
                  <CandidatesWrapper isSuperAdmin={true} />
                </div>
              </div>
            )
          }

          {
            activeTab === 'job-openings' && (
              <div className="flex flex-col h-full overflow-hidden">
                <JobOpeningsViewNew
                  hideHeader={true}
                  searchQuery={undefined}
                  showFilters={undefined}
                  jobTab={status || 'all'}
                  onJobTabChange={(tab) => navigate(`/superadmin-dashboard/jobs/${tab}`)}
                />
              </div>
            )
          }

          {/* Approvals moved to separate route */}
          {
            activeTab === 'approvals' && (
              <div className="flex flex-col h-full items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">Approvals have moved</h2>
                  <p className="text-gray-600 mt-2">Please use the sidebar to navigate to Approvals.</p>
                  <button
                    onClick={() => navigate('/superadmin/dashboard/approvals')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Go to Approvals
                  </button>
                </div>
              </div>
            )
          }

          {
            activeTab === 'settings-ai-policies' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <h1 className="text-3xl font-semibold text-gray-900">AI Policies</h1>
                  <p className="text-gray-600">Manage AI policy documents and configurations</p>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
                  <div className="space-y-4 h-full overflow-auto">
                    {/* Restrict Candidate Policy */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">Restrict Candidate Policy</h4>
                          {policies['restrict-candidate'] && (
                            <p className="text-sm text-gray-600 mt-1">
                              {policies['restrict-candidate'].name} - Uploaded on {policies['restrict-candidate'].uploadedAt}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => triggerFileUpload('restrict-candidate')}
                          disabled={uploadingPolicy === 'restrict-candidate'}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 disabled:opacity-50"
                        >
                          <Upload size={18} />
                          <span>{uploadingPolicy === 'restrict-candidate' ? 'Uploading...' : 'Upload'}</span>
                        </button>
                        <input
                          ref={el => { fileInputRefs.current['restrict-candidate'] = el; }}
                          type="file"
                          accept=".pdf,.txt"
                          onChange={(e) => handleFileChange('restrict-candidate', e)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* AI Interviewer Policy */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">AI Interviewer Policy</h4>
                          {policies['ai-interviewer'] && (
                            <p className="text-sm text-gray-600 mt-1">
                              {policies['ai-interviewer'].name} - Uploaded on {policies['ai-interviewer'].uploadedAt}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => triggerFileUpload('ai-interviewer')}
                          disabled={uploadingPolicy === 'ai-interviewer'}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 disabled:opacity-50"
                        >
                          <Upload size={18} />
                          <span>{uploadingPolicy === 'ai-interviewer' ? 'Uploading...' : 'Upload'}</span>
                        </button>
                        <input
                          ref={el => { fileInputRefs.current['ai-interviewer'] = el; }}
                          type="file"
                          accept=".pdf,.txt"
                          onChange={(e) => handleFileChange('ai-interviewer', e)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* AI Call Policy */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">AI Call Policy</h4>
                          {policies['ai-call'] && (
                            <p className="text-sm text-gray-600 mt-1">
                              {policies['ai-call'].name} - Uploaded on {policies['ai-call'].uploadedAt}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => triggerFileUpload('ai-call')}
                          disabled={uploadingPolicy === 'ai-call'}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 disabled:opacity-50"
                        >
                          <Upload size={18} />
                          <span>{uploadingPolicy === 'ai-call' ? 'Uploading...' : 'Upload'}</span>
                        </button>
                        <input
                          ref={el => { fileInputRefs.current['ai-call'] = el; }}
                          type="file"
                          accept=".pdf,.txt"
                          onChange={(e) => handleFileChange('ai-call', e)}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab === 'settings-audit-logs' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <h1 className="text-3xl font-semibold text-gray-900">Audit Logs</h1>
                  <p className="text-gray-600">View system activity and user actions</p>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 h-full overflow-auto">
                    {/* Search and Export */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="relative flex-1 mr-4">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Search logs..."
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await axios.get<{ logs: any[] }>('http://localhost:8000/api/superadmin/audit-logs/export');
                            const csv = response.data.logs.map((log: any) =>
                              `${log.created_at},${log.user_name},${log.action_type},${log.action_description}`
                            ).join('\n');
                            const blob = new Blob([`Timestamp,User,Action,Description\n${csv}`], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `audit-logs-${new Date().toISOString()}.csv`;
                            a.click();
                          } catch (error) {
                            console.error('Error exporting logs:', error);
                          }
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Download size={18} />
                        <span>Export</span>
                      </button>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Timestamp</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.filter(log =>
                            !auditSearch ||
                            log.user_name?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                            log.action_description?.toLowerCase().includes(auditSearch.toLowerCase())
                          ).slice(0, 10).map((log) => (
                            <tr key={log.id} className="border-t border-gray-200">
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900">{log.user_name || 'System'}</td>
                              <td className="py-3 px-4 text-sm">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {log.action_type}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{log.action_description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}



          {
            activeTab === 'profile-settings' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <h1 className="text-3xl font-semibold text-gray-900">Profile Settings</h1>
                  <p className="text-gray-600">Update your personal information</p>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 h-full overflow-auto">
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
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
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
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
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
                              onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter current password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                              type="password"
                              value={profileData.newPassword}
                              onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter new password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              value={profileData.confirmPassword}
                              onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
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
                              // Validation
                              if (!profileData.name || !profileData.email) {
                                setErrorMessage({
                                  title: 'Validation Error',
                                  message: 'Name and email are required'
                                });
                                setShowErrorModal(true);
                                return;
                              }

                              // Password validation
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
                                admin: {
                                  id: number;
                                  name: string;
                                  email: string;
                                  profile_picture: string | null;
                                };
                              }>('http://localhost:8000/api/superadmin/profile', {
                                id: admin.id,
                                name: profileData.name,
                                email: profileData.email,
                                currentPassword: profileData.currentPassword || undefined,
                                newPassword: profileData.newPassword || undefined,
                                profilePicture: profilePicture || undefined
                              });

                              // Update localStorage
                              const updatedAdmin = {
                                ...admin,
                                name: response.data.admin.name,
                                email: response.data.admin.email,
                                profile_picture: response.data.admin.profile_picture
                              };
                              localStorage.setItem('superadmin', JSON.stringify(updatedAdmin));

                              // Clear password fields
                              setProfileData({
                                ...profileData,
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });

                              // Show success modal
                              setSuccessMessage({
                                title: 'Success!',
                                message: 'Profile updated successfully'
                              });
                              setShowSuccessModal(true);

                              // Reload page after 1.5 seconds to reflect changes
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
            )
          }

          {
            activeTab === 'create-job' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <h1 className="text-3xl font-semibold text-gray-900">Create New Job</h1>
                  <p className="text-gray-600">Create and publish a new job opening</p>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
                  <JobCreationForm
                    onBack={() => setActiveTab('dashboard')}
                    isSuperAdmin={true}
                  />
                </div>
              </div>
            )
          }

          {
            activeTab === 'create-user-page' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <h1 className="text-3xl font-semibold text-gray-900">Create New User</h1>
                  <p className="text-gray-600">Add a new user to the system</p>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-6xl mx-auto">
                    <div className="flex gap-6">
                      {/* Left Container - Form Fields */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">User Details</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              onBlur={(e) => checkEmailExists(e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${emailError ? 'border-red-500' : 'border-gray-300'
                                }`}
                              placeholder="Enter email address"
                            />
                            {checkingEmail && <p className="text-xs text-blue-500 mt-1">Checking email...</p>}
                            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                            <input
                              type="text"
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="w-full">
                              <PhoneInput
                                value={newUser.phone}
                                onChange={(value) => setNewUser({ ...newUser, phone: value })}
                                className="w-full"
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  color: '#000000',
                                  height: '48px'
                                }}
                                themeState="light"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                            <div className="relative role-dropdown-container">
                              <button
                                type="button"
                                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between"
                              >
                                <span>{newUser.role || 'Select role'}</span>
                                <svg className={`w-5 h-5 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {showRoleDropdown && (
                                <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                  <div className="p-2">
                                    {['SuperAdmin', 'Admin', 'Recruiter', 'HR', 'Sales', 'Interviewer'].map(role => (
                                      <div
                                        key={role}
                                        onClick={() => {
                                          setNewUser({ ...newUser, role });
                                          setShowRoleDropdown(false);
                                          fetchRolePermissions(role);
                                        }}
                                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                      >
                                        {role}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Container - Permissions */}
                      {newUser.role && availablePermissions.length > 0 && (
                        <div className="flex-1 bg-blue-50 rounded-lg p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium text-blue-900">{newUser.role} Permissions</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  const defaults: { [key: string]: boolean } = {};
                                  availablePermissions.forEach(p => defaults[p.name] = p.has_permission);
                                  setSelectedPermissions(defaults);
                                }}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                              >
                                Standard
                              </button>
                              <button
                                onClick={() => {
                                  const readOnly: { [key: string]: boolean } = {};
                                  availablePermissions.forEach(p => readOnly[p.name] = p.name.startsWith('view_'));
                                  setSelectedPermissions(readOnly);
                                }}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded font-medium"
                              >
                                Read-Only
                              </button>
                            </div>
                          </div>
                          <div className="max-h-96 overflow-y-auto space-y-4">
                            {Object.entries(availablePermissions.reduce((acc: Record<string, any[]>, perm: any) => {
                              if (!acc[perm.category]) acc[perm.category] = [];
                              acc[perm.category].push(perm);
                              return acc;
                            }, {})).map(([category, permissions]) => (
                              <div key={category} className="bg-white rounded-lg p-4">
                                <h5 className="text-sm font-semibold text-gray-800 mb-3 capitalize">
                                  {category.replace('_', ' ')}
                                </h5>
                                <div className="space-y-2">
                                  {(permissions as any[]).map((perm: any) => (
                                    <div key={perm.name} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                      <div className="flex-1">
                                        <span className="font-medium text-gray-700">{perm.description}</span>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {perm.source === 'custom' ? 'Custom' : 'Role Default'}
                                        </div>
                                      </div>
                                      <input
                                        type="checkbox"
                                        checked={selectedPermissions[perm.name] || false}
                                        onChange={(e) => handlePermissionToggle(perm.name, e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <hr className="border-gray-200 my-6" />

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setNewUser({ name: '', email: '', phone: '', role: '' });
                          setEmailError('');
                          setAvailablePermissions([]);
                          setSelectedPermissions({});
                        }}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await handleCreateUser();
                          setActiveTab('users');
                        }}
                        disabled={creatingUser || !newUser.name || !newUser.email || !newUser.role}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <span>{creatingUser ? 'Creating...' : 'Create & Send Invite'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab === 'create-account-page' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                  <h1 className="text-3xl font-semibold text-gray-900">Create New Account</h1>
                  <p className="text-gray-600">Add a new client account to the system</p>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
                        <input
                          type="text"
                          value={newAccount.name}
                          onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter account name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={newAccount.status}
                          onChange={(e) => setNewAccount({ ...newAccount, status: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={newAccount.locations.length > 0 ? newAccount.locations[0] : locationSearch}
                            onChange={(e) => {
                              setLocationSearch(e.target.value);
                              setShowLocationDropdown(e.target.value.length > 0);
                              if (e.target.value === '') {
                                setNewAccount({ ...newAccount, locations: [] });
                              }
                            }}
                            onFocus={() => {
                              setNewAccount({ ...newAccount, locations: [] });
                              setShowLocationDropdown(true);
                            }}
                            onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search location..."
                          />
                          {showLocationDropdown && locationSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {locationOptions
                                .filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                                .map((location) => (
                                  <div
                                    key={location}
                                    onClick={() => {
                                      setNewAccount({ ...newAccount, locations: [location] });
                                      setLocationSearch('');
                                      setShowLocationDropdown(false);
                                    }}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                  >
                                    {location}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign Users</label>
                        <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                          {users.map((user) => (
                            <div key={user.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 px-2 rounded">
                              <input
                                type="checkbox"
                                checked={newAccount.assignedUsers.includes(user.id)}
                                onChange={() => {
                                  setNewAccount(prev => ({
                                    ...prev,
                                    assignedUsers: prev.assignedUsers.includes(user.id)
                                      ? prev.assignedUsers.filter(id => id !== user.id)
                                      : [...prev.assignedUsers, user.id]
                                  }));
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email} - {user.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={() => {
                            setActiveTab('dashboard');
                            setNewAccount({ name: '', status: 'Active', locations: [], assignedUsers: [admin?.id].filter(Boolean) as number[] });
                          }}
                          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (!newAccount.name) {
                              setErrorMessage({
                                title: 'Missing Field',
                                message: 'Please enter account name'
                              });
                              setShowErrorModal(true);
                              return;
                            }
                            setCreatingAccount(true);
                            try {
                              await axios.post('http://localhost:8000/api/superadmin/accounts', {
                                ...newAccount,
                                locations: newAccount.locations.length > 0 ? newAccount.locations[0] : null
                              });
                              setNewAccount({ name: '', status: 'Active', locations: [], assignedUsers: [admin?.id].filter(Boolean) as number[] });
                              fetchAccounts();
                              setSuccessMessage({
                                title: 'Success!',
                                message: 'Client Company created successfully'
                              });
                              setShowSuccessModal(true);
                              setActiveTab('accounts');
                            } catch (error) {
                              console.error('Error creating account:', error);
                              setErrorMessage({
                                title: 'Error',
                                message: 'Error creating account'
                              });
                              setShowErrorModal(true);
                            } finally {
                              setCreatingAccount(false);
                            }
                          }}
                          disabled={creatingAccount || !newAccount.name}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {creatingAccount ? 'Creating...' : 'Create Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {
            activeTab === 'send-invitation' && (
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
                              <span className="text-left">
                                {selectedJobId ?
                                  jobs.find(job => job.job_id.toString() === selectedJobId)?.job_title + ' - ' +
                                  (Array.isArray(jobs.find(job => job.job_id.toString() === selectedJobId)?.locations) ?
                                    jobs.find(job => job.job_id.toString() === selectedJobId)?.locations.join(', ') :
                                    jobs.find(job => job.job_id.toString() === selectedJobId)?.locations)
                                  : 'Select a job opening'
                                }
                              </span>
                              <svg className={`w-5 h-5 transition-transform ${showJobDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {showJobDropdown && (
                              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                <div className="p-2">
                                  <div
                                    onClick={() => {
                                      setSelectedJobId('');
                                      setShowJobDropdown(false);
                                    }}
                                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                  >
                                    Select a job opening
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
            )
          }




          {/* Edit User Modal */}
          {
            showEditModal && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Edit User</h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={selectedUser.name}
                        onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={selectedUser.email}
                        onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Admin">Admin</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>

                    <button
                      onClick={handleUpdateUser}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Update User
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Edit Account Modal */}
          {
            showEditAccountModal && selectedAccount && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Edit Account</h2>
                    <button
                      onClick={() => setShowEditAccountModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                      <input
                        type="text"
                        value={selectedAccount.name}
                        onChange={(e) => setSelectedAccount({ ...selectedAccount, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedAccount.status}
                        onChange={(e) => setSelectedAccount({ ...selectedAccount, status: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedAccount.locations && selectedAccount.locations.length > 0 ? selectedAccount.locations[0] : locationSearch}
                          onChange={(e) => {
                            setLocationSearch(e.target.value);
                            setShowLocationDropdown(e.target.value.length > 0);
                            if (e.target.value === '') {
                              setSelectedAccount({ ...selectedAccount, locations: [] });
                            }
                          }}
                          onFocus={() => {
                            setSelectedAccount({ ...selectedAccount, locations: [] });
                            setShowLocationDropdown(true);
                          }}
                          onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search location..."
                        />
                        {showLocationDropdown && locationSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {locationOptions
                              .filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                              .map((location) => (
                                <div
                                  key={location}
                                  onClick={() => {
                                    setSelectedAccount({ ...selectedAccount, locations: [location] });
                                    setLocationSearch('');
                                    setShowLocationDropdown(false);
                                  }}
                                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                >
                                  {location}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assign Users</label>
                      <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 px-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => toggleUserAssignment(user.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email} - {user.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateAccount}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Update Account
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Delete User Confirmation Modal */}
          {
            showDeleteUserConfirmModal && userToDeleteSimple && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Delete User</h2>
                    <button
                      onClick={() => {
                        setShowDeleteUserConfirmModal(false);
                        setUserToDeleteSimple(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-4">
                      Are you sure you want to delete <strong>{userToDeleteSimple.name}</strong>?
                    </p>
                    <p className="text-sm text-red-600">
                      This action cannot be undone.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteUserConfirmModal(false);
                        setUserToDeleteSimple(null);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await axios.delete(`http://localhost:8000/api/superadmin/users/${userToDeleteSimple.id}`);
                          setShowDeleteUserConfirmModal(false);
                          setUserToDeleteSimple(null);
                          fetchUsers();
                          setSuccessMessage({
                            title: 'Success!',
                            message: 'User deleted successfully'
                          });
                          setShowSuccessModal(true);
                        } catch (error) {
                          console.error('Error deleting user:', error);
                          setErrorMessage({
                            title: 'Error',
                            message: 'Error deleting user'
                          });
                          setShowErrorModal(true);
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Delete User with Transfer Modal */}
          {
            showDeleteUserModal && userToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Delete User</h2>
                    <button
                      onClick={() => {
                        setShowDeleteUserModal(false);
                        setUserToDelete(null);
                        setUserAccounts([]);
                        setTransferTargetUserId('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>{userToDelete.name}</strong> has {userAccounts.length} assigned account(s):
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
                      {userAccounts.map((account) => (
                        <li key={account.account_id}>{account.account_name}</li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-700 mb-2">
                      Select a user to transfer these accounts to:
                    </p>
                    {!transferTargetUserId && (
                      <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        ⚠️ If no user is selected, accounts will be assigned to SuperAdmin
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transfer to User (Optional)</label>
                      <select
                        value={transferTargetUserId}
                        onChange={(e) => setTransferTargetUserId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select user (or assign to SuperAdmin)</option>
                        {users.filter(u => u.id !== userToDelete.id).map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email}) - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleTransferAndDelete}
                      disabled={deletingUser}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingUser
                        ? 'Deleting...'
                        : transferTargetUserId
                          ? 'Transfer Accounts & Delete User'
                          : 'Delete User (Assign to SuperAdmin)'
                      }
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Delete Account Confirmation Modal */}
          {
            showDeleteAccountModal && accountToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Delete Account</h2>
                    <button
                      onClick={() => {
                        setShowDeleteAccountModal(false);
                        setAccountToDelete(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-4">
                      Are you sure you want to delete <strong>{accountToDelete.name}</strong>?
                    </p>
                    <p className="text-sm text-red-600 mb-4">
                      This action cannot be undone.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type <span className="font-bold text-red-600">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteAccountModal(false);
                        setAccountToDelete(null);
                        setDeleteConfirmText('');
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE'}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${deleteConfirmText === 'DELETE'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Create New Account Modal */}
          {
            showCreateAccountModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Create New Account</h2>
                    <button
                      onClick={() => {
                        setShowCreateAccountModal(false);
                        setNewAccount({ name: '', status: 'Active', locations: [], assignedUsers: [] });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
                      <input
                        type="text"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter account name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={newAccount.status}
                        onChange={(e) => setNewAccount({ ...newAccount, status: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newAccount.locations.length > 0 ? newAccount.locations[0] : locationSearch}
                          onChange={(e) => {
                            setLocationSearch(e.target.value);
                            setShowLocationDropdown(e.target.value.length > 0);
                            if (e.target.value === '') {
                              setNewAccount({ ...newAccount, locations: [] });
                            }
                          }}
                          onFocus={() => {
                            setNewAccount({ ...newAccount, locations: [] });
                            setShowLocationDropdown(true);
                          }}
                          onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search location..."
                        />
                        {showLocationDropdown && locationSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {locationOptions
                              .filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                              .map((location) => (
                                <div
                                  key={location}
                                  onClick={() => {
                                    setNewAccount({ ...newAccount, locations: [location] });
                                    setLocationSearch('');
                                    setShowLocationDropdown(false);
                                  }}
                                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                >
                                  {location}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assign Users</label>
                      <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 px-2 rounded">
                            <input
                              type="checkbox"
                              checked={newAccount.assignedUsers.includes(user.id)}
                              onChange={() => {
                                setNewAccount(prev => ({
                                  ...prev,
                                  assignedUsers: prev.assignedUsers.includes(user.id)
                                    ? prev.assignedUsers.filter(id => id !== user.id)
                                    : [...prev.assignedUsers, user.id]
                                }));
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email} - {user.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (!newAccount.name) {
                          setErrorMessage({
                            title: 'Missing Field',
                            message: 'Please enter account name'
                          });
                          setShowErrorModal(true);
                          return;
                        }
                        setCreatingAccount(true);
                        try {
                          await axios.post('http://localhost:8000/api/superadmin/accounts', {
                            ...newAccount,
                            locations: newAccount.locations.length > 0 ? newAccount.locations[0] : null
                          });
                          setShowCreateAccountModal(false);
                          setNewAccount({ name: '', status: 'Active', locations: [], assignedUsers: [] });
                          fetchAccounts();
                          setSuccessMessage({
                            title: 'Success!',
                            message: 'Account created successfully'
                          });
                          setShowSuccessModal(true);
                        } catch (error) {
                          console.error('Error creating account:', error);
                          setErrorMessage({
                            title: 'Error',
                            message: 'Error creating account'
                          });
                          setShowErrorModal(true);
                        } finally {
                          setCreatingAccount(false);
                        }
                      }}
                      disabled={creatingAccount || !newAccount.name}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingAccount ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Create New User Modal */}
          {
            showCreateUserModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Create New User</h2>
                    <button
                      onClick={() => setShowCreateUserModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select role</option>
                        <option value="Admin">Admin</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>



                    <button
                      onClick={handleCreateUser}
                      disabled={creatingUser || !newUser.name || !newUser.email || !newUser.role}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingUser ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Purge Logs Confirmation Modal */}
          {
            showPurgeConfirmModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Purge Audit Logs</h2>
                    <button
                      onClick={() => setShowPurgeConfirmModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-4">
                      Are you sure you want to purge all logs older than <strong>{auditSettings.retention_days} days</strong>?
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                      This action cannot be undone.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPurgeConfirmModal(false)}
                      disabled={isPurging}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        setIsPurging(true);
                        try {
                          const response = await axios.delete<{ message: string; deleted: number }>(`http://localhost:8000/api/superadmin/audit-logs/purge?days=${auditSettings.retention_days}`);

                          // Refresh the logs after purging
                          const logsRes = await axios.get<{ logs: any[] }>(`http://localhost:8000/api/superadmin/audit-logs?page=${auditPage}`);
                          setAuditLogs(logsRes.data.logs);

                          setShowPurgeConfirmModal(false);
                          setSuccessMessage({
                            title: 'Success!',
                            message: `Successfully purged ${response.data.deleted || 0} old log entries`
                          });
                          setShowSuccessModal(true);
                        } catch (error: any) {
                          console.error('Error purging logs:', error);
                          setShowPurgeConfirmModal(false);
                          setErrorMessage({
                            title: 'Error',
                            message: error.response?.data?.error || 'Failed to purge logs'
                          });
                          setShowErrorModal(true);
                        } finally {
                          setIsPurging(false);
                        }
                      }}
                      disabled={isPurging}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPurging ? 'Purging...' : 'Purge Logs'}
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {
            (activeTab === 'new-dashboard' || activeTab === 'job-dashboard') && (
              <NewDashboardContainer
                onBack={() => navigate('/superadmin-dashboard/jobs')}
                isSidebarExpanded={true}
              />
            )
          }

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

          {/* Invitation Modal */}
          {
            showInviteModal && ReactDOM.createPortal(
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
            )
          }

          {/* Job Rejection Modal */}
          {
            showRejectModal && jobToReject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Reject Job Opening</h2>
                    <button
                      onClick={() => {
                        setShowRejectModal(false);
                        setJobToReject(null);
                        setRejectionReason('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Rejecting: <strong>{jobToReject.title}</strong>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejecting this job opening..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <button
                      onClick={handleRejectSubmit}
                      disabled={submittingRejection || !rejectionReason.trim()}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingRejection ? 'Rejecting...' : 'Reject Job Opening'}
                    </button>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
};

export default SuperAdminDefaultView;
