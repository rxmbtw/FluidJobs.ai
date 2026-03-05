import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const SuperAdminBreadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Map path segments to readable names
    const routeNameMap: { [key: string]: string } = {
        'superadmin-dashboard': 'Home',
        'overview': 'Dashboard',
        'jobs': 'Jobs',
        'create-job': 'Create Job',
        'candidates': 'Candidates',
        'create-candidate': 'Create Candidate',
        'send-invitation': 'Send Invitation',
        'bulk-import': 'Bulk Import',
        'accounts': 'Accounts',
        'approvals': 'Approvals',
        'users': 'User Management',
        'settings': 'Settings',
        'policies': 'AI Policies',
        'audit-logs': 'Audit Logs',
        'profile-settings': 'Profile Settings',
        'create-user': 'Create User',
        'create-account': 'Create Account',
        'job-dashboard': 'Job Dashboard',
        'job-settings': 'Job Settings',
        'invite': 'Send Invitation',
        'import': 'Bulk Import',
        'published': 'Published',
        'unpublished': 'Unpublished',
        'pending': 'Pending',
        'closed': 'Closed',
        'all-jobs': 'All Jobs',
        'approved': 'Approved',
        'declined': 'Declined',
        'hiring-pipeline': 'Hiring Pipeline',
        'interview-analytics': 'Interview Analytics',
        'executive-summary': 'Executive Summary',
        'candidate-tracker': 'Candidate Tracker',

    };

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex items-center text-sm text-gray-500 mb-6 bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm" aria-label="Breadcrumb">
            <div className="flex items-center hover:text-blue-600 transition-colors">
                <Home size={16} className="mr-1" />
                <span className="sr-only">Home</span>
            </div>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                let displayName = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
                let isHidden = false;

                // Handle dynamic segments (IDs)
                if (index > 0) {
                    const prevSegment = pathnames[index - 1];
                    if (prevSegment === 'candidates' && /^\d+$/.test(value)) {
                        displayName = 'Candidate Profile';
                    } else if (prevSegment === 'jobs' && /^\d+$/.test(value)) {
                        displayName = 'Job Details';
                    } else if (value === 'job-dashboard') {
                        isHidden = true;
                    } else if (prevSegment === 'job-dashboard') {
                        // Value might be ID (123) or ID-Slug (123-job-title)
                        // Try to extract title part
                        const match = value.match(/^\d+-(.+)$/);
                        if (match) {
                            // Capitalize words
                            displayName = match[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        } else {
                            // Only ID
                            displayName = `#${value}`;
                        }
                        isHidden = false;
                    }
                }

                if (isHidden) return null;

                return (
                    <React.Fragment key={to}>
                        <ChevronRight size={16} className="mx-2 text-gray-400" />
                        {last ? (
                            <span className="font-medium text-gray-900" aria-current="page">
                                {displayName}
                            </span>
                        ) : (
                            <Link to={to} className="hover:text-blue-600 transition-colors">
                                {displayName}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default SuperAdminBreadcrumbs;
