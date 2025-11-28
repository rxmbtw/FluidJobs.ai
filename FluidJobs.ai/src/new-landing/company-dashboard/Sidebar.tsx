import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Eye, Users, Upload, LogOut, User, Mail, X, Globe } from 'lucide-react';
import { useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [userEmail, setUserEmail] = useState('ram@fluid.live');
  const [userName, setUserName] = useState('Shriram Surse');
  const [userRole, setUserRole] = useState('HR');

  // Get user data from sessionStorage
  React.useEffect(() => {
    const userStr = sessionStorage.getItem('fluidjobs_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserEmail(user.email || 'ram@fluid.live');
        setUserName(user.name || 'Shriram Surse');
        setUserRole(user.role || 'HR');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch jobs when modal opens
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

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isNewDropdownOpen && !target.closest('.new-dropdown-container')) {
        setIsNewDropdownOpen(false);
      }
      if (isProfileOpen && !target.closest('.profile-container')) {
        setIsProfileOpen(false);
      }
      if (isLogoutOpen && !target.closest('.profile-container')) {
        setIsLogoutOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNewDropdownOpen, isProfileOpen, isLogoutOpen]);

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteName) {
      alert('Please enter both name and email');
      return;
    }

    try {
      setSendingInvite(true);
      
      // Send platform invitation
      const inviteResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates/send-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName
        })
      });

      if (!inviteResponse.ok) {
        const error = await inviteResponse.json();
        alert(`Failed to send invitation: ${error.error || 'Unknown error'}`);
        return;
      }

      // If job is selected, send job notification as well
      if (selectedJobId) {
        const selectedJob = jobs.find(job => job.job_id.toString() === selectedJobId);
        if (selectedJob) {
          // TODO: Implement job notification endpoint when ready
          console.log('Job notification will be sent for:', selectedJob.job_title);
        }
      }

      const message = selectedJobId 
        ? `Invitation sent successfully to ${inviteName} with job notification!`
        : `Invitation sent successfully to ${inviteName}!`;
      
      alert(message);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setSelectedJobId('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  };

  const ChartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" opacity="0.4"/>
      <rect x="6.5" y="9.5" width="2" height="8.5" fill="currentColor"/>
      <rect x="11" y="6" width="2" height="12" fill="currentColor"/>
      <rect x="15.5" y="13" width="2" height="5" fill="currentColor"/>
    </svg>
  );

  const menuItems = [
    { id: 'view_opening', label: 'View Openings', icon: Globe },
    { id: 'manage_candidates', label: 'Manage Candidates', icon: Users },
    { id: 'my_accounts', label: 'My Accounts', icon: ChartIcon }
  ];

  const newMenuItems = [
    { id: 'create_job', label: 'Create Job', icon: Plus },
    { id: 'bulk_import', label: 'Bulk Import', icon: Upload },
    { id: 'send_invitation', label: 'Send Invitation', icon: Mail }
  ];

  return (
    <aside 
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className="hidden md:block sticky p-3 flex flex-col justify-between shadow-lg transition-all duration-300" 
      style={{ 
        width: isCollapsed ? '80px' : '297px', 
        top: '4rem', 
        height: 'calc(100vh - 4rem)', 
        backgroundColor: colors.bgSidebar, 
        borderRight: `1px solid ${colors.border}`, 
        overflow: 'hidden' 
      }}
    >
      <div className="flex flex-col h-full">
        {/* New Button with Dropdown */}
        <div className="relative mt-4 mb-2 new-dropdown-container">
          <button
            onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            style={{ border: `1px solid ${colors.border}` }}
          >
            <Plus className="w-5 h-5" style={{ color: colors.textPrimary }} />
            {!isCollapsed && <span className="font-semibold text-base" style={{ color: colors.textPrimary }}>New</span>}
          </button>

          {!isCollapsed && isNewDropdownOpen && (
            <div 
              className="absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl overflow-hidden z-20"
              style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
            >
              <nav className="p-2">
                {newMenuItems.map((item) => (
                  <a
                    key={item.id}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.id === 'send_invitation') {
                        setShowInviteModal(true);
                        setIsNewDropdownOpen(false);
                      } else {
                        onNavigate(item.id);
                        setIsNewDropdownOpen(false);
                      }
                    }}
                    className="flex items-center space-x-3 p-3 rounded-lg transition duration-150 hover:bg-opacity-10"
                    style={{ color: colors.textPrimary }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.activeItemBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => (
            <a 
              key={item.id}
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
              className="flex items-center space-x-3 p-3 transition duration-200" 
              style={{ 
                borderRadius: '40px', 
                backgroundColor: currentView === item.id ? colors.activeItemBg : 'transparent', 
                color: currentView === item.id ? colors.accent : colors.iconColor,
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              }}
              onMouseEnter={(e) => {
                if (currentView !== item.id) {
                  e.currentTarget.style.backgroundColor = colors.activeItemBg;
                  e.currentTarget.style.color = colors.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.iconColor;
                }
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="my-6 mx-3" style={{ borderTop: `1px solid ${colors.border}` }}></div>

        <div className="relative mb-4 profile-container">
          <div 
            className="p-3 flex items-center justify-between cursor-pointer hover:opacity-90 transition" 
            style={{ backgroundColor: colors.activeItemBg, borderRadius: '40px' }}
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsLogoutOpen(false);
            }}
          >
            {isCollapsed ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
                <User className="w-6 h-6" style={{ color: '#FFFFFF' }} />
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
                    <User className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                  <span className="font-semibold text-lg" style={{ color: colors.textPrimary }}>{userName}</span>
                </div>
                <button onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsLogoutOpen(!isLogoutOpen);
                  setIsProfileOpen(false);
                }} className="cursor-pointer hover:opacity-80 transition">
                  <LogOut className="w-6 h-6" style={{ color: '#EF4444' }} />
                </button>
              </>
            )}
          </div>

          {!isCollapsed && isProfileOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 rounded-2xl shadow-2xl overflow-hidden z-20" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
              <div className="p-6 space-y-3">
                <div>
                  <span className="font-semibold" style={{ color: colors.accent }}>User Role: </span>
                  <span style={{ color: colors.textPrimary }}>{userRole}</span>
                </div>
                <div>
                  <span className="font-semibold" style={{ color: colors.accent }}>Email: </span>
                  <span style={{ color: colors.textPrimary }}>{userEmail}</span>
                </div>
                <div>
                  <span className="font-semibold" style={{ color: colors.accent }}>Total Accounts: </span>
                  <span style={{ color: colors.textPrimary }}>04</span>
                </div>
                <div className="pt-3 border-t" style={{ borderColor: colors.border }}>
                  <span className="font-semibold" style={{ color: colors.textPrimary }}>Change Password</span>
                </div>
              </div>
            </div>
          )}

          {!isCollapsed && isLogoutOpen && (
            <div className="absolute bottom-full left-0 w-full mb-1 rounded-xl shadow-2xl overflow-hidden z-20" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
              <nav className="p-2">
                <a href="#" onClick={(e) => { e.preventDefault(); onLogout?.(); }} className="flex items-center space-x-3 p-3 rounded-lg transition duration-150" style={{ color: '#EF4444' }}>
                  <LogOut className="w-5 h-5" style={{ color: '#EF4444' }} />
                  <span className="font-semibold text-base">Logout</span>
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Invitation Modal - Rendered at body level using portal */}
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
            {/* Close Button */}
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Send Invitation</h2>
            </div>

            {/* Form */}
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
    </aside>
  );
};

export default Sidebar;
