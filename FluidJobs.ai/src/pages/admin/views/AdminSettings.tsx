import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminUserManagement from '../../../components/admin/AdminUserManagement';

interface AdminDashboardContextType {
    admin: any;
}

const AdminSettings: React.FC = () => {
    const { admin } = useOutletContext<AdminDashboardContextType>();

    // Role-based access control (re-derived from admin)
    const userRole = admin.role || 'User';
    const canCreateJobs = ['Admin', 'Recruiter', 'Sales'].includes(userRole);
    const canManageUsers = ['Admin'].includes(userRole);
    const canViewPermissions = ['HR', 'Interviewer', 'Sales', 'Recruiter'].includes(userRole);
    const canViewAccounts = ['Admin', 'Recruiter', 'HR', 'Sales', 'Interviewer'].includes(userRole);
    const canManageCandidates = ['Admin', 'HR', 'Recruiter'].includes(userRole);
    const canViewJobs = ['Admin', 'Recruiter', 'HR', 'Interviewer', 'Sales'].includes(userRole);
    const canSendInvites = ['Admin', 'HR', 'Recruiter'].includes(userRole);
    const canBulkImport = ['Admin', 'HR'].includes(userRole);

    if (!canManageUsers && !canViewPermissions) {
        return null; // Should be handled by route guard, but extra safety
    }

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account settings and users</p>
            </div>

            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="space-y-6">
                    {canManageUsers && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <AdminUserManagement isCompanyDashboard={true} />
                        </div>
                    )}

                    {canViewPermissions && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">My Permissions</h3>
                                <p className="text-gray-600">View your current role permissions</p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {admin.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{admin.name}</h4>
                                            <p className="text-sm text-blue-600 font-medium">{userRole}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Dashboard Permissions */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h5 className="font-medium text-gray-900 mb-3">Dashboard Access</h5>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700">View Dashboard</span>
                                                <span className="text-green-600">✓</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Permissions */}
                                    {(canViewJobs || canCreateJobs) && (
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <h5 className="font-medium text-gray-900 mb-3">Job Management</h5>
                                            <div className="space-y-2">
                                                {canViewJobs && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">View Jobs</span>
                                                        <span className="text-green-600">✓</span>
                                                    </div>
                                                )}
                                                {canCreateJobs && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">Create Jobs</span>
                                                        <span className="text-green-600">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Account Permissions */}
                                    {canViewAccounts && (
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <h5 className="font-medium text-gray-900 mb-3">Account Management</h5>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700">View Accounts</span>
                                                    <span className="text-green-600">✓</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Candidate Permissions */}
                                    {(canManageCandidates || canSendInvites || canBulkImport) && (
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <h5 className="font-medium text-gray-900 mb-3">Candidate Management</h5>
                                            <div className="space-y-2">
                                                {canManageCandidates && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">Manage Candidates</span>
                                                        <span className="text-green-600">✓</span>
                                                    </div>
                                                )}
                                                {canSendInvites && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">Send Invites</span>
                                                        <span className="text-green-600">✓</span>
                                                    </div>
                                                )}
                                                {canBulkImport && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">Bulk Import</span>
                                                        <span className="text-green-600">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* System Permissions */}
                                    {(canManageUsers || canViewPermissions) && (
                                        <div className="border border-gray-200 rounded-lg p-4 md:col-span-2">
                                            <h5 className="font-medium text-gray-900 mb-3">System Access</h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                {canManageUsers && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">User Management</span>
                                                        <span className="text-green-600">✓</span>
                                                    </div>
                                                )}
                                                {canViewPermissions && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">View Permissions</span>
                                                        <span className="text-green-600">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        <strong>Note:</strong> These permissions are assigned based on your role ({userRole}).
                                        Contact your administrator if you need additional access.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
