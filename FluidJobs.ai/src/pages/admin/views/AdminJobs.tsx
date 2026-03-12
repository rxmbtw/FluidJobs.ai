import React, { useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import JobOpeningsViewNew from '../../../components/admin/JobOpeningsView_new';

interface AdminDashboardContextType {
    jobSearchQuery: string;
    showJobFilters: boolean;
    jobTab: string;
    setJobTab: (tab: string) => void;
}

const AdminJobs: React.FC = () => {
    const { status } = useParams<{ status?: string }>();
    const navigate = useNavigate();
    const {
        jobSearchQuery,
        showJobFilters,
        jobTab,
        setJobTab
    } = useOutletContext<AdminDashboardContextType>();

    useEffect(() => {
        if (status) {
            // Map URL status to internal tab names if they differ
            // Assuming "All jobs" in URL maps to 'all' tab, etc.
            // The user requested: /All jobs, /published, /Unpublished, /pending, /Closed

            let tabToSet = 'all';
            const decodedStatus = decodeURIComponent(status).toLowerCase();

            switch (decodedStatus) {
                case 'all jobs':
                case 'all':
                case 'all-jobs':
                    tabToSet = 'all';
                    break;
                case 'published':
                case 'active':
                    tabToSet = 'published';
                    break;
                case 'unpublished':
                case 'draft':
                    tabToSet = 'unpublished';
                    break;
                case 'pending':
                    tabToSet = 'pending';
                    break;
                case 'closed':
                    tabToSet = 'closed';
                    break;
                default:
                    tabToSet = 'all';
            }

            if (jobTab !== tabToSet) {
                setJobTab(tabToSet);
            }
        } else {
            // No status param, default to all if not already set? Or keep current?
            // Usually /jobs means all
            if (jobTab !== 'all') {
                setJobTab('all');
            }
        }
    }, [status, setJobTab, jobTab]);

    const handleTabChange = (newTab: string) => {
        setJobTab(newTab);

        let urlStatus = 'all-jobs';
        switch (newTab) {
            case 'all':
                urlStatus = 'all-jobs';
                break;
            case 'published':
            case 'active':
                urlStatus = 'published';
                break;
            case 'unpublished':
            case 'draft':
                urlStatus = 'unpublished';
                break;
            case 'pending':
                urlStatus = 'pending';
                break;
            case 'closed':
                urlStatus = 'closed';
                break;
            default:
                urlStatus = 'all-jobs';
        }

        navigate(`jobs/${urlStatus}`);
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">
                <JobOpeningsViewNew
                    hideHeader={true}
                    searchQuery={jobSearchQuery}
                    showFilters={showJobFilters}
                    jobTab={jobTab}
                    onJobTabChange={handleTabChange}
                />
            </div>
        </div>
    );
};

export default AdminJobs;
