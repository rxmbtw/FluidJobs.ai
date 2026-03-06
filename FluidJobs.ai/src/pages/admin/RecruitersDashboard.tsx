import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Users, Briefcase, Search, ChevronDown, ChevronUp,
    Clock, Plus, X, UserPlus, UserMinus, ArrowUpDown,
    AlertCircle, Loader2, UserCheck, UserX, Timer
} from 'lucide-react';
import axios from 'axios';

// ── Types ──────────────────────────────────────────────────────────────────────
interface RecruiterMetrics {
    id: number;
    name: string;
    email: string;
    totalAssignedJobs: number;
    sourced: number;
    rejected: number;
    onHold: number;
    dropped: number;
    selected: number;
    placed: number;
    joined: number;
    avgHiringTimeDays: number;
    assignedJobs?: JobAssignment[];
}

interface Summary {
    totalRecruiters: number;
    totalAssigned: number;
    totalUnassigned: number;
    avgAgingDays: number;
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

// ── Animated Number ────────────────────────────────────────────────────────────
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
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + diff * eased);
            setDisplay(current);
            if (progress < 1) requestAnimationFrame(step);
            else ref.current = value;
        };
        requestAnimationFrame(step);
    }, [value, duration]);

    return <>{display.toLocaleString()}{suffix}</>;
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const STYLES = `
  .rd-fade-in { animation: rdFadeIn .4s ease-out both; }
  .rd-fade-in-up { animation: rdFadeInUp .45s ease-out both; }
  @keyframes rdFadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes rdFadeInUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
  .rd-card { transition: box-shadow .2s ease, transform .2s ease; }
  .rd-card:hover { transform:translateY(-1px); box-shadow:0 6px 20px -6px rgba(0,0,0,.09); }
  .rd-row { transition: background-color .12s ease; }
  .rd-row:hover { background-color: #f8fafc; }
  .rd-modal-overlay { animation: rdOverlayIn .18s ease both; }
  @keyframes rdOverlayIn { from { opacity:0 } to { opacity:1 } }
  .rd-modal-content { animation: rdModalIn .22s ease both; }
  @keyframes rdModalIn { from { opacity:0; transform:scale(.97) translateY(6px) } to { opacity:1; transform:scale(1) translateY(0) } }
  .rd-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:32px; }
  .rd-filter-btn { transition: all .15s ease; }
  .rd-filter-btn.active { background-color:#0f172a; color:#fff; }
  .rd-filter-btn:not(.active) { background-color:transparent; color:#64748b; }
  .rd-filter-btn:not(.active):hover { background-color:#f1f5f9; color:#1e293b; }
`;

// ── Main Component ─────────────────────────────────────────────────────────────
const RecruitersDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<RecruiterMetrics[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalRecruiters: 0, totalAssigned: 0, totalUnassigned: 0, avgAgingDays: 0 });
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<keyof RecruiterMetrics>('sourced');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'this_week' | 'this_month' | 'last_month'>('this_month');
    const [mounted, setMounted] = useState(false);
    const [modalRecruiter, setModalRecruiter] = useState<RecruiterMetrics | null>(null);
    const [assignBusy, setAssignBusy] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [jobSearch, setJobSearch] = useState('');
    const [toastMsg, setToastMsg] = useState('');

    const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    const token = useCallback(() =>
        sessionStorage.getItem('fluidjobs_token') ||
        localStorage.getItem('superadmin_token') ||
        localStorage.getItem('token'), []);

    // ── Data fetching ──────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const auth = { headers: { Authorization: `Bearer ${token()}` } };

            const [mRes, jRes] = await Promise.all([
                axios.get<{ success: boolean; summary: Summary; metrics: RecruiterMetrics[] }>(
                    `${API}/api/recruiters-analytics`, { ...auth, params: { period: selectedPeriod } }
                ),
                axios.get<{ success: boolean; jobs: Job[] }>(`${API}/api/jobs`, auth),
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
            if (mRes.data?.summary) setSummary(mRes.data.summary);
            if (jRes.data?.jobs) setAllJobs(jRes.data.jobs);
        } catch (err: any) {
            console.error('Failed to fetch data:', err);
            setFetchError(err?.response?.data?.message || 'Failed to load recruiter data. Please check your connection.');
        } finally {
            setLoading(false);
            setTimeout(() => setMounted(true), 60);
        }
    }, [API, selectedPeriod, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Sync modal recruiter on metrics update
    useEffect(() => {
        if (modalRecruiter) {
            const updated = metrics.find(m => m.id === modalRecruiter.id);
            if (updated) setModalRecruiter(updated);
        }
    }, [metrics]);

    // ── Toast ──────────────────────────────────────────────────────────────────
    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 2500);
    };

    // ── Assign / Unassign ──────────────────────────────────────────────────────
    const handleAssign = async (recruiterId: number, jobId: number) => {
        try {
            setAssignBusy(true);
            await axios.post(`${API}/api/recruiters/${recruiterId}/assign-job`, { jobId },
                { headers: { Authorization: `Bearer ${token()}` } });
            showToast('Job assigned successfully');
            await fetchData();
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
        } catch { showToast('Failed to unassign job'); }
        finally { setAssignBusy(false); }
    };

    // ── Sort / Filter ──────────────────────────────────────────────────────────
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
            return sortDir === 'asc'
                ? (av < bv ? -1 : av > bv ? 1 : 0)
                : (av > bv ? -1 : av < bv ? 1 : 0);
        });
        return items;
    }, [metrics, sortKey, sortDir]);

    const filtered = sorted.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Sort icon helper ───────────────────────────────────────────────────────
    const SortIcon: React.FC<{ col: keyof RecruiterMetrics }> = ({ col }) => {
        if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-40 transition-opacity" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3 h-3 ml-1 text-slate-900" />
            : <ChevronDown className="w-3 h-3 ml-1 text-slate-900" />;
    };

    const statusDot = (status: string) =>
        status === 'Active' || status === 'active' ? 'bg-emerald-400' :
            status === 'Draft' || status === 'draft' ? 'bg-amber-400' : 'bg-slate-300';

    const initials = (name: string) => {
        const parts = name.split(' ');
        return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
    };

    // ── KPI Cards config ───────────────────────────────────────────────────────
    const kpiCards = [
        {
            label: 'Total Recruiters',
            value: summary.totalRecruiters,
            icon: Users,
            suffix: '',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
        },
        {
            label: 'Assigned Candidates',
            value: summary.totalAssigned,
            icon: UserCheck,
            suffix: '',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
        },
        {
            label: 'Unassigned Candidates',
            value: summary.totalUnassigned,
            icon: UserX,
            suffix: '',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
        },
        {
            label: 'Avg Candidate Aging',
            value: summary.avgAgingDays,
            icon: Clock,
            suffix: 'd',
            iconBg: 'bg-slate-50',
            iconColor: 'text-slate-500',
        },
    ];

    // ── Table columns config ───────────────────────────────────────────────────
    type SortableKey = keyof RecruiterMetrics;
    const tableCols: { col: SortableKey | null; label: string }[] = [
        { col: 'name', label: 'Recruiter' },
        { col: 'totalAssignedJobs', label: 'Jobs' },
        { col: 'sourced', label: 'Sourced' },
        { col: 'rejected', label: 'Rejected' },
        { col: 'onHold', label: 'On Hold' },
        { col: 'dropped', label: 'Dropped' },
        { col: 'selected', label: 'Selected' },
        { col: 'placed', label: 'Placed' },
        { col: 'joined', label: 'Joined' },
        { col: 'avgHiringTimeDays', label: 'Avg Hiring Time' },
        { col: null, label: '' },
    ];

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="h-full bg-white overflow-y-auto">
            <style>{STYLES}</style>

            {/* ─── Toast ───────────────────────────────────────────────────── */}
            {toastMsg && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rd-fade-in">
                    <div className="bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-lg">
                        {toastMsg}
                    </div>
                </div>
            )}

            {/* ─── Error Banner ─────────────────────────────────────────────── */}
            {fetchError && (
                <div className="max-w-[1400px] mx-auto px-8 pt-4">
                    <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={1.8} />
                        <span className="text-[13px] text-red-600">{fetchError}</span>
                        <button onClick={() => setFetchError('')} className="ml-auto text-red-300 hover:text-red-500 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Header ──────────────────────────────────────────────────── */}
            <div className="border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="max-w-[1400px] mx-auto px-8 py-5">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-[22px] font-semibold text-slate-900 tracking-[-0.02em]">
                                Recruiter Dashboard
                            </h1>
                            <p className="text-[13px] text-slate-400 mt-0.5">
                                Recruiter performance and hiring pipeline metrics
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-slate-400" strokeWidth={1.8} />
                                <input
                                    type="text"
                                    placeholder="Search recruiters…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9 pl-9 pr-3 w-52 rounded-lg border border-slate-200 bg-slate-50/60 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                                />
                            </div>

                            {/* Period Dropdown */}
                            <div className="relative">
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value as any)}
                                    className="rd-select h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all shadow-sm appearance-none"
                                >
                                    <option value="today">Today</option>
                                    <option value="this_week">This Week</option>
                                    <option value="this_month">This Month</option>
                                    <option value="last_month">Last Month</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-8 py-7 space-y-7">

                {/* ─── KPI Cards ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((card, i) => (
                        <div
                            key={i}
                            className="rd-card bg-white border border-slate-100 rounded-2xl p-5 rd-fade-in-up"
                            style={{ animationDelay: `${i * 55}ms` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wide leading-none">
                                    {card.label}
                                </span>
                                <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    <card.icon className={`w-4 h-4 ${card.iconColor}`} strokeWidth={1.8} />
                                </div>
                            </div>
                            <p className="text-[28px] font-semibold text-slate-900 tracking-tight leading-none">
                                {mounted ? <AnimatedNumber value={card.value} suffix={card.suffix} /> : '—'}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ─── Performance Table ───────────────────────────────────── */}
                <div
                    className="border border-slate-100 rounded-2xl overflow-hidden rd-fade-in-up bg-white"
                    style={{ animationDelay: '250ms' }}
                >
                    {/* Table header bar */}
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-[14px] font-semibold text-slate-900">Recruiter Performance</h2>
                            <p className="text-[12px] text-slate-400 mt-0.5">
                                {selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'this_week' ? 'This week' : selectedPeriod === 'this_month' ? 'This month' : 'Last month'} · {filtered.length} recruiter{filtered.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    {tableCols.map(({ col, label }, ci) => (
                                        <th
                                            key={ci}
                                            onClick={() => col && toggleSort(col)}
                                            className={`px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col ? 'cursor-pointer select-none group' : ''} ${ci === 0 ? 'pl-6 min-w-[200px]' : ''}`}
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
                                    <tr><td colSpan={tableCols.length} className="py-16 text-center">
                                        <Loader2 className="w-5 h-5 text-slate-300 animate-spin mx-auto" />
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={tableCols.length} className="py-16 text-center text-sm text-slate-400">
                                        No recruiters match your search
                                    </td></tr>
                                ) : filtered.map((r) => (
                                    <React.Fragment key={r.id}>
                                        <tr className="rd-row border-b border-slate-50 last:border-0">
                                            {/* Recruiter */}
                                            <td className="pl-6 pr-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                                                        {initials(r.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 truncate">{r.name}</p>
                                                        <p className="text-[11px] text-slate-400 truncate">{r.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Jobs */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{r.totalAssignedJobs}</span>
                                                    <button
                                                        onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                                                        className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="View assigned jobs"
                                                    >
                                                        {expandedId === r.id ? 'hide' : 'view'}
                                                    </button>
                                                </div>
                                            </td>
                                            {/* Sourced */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-slate-900 tabular-nums">{r.sourced}</span>
                                            </td>
                                            {/* Rejected */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-slate-600 tabular-nums">{r.rejected}</span>
                                            </td>
                                            {/* On Hold */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-slate-600 tabular-nums">{r.onHold}</span>
                                            </td>
                                            {/* Dropped */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-slate-600 tabular-nums">{r.dropped}</span>
                                            </td>
                                            {/* Selected */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-medium text-emerald-700 tabular-nums">{r.selected}</span>
                                            </td>
                                            {/* Placed */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-emerald-700 tabular-nums">{r.placed}</span>
                                            </td>
                                            {/* Joined */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-slate-900 tabular-nums">{r.joined}</span>
                                            </td>
                                            {/* Avg Hiring Time */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Timer className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" strokeWidth={1.8} />
                                                    <span className="text-sm text-slate-600 tabular-nums">{r.avgHiringTimeDays}d</span>
                                                </div>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-5 py-4 pr-6">
                                                <button
                                                    onClick={() => setModalRecruiter(r)}
                                                    className="text-[12px] font-medium text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-all hover:bg-slate-50 whitespace-nowrap"
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded jobs row */}
                                        {expandedId === r.id && (
                                            <tr className="bg-slate-50/60">
                                                <td colSpan={tableCols.length} className="px-6 py-4">
                                                    <div className="ml-11 space-y-2">
                                                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                            Assigned Jobs · {r.assignedJobs?.length || 0}
                                                        </p>
                                                        {r.assignedJobs && r.assignedJobs.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {r.assignedJobs.map(j => (
                                                                    <div key={j.id} className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm group/tag">
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(j.status)}`} />
                                                                        <span className="text-slate-700 font-medium text-[13px]">{j.title}</span>
                                                                        <span className="text-[11px] text-slate-400">{j.candidatesCount || 0}</span>
                                                                        <button
                                                                            onClick={() => handleUnassign(r.id, j.id)}
                                                                            disabled={assignBusy}
                                                                            className="ml-0.5 p-0.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/tag:opacity-100 disabled:opacity-50"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[13px] text-slate-400">No jobs assigned</p>
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

                    {/* Table footer */}
                    <div className="px-6 py-3 border-t border-slate-50 text-[12px] text-slate-400 bg-slate-50/30">
                        Showing <span className="font-medium text-slate-600">{filtered.length}</span> of {metrics.length} recruiters
                    </div>
                </div>
            </div>

            {/* ─── Job Assignment Modal ─────────────────────────────────────── */}
            {modalRecruiter && (
                <div className="fixed inset-0 z-50 rd-modal-overlay" onClick={() => setModalRecruiter(null)}>
                    <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
                    <div className="relative flex items-center justify-center min-h-screen p-4">
                        <div
                            className="rd-modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                                        {initials(modalRecruiter.name)}
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-semibold text-slate-900">{modalRecruiter.name}</h3>
                                        <p className="text-[12px] text-slate-400">Manage job assignments</p>
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
                                        <div className="space-y-1">
                                            {modalRecruiter.assignedJobs.map(j => (
                                                <div key={j.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors group">
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
                                                        <UserMinus className="w-3 h-3" /> Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-7 text-center">
                                            <AlertCircle className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
                                            <p className="text-sm text-slate-400">No jobs assigned yet</p>
                                        </div>
                                    )}
                                </div>

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
                                                className="h-7 pl-8 pr-3 w-44 rounded-lg border border-slate-200 bg-slate-50/60 text-[12px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5 max-h-[260px] overflow-y-auto pr-1">
                                        {allJobs
                                            .filter(j => !modalRecruiter.assignedJobs?.some(aj => aj.id === j.id))
                                            .filter(j => j.title.toLowerCase().includes(jobSearch.toLowerCase()))
                                            .map(j => (
                                                <div key={j.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors group">
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
                                                        <UserPlus className="w-3 h-3" /> Assign
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end flex-shrink-0">
                                <button
                                    onClick={() => setModalRecruiter(null)}
                                    className="h-9 px-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitersDashboard;
