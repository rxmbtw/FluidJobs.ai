import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { DateFilterDropdown } from '../../../components/DateFilterDropdown';
import { Check, X, Eye, MapPin, Briefcase, DollarSign, Calendar, User, Building, Clock, AlertCircle, Edit3, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminApprovals: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const admin = JSON.parse(sessionStorage.getItem('fluidjobs_user') || '{}');
    const userId = admin.id;
    const userRole = admin.role || 'User';

    const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
    const [approvedJobs, setApprovedJobs] = useState<any[]>([]);
    const [rejectedJobs, setRejectedJobs] = useState<any[]>([]);
    const [allApprovals, setAllApprovals] = useState<any[]>([]);

    const { status } = useParams();
    const approvalTab = status || 'pending';

    const approvalFilter = searchParams.get('filter') || 'all';
    
    const setApprovalTab = (tab: string) => {
        navigate(`approvals/${tab}?filter=${approvalFilter}`);
    };

    const setApprovalFilter = (filter: string) => {
        setSearchParams({ filter });
    };

    const [approvalsDateRange, setApprovalsDateRange] = useState({ start: '', end: '' });
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [jobToReject, setJobToReject] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submittingRejection, setSubmittingRejection] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

    useEffect(() => {
        if (!searchParams.get('filter')) {
            setSearchParams({ filter: 'all' }, { replace: true });
        }
    }, []);

    useEffect(() => {
        if (approvalTab === 'all') {
            fetchAllApprovals();
        } else {
            fetchPendingApprovals();
            if (approvalTab === 'approved') {
                fetchApprovedJobs();
            } else if (approvalTab === 'declined') {
                fetchRejectedJobs();
            }
        }
    }, [approvalTab, approvalsDateRange]);

    // Filter to show only user's own submissions
    const filterByUser = (items: any[]) => {
        console.log('🔍 Filtering items for user:', userId, 'role:', userRole);
        console.log('📦 Items before filter:', items);
        
        if (userRole === 'SuperAdmin' || userRole === 'Admin') {
            console.log('✅ Admin/SuperAdmin - showing all items');
            return items; // Admin sees all
        }
        // Recruiter sees only their own submissions
        // Check both created_by_user_id (for jobs) and requested_by (for edit requests)
        const filtered = items.filter(item => {
            const matchesJob = item.created_by_user_id === userId;
            const matchesEditRequest = item.requested_by === userId;
            const matches = matchesJob || matchesEditRequest;
            console.log('Checking item:', item.id, 'type:', item.approval_type, 'created_by:', item.created_by_user_id, 'requested_by:', item.requested_by, 'matches:', matches);
            return matches;
        });
        console.log('📋 Filtered items:', filtered);
        return filtered;
    };

    const fetchPendingApprovals = async () => {
        try {
            let url = `${BACKEND_URL}/api/superadmin/pending-approvals`;
            if (approvalsDateRange.start && approvalsDateRange.end) {
                url += `?startDate=${approvalsDateRange.start}&endDate=${approvalsDateRange.end}`;
            }
            console.log('🔍 Fetching pending approvals from:', url);
            const response = await axios.get<any[]>(url);
            console.log('📥 Pending approvals response:', response.data.length, 'items');

            let mappedEdits: any[] = [];
            try {
                const editResponse = await axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=pending`);
                mappedEdits = editResponse.data.map(e => ({ 
                    ...e, 
                    approval_type: 'job_edit',
                    title: e.job_title || e.changes_json?.title || 'Job Edit Request',
                    created_by_user_id: e.requested_by // Map requested_by to created_by_user_id for consistency
                }));
                console.log('📝 Mapped pending edit requests:', mappedEdits.length);
            } catch (editError) {
                console.warn('Could not fetch pending edit requests:', editError);
            }

            const combined = [...response.data, ...mappedEdits].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            console.log('📦 Combined pending items before filter:', combined.length);
            const filtered = filterByUser(combined);
            console.log('✅ Filtered pending items:', filtered.length);
            setPendingApprovals(filtered);
        } catch (error) {
            console.error('Error fetching approvals:', error);
        }
    };

    const fetchApprovedJobs = async () => {
        try {
            let url = `${BACKEND_URL}/api/superadmin/approved-jobs`;
            if (approvalsDateRange.start && approvalsDateRange.end) {
                url += `?startDate=${approvalsDateRange.start}&endDate=${approvalsDateRange.end}`;
            }
            console.log('🔍 Fetching approved jobs from:', url);
            const response = await axios.get<any[]>(url);
            console.log('📥 Approved jobs response:', response.data.length, 'items');
            console.log('📋 First 3 approved jobs:', response.data.slice(0, 3).map(j => ({ id: j.id, created_by: j.created_by_user_id, title: j.title })));

            let mappedEdits: any[] = [];
            try {
                const editResponse = await axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=approved`);
                mappedEdits = editResponse.data.map(e => ({
                    ...e,
                    approval_type: 'job_edit',
                    title: e.job_title || e.changes_json?.title || 'Job Edit Request',
                    created_by_user_id: e.requested_by // Map requested_by to created_by_user_id for consistency
                }));
                console.log('📝 Mapped approved edit requests:', mappedEdits.length);
            } catch (editError) {
                console.warn('Could not fetch approved edit requests:', editError);
            }

            const combined = [...response.data, ...mappedEdits].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            console.log('📦 Combined approved items before filter:', combined.length);
            const filtered = filterByUser(combined);
            console.log('✅ Filtered approved items:', filtered.length);
            setApprovedJobs(filtered);
        } catch (error) {
            console.error('Error fetching approved jobs:', error);
        }
    };

    const fetchRejectedJobs = async () => {
        try {
            let url = `${BACKEND_URL}/api/superadmin/rejected-jobs`;
            if (approvalsDateRange.start && approvalsDateRange.end) {
                url += `?startDate=${approvalsDateRange.start}&endDate=${approvalsDateRange.end}`;
            }
            const response = await axios.get<any[]>(url);

            let mappedEdits: any[] = [];
            try {
                const editResponse = await axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=rejected`);
                mappedEdits = editResponse.data.map(e => ({
                    ...e,
                    approval_type: 'job_edit',
                    title: e.job_title || e.changes_json?.title || 'Job Edit Request',
                    created_by_user_id: e.requested_by // Map requested_by to created_by_user_id for consistency
                }));
                console.log('📝 Mapped rejected edit requests:', mappedEdits.length);
            } catch (editError) {
                console.warn('Could not fetch rejected edit requests:', editError);
            }

            const combined = [...response.data, ...mappedEdits].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            setRejectedJobs(filterByUser(combined));
        } catch (error) {
            console.error('Error fetching rejected jobs:', error);
        }
    };

    const fetchAllApprovals = async () => {
        try {
            const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/pending-approvals`),
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/approved-jobs`),
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/rejected-jobs`)
            ]);

            let editPendingData: any[] = [];
            let editApprovedData: any[] = [];
            let editRejectedData: any[] = [];

            try {
                const editPendingRes = await axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=pending`);
                editPendingData = (editPendingRes.data || []).map((e: any) => ({ 
                    ...e, 
                    approval_type: 'job_edit',
                    title: e.job_title || e.changes_json?.title || 'Job Edit Request',
                    created_by_user_id: e.requested_by
                }));
            } catch (e) {
                console.warn('Could not fetch pending edit requests');
            }

            try {
                const editApprovedRes = await axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=approved`);
                editApprovedData = (editApprovedRes.data || []).map((e: any) => ({ 
                    ...e, 
                    approval_type: 'job_edit',
                    title: e.job_title || e.changes_json?.title || 'Job Edit Request',
                    created_by_user_id: e.requested_by
                }));
            } catch (e) {
                console.warn('Could not fetch approved edit requests');
            }

            try {
                const editRejectedRes = await axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=rejected`);
                editRejectedData = (editRejectedRes.data || []).map((e: any) => ({ 
                    ...e, 
                    approval_type: 'job_edit',
                    title: e.job_title || e.changes_json?.title || 'Job Edit Request',
                    created_by_user_id: e.requested_by
                }));
            } catch (e) {
                console.warn('Could not fetch rejected edit requests');
            }

            const allItems = [
                ...(pendingRes.data || []),
                ...(approvedRes.data || []),
                ...(rejectedRes.data || []),
                ...editPendingData,
                ...editApprovedData,
                ...editRejectedData
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setAllApprovals(filterByUser(allItems));
        } catch (error) {
            console.error('Error fetching all approvals:', error);
        }
    };

    const getDisplayData = () => {
        let data: any[] = [];
        switch (approvalTab) {
            case 'pending': data = pendingApprovals; break;
            case 'approved': data = approvedJobs; break;
            case 'declined': data = rejectedJobs; break;
            default: data = pendingApprovals;
        }

        // Apply filter
        if (approvalFilter === 'all') {
            return data;
        } else if (approvalFilter === 'jobs') {
            return data.filter(item => !item.approval_type || item.approval_type !== 'job_edit');
        } else if (approvalFilter === 'edits') {
            return data.filter(item => item.approval_type === 'job_edit');
        } else if (approvalFilter === 'candidates') {
            return data.filter(item => item.approval_type === 'candidate_restriction');
        }
        return data;
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
            case 'approved':
            case 'published':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejected</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    const displayData = getDisplayData();

    // Helper functions
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

    const renderEditDiff = (original: any, changes: any) => {
        if (!changes) return <div className="text-sm text-gray-500 italic mt-3">No change details available.</div>;
        
        let parsedChanges = changes;
        if (typeof changes === 'string') {
            try { parsedChanges = JSON.parse(changes); } catch (e) { 
                return <div className="text-sm text-gray-500 italic mt-3">Unable to parse changes.</div>;
            }
        }

        if (!original) {
            return <div className="text-sm text-gray-500 italic mt-3">Original job data not available.</div>;
        }

        const diffs: { field: string, old: any, new: any }[] = [];

        const fieldMap: Record<string, string> = {
            title: 'title',
            domain: 'job_domain',
            type: 'job_type',
            description: 'description',
            modeOfJob: 'mode_of_job',
            minExperience: 'min_experience',
            maxExperience: 'max_experience',
            registrationOpeningDate: 'registration_opening_date',
            registrationClosingDate: 'registration_closing_date',
            numberOfOpenings: 'no_of_openings'
        };

        // Fields to skip
        const skipFields = ['interviewStages', 'requirements', 'hiringManager', 'recruiters', 'status', 'isPublished', 'location', 'primaryRecruiterId'];

        Object.keys(parsedChanges).forEach(key => {
            if (skipFields.includes(key)) return;

            let oldVal = null;
            let newVal = parsedChanges[key];

            // Handle salary object
            if (key === 'salary') {
                const oldMin = original.min_salary;
                const oldMax = original.max_salary;
                const newMin = newVal?.min;
                const newMax = newVal?.max;
                
                // Only show if salary actually changed (compare numbers)
                if (Number(oldMin) !== Number(newMin) || Number(oldMax) !== Number(newMax)) {
                    diffs.push({
                        field: 'Salary Range',
                        old: oldMin && oldMax ? `₹${(oldMin / 100000).toFixed(1)}L - ₹${(oldMax / 100000).toFixed(1)}L` : 'Not Set',
                        new: `₹${(newMin / 100000).toFixed(1)}L - ₹${(newMax / 100000).toFixed(1)}L`
                    });
                }
                return;
            }

            // Handle locations array
            if (key === 'locations') {
                const oldLocs = original.locations || [];
                const newLocs = Array.isArray(newVal) ? newVal : [];
                const oldLocsStr = Array.isArray(oldLocs) ? oldLocs.sort().join(', ') : String(oldLocs);
                const newLocsStr = newLocs.sort().join(', ');
                
                // Only show if locations changed
                if (oldLocsStr !== newLocsStr) {
                    diffs.push({ field: 'Locations', old: oldLocsStr || 'Not Set', new: newLocsStr });
                }
                return;
            }

            // Handle skills array
            if (key === 'skills') {
                const oldSkills = original.skills || [];
                const newSkills = Array.isArray(newVal) ? newVal : [];
                const oldSkillsStr = Array.isArray(oldSkills) ? oldSkills.sort().join(', ') : String(oldSkills);
                const newSkillsStr = newSkills.sort().join(', ');
                
                // Only show if skills changed
                if (oldSkillsStr !== newSkillsStr) {
                    diffs.push({ field: 'Skills', old: oldSkillsStr || 'Not Set', new: newSkillsStr });
                }
                return;
            }

            // Handle date fields - normalize to date only (ignore time)
            if (key === 'registrationOpeningDate' || key === 'registrationClosingDate') {
                const dbField = fieldMap[key];
                oldVal = original[dbField];
                
                // Normalize dates to YYYY-MM-DD format
                const oldDate = oldVal ? new Date(oldVal).toISOString().split('T')[0] : '';
                const newDate = newVal ? new Date(newVal).toISOString().split('T')[0] : '';
                
                // Only show if dates actually changed
                if (oldDate !== newDate) {
                    const fieldLabel = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .trim();
                    diffs.push({ 
                        field: fieldLabel, 
                        old: oldDate || 'Not Set', 
                        new: newDate 
                    });
                }
                return;
            }

            // Map field name to database field
            const dbField = fieldMap[key] || key;
            oldVal = original[dbField];

            // Convert to strings for comparison, trim whitespace
            const oldValStr = String(oldVal || '').trim();
            const newValStr = String(newVal || '').trim();
            
            // Only show if value actually changed
            if (oldValStr !== newValStr && newValStr !== '') {
                const fieldLabel = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
                
                diffs.push({ 
                    field: fieldLabel, 
                    old: oldVal || 'Not Set', 
                    new: newVal 
                });
            }
        });

        if (diffs.length === 0) {
            return <div className="text-sm text-gray-500 italic mt-3">No changes detected.</div>;
        }

        return (
            <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Requested Changes</h5>
                </div>
                <ul className="divide-y divide-gray-200">
                    {diffs.map((diff, idx) => (
                        <li key={idx} className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            <div className="sm:col-span-3 text-sm font-medium text-gray-900 capitalize">{diff.field}</div>
                            <div className="sm:col-span-9 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                                <div className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded border border-red-100 line-through truncate opacity-75">
                                    {String(diff.old)}
                                </div>
                                <div className="flex-shrink-0 text-gray-400 hidden sm:block">➔</div>
                                <div className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded border border-green-100 font-medium truncate">
                                    {String(diff.new)}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
            <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-10 pt-6 pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Approvals</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                {userRole === 'Recruiter' ? 'Track your submission status' : 'Manage job postings and requests'}
                            </p>
                        </div>
                        <DateFilterDropdown onDateRangeChange={(start, end) => setApprovalsDateRange({ start, end })} />
                    </div>

                    {/* Tab Navigation with Filter Dropdown */}
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-6">
                            {['pending', 'approved', 'declined'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setApprovalTab(tab)}
                                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                                        approvalTab === tab
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative pb-3">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="capitalize">
                                    {approvalFilter === 'all' ? 'All Items' : approvalFilter === 'edits' ? 'Job Edits' : approvalFilter}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilterDropdown && (
                                <>
                                    {/* Backdrop to close dropdown */}
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setShowFilterDropdown(false)}
                                    />
                                    
                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                        {[
                                            { value: 'all', label: 'All Items' },
                                            { value: 'jobs', label: 'Jobs Approval' },
                                            { value: 'edits', label: 'Job Edits' },
                                            { value: 'candidates', label: 'Candidates' }
                                        ].map((filter) => (
                                            <button
                                                key={filter.value}
                                                onClick={() => {
                                                    setApprovalFilter(filter.value);
                                                    setShowFilterDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                    approvalFilter === filter.value
                                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {displayData.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {userRole === 'Recruiter' 
                                    ? 'Your job submissions will appear here'
                                    : 'No approval requests at this time'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayData.map((item, index) => (
                                item.approval_type === 'job_edit' ? (
                                    // Job Edit Card
                                    <motion.div
                                        key={`edit-${item.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-white rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-xl" />
                                        <div className="flex flex-col flex-1 pl-2">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                                        <Edit3 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 leading-tight">Job Edit Request</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-gray-600 text-sm font-medium">Job: {item.job_title || item.title}</span>
                                                            {getStatusBadge(item.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500 text-right hidden sm:block">
                                                    Requested by <span className="font-medium text-gray-900">{item.requested_by_name || 'You'}</span><br />
                                                    {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>

                                            {item.original_values_json && renderEditDiff(item.original_values_json, item.changes_json)}

                                            {item.rejection_reason && (
                                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-sm text-red-800">
                                                        <strong>Rejection Reason:</strong> {item.rejection_reason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    // Job Approval Card
                                    <motion.div
                                        key={`job-${item.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl" />

                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                            <Briefcase className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {item.title || item.job_title || 'Untitled'}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {getStatusBadge(item.status)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {item.skills && item.skills.length > 0 && (
                                                    <div className="mb-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.skills.slice(0, 3).map((skill: string, index: number) => (
                                                                <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{skill}</span>
                                                            ))}
                                                            {item.skills.length > 3 && (
                                                                <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-xs">+{item.skills.length - 3} more</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    {item.company && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Building size={16} />
                                                            <span>{item.company}</span>
                                                        </div>
                                                    )}
                                                    {item.locations && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <MapPin size={16} />
                                                            <span>{Array.isArray(item.locations) ? item.locations.join(', ') : item.locations}</span>
                                                        </div>
                                                    )}
                                                    {item.job_type && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Briefcase size={16} />
                                                            <span>{item.job_type}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Clock size={16} />
                                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                {item.rejection_reason && (
                                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-sm text-red-800">
                                                            <strong>Rejection Reason:</strong> {item.rejection_reason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminApprovals;
