import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    const breadcrumbNameMap: { [key: string]: string } = {
        superadmin: 'Super Admin',
        dashboard: 'Dashboard',
        approvals: 'Approvals',
        accounts: 'Accounts',
        jobs: 'Jobs',
        candidates: 'Candidates',
        settings: 'Settings',
        overview: 'Overview',
        'job-dashboard': 'Job Dashboard',
    };

    const isGuuid = (str: string) => {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    }

    const isNumeric = (str: string) => {
        return /^\d+$/.test(str);
    }

    return (
        <nav className="flex items-center text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link to="/superadmin/dashboard" className="flex items-center hover:text-blue-600 transition-colors">
                <Home size={16} className="mr-1" />
                <span className="sr-only">Home</span>
            </Link>
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                let displayName = breadcrumbNameMap[value] || value;

                // Improve display for IDs
                if (isNumeric(value) || isGuuid(value)) {
                    displayName = `ID: ${value.substring(0, 8)}...`;
                }

                // Capitalize if not in map
                if (!breadcrumbNameMap[value] && !isNumeric(value) && !isGuuid(value)) {
                    displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
                }

                return (
                    <React.Fragment key={to}>
                        <ChevronRight size={16} className="mx-2 text-gray-400" />
                        {isLast ? (
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

export default Breadcrumbs;
