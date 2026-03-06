import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { DateFilterDropdown } from '../../../components/DateFilterDropdown';
import { Check, X, Eye, MapPin, Briefcase, DollarSign, Calendar, User, Building, Clock, AlertCircle, Edit3, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';


const SuperAdminApprovals: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
    const [approvedJobs, setApprovedJobs] = useState<any[]>([]);
    const [rejectedJobs, setRejectedJobs] = useState<any[]>([]);
    const [allApprovals, setAllApprovals] = useState<any[]>([]);

    const { status } = useParams();
    const approvalTab = status || 'pending';

    // Get filter from URL or default to 'all'
    const approvalFilter = searchParams.get('filter') || 'all';
    
    const setApprovalTab = (tab: string) => {
        navigate(`/superadmin-dashboard/approvals/${tab}?filter=${approvalFilter}`);
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

    // Ensure filter parameter is set in URL on initial load
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

    const fetchPendingApprovals = async () => {
        try {
            let url = `${BACKEND_URL}/api/superadmin/pending-approvals`;
            if (approvalsDateRange.start && approvalsDateRange.end) {
                url += `?startDate=${approvalsDateRange.start}&endDate=${approvalsDateRange.end}`;
            }
            const response = await axios.get<any[]>(url);
            console.log('📥 Pending approvals fetched:', response.data);

            // Try to fetch edit requests, but don't fail if it errors
            let mappedEdits: any[] = [];
            try {
                const editResponse = await axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=pending`);
                mappedEdits = editResponse.data.map(e => ({ ...e, approval_type: 'job_edit' }));
            } catch (editError) {
                console.warn('Could not fetch edit requests:', editError);
                // Continue without edit requests
            }

            const combined = [...response.data, ...mappedEdits].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            console.log('📊 Combined pending approvals:', combined);
            console.log('🔍 Current filter:', approvalFilter);
            console.log('🔍 Filtered result:', filterApprovals(combined));
            setPendingApprovals(combined);
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
            const response = await axios.get<any[]>(url);

            let mappedEdits: any[] = [];
            try {
                const editResponse = await axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=approved`);
                mappedEdits = editResponse.data.map(e => ({
                    ...e,
                    approval_type: 'job_edit',
                    approved_at: e.resolved_at,
                    approved_by_name: 'SuperAdmin'
                }));
            } catch (editError) {
                console.warn('Could not fetch approved edit requests:', editError);
            }

            const combined = [...response.data, ...mappedEdits].sort((a, b) => {
                const dateA = new Date(a.approved_at || a.created_at).getTime();
                const dateB = new Date(b.approved_at || b.created_at).getTime();
                return dateB - dateA;
            });
            setApprovedJobs(combined);
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
                    approved_at: e.resolved_at
                }));
            } catch (editError) {
                console.warn('Could not fetch rejected edit requests:', editError);
            }

            const combined = [...response.data, ...mappedEdits].sort((a, b) => {
                const dateA = new Date(a.approved_at || a.created_at).getTime();
                const dateB = new Date(b.approved_at || b.created_at).getTime();
                return dateB - dateA;
            });
            setRejectedJobs(combined);
        } catch (error) {
            console.error('Error fetching rejected jobs:', error);
        }
    };

    const fetchAllApprovals = async () => {
        try {
            const [pendingRes, approvedRes, rejectedRes, pendingEdits, approvedEdits, rejectedEdits] = await Promise.all([
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/pending-approvals`),
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/approved-jobs`),
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/rejected-jobs`),
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=pending`),
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=approved`),
                axios.get<any[]>(`${BACKEND_URL}/api/superadmin/edit-requests?status=rejected`)
            ]);

            const mappedPendingEdits = pendingEdits.data.map(e => ({ ...e, approval_type: 'job_edit' }));
            const pending = [...pendingRes.data, ...mappedPendingEdits].map(job => ({ ...job, status: 'pending', priority: 1 }));

            const mappedApprovedEdits = approvedEdits.data.map(e => ({ ...e, approval_type: 'job_edit', approved_at: e.resolved_at, approved_by_name: 'SuperAdmin' }));
            const approved = [...approvedRes.data, ...mappedApprovedEdits].map(job => ({ ...job, status: 'approved', priority: 2 }));

            const mappedRejectedEdits = rejectedEdits.data.map(e => ({ ...e, approval_type: 'job_edit', approved_at: e.resolved_at }));
            const rejected = [...rejectedRes.data, ...mappedRejectedEdits].map(job => ({ ...job, status: 'rejected', priority: 3 }));

            const combined = [...pending, ...approved, ...rejected];

            const sorted = combined.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                const dateA = new Date(a.created_at || a.approved_at).getTime();
                const dateB = new Date(b.created_at || b.approved_at).getTime();
                return dateB - dateA;
            });

            setAllApprovals(sorted);
        } catch (error) {
            console.error('Error fetching all approvals:', error);
        }
    };

    const handleApprove = async (id: number, approvalType: string = 'job') => {
        try {
            if (approvalType === 'candidate_restriction') {
                await axios.post(`${BACKEND_URL}/api/superadmin/approve-candidate-restriction/${id}`);
            } else if (approvalType === 'job_edit') {
                await axios.put(`${BACKEND_URL}/api/superadmin/edit-requests/${id}/approve`);
            } else {
                await axios.post(`${BACKEND_URL}/api/superadmin/approve-job/${id}`);
            }

            fetchPendingApprovals();
            if (approvalTab === 'all') {
                fetchAllApprovals();
            }
        } catch (error) {
            console.error('Error approving:', error);
        }
    };

    const handleReject = async (id: number, approvalType: string = 'job') => {
        if (approvalType === 'candidate_restriction') {
            try {
                const response = await axios.post(`${BACKEND_URL}/api/superadmin/reject-candidate-restriction/${id}`);
                if (response.status === 200) {
                    fetchPendingApprovals();
                    if (approvalTab === 'all') {
                        fetchAllApprovals();
                    }
                }
            } catch (error) {
                console.error('Error rejecting candidate restriction:', error);
                alert('Failed to reject. Please try again.');
            }
        } else {
            const item = pendingApprovals.find(j => j.id === id) || allApprovals.find(j => j.id === id);
            setJobToReject({ ...item, approval_type: approvalType });
            setShowRejectModal(true);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            alert('Please enter a reason for rejection');
            return;
        }

        try {
            setSubmittingRejection(true);

            if (jobToReject.approval_type === 'candidate_restriction') {
                const response = await axios.post(`${BACKEND_URL}/api/superadmin/reject-candidate-restriction/${jobToReject.id}`, {
                    reason: rejectionReason
                });

                if (response.status === 200) {
                    fetchPendingApprovals();
                    if (approvalTab === 'all') {
                        fetchAllApprovals();
                    }
                    setShowRejectModal(false);
                    setJobToReject(null);
                    setRejectionReason('');
                }
            } else if (jobToReject.approval_type === 'job_edit') {
                const response = await axios.put(`${BACKEND_URL}/api/superadmin/edit-requests/${jobToReject.id}/reject`, {
                    reason: rejectionReason
                });

                if (response.status === 200) {
                    fetchPendingApprovals();
                    if (approvalTab === 'all') {
                        fetchAllApprovals();
                    }
                    setShowRejectModal(false);
                    setJobToReject(null);
                    setRejectionReason('');
                }
            } else {
                const response = await axios.post(`${BACKEND_URL}/api/superadmin/reject-job/${jobToReject.id}`, {
                    reason: rejectionReason
                });

                if (response.status === 200) {
                    fetchPendingApprovals();
                    if (approvalTab === 'all') {
                        fetchAllApprovals();
                    }
                    setShowRejectModal(false);
                    setJobToReject(null);
                    setRejectionReason('');
                }
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Failed to reject. Please try again.');
        } finally {
            setSubmittingRejection(false);
        }
    };

    const getAllApprovalsForFilter = () => {
        const pending = pendingApprovals.map(job => ({ ...job, status: 'pending', priority: 1 }));
        const approved = approvedJobs.map(job => ({ ...job, status: 'approved', priority: 2 }));
        const rejected = rejectedJobs.map(job => ({ ...job, status: 'rejected', priority: 3 }));

        const combined = [...pending, ...approved, ...rejected];

        return combined.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            const dateA = new Date(a.created_at || a.approved_at).getTime();
            const dateB = new Date(b.created_at || b.approved_at).getTime();
            return dateB - dateA;
        });
    };

    const filterApprovals = (approvals: any[]) => {
        if (approvalFilter === 'all') {
            return getAllApprovalsForFilter().filter(item => {
                if (approvalTab === 'pending') return item.status === 'pending';
                if (approvalTab === 'approved') return item.status === 'approved';
                if (approvalTab === 'declined') return item.status === 'rejected';
                return true;
            });
        }
        if (approvalFilter === 'jobs') return approvals.filter(item => item.approval_type === 'job' || !item.approval_type);
        if (approvalFilter === 'candidates') return approvals.filter(item => item.approval_type === 'candidate_restriction');
        if (approvalFilter === 'edits') return approvals.filter(item => item.approval_type === 'job_edit');
        return approvals;
    };

    // Helper to open candidate profile (converted to navigation navigation if possible needed)
    const openCandidate = (id: string | number, name: string) => {
        // In new routing, we should navigate to /superadmin-dashboard/candidates/:id
        navigate(`/superadmin-dashboard/candidates/${id}`);
    };

    const openJob = (jobId: string, title: string) => {
        // Navigate to the job dashboard with the job ID
        navigate(`/superadmin-dashboard/jobs/job-dashboard/${jobId}/executive-summary`);
    };

    const renderEditDiff = (original: any, changes: any) => {
        if (!original || !changes) return null;
        let parsedChanges = changes;
        if (typeof changes === 'string') {
            try { parsedChanges = JSON.parse(changes); } catch (e) { return null; }
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
            numberOfOpenings: 'no_of_openings',
            primaryRecruiterId: 'primary_recruiter_id'
        };

        Object.keys(parsedChanges).forEach(key => {
            if (key === 'interviewStages' || key === 'requirements' || key === 'uiState' || key === 'hiringManager' || key === 'recruiters' || key === 'status' || key === 'isPublished') return;

            let oldVal = null;
            let newVal = parsedChanges[key];

            if (key === 'salary') {
                const oldMin = original.min_salary;
                const oldMax = original.max_salary;
                const newMin = newVal?.min;
                const newMax = newVal?.max;
                if (String(oldMin) !== String(newMin) || String(oldMax) !== String(newMax)) {
                    diffs.push({
                        field: 'Salary Range',
                        old: `${oldMin ? '₹' + oldMin : 'N/A'} - ${oldMax ? '₹' + oldMax : 'N/A'}`,
                        new: `${newMin ? '₹' + newMin : 'N/A'} - ${newMax ? '₹' + newMax : 'N/A'}`
                    });
                }
                return;
            }

            if (key === 'locations') {
                const oldLocs = original.locations || [];
                const newLocs = Array.isArray(newVal) ? newVal.join(', ') : newVal;
                const oldLocsStr = Array.isArray(oldLocs) ? oldLocs.join(', ') : oldLocs;
                if (oldLocsStr !== newLocs) {
                    diffs.push({ field: 'Locations', old: oldLocsStr || 'None', new: newLocs || 'None' });
                }
                return;
            }

            if (key === 'skills') {
                const oldSkills = original.skills || [];
                const newSkills = Array.isArray(newVal) ? newVal.join(', ') : newVal;
                const oldSkillsStr = Array.isArray(oldSkills) ? oldSkills.join(', ') : oldSkills;
                if (oldSkillsStr !== newSkills) {
                    diffs.push({ field: 'Skills', old: oldSkillsStr || 'None', new: newSkills || 'None' });
                }
                return;
            }

            const dbField = fieldMap[key] || key;
            oldVal = original[dbField];

            if (String(oldVal) !== String(newVal)) {
                diffs.push({ field: key.replace(/([A-Z])/g, ' $1').trim(), old: oldVal || 'None', new: newVal || 'None' });
            }
        });

        if (diffs.length === 0) {
            return <div className="text-sm text-gray-500 italic mt-3">No substantive changes detected.</div>;
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
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Approvals Dashboard</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage job postings and candidate restrictions</p>
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
                                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${approvalTab === tab
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
                                    {approvalFilter === 'all' ? 'All Items' : approvalFilter}
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
                                            { value: 'jobs', label: 'Jobs' },
                                            { value: 'candidates', label: 'Candidates' },
                                            { value: 'edits', label: 'Edits' }
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

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Content Logic */}
                    {/* Pending Tab */}
                    {approvalTab === 'pending' && (
                        filterApprovals(pendingApprovals).length > 0 ? (
                            <div className="grid gap-6">
                                {filterApprovals(pendingApprovals).map((item) => (
                                    item.approval_type === 'candidate_restriction' ? (
                                        // Candidate Restriction Card
                                        <div key={`candidate-${item.id}`} className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-xl" />
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-gray-900 leading-tight">Restricted Candidate</h4>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                                                    Restriction Request
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Candidate:</span>
                                                                <span className="text-gray-900">{item.candidate_name}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Requested By:</span>
                                                                <span className="text-gray-900">{item.requested_by_name}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-start text-sm text-gray-600">
                                                                <AlertCircle className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                                                                <span className="font-medium mr-2 whitespace-nowrap">Reason:</span>
                                                                <span className="text-gray-900 italic">"{item.restriction_reason}"</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Date:</span>
                                                                <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                                    <button
                                                        onClick={() => handleApprove(item.id, 'candidate_restriction')}
                                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                                    >
                                                        <Check className="w-4 h-4 mr-1.5" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(item.id, 'candidate_restriction')}
                                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                                                    >
                                                        <X className="w-4 h-4 mr-1.5" /> Reject
                                                    </button>
                                                    <button
                                                        onClick={() => openCandidate(item.candidate_id || item.id, item.candidate_name)}
                                                        className="flex-1 flex items-center justify-center px-4 py-2 text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1.5" /> View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : item.approval_type === 'job_edit' ? (
                                        // Job Edit Card
                                        <div key={`edit-${item.id}`} className="group bg-white rounded-xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
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
                                                                <span className="text-gray-600 text-sm font-medium">Job: {item.job_title}</span>
                                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center">
                                                                    <Clock className="w-3 h-3 mr-1" /> Pending
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500 text-right hidden sm:block">
                                                        Requested by <span className="font-medium text-gray-900">{item.requested_by_name}</span><br />
                                                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>

                                                {renderEditDiff(item.original_job, item.changes_json)}

                                                <div className="mt-6 flex flex-wrap gap-3 justify-end border-t border-gray-100 pt-4">
                                                    <button
                                                        onClick={() => handleApprove(item.id, 'job_edit')}
                                                        className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                                    >
                                                        <Check className="w-4 h-4 mr-1.5" /> Approve Changes
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(item.id, 'job_edit')}
                                                        className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                                                    >
                                                        <X className="w-4 h-4 mr-1.5" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Job Approval Card
                                        <div key={`job-${item.id}`} className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl" />

                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                                <Briefcase className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {(() => {
                                                                        const daysSincePosted = Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24));
                                                                        const isNewJob = daysSincePosted <= 2;
                                                                        return isNewJob && (
                                                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">New</span>
                                                                        );
                                                                    })()}
                                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center">
                                                                        <Clock className="w-3 h-3 mr-1" /> Pending
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">

                                                        <div className="flex flex-wrap gap-2">
                                                            {item.skills && item.skills.slice(0, 3).map((skill: string, index: number) => (
                                                                <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{skill}</span>
                                                            ))}
                                                            {item.skills && item.skills.length > 3 && (
                                                                <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-xs">+{item.skills.length - 3} more</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                                                        <div className="flex items-center text-gray-600">
                                                            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.job_type || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{formatSalary(item.salary_range)}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.location || 'Remote'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Building className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.job_domain || 'General'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <User className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">Posted by {item.created_by_name || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <User className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.experience_level || 'Not Specified'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                                    <button
                                                        onClick={() => handleApprove(item.id, 'job')}
                                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                                    >
                                                        <Check className="w-4 h-4 mr-1.5" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(item.id, 'job')}
                                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                                                    >
                                                        <X className="w-4 h-4 mr-1.5" /> Reject
                                                    </button>
                                                    <button
                                                        onClick={() => openJob(item.id.toString(), item.title)}
                                                        className="flex-1 flex items-center justify-center px-4 py-2 text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1.5" /> View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                                <div className="p-3 bg-gray-50 rounded-full mb-3">
                                    <Check className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                                <p className="text-gray-500 mt-1 max-w-sm">There are no pending approvals. Good job!</p>
                            </div>
                        )
                    )}

                    {/* Approved Tab */}
                    {approvalTab === 'approved' && (
                        filterApprovals([...approvedJobs, ...pendingApprovals.filter(item => item.status === 'approved')]).length > 0 ? (
                            <div className="grid gap-6">
                                {filterApprovals([...approvedJobs, ...pendingApprovals.filter(item => item.status === 'approved')]).map(item => (
                                    item.approval_type === 'candidate_restriction' ? (
                                        // Approved Candidate Restriction Card
                                        <div key={`approved-candidate-${item.id}`} className="group bg-white rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-xl" />
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-gray-900 leading-tight">{item.candidate_name || 'Restricted Candidate'}</h4>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                                    <Check className="w-3 h-3 mr-1" /> Approved Restriction
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Candidate:</span>
                                                                <span className="text-gray-900">{item.candidate_name}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Requested By:</span>
                                                                <span className="text-gray-900">{item.requested_by_name || item.requested_by_username || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Approved By:</span>
                                                                <span className="text-gray-900">{item.approved_by_name || item.approved_by_username || 'SuperAdmin'}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Approved:</span>
                                                                <span>{new Date(item.approved_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {item.restriction_reason && (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                            <p className="text-sm text-gray-700 flex items-start">
                                                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                                                                <span><span className="font-medium">Reason:</span> "{item.restriction_reason}"</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                                    <button
                                                        onClick={() => openCandidate(item.candidate_id || item.id, item.candidate_name)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center shadow-sm"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" /> View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : item.approval_type === 'job_edit' ? (
                                        // Approved Job Edit Card
                                        <div key={`approved-edit-${item.id}`} className="group bg-white rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-xl" />
                                            <div className="flex flex-col flex-1 pl-2">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                                            <Edit3 className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900 leading-tight">Job Edit Approved</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-gray-600 text-sm font-medium">Job: {item.job_title}</span>
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center">
                                                                    <Check className="w-3 h-3 mr-1" /> Approved
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500 text-right hidden sm:block">
                                                        Requested by <span className="font-medium text-gray-900">{item.requested_by_name}</span><br />
                                                        Approved: {new Date(item.approved_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>

                                                {renderEditDiff(item.original_job, item.changes_json)}
                                            </div>
                                        </div>
                                    ) : (
                                        // Approved Job Card
                                        <div key={`approved-job-${item.id}`} className="group bg-white rounded-xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-xl" />
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                                                <Briefcase className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">{item.title}</h4>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                                    <Check className="w-3 h-3 mr-1" /> Approved & Published
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm mb-4">
                                                        <div className="flex items-center text-gray-600">
                                                            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.job_type || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{formatSalary(item.salary_range)}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.location || 'Remote'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <User className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">Posted by {item.created_by_name || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span>Approved {new Date(item.approved_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Building className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.job_domain || 'General'}</span>
                                                        </div>
                                                    </div>

                                                    {item.skills && item.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.skills.slice(0, 4).map((skill: string, index: number) => (
                                                                <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{skill}</span>
                                                            ))}
                                                            {item.skills.length > 4 && (
                                                                <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-xs">+{item.skills.length - 4} more</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                                    <button
                                                        onClick={() => openJob(item.id.toString(), item.title)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center shadow-sm"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" /> View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                                <div className="p-3 bg-gray-50 rounded-full mb-3">
                                    <Check className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No Approved Items</h3>
                                <p className="text-gray-500 mt-1 max-w-sm">No approved items found in this period.</p>
                            </div>
                        )
                    )}

                    {/* Declined Tab */}
                    {approvalTab === 'declined' && (
                        filterApprovals([...rejectedJobs, ...pendingApprovals.filter(item => item.status === 'rejected')]).length > 0 ? (
                            <div className="grid gap-6">
                                {filterApprovals([...rejectedJobs, ...pendingApprovals.filter(item => item.status === 'rejected')]).map(item => (
                                    item.approval_type === 'candidate_restriction' ? (
                                        // Declined Candidate Restriction Card
                                        <div key={`rejected-candidate-${item.id}`} className="group bg-white rounded-xl border border-red-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl" />
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-gray-900 leading-tight">{item.candidate_name || 'Restricted Candidate'}</h4>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                                    <X className="w-3 h-3 mr-1" /> Restriction Rejected
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Candidate:</span>
                                                                <span className="text-gray-900">{item.candidate_name}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Requested By:</span>
                                                                <span className="text-gray-900">{item.requested_by_name || item.requested_by_username || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Rejected By:</span>
                                                                <span className="text-gray-900">{item.approved_by_name || item.approved_by_username || 'SuperAdmin'}</span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-600">
                                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="font-medium mr-2">Rejected:</span>
                                                                <span>{new Date(item.approved_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {(item.rejection_reason || item.restriction_reason) && (
                                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                                            <p className="text-sm text-red-800 font-medium flex items-start">
                                                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                                <span>
                                                                    {item.rejection_reason ? (
                                                                        <><span className="font-semibold">Rejection Reason:</span> "{item.rejection_reason}"</>
                                                                    ) : (
                                                                        <><span className="font-semibold">Original Request:</span> "{item.restriction_reason}"</>
                                                                    )}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                                    <button
                                                        onClick={() => openCandidate(item.candidate_id || item.id, item.candidate_name)}
                                                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors text-sm font-medium flex items-center"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" /> View Candidate
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : item.approval_type === 'job_edit' ? (
                                        // Declined Job Edit Card
                                        <div key={`rejected-edit-${item.id}`} className="group bg-white rounded-xl border border-red-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl" />
                                            <div className="flex flex-col flex-1 pl-2">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                                            <Edit3 className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900 leading-tight">Job Edit Rejected</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-gray-600 text-sm font-medium">Job: {item.job_title}</span>
                                                                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full flex items-center">
                                                                    <X className="w-3 h-3 mr-1" /> Declined
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500 text-right hidden sm:block">
                                                        Requested by <span className="font-medium text-gray-900">{item.requested_by_name}</span><br />
                                                        Rejected: {new Date(item.approved_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>

                                                {renderEditDiff(item.original_job, item.changes_json)}
                                            </div>
                                        </div>
                                    ) : (
                                        // Declined Job Card
                                        <div key={`rejected-job-${item.id}`} className="group bg-white rounded-xl border border-red-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl" />
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                                                <Briefcase className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-red-700 transition-colors">{item.title}</h4>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                                    <X className="w-3 h-3 mr-1" /> Rejected
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm mb-4">
                                                        <div className="flex items-center text-gray-600">
                                                            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.job_type || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">{item.location || 'Remote'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <User className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span className="truncate">Posted by {item.created_by_name || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                            <span>Rejected {new Date(item.approved_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    </div>

                                                    {item.rejection_reason && (
                                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                                            <p className="text-sm text-red-800 font-medium flex items-start">
                                                                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                                <span><span className="font-semibold">Rejection Reason:</span> "{item.rejection_reason}"</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                                    <button
                                                        onClick={() => openJob(item.id.toString(), item.title)}
                                                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors text-sm font-medium flex items-center"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" /> View Job
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                                <div className="p-3 bg-gray-50 rounded-full mb-3">
                                    <X className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No Declined Items</h3>
                                <p className="text-gray-500 mt-1 max-w-sm">No declined items found.</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject {jobToReject?.approval_type === 'candidate_restriction' ? 'Restriction' : 'Job'}</h3>
                            <p className="text-gray-500 text-sm mb-6">Please provide a reason for this rejection. This will be visible to the user.</p>

                            <textarea
                                className="w-full border border-gray-300 rounded-xl p-4 h-32 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none transition-shadow"
                                placeholder="Enter rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                autoFocus
                            ></textarea>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setJobToReject(null);
                                    setRejectionReason('');
                                }}
                                className="px-5 py-2.5 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={submittingRejection}
                                className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {submittingRejection ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Rejecting...
                                    </>
                                ) : (
                                    'Confirm Rejection'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminApprovals;
