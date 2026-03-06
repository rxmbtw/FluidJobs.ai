import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminDashboardView from '../../../components/dashboard/AdminDashboardView';
import { DateFilterDropdown } from '../../../components/DateFilterDropdown';

// Define the context type based on what AdminDashboard will provide
interface AdminDashboardContextType {
    handleTabChange: (tab: string) => void;
    handleAccountsUpdate: (accounts: any[]) => void;
    handleStatsUpdate: (stats: any) => void;
    dashboardDateRange: { start: string; end: string };
    setDashboardDateRange: (range: { start: string; end: string }) => void;
    admin: any;
}

const AdminOverview: React.FC = () => {
    const {
        handleTabChange,
        handleAccountsUpdate,
        handleStatsUpdate,
        dashboardDateRange,
        setDashboardDateRange,
        admin
    } = useOutletContext<AdminDashboardContextType>();

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">{admin.role || 'Admin'} Dashboard</h1>
                        <p className="text-gray-600">Welcome back {admin.name || 'Admin'}!</p>
                    </div>
                    <DateFilterDropdown onDateRangeChange={(start, end) => setDashboardDateRange({ start, end })} />
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <AdminDashboardView
                    onTabChange={handleTabChange}
                    onAccountsUpdate={handleAccountsUpdate}
                    onStatsUpdate={handleStatsUpdate}
                    dashboardDateRange={dashboardDateRange}
                />
            </div>
        </div>
    );
};

export default AdminOverview;
