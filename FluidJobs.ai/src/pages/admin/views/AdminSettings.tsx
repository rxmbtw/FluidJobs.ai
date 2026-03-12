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
    const canManageUsers = ['Admin'].includes(userRole);

    if (!canManageUsers) {
        return null; // Should be handled by route guard, but extra safety
    }

    return (
        <div className="flex flex-col flex-1 overflow-hidden h-full">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account settings and users</p>
            </div>

            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <AdminUserManagement isCompanyDashboard={true} />
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
