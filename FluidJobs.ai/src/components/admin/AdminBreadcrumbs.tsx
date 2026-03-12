import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const AdminBreadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    // Get the base dashboard path from current location
    const getDashboardBasePath = () => {
        const path = location.pathname;
        if (path.includes('/hr-dashboard')) return '/hr-dashboard';
        if (path.includes('/sales-dashboard')) return '/sales-dashboard';
        if (path.includes('/recruiter-dashboard')) return '/recruiter-dashboard';
        if (path.includes('/interviewer-dashboard')) return '/interviewer-dashboard';
        return '/admin-dashboard'; // default
    };
    
    const dashboardBasePath = getDashboardBasePath();

    // Map path segments to readable names
    const routeNameMap: { [key: string]: string } = {
        'admin-dashboard': 'Home',
        'hr-dashboard': 'Home',
        'sales-dashboard': 'Home',
        'recruiter-dashboard': 'Home',
        'interviewer-dashboard': 'Home',
        'overview': 'Dashboard',
        'jobs': 'Jobs',
        'create-job': 'Create Job',
        'candidates': 'Candidates',
        'create-candidate': 'Create Candidate',
        'send-invitation': 'Send Invitation',
        'bulk-import': 'Bulk Import',
        'accounts': 'My Accounts',
        'settings': 'Settings',
        'profile-settings': 'Profile Settings',
        'create-user': 'Create User',
        'published': 'Published',
        'unpublished': 'Unpublished',
        'Unpublished': 'Unpublished',
        'pending': 'Pending',
        'closed': 'Closed',
        'Closed': 'Closed',
        'all-jobs': 'All Jobs',
        'All jobs': 'All Jobs'
    };

    // If we are on the main dashboard overview, typical pattern is Home > Dashboard
    // But since "Home" is admin-dashboard and "Dashboard" is overview, it works out.

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex items-center text-sm text-gray-500 mb-6 bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm" aria-label="Breadcrumb">
            <Link to={`${dashboardBasePath}/overview`} className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <Home size={16} className="mr-1" />
                <span className="sr-only">Home</span>
            </Link>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const name = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

                // Skip rendering "Home" text again if the first segment is a dashboard route
                if ((value === 'admin-dashboard' || value === 'hr-dashboard' || value === 'sales-dashboard' || 
                     value === 'recruiter-dashboard' || value === 'interviewer-dashboard') && index === 0) {
                    // We already rendered the Home icon. 
                    // If we want to show text "Home", we can. Use routeNameMap. 
                    // But existing design used Home icon.
                    return null;
                }

                return (
                    <React.Fragment key={to}>
                        <ChevronRight size={16} className="mx-2 text-gray-400" />
                        {last ? (
                            <span className="font-medium text-gray-900" aria-current="page">
                                {name}
                            </span>
                        ) : (
                            <Link to={to} className="hover:text-blue-600 transition-colors">
                                {name}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default AdminBreadcrumbs;
