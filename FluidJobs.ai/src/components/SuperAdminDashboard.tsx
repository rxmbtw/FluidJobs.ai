import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, UserCheck, Settings, LogOut, Search, X, Check, Moon, Plus, ChevronLeft, ChevronRight, ArrowUpDown, Briefcase, Filter, Upload } from 'lucide-react';
import ManageCandidatesWrapper from './ManageCandidatesWrapper';
import JobOpeningsViewNew from './JobOpeningsView_new';

const SuperAdminDashboard: React.FC = () => {
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
  const [users, setUsers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [approvalTab, setApprovalTab] = useState('pending');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [uploadingPolicy, setUploadingPolicy] = useState<string | null>(null);
  const [policies, setPolicies] = useState<{[key: string]: {name: string, uploadedAt: string} | null}>({
    'restrict-candidate': null,
    'ai-interviewer': null,
    'ai-call': null
  });
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<any>(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [transferTargetUserId, setTransferTargetUserId] = useState('');
  const [deletingUser, setDeletingUser] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', status: 'Active', locations: [] as string[], assignedUsers: [] as number[] });
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

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
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem('superadmin') || '{}');

  useEffect(() => {
    fetchStats();
    fetchPendingApprovals();
    fetchUsers();
    fetchPolicies();
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'approvals') {
      if (approvalTab === 'approved') {
        fetchApprovedJobs();
      } else if (approvalTab === 'declined') {
        fetchRejectedJobs();
      }
    }
  }, [activeTab, approvalTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get<typeof stats>('http://localhost:8000/api/superadmin/stats');
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

  const fetchApprovedJobs = async () => {
    try {
      const response = await axios.get<any[]>('http://localhost:8000/api/superadmin/approved-jobs');
      setApprovedJobs(response.data);
    } catch (error) {
      console.error('Error fetching approved jobs:', error);
    }
  };

  const fetchRejectedJobs = async () => {
    try {
      const response = await axios.get<any[]>('http://localhost:8000/api/superadmin/rejected-jobs');
      setRejectedJobs(response.data);
    } catch (error) {
      console.error('Error fetching rejected jobs:', error);
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

  const fetchPolicies = async () => {
    try {
      const response = await axios.get<{[key: string]: {name: string, uploadedAt: string} | null}>('http://localhost:8000/api/superadmin/policies');
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
    } catch (error) {
      console.error('Error uploading policy:', error);
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
      alert('Please fill in all required fields');
      return;
    }
    
    setCreatingUser(true);
    try {
      const response = await axios.post('http://localhost:8000/api/superadmin/create-user', newUser);
      alert(`User created successfully! Temporary password: ${(response.data as any).tempPassword}`);
      setShowCreateUserModal(false);
      setNewUser({ name: '', email: '', role: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.error || 'Error creating user';
      alert(errorMessage);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleEditAccount = async (account: any) => {
    setSelectedAccount({
      ...account,
      locations: account.locations ? account.locations.split(', ') : []
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
    setShowDeleteAccountModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/superadmin/accounts/${accountToDelete.id}`);
      setShowDeleteAccountModal(false);
      setAccountToDelete(null);
      fetchAccounts();
      alert('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    }
  };

  const handleUpdateAccount = async () => {
    try {
      await axios.put(`http://localhost:8000/api/superadmin/accounts/${selectedAccount.id}`, {
        name: selectedAccount.name,
        status: selectedAccount.status,
        locations: selectedAccount.locations ? selectedAccount.locations.join(', ') : null,
        assignedUsers: selectedUserIds
      });
      setShowEditAccountModal(false);
      fetchAccounts();
      alert('Account updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Error updating account');
    }
  };

  const toggleUserAssignment = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleDeleteUser = async (user: any) => {
    try {
      const response = await axios.get<{hasAccounts: boolean, accounts: any[]}>(`http://localhost:8000/api/superadmin/users/${user.id}/accounts`);
      if (response.data.hasAccounts) {
        setUserToDelete(user);
        setUserAccounts(response.data.accounts);
        setShowDeleteUserModal(true);
      } else {
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
          await axios.delete(`http://localhost:8000/api/superadmin/users/${user.id}`);
          fetchUsers();
          alert('User deleted successfully');
        }
      }
    } catch (error) {
      console.error('Error checking user accounts:', error);
      alert('Error deleting user');
    }
  };

  const handleTransferAndDelete = async () => {
    if (!transferTargetUserId) {
      alert('Please select a user to transfer accounts to');
      return;
    }
    
    setDeletingUser(true);
    try {
      await axios.post(`http://localhost:8000/api/superadmin/users/${userToDelete.id}/transfer-accounts`, {
        targetUserId: parseInt(transferTargetUserId)
      });
      await axios.delete(`http://localhost:8000/api/superadmin/users/${userToDelete.id}`);
      setShowDeleteUserModal(false);
      setUserToDelete(null);
      setUserAccounts([]);
      setTransferTargetUserId('');
      fetchUsers();
      alert('User deleted and accounts transferred successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    } finally {
      setDeletingUser(false);
    }
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
            {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{accounts.length}</span>}
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
            {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{pendingApprovals.length}</span>}
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
                <button 
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create New User
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6 mb-8">
            <div 
              onClick={() => setActiveTab('approvals')}
              className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <p className="text-gray-600 text-sm mb-2">Pending Approvals</p>
              <p className="text-4xl font-bold text-gray-900">{stats.total_pending_approvals}</p>
            </div>

            <div 
              onClick={() => setActiveTab('job-openings')}
              className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <p className="text-gray-600 text-sm mb-2">Total Active Jobs</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.active_jobs}</p>
              {stats.jobs_change !== 0 && (
                <p className={`text-sm ${stats.jobs_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.jobs_change > 0 ? '↑' : '↓'} {stats.jobs_change > 0 ? '+' : ''}{stats.jobs_change}
                </p>
              )}
            </div>

            <div 
              onClick={() => setActiveTab('candidates')}
              className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <p className="text-gray-600 text-sm mb-2">Active Candidates</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.active_candidates}</p>
              {stats.candidates_change !== 0 && (
                <p className={`text-sm ${stats.candidates_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.candidates_change > 0 ? '↑' : '↓'} {stats.candidates_change > 0 ? '+' : ''}{stats.candidates_change}
                </p>
              )}
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
              <button 
                onClick={() => setActiveTab('approvals')}
                className="text-gray-600 text-sm hover:text-gray-900"
              >
                Show more
              </button>
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
            </>
          )}

          {activeTab === 'accounts' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
                  <p className="text-gray-600">Manage client accounts and their dedicated hiring managers.</p>
                </div>
                <button 
                  onClick={() => setShowCreateAccountModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Create New Account</span>
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Account Name</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Assigned Users</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Status</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Active Jobs</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-gray-900">Date Created</th>
                      <th className="py-4 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900 font-medium">{account.name}</td>
                        <td className="py-4 px-4">
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
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                            account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {account.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">{account.activeJobs}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{account.dateCreated}</td>
                        <td className="py-4 px-4 text-right">
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
                <button 
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
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
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{user.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{user.role || 'Admin'}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">Active</span>
                        </td>
                        <td className="py-4 px-4 text-right">
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

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">Showing 1 to {users.length} of {users.length} results</p>
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
                  <div className="space-y-6">
                    {/* Job Creation Approvals */}
                    {pendingApprovals.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                        <div className="space-y-4">
                          {pendingApprovals.map((job) => (
                            <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-xl font-semibold text-gray-900">{job.title}</h4>
                                    {job.is_republish ? (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                        Re-publish Request
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                                        New Job
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Job Type:</span>
                                      <span className="text-sm text-gray-900">{job.job_type || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Location:</span>
                                      <span className="text-sm text-gray-900">{job.location || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Salary Range:</span>
                                      <span className="text-sm text-gray-900">{formatSalary(job.salary_range)}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Posted By:</span>
                                      <span className="text-sm text-gray-900">{job.created_by_name || 'Unknown'}</span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-500">Posted on: {new Date(job.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => handleReject(job.id)}
                                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleApprove(job.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                  >
                                    Approve
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <p>No pending approvals</p>
                      </div>
                    )}
                  </div>
                )}
                {approvalTab === 'approved' && (
                  <div className="space-y-6">
                    {/* Approved Jobs */}
                    {approvedJobs.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approved Jobs</h3>
                        <div className="space-y-4">
                          {approvedJobs.map((job) => (
                            <div key={job.id} className="bg-white border border-green-200 rounded-lg p-6 shadow-sm">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-xl font-semibold text-gray-900">{job.title}</h4>
                                    <span className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium">Approved</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Job Type:</span>
                                      <span className="text-sm text-gray-900">{job.job_type || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Location:</span>
                                      <span className="text-sm text-gray-900">{job.location || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Salary Range:</span>
                                      <span className="text-sm text-gray-900">{formatSalary(job.salary_range)}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Posted By:</span>
                                      <span className="text-sm text-gray-900">{job.created_by_name || 'Unknown'}</span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-500">Approved on: {new Date(job.approved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <p>No approved items</p>
                      </div>
                    )}
                  </div>
                )}
                {approvalTab === 'declined' && (
                  <div className="space-y-6">
                    {/* Rejected Jobs */}
                    {rejectedJobs.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejected Jobs</h3>
                        <div className="space-y-4">
                          {rejectedJobs.map((job) => (
                            <div key={job.id} className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h4 className="text-xl font-semibold text-gray-900">{job.title}</h4>
                                    <span className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium">Rejected</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Job Type:</span>
                                      <span className="text-sm text-gray-900">{job.job_type || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Location:</span>
                                      <span className="text-sm text-gray-900">{job.location || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Salary Range:</span>
                                      <span className="text-sm text-gray-900">{formatSalary(job.salary_range)}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Posted By:</span>
                                      <span className="text-sm text-gray-900">{job.created_by_name || 'Unknown'}</span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-500">Rejected on: {new Date(job.approved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <p>No declined items</p>
                      </div>
                    )}
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
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Restrict Candidate Policy</h2>
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
                      <span>{uploadingPolicy === 'restrict-candidate' ? 'Uploading...' : 'Upload Policy'}</span>
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
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">AI Interviewer Policy</h2>
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
                      <span>{uploadingPolicy === 'ai-interviewer' ? 'Uploading...' : 'Upload Policy'}</span>
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
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">AI Call Policy</h2>
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
                      <span>{uploadingPolicy === 'ai-call' ? 'Uploading...' : 'Upload Policy'}</span>
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
            </>
          )}

          {activeTab === 'settings' && (
            <>
              
            </>
          )}
        </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
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
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
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
      )}

      {/* Edit Account Modal */}
      {showEditAccountModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Account</h2>
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
                  onChange={(e) => setSelectedAccount({...selectedAccount, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedAccount.status}
                  onChange={(e) => setSelectedAccount({...selectedAccount, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setShowLocationDropdown(e.target.value.length > 0);
                    }}
                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search locations..."
                  />
                  {showLocationDropdown && locationSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {locationOptions
                        .filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                        .map((location) => (
                          <div
                            key={location}
                            onClick={() => {
                              const currentLocations = selectedAccount.locations || [];
                              if (!currentLocations.includes(location)) {
                                setSelectedAccount({...selectedAccount, locations: [...currentLocations, location]});
                              }
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
                {selectedAccount.locations && selectedAccount.locations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedAccount.locations.map((loc: string) => (
                      <span key={loc} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex items-center gap-1">
                        {loc}
                        <button
                          onClick={() => setSelectedAccount({...selectedAccount, locations: selectedAccount.locations.filter((l: string) => l !== loc)})}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
      )}

      {/* Delete User with Transfer Modal */}
      {showDeleteUserModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Delete User</h2>
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
              <p className="text-sm text-gray-700">
                Please select a user to transfer these accounts to:
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transfer to User *</label>
                <select
                  value={transferTargetUserId}
                  onChange={(e) => setTransferTargetUserId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select user</option>
                  {users.filter(u => u.id !== userToDelete.id).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleTransferAndDelete}
                disabled={deletingUser || !transferTargetUserId}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingUser ? 'Deleting...' : 'Transfer Accounts & Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && accountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Delete Account</h2>
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
              <p className="text-sm text-red-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setAccountToDelete(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Account Modal */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Account</h2>
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
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newAccount.status}
                  onChange={(e) => setNewAccount({...newAccount, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setShowLocationDropdown(e.target.value.length > 0);
                    }}
                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search locations..."
                  />
                  {showLocationDropdown && locationSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {locationOptions
                        .filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                        .map((location) => (
                          <div
                            key={location}
                            onClick={() => {
                              if (!newAccount.locations.includes(location)) {
                                setNewAccount({...newAccount, locations: [...newAccount.locations, location]});
                              }
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
                {newAccount.locations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newAccount.locations.map((loc) => (
                      <span key={loc} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex items-center gap-1">
                        {loc}
                        <button
                          onClick={() => setNewAccount({...newAccount, locations: newAccount.locations.filter(l => l !== loc)})}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                    alert('Please enter account name');
                    return;
                  }
                  setCreatingAccount(true);
                  try {
                    await axios.post('http://localhost:8000/api/superadmin/accounts', {
                      ...newAccount,
                      locations: newAccount.locations.join(', ')
                    });
                    setShowCreateAccountModal(false);
                    setNewAccount({ name: '', status: 'Active', locations: [], assignedUsers: [] });
                    fetchAccounts();
                    alert('Account created successfully');
                  } catch (error) {
                    console.error('Error creating account:', error);
                    alert('Error creating account');
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
      )}

      {/* Create New User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
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
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
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
      )}
    </div>
  );
};

export default SuperAdminDashboard;
