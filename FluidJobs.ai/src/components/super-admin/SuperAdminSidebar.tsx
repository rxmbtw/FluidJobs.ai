import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users, FileText, UserCheck, Settings, LogOut, Search, X, Check, Plus,
    ChevronLeft, ChevronRight, Briefcase, Upload, Mail, User, Building2, TrendingUp, Bot
} from 'lucide-react';

interface SuperAdminSidebarProps {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    adminName: string;
    adminEmail: string;
    stats: {
        pendingApprovals: number;
        activeAccounts: number;
        activeJobs: number;
    };
    onLogout: () => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
    isExpanded,
    setIsExpanded,
    adminName,
    adminEmail,
    stats,
    onLogout
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/superadmin-dashboard' && location.pathname === '/superadmin-dashboard') return true;
        if (path !== '/superadmin-dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navItemClass = (path: string) => `w-full flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${isActive(path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`;
    const navItemClassJustified = (path: string) => `w-full flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${isActive(path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`;

    return (
        <div
            className="fixed left-0 top-0 bottom-0 bg-white border-r-0 flex flex-col transition-all duration-300 z-40"
            style={{
                width: isExpanded ? '256px' : '80px',
                boxShadow: '1px 0 3px 0 rgba(0, 0, 0, 0.1), 1px 0 2px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo Header */}
            <div className="flex items-center px-4 py-4 border-b border-gray-200">
                <img
                    src="/images/FLuid Live Icon light theme.png"
                    alt="FluidJobs.ai Logo"
                    className="object-contain flex-shrink-0"
                    style={{ width: '2.5rem', height: '2.5rem' }}
                />
                {isExpanded && (
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
                        {isExpanded && <span className="text-sm font-semibold whitespace-nowrap">Create</span>}
                    </button>

                    {isExpanded && isNewDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-2xl overflow-hidden z-20 border border-gray-200">
                            <nav className="p-2">
                                <button
                                    onClick={() => {
                                        navigate('/superadmin-dashboard/create-job');
                                        setIsNewDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                                >
                                    <Briefcase size={18} />
                                    <span className="text-sm font-medium">Create Job</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/superadmin-dashboard/create-user');
                                        setIsNewDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                                >
                                    <UserCheck size={18} />
                                    <span className="text-sm font-medium">Create User</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/superadmin-dashboard/create-account');
                                        setIsNewDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                                >
                                    <Users size={18} />
                                    <span className="text-sm font-medium">Create Account</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/superadmin-dashboard/create-candidate');
                                        setIsNewDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                                >
                                    <User size={18} />
                                    <span className="text-sm font-medium">Create Candidate</span>
                                </button>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Separator line */}
                <div className="-mx-4 mb-3" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', paddingTop: '16px', boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)' }}></div>

                <button
                    onClick={() => navigate('/superadmin-dashboard')}
                    className={navItemClass('/superadmin-dashboard')}
                >
                    <FileText size={20} className="flex-shrink-0" />
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
                </button>

                <button
                    onClick={() => navigate('/superadmin-dashboard/approvals/pending')}
                    className={navItemClassJustified('/superadmin-dashboard/approvals')}
                >
                    <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                        <Check size={20} className="flex-shrink-0" />
                        {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Approvals</span>}
                    </div>
                    {isExpanded && stats.pendingApprovals > 0 && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{stats.pendingApprovals}</span>}
                </button>

                <button
                    onClick={() => navigate('/superadmin-dashboard/accounts')}
                    className={navItemClassJustified('/superadmin-dashboard/accounts')}
                >
                    <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                        <Building2 size={20} className="flex-shrink-0" />
                        {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Accounts</span>}
                    </div>
                    {isExpanded && stats.activeAccounts > 0 && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{stats.activeAccounts}</span>}
                </button>

                <button
                    onClick={() => navigate('/superadmin-dashboard/jobs/all-jobs')}
                    className={navItemClassJustified('/superadmin-dashboard/jobs')}
                >
                    <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                        <Briefcase size={20} className="flex-shrink-0" />
                        {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Jobs</span>}
                    </div>
                    {isExpanded && stats.activeJobs > 0 && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{stats.activeJobs}</span>}
                </button>

                <button
                    onClick={() => navigate('/superadmin-dashboard/candidates')}
                    className={navItemClass('/superadmin-dashboard/candidates')}
                >
                    <Users size={20} className="flex-shrink-0" />
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Candidates</span>}
                </button>

                <button
                    onClick={() => navigate('/superadmin-dashboard/recruiters')}
                    className={navItemClass('/superadmin-dashboard/recruiters')}
                >
                    <TrendingUp size={20} className="flex-shrink-0" />
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Recruiters</span>}
                </button>

                {/* AI Mentor */}
                <button
                    onClick={() => navigate('/superadmin-dashboard/ai-mentor')}
                    className={`w-full flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg mb-1 text-left transition-all ${isActive('/superadmin-dashboard/ai-mentor') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                    <Bot size={20} className="flex-shrink-0" />
                    {isExpanded && <span className="text-sm font-medium whitespace-nowrap">FluidJobs AI Mentor</span>}
                </button>
            </nav>

            {/* Settings Direct Navigation */}
            <div className="px-4 mb-4 settings-container" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', paddingTop: '16px', boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                <div className="relative">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`w-full flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-lg text-left transition-all ${location.pathname.includes('/settings') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Settings size={20} className="flex-shrink-0" />
                        {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
                    </button>

                    {isExpanded && isSettingsOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-20 border border-gray-200">
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        navigate('/superadmin-dashboard/settings/policies');
                                        setIsSettingsOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                                >
                                    <FileText size={18} />
                                    <span className="text-sm font-medium">AI Policies</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/superadmin-dashboard/settings/audit-logs');
                                        setIsSettingsOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                                >
                                    <FileText size={18} />
                                    <span className="text-sm font-medium">Audit Logs</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/superadmin-dashboard/users');
                                        setIsSettingsOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                                >
                                    <UserCheck size={18} />
                                    <span className="text-sm font-medium">User Management</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 overflow-visible relative profile-container" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                <div
                    className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} cursor-pointer hover:opacity-90 transition`}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                    {isExpanded ? (
                        <>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {adminName?.charAt(0) || 'D'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{adminName || 'Super Admin'}</p>
                                    <p className="text-xs text-blue-600">Super Admin</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLogout();
                                }}
                                className="text-red-500 hover:text-red-700"
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {adminName?.charAt(0) || 'D'}
                        </div>
                    )}
                </div>

                {isExpanded && isProfileOpen && (
                    <div className="absolute bottom-20 left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-20 border border-gray-200">
                        <div className="p-6 space-y-3">
                            <div>
                                <span className="font-semibold text-blue-600">Role: </span>
                                <span className="text-gray-900">Super Admin</span>
                            </div>
                            <div>
                                <span className="font-semibold text-blue-600">Email: </span>
                                <span className="text-gray-900">{adminEmail || 'admin@fluidjobs.ai'}</span>
                            </div>
                            <button
                                onClick={() => {
                                    navigate('/superadmin-dashboard/profile');
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
    );
};

export default SuperAdminSidebar;
