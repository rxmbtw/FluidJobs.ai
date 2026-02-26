import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Users, Briefcase, Search, ChevronDown, ChevronUp,
    Clock, Plus, X, UserPlus, UserMinus, ArrowUpDown,
    AlertCircle, Loader2, Hash, Target, TrendingUp
} from 'lucide-react';
import axios from 'axios';

// ── Types ──────────────────────────────────────────────────────────
interface RecruiterMetrics {
    id: number;
    name: string;
    email: string;
    totalAssignedJobs: number;
    totalCandidatesSourced: number;
    interviewConversionRate: number;
    totalPlacements: number;
    avgTimeToHireDays: number;
    activePipeline: { screening: number; interviewing: number; offered: number };
    assignedJobs?: JobAssignment[];
}

interface JobAssignment {
    id: number;
    title: string;
    status: string;
    candidatesCount: number;
    department?: string;
}

interface Job {
    id: number;
    title: string;
    status: string;
    department?: string;
    assigned_recruiters?: number[];
}

interface JobOverview {
    job_id: number;
    job_title: string;
    job_status: string;
    department?: string;
    recruiters: { id: number; name: string; email: string }[];
}

// ── Animated Number ────────────────────────────────────────────────
const AnimatedNumber: React.FC<{ value: number; suffix?: string; duration?: number }> = ({
    value, suffix = '', duration = 800
}) => {
    const [display, setDisplay] = useState(0);
    const ref = useRef<number>(0);

    useEffect(() => {
        const start = ref.current;
        const diff = value - start;
        if (diff === 0) return;
        const startTime = performance.now();

        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.round(start + diff * eased);
            setDisplay(current);
            if (progress < 1) requestAnimationFrame(step);
            else ref.current = value;
        };
        requestAnimationFrame(step);
    }, [value, duration]);

    return <>{display.toLocaleString()}{suffix}</>;
};

// ── Styles (injected once) ─────────────────────────────────────────
const STYLES = `
  .rd-fade-in { animation: rdFadeIn .45s ease-out both; }
  .rd-fade-in-up { animation: rdFadeInUp .5s ease-out both; }
  @keyframes rdFadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes rdFadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  .rd-card { transition: box-shadow .2s ease, transform .2s ease; }
  .rd-card:hover { transform:translateY(-1px); box-shadow: 0 8px 24px -8px rgba(0,0,0,.08); }
  .rd-bar { transition: width .9s cubic-bezier(.4,0,.2,1); }
  .rd-row { transition: background-color .15s ease; }
  .rd-row:hover { background-color: rgba(248,250,252,.8); }
  .rd-modal-overlay { animation: rdOverlayIn .2s ease both; }
  @keyframes rdOverlayIn { from { opacity:0 } to { opacity:1 } }
  .rd-modal-content { animation: rdModalIn .25s ease both; }
  @keyframes rdModalIn { from { opacity:0; transform:scale(.97) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
  .rd-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:32px; }
`;

// ── Main Component ─────────────────────────────────────────────────
const RecruitersDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<RecruiterMetrics[]>([]);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<keyof RecruiterMetrics>('totalPlacements');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [selectedPeriod, setSelectedPeriod] = useState('30days');
    const [mounted, setMounted] = useState(false);
    const [modalRecruiter, setModalRecruiter] = useState<RecruiterMetrics | null>(null);
    const [assignBusy, setAssignBusy] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [jobSearch, setJobSearch] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'metrics' | 'jobs'>('metrics');
    const [jobsOverview, setJobsOverview] = useState<JobOverview[]>([]);
    const [jobOverviewSearch, setJobOverviewSearch] = useState('');
    const [assignToJobModal, setAssignToJobModal] = useState<JobOverview | null>(null);
    const [assignToJobBusy, setAssignToJobBusy] = useState(false);

    const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    const token = useCallback(() =>
        sessionStorage.getItem('fluidjobs_token') ||
        localStorage.getItem('superadmin_token') ||
        localStorage.getItem('token'), []);

    // ── Data fetching ──────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const auth = { headers: { Authorization: `Bearer ${token()}` } };

            const [mRes, jRes, ovRes] = await Promise.all([
                axios.get<{ success: boolean; metrics: RecruiterMetrics[] }>(
                    `${API}/api/recruiters-analytics`, { ...auth, params: { period: selectedPeriod } }
                ),
                axios.get<{ success: boolean; jobs: Job[] }>(`${API}/api/jobs`, auth),
                axios.get<{ success: boolean; assignments: JobOverview[] }>(
                    `${API}/api/recruiters/job-assignments-overview`, auth
                )
            ]);

            if (mRes.data?.metrics) {
                const enriched = await Promise.all(
                    mRes.data.metrics.map(async (r) => {
                        try {
                            const jr = await axios.get<{ success: boolean; jobs: JobAssignment[] }>(
                                `${API}/api/recruiters/${r.id}/assigned-jobs`, auth
                            );
                            return { ...r, assignedJobs: jr.data?.jobs || [] };
                        } catch { return { ...r, assignedJobs: [] }; }
                    })
                );
                setMetrics(enriched);
            }
            if (jRes.data?.jobs) setAllJobs(jRes.data.jobs);
            if (ovRes.data?.assignments) setJobsOverview(ovRes.data.assignments);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setMetrics([
                { id: 1, name: 'Alice Smith', email: 'alice@example.com', totalAssignedJobs: 12, totalCandidatesSourced: 145, interviewConversionRate: 42.5, totalPlacements: 8, avgTimeToHireDays: 18, activePipeline: { screening: 20, interviewing: 12, offered: 2 }, assignedJobs: [] },
                { id: 2, name: 'Bob Jones', email: 'bob@example.com', totalAssignedJobs: 8, totalCandidatesSourced: 98, interviewConversionRate: 35.0, totalPlacements: 3, avgTimeToHireDays: 24, activePipeline: { screening: 15, interviewing: 5, offered: 1 }, assignedJobs: [] },
                { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', totalAssignedJobs: 15, totalCandidatesSourced: 210, interviewConversionRate: 55.2, totalPlacements: 14, avgTimeToHireDays: 14, activePipeline: { screening: 40, interviewing: 25, offered: 4 }, assignedJobs: [] },
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => setMounted(true), 60);
        }
    }, [API, selectedPeriod, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Assign / Unassign ──────────────────────────────────────────
    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2500);
    };

    const handleAssign = async (recruiterId: number, jobId: number) => {
        try {
            setAssignBusy(true);
            await axios.post(`${API}/api/recruiters/${recruiterId}/assign-job`, { jobId },
                { headers: { Authorization: `Bearer ${token()}` } });
            showToast('Job assigned successfully');
            await fetchData();
            // Update modal recruiter with refreshed data
            setModalRecruiter(prev => prev ? metrics.find(m => m.id === prev.id) || prev : prev);
        } catch { showToast('Failed to assign job'); }
        finally { setAssignBusy(false); }
    };

    const handleUnassign = async (recruiterId: number, jobId: number) => {
        try {
            setAssignBusy(true);
            await axios.post(`${API}/api/recruiters/${recruiterId}/unassign-job`, { jobId },
                { headers: { Authorization: `Bearer ${token()}` } });
            showToast('Job unassigned');
            await fetchData();
            setModalRecruiter(prev => prev ? metrics.find(m => m.id === prev.id) || prev : prev);
        } catch { showToast('Failed to unassign job'); }
        finally { setAssignBusy(false); }
    };

    // Aliases for the Job Assignments tab (job-centric view)
    const handleAssignJob = async (recruiterId: number, jobId: number) => handleAssign(recruiterId, jobId);
    const handleUnassignJob = async (recruiterId: number, jobId: number) => handleUnassign(recruiterId, jobId);

    // After fetchData completes and metrics update, sync modal recruiter
    useEffect(() => {
        if (modalRecruiter) {
            const updated = metrics.find(m => m.id === modalRecruiter.id);
            if (updated) setModalRecruiter(updated);
        }
    }, [metrics]);

    // ── Sort / Filter ──────────────────────────────────────────────
    const toggleSort = (key: keyof RecruiterMetrics) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const sorted = React.useMemo(() => {
        const items = [...metrics];
        items.sort((a, b) => {
            const av = a[sortKey] as any, bv = b[sortKey] as any;
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
        });
        return items;
    }, [metrics, sortKey, sortDir]);

    const filtered = sorted.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Aggregates ─────────────────────────────────────────────────
    const agg = React.useMemo(() => ({
        recruiters: metrics.length,
        jobs: metrics.reduce((a, c) => a + c.totalAssignedJobs, 0),
        sourced: metrics.reduce((a, c) => a + c.totalCandidatesSourced, 0),
        placements: metrics.reduce((a, c) => a + c.totalPlacements, 0),
        pipeline: metrics.reduce((a, c) => a + c.activePipeline.screening + c.activePipeline.interviewing + c.activePipeline.offered, 0),
        avgConv: metrics.length ? +(metrics.reduce((a, c) => a + c.interviewConversionRate, 0) / metrics.length).toFixed(1) : 0,
    }), [metrics]);

    // ── Sort icon helper ───────────────────────────────────────────
    const SortIcon: React.FC<{ col: keyof RecruiterMetrics }> = ({ col }) => {
        if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-40 transition-opacity" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3 h-3 ml-1 text-blue-600" />
            : <ChevronDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    const statusDot = (status: string) =>
        status === 'Active' || status === 'active' ? 'bg-emerald-400' :
            status === 'Draft' || status === 'draft' ? 'bg-amber-400' : 'bg-slate-300';

    // ── Render ──────────────────────────────────────────────────────
    return (
        <div className="h-full bg-white overflow-y-auto">
            <style>{STYLES}</style>

            {/* ─── Toast ─────────────────────────────────────────── */}
            {toastMsg && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rd-fade-in">
                    <div className="bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-lg">
                        {toastMsg}
                    </div>
                </div>
            )}

            {/* ─── Header ────────────────────────────────────────── */}
            <div className="border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="max-w-[1360px] mx-auto px-8 py-5">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-[22px] font-semibold text-slate-900 tracking-[-0.02em]">
                                Recruiter Performance
                            </h1>
                            <p className="text-[13px] text-slate-500 mt-0.5 font-normal">
                                Pipeline efficiency, sourcing metrics, and job assignments
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400" strokeWidth={1.8} />
                                <input
                                    type="text"
                                    placeholder="Search…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9 pl-9 pr-3 w-56 rounded-lg border border-slate-200 bg-slate-50/60 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                                />
                            </div>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="rd-select h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/60 text-sm text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                            >
                                <option value="7days">Last 7 days</option>
                                <option value="30days">Last 30 days</option>
                                <option value="90days">Last 90 days</option>
                                <option value="year">This year</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1360px] mx-auto px-8 py-6 space-y-6">

                {/* ─── Tab Bar ─────────────────────────────────────── */}
                <div className="flex items-center gap-1 border-b border-slate-100 -mb-3">
                    {([
                        { id: 'metrics', label: 'Recruiter Metrics', icon: Users },
                        { id: 'jobs', label: 'Job Assignments', icon: Briefcase },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── JOB ASSIGNMENTS TAB ─────────────────────────── */}
                {activeTab === 'jobs' && (
                    <div className="rd-fade-in space-y-4">
                        {/* Search */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-slate-400" strokeWidth={1.8} />
                                <input
                                    type="text"
                                    placeholder="Filter jobs…"
                                    value={jobOverviewSearch}
                                    onChange={e => setJobOverviewSearch(e.target.value)}
                                    className="h-9 pl-9 pr-3 w-full rounded-lg border border-slate-200 bg-slate-50/60 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                                />
                            </div>
                            <span className="text-[12px] text-slate-400">{jobsOverview.length} job{jobsOverview.length !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Job Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {jobsOverview
                                .filter(j =>
                                    j.job_title.toLowerCase().includes(jobOverviewSearch.toLowerCase()) ||
                                    (j.department || '').toLowerCase().includes(jobOverviewSearch.toLowerCase())
                                )
                                .map((job) => (
                                    <div
                                        key={job.job_id}
                                        className="rd-card bg-white border border-slate-100 rounded-xl p-5 space-y-4 rd-fade-in-up"
                                    >
                                        {/* Job Title + Status */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-slate-900 leading-snug truncate" title={job.job_title}>
                                                    {job.job_title}
                                                </p>
                                                {job.department && (
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{job.department}</p>
                                                )}
                                            </div>
                                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${statusDot(job.job_status)}`} />
                                        </div>

                                        {/* Recruiter Chips */}
                                        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                                            {job.recruiters.length === 0 ? (
                                                <span className="text-[11px] text-slate-400 italic">No recruiters assigned</span>
                                            ) : (
                                                job.recruiters.map(r => (
                                                    <div
                                                        key={r.id}
                                                        className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 group relative"
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700 flex-shrink-0">
                                                            {r.name.charAt(0)}
                                                        </div>
                                                        <span className="text-[11px] text-slate-700 font-medium">{r.name}</span>
                                                        <button
                                                            onClick={async () => {
                                                                const m = metrics.find(m => m.id === r.id);
                                                                if (!m) return;
                                                                await handleUnassignJob(m.id, job.job_id);
                                                            }}
                                                            className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"
                                                            title={`Remove ${r.name}`}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Assign Button */}
                                        <button
                                            onClick={() => setAssignToJobModal(job)}
                                            className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-blue-200 text-blue-600 text-[12px] font-medium hover:bg-blue-50 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Assign Recruiter
                                        </button>
                                    </div>
                                ))}
                        </div>

                        {/* Assign-to-Job Modal */}
                        {assignToJobModal && (
                            <div className="rd-modal-overlay fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
                                <div className="rd-modal-content bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                        <div>
                                            <p className="text-[13px] font-semibold text-slate-900">{assignToJobModal.job_title}</p>
                                            <p className="text-[11px] text-slate-400">Assign recruiters to this job</p>
                                        </div>
                                        <button onClick={() => setAssignToJobModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {/* Recruiter List */}
                                    <div className="px-6 py-4 max-h-64 overflow-y-auto space-y-2">
                                        {metrics.length === 0 ? (
                                            <p className="text-[13px] text-slate-400 text-center py-8">No recruiters available</p>
                                        ) : (
                                            metrics.map(r => {
                                                const alreadyAssigned = assignToJobModal.recruiters.some(ar => ar.id === r.id);
                                                return (
                                                    <div key={r.id} className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors ${alreadyAssigned ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                                                                {r.name.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[13px] font-medium text-slate-900 truncate">{r.name}</p>
                                                                <p className="text-[11px] text-slate-400 truncate">{r.email}</p>
                                                            </div>
                                                        </div>
                                                        {alreadyAssigned ? (
                                                            <button
                                                                onClick={async () => {
                                                                    setAssignToJobBusy(true);
                                                                    await handleUnassignJob(r.id, assignToJobModal.job_id);
                                                                    setAssignToJobModal(prev => prev ? {
                                                                        ...prev,
                                                                        recruiters: prev.recruiters.filter(ar => ar.id !== r.id)
                                                                    } : null);
                                                                    setAssignToJobBusy(false);
                                                                }}
                                                                disabled={assignToJobBusy}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                            >
                                                                <UserMinus className="w-3 h-3" /> Remove
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={async () => {
                                                                    setAssignToJobBusy(true);
                                                                    await handleAssignJob(r.id, assignToJobModal.job_id);
                                                                    setAssignToJobModal(prev => prev ? {
                                                                        ...prev,
                                                                        recruiters: [...prev.recruiters, { id: r.id, name: r.name, email: r.email }]
                                                                    } : null);
                                                                    setAssignToJobBusy(false);
                                                                }}
                                                                disabled={assignToJobBusy}
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                            >
                                                                <UserPlus className="w-3 h-3" /> Assign
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div className="px-6 py-4 border-t border-slate-100">
                                        <button onClick={() => setAssignToJobModal(null)} className="w-full h-9 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── METRICS TAB ─────────────────────────────────── */}
                {activeTab === 'metrics' && (
                <div className="space-y-6">
                    <div className="space-y-6">

                        {/* ─── KPI Strip ──────────────────────────────────── */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                                { label: 'Recruiters', value: agg.recruiters, icon: Users },
                                { label: 'Assigned Jobs', value: agg.jobs, icon: Briefcase },
                                { label: 'Sourced', value: agg.sourced, icon: Target },
                                { label: 'In Pipeline', value: agg.pipeline, icon: Hash },
                                { label: 'Placements', value: agg.placements, icon: TrendingUp },
                                { label: 'Avg Conv.', value: agg.avgConv, icon: TrendingUp, suffix: '%' },
                            ].map((k, i) => (
                                <div
                                    key={i}
                                    className="rd-card bg-white border border-slate-100 rounded-xl p-4 rd-fade-in-up"
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <k.icon className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.8} />
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{k.label}</span>
                                    </div>
                                    <p className="text-2xl font-semibold text-slate-900 tracking-tight">
                                        {mounted ? <AnimatedNumber value={k.value} suffix={k.suffix} /> : '—'}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* ─── Leaderboard ─────────────────────────────────── */}
                        {sorted.length > 0 && (
                            <div className="rd-fade-in-up" style={{ animationDelay: '350ms' }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm font-semibold text-slate-900">Top Performers</h2>
                                    <span className="text-[11px] text-slate-400 font-normal">by placements</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {sorted.slice(0, 3).map((r, i) => (
                                        <div key={r.id} className="rd-card bg-white border border-slate-100 rounded-xl p-5 flex items-center gap-4">
                                            {/* Rank */}
                                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-slate-500">{i + 1}</span>
                                            </div>
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                                                {r.name.charAt(0)}{r.name.split(' ')[1]?.charAt(0) || ''}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{r.name}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{r.email}</p>
                                            </div>
                                            {/* Stats */}
                                            <div className="flex items-center gap-4 flex-shrink-0">
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-slate-900">{r.totalPlacements}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Placed</p>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100" />
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-slate-900">{r.interviewConversionRate.toFixed(0)}%</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Conv</p>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100" />
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-slate-600">{r.avgTimeToHireDays}d</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">TTH</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── Data Table ──────────────────────────────────── */}
                        <div className="border border-slate-100 rounded-xl overflow-hidden rd-fade-in-up" style={{ animationDelay: '450ms' }}>
                            {/* Table Header Label */}
                            <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/40">
                                <span className="text-[13px] font-medium text-slate-700">All Recruiters</span>
                                <span className="text-[12px] text-slate-400">{filtered.length} of {metrics.length}</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            {([
                                                ['name', 'Recruiter'],
                                                ['totalAssignedJobs', 'Jobs'],
                                                ['totalCandidatesSourced', 'Sourced'],
                                                ['interviewConversionRate', 'Conversion'],
                                                [null, 'Pipeline'],
                                                ['totalPlacements', 'Placed'],
                                                ['avgTimeToHireDays', 'Avg Time'],
                                                [null, ''],
                                            ] as [keyof RecruiterMetrics | null, string][]).map(([col, label], ci) => (
                                                <th
                                                    key={ci}
                                                    onClick={() => col && toggleSort(col)}
                                                    className={`px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${col ? 'cursor-pointer select-none group' : ''} ${ci === 0 ? 'pl-6' : ''}`}
                                                >
                                                    <span className="inline-flex items-center">
                                                        {label}
                                                        {col && <SortIcon col={col} />}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={8} className="py-16 text-center">
                                                <Loader2 className="w-5 h-5 text-slate-300 animate-spin mx-auto" />
                                            </td></tr>
                                        ) : filtered.length === 0 ? (
                                            <tr><td colSpan={8} className="py-16 text-center text-sm text-slate-400">No recruiters match your search</td></tr>
                                        ) : filtered.map((r) => (
                                            <React.Fragment key={r.id}>
                                                <tr className="rd-row border-b border-slate-50 last:border-0">
                                                    {/* Recruiter */}
                                                    <td className="pl-6 pr-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                                                                {r.name.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 truncate">{r.name}</p>
                                                                <p className="text-[11px] text-slate-400 truncate">{r.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Jobs */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-slate-900 tabular-nums">{r.totalAssignedJobs}</span>
                                                            <button
                                                                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                                                                className="text-[11px] text-blue-600/80 hover:text-blue-700 font-medium transition-colors"
                                                            >
                                                                {expandedId === r.id ? 'hide' : 'view'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    {/* Sourced */}
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{r.totalCandidatesSourced}</span>
                                                    </td>
                                                    {/* Conversion */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-20 h-[5px] bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="rd-bar h-full rounded-full bg-blue-500/70"
                                                                    style={{ width: mounted ? `${Math.min(r.interviewConversionRate, 100)}%` : '0%' }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-700 tabular-nums w-10">
                                                                {r.interviewConversionRate.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Pipeline */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 tabular-nums">
                                                                {r.activePipeline.screening}
                                                            </span>
                                                            <span className="text-slate-200">·</span>
                                                            <span className="text-[11px] font-medium text-blue-600/80 bg-blue-50/60 border border-blue-100/60 rounded px-1.5 py-0.5 tabular-nums">
                                                                {r.activePipeline.interviewing}
                                                            </span>
                                                            <span className="text-slate-200">·</span>
                                                            <span className="text-[11px] font-medium text-emerald-600/80 bg-emerald-50/50 border border-emerald-100/60 rounded px-1.5 py-0.5 tabular-nums">
                                                                {r.activePipeline.offered}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Placements */}
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{r.totalPlacements}</span>
                                                    </td>
                                                    {/* Avg Time */}
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-sm text-slate-600 tabular-nums">{r.avgTimeToHireDays}d</span>
                                                    </td>
                                                    {/* Actions */}
                                                    <td className="px-5 py-3.5">
                                                        <button
                                                            onClick={() => setModalRecruiter(r)}
                                                            className="text-[12px] font-medium text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg px-3 py-1.5 transition-all hover:bg-blue-50/50"
                                                        >
                                                            Manage
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded row */}
                                                {expandedId === r.id && (
                                                    <tr className="bg-slate-25">
                                                        <td colSpan={8} className="px-6 py-4">
                                                            <div className="ml-11 space-y-2">
                                                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                                    Assigned Jobs · {r.assignedJobs?.length || 0}
                                                                </p>
                                                                {r.assignedJobs && r.assignedJobs.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {r.assignedJobs.map(j => (
                                                                            <div key={j.id} className="inline-flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm group/tag">
                                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot(j.status)}`} />
                                                                                <span className="text-slate-700 font-medium">{j.title}</span>
                                                                                <span className="text-[11px] text-slate-400">{j.candidatesCount || 0}</span>
                                                                                <button
                                                                                    onClick={() => handleUnassign(r.id, j.id)}
                                                                                    disabled={assignBusy}
                                                                                    className="ml-1 p-0.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/tag:opacity-100"
                                                                                >
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-slate-400">No jobs assigned</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between text-[12px] text-slate-400 bg-slate-50/30">
                                <span>
                                    Showing <span className="font-medium text-slate-600">{filtered.length}</span> of {metrics.length} recruiters
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-0.5" /> Screening
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-2 mr-0.5" /> Interviewing
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-2 mr-0.5" /> Offered
                                </div>
                            </div>
                        </div>
                    </div>

            {/* ─── Job Assignment Modal ────────────────────────────── */}
                {modalRecruiter && (
                    <div className="fixed inset-0 z-50 rd-modal-overlay" onClick={() => setModalRecruiter(null)}>
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                        <div className="relative flex items-center justify-center min-h-screen p-4">
                            <div
                                className="rd-modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                                            {modalRecruiter.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-[15px] font-semibold text-slate-900">{modalRecruiter.name}</h3>
                                            <p className="text-[12px] text-slate-500">Manage job assignments</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setModalRecruiter(null)}
                                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="flex-1 overflow-y-auto">
                                    {/* Currently Assigned */}
                                    <div className="px-6 pt-5 pb-4">
                                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                            Currently Assigned · {modalRecruiter.assignedJobs?.length || 0}
                                        </p>
                                        {modalRecruiter.assignedJobs && modalRecruiter.assignedJobs.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {modalRecruiter.assignedJobs.map(j => (
                                                    <div key={j.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors group">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(j.status)}`} />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-slate-800 truncate">{j.title}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {j.department && <span className="text-[11px] text-slate-400">{j.department}</span>}
                                                                    <span className="text-[11px] text-slate-400">{j.candidatesCount || 0} candidates</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnassign(modalRecruiter.id, j.id)}
                                                            disabled={assignBusy}
                                                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                        >
                                                            <UserMinus className="w-3 h-3" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <AlertCircle className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
                                                <p className="text-sm text-slate-400">No jobs assigned yet</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="mx-6 border-t border-slate-100" />

                                    {/* Available Jobs */}
                                    <div className="px-6 pt-4 pb-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                                Available Jobs
                                            </p>
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" strokeWidth={1.8} />
                                                <input
                                                    type="text"
                                                    placeholder="Filter…"
                                                    value={jobSearch}
                                                    onChange={(e) => setJobSearch(e.target.value)}
                                                    className="h-7 pl-8 pr-3 w-44 rounded-md border border-slate-200 bg-slate-50/60 text-[12px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                                            {allJobs
                                                .filter(j => !modalRecruiter.assignedJobs?.some(aj => aj.id === j.id))
                                                .filter(j => j.title.toLowerCase().includes(jobSearch.toLowerCase()))
                                                .map(j => (
                                                    <div key={j.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors group">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(j.status)}`} />
                                                            <div className="min-w-0">
                                                                <p className="text-sm text-slate-700 truncate">{j.title}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {j.department && <span className="text-[11px] text-slate-400">{j.department}</span>}
                                                                    {j.assigned_recruiters && j.assigned_recruiters.length > 0 && (
                                                                        <span className="text-[11px] text-slate-400">{j.assigned_recruiters.length} assigned</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAssign(modalRecruiter.id, j.id)}
                                                            disabled={assignBusy}
                                                            className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                        >
                                                            <UserPlus className="w-3 h-3" />
                                                            Assign
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end flex-shrink-0">
                                    <button
                                        onClick={() => setModalRecruiter(null)}
                                        className="h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                                <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end flex-shrink-0">
                                    <button
                                        onClick={() => setModalRecruiter(null)}
                                        className="h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
                )}

            </div>
        </div>
    );
};

export default RecruitersDashboard;
