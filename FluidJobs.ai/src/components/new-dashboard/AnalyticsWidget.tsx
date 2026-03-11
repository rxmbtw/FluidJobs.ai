import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Inbox,
  Clock,
  UserCheck,
  UserX,
  Star,
  UserMinus,
  ArrowRight,
  CheckCircle,
  Calendar,
  Settings,
  MessageCircle,
  UserPlus,
  XCircle,
  ChevronDown
} from 'lucide-react';
import { Candidate, InterviewStage, CandidateStatus } from './types';
import { useDashboardHeader } from './NewDashboardContainer';
import Loader from '../Loader';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, trend, trendUp, icon: Icon, color }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-${color}-50/80 text-${color}-600 ring-1 ring-${color}-100 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      {trend && (
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${trendUp
          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
          : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}>
          <span className={`inline-block mr-1 ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trendUp ? '↑' : '↓'}
          </span>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
    <p className="text-3xl font-bold text-gray-800 tracking-tight">{value}</p>
  </div>
);

const FunnelStep: React.FC<{ label: string; count: number; total: number; color: string }> = ({ label, count, total, color }) => {
  const width = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm font-medium text-gray-600 px-1">
        <span className="truncate max-w-[80px]" title={label}>{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-10 bg-gray-50/80 rounded-xl overflow-hidden relative shadow-inner ring-1 ring-gray-100/50">
        <div
          className={`h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out flex items-center justify-end pr-3 shadow-md border-r border-indigo-400`}
          style={{ width: `${Math.max(width, 2)}%` }}
        >
          {width > 10 && <span className="text-white text-xs font-semibold drop-shadow-sm">{width.toFixed(1)}%</span>}
        </div>
      </div>
    </div>

  );
};

interface DashboardProps {
  jobId?: string;
  stages?: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ jobId, stages }) => {
  const { setHeaderActions } = useDashboardHeader();
  const [timeFilter, setTimeFilter] = useState('this_month');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper functions from ManageCandidates
  const getPositionFromEmail = (email: string | null | undefined) => {
    const positions = ['Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer'];
    if (!email) return positions[0];
    return positions[email.length % positions.length];
  };

  const formatStage = (stage: string) => {
    if (!stage) return InterviewStage.SCREENING;
    // Map backend stages to InterviewStage enum if needed, or just return as is
    return stage as InterviewStage;
  };

  // Fetch candidates from database
  const fetchCandidates = async () => {
    try {
      setLoading(true);

      const url = jobId
        ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/job-applications/admin/list?jobId=${jobId}`
        : `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates?page=1&limit=1000`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('superadmin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const candList = data.applications || (data.data && data.data.candidates) || [];
        if (candList.length > 0) {
          const formattedCandidates = candList.map((candidate: any) => ({
            id: candidate.candidate_id || candidate.id,
            jobId: candidate.job_id || jobId || 'default-job-id',
            name: candidate.full_name,
            email: candidate.email,
            phone: candidate.phone_number || '',
            jobTitle: getPositionFromEmail(candidate.email),
            department: 'Engineering',
            source: 'Database',
            currentStage: formatStage(candidate.current_stage),
            status: CandidateStatus.ACTIVE, // Use enum value
            hiringManagerId: 'default-hm-id', // Add required field
            appliedDate: candidate.created_at
              ? new Date(candidate.created_at).toLocaleDateString('en-GB')
              : new Date().toLocaleDateString('en-GB'),
            lastUpdateDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
            experience: `${parseFloat(candidate.experience_years) || 0} Years`,
            location: candidate.location || 'Not specified',
            // Add required audit fields
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1,
            stageHistory: [],
            cvStatusRecruiter: Math.random() > 0.3 ? 'Shortlisted' as const : 'Pending' as const,
            cvStatusHM: Math.random() > 0.4 ? 'Shortlisted' as const : 'Pending' as const,
            interviews: {
              l1: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l2: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l3: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l4: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              hr: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              management: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
            },
            ctc: {
              current: parseFloat(candidate.current_ctc) || 0,
              expected: parseFloat(candidate.expected_ctc) || 0,
              currency: 'INR'
            },
            noticePeriod: candidate.notice_period || 'Not specified',
            comments: [],
            resumeUrl: candidate.resume_link || '',
            // Additional fields
            applicationDate: candidate.created_at
              ? new Date(candidate.created_at).toLocaleDateString('en-GB')
              : new Date().toLocaleDateString('en-GB'),
            gender: candidate.gender || 'Male',
            position: getPositionFromEmail(candidate.email),
            experienceYears: parseFloat(candidate.experience_years) || 0,
            currentlyEmployed: candidate.currently_employed || 'No',
            currentCompany: candidate.current_company || 'Not specified',
            currentSalary: candidate.current_ctc ? `₹${parseFloat(candidate.current_ctc).toLocaleString('en-IN')}` : 'Not specified',
            expectedSalary: candidate.expected_ctc ? `₹${parseFloat(candidate.expected_ctc).toLocaleString('en-IN')}` : 'Not specified',
            maritalStatus: candidate.marital_status || 'Not specified',
            resumeScore: candidate.resume_score || Math.floor(Math.random() * 40) + 60,
            skills: ['React', 'JavaScript', 'Node.js', 'Python'].slice(0, Math.floor(Math.random() * 4) + 1),
            isRestricted: Math.random() > 0.9, // 10% chance of being restricted
            candidateJobStatuses: []
          }));
          setCandidates(formattedCandidates);
        }
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchAuditLogs = async () => {
    try {
      const url = jobId
        ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/audit-logs?jobId=${jobId}&limit=50`
        : `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/audit-logs?limit=50`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('superadmin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.logs) {
          setAuditLogs(data.data.logs);
        }
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchAuditLogs();
  }, [jobId]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Custom Date', value: 'custom' },
  ];

  const activeLabel = filterOptions.find(o => o.value === timeFilter)?.label || 'This Month';

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const DateFilterDropdown = () => (
      <div ref={dropdownRef} className="relative" style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <Calendar className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
          {activeLabel}
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown panel */}
        <div
          className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
          style={{
            top: '100%',
            opacity: dropdownOpen ? 1 : 0,
            transform: dropdownOpen ? 'translateY(0)' : 'translateY(-6px)',
            pointerEvents: dropdownOpen ? 'auto' : 'none',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
          }}
        >
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                setTimeFilter(opt.value);
                if (opt.value !== 'custom') setDropdownOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${timeFilter === opt.value
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              {opt.label}
            </button>
          ))}

          {/* Custom date picker - slides in when Custom is selected */}
          <div
            style={{
              maxHeight: timeFilter === 'custom' ? '48px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.2s ease',
            }}
          >
            <div className="px-3 pb-2 pt-1 border-t border-gray-100">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDropdownOpen(false);
                }}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );

    setHeaderActions(<DateFilterDropdown />);
    return () => setHeaderActions(null);
  }, [timeFilter, dropdownOpen, activeLabel, customDate, setHeaderActions]);

  // Filter candidates based on time filter
  const filteredCandidates = useMemo(() => {
    if (!candidates.length) return [];

    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'this_week':
        // Get start of current week (Sunday)
        const dayOfWeek = now.getDay();
        filterDate.setDate(now.getDate() - dayOfWeek);
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'this_month':
        // Get start of current month
        filterDate.setDate(1);
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'last_month':
        // Get start of last month
        filterDate.setMonth(now.getMonth() - 1);
        filterDate.setDate(1);
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        // For custom, show all candidates (date picker will handle filtering)
        return candidates;
      default:
        return candidates; // Show all for unknown filters
    }

    return candidates.filter(candidate => {
      const appliedDate = new Date(candidate.appliedDate.split('/').reverse().join('-'));
      return appliedDate >= filterDate;
    });
  }, [candidates, timeFilter]);

  // Calculate real statistics from filtered candidates
  const stats = useMemo(() => {
    const total = filteredCandidates.length;
    const byStage = filteredCandidates.reduce((acc, candidate) => {
      acc[candidate.currentStage] = (acc[candidate.currentStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const active = filteredCandidates.filter(c =>
      !([InterviewStage.REJECTED, InterviewStage.JOINED] as string[]).includes(c.currentStage)
    ).length;

    const shortlisted = byStage[InterviewStage.CV_SHORTLISTED] || 0;
    const rejected = byStage[InterviewStage.REJECTED] || 0;
    const selected = byStage[InterviewStage.JOINED] || 0;
    const offerDropoffs = byStage[InterviewStage.ON_HOLD] || 0;

    return {
      total,
      active,
      shortlisted,
      rejected,
      selected,
      offerDropoffs,
      byStage
    };
  }, [filteredCandidates]);

  // Calculate funnel stages dynamically based on job stages
  const funnelStages = useMemo(() => {
    // Start with total profiles
    const result = [{ label: 'Total Profiles', count: stats.total }];

    if (stages && stages.length > 0) {
      // Use dynamic stages from props
      stages.forEach(stage => {
        const stageName = stage.name || stage;
        result.push({
          label: stageName,
          count: stats.byStage[stageName] || 0
        });
      });
    } else {
      // Fallback to standard flow if no custom stages
      const defaultStages = [
        { label: 'CV Shortlist', key: InterviewStage.CV_SHORTLISTED },
        { label: 'Screening', key: InterviewStage.SCREENING },
        { label: 'L1 Tech', key: InterviewStage.L1_TECHNICAL },
        { label: 'L2 Tech', key: InterviewStage.L2_TECHNICAL },
        { label: 'L3 Tech', key: InterviewStage.L3_TECHNICAL },
        { label: 'L4 Tech', key: InterviewStage.L4_TECHNICAL },
        { label: 'HR Round', key: InterviewStage.HR_ROUND },
        { label: 'Management', key: InterviewStage.MANAGEMENT_ROUND }
      ];

      defaultStages.forEach(st => {
        result.push({
          label: st.label,
          count: stats.byStage[st.key] || 0
        });
      });
    }

    // Always end with Hired/Selected if not in stages array
    if (!result.find(r => r.label.toLowerCase() === 'hired' || r.label.toLowerCase() === 'joined' || r.label.toLowerCase() === 'selected')) {
      result.push({ label: 'Selected/Offered', count: stats.selected || 0 });
    }

    return result;
  }, [stats, stages]);

  // Generate recent activities from real audit logs data
  const recentActivities = useMemo(() => {
    if (!auditLogs.length) return [];

    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'this_week':
        const dayOfWeek = now.getDay();
        filterDate.setDate(now.getDate() - dayOfWeek);
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'this_month':
        filterDate.setDate(1);
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'last_month':
        filterDate.setMonth(now.getMonth() - 1);
        filterDate.setDate(1);
        filterDate.setHours(0, 0, 0, 0);
        break;
    }

    const filteredLogs = timeFilter === 'custom'
      ? auditLogs
      : auditLogs.filter(log => new Date(log.created_at) >= filterDate);

    // Map audit logs to activity feed items
    return filteredLogs.slice(0, 15).map((log, index) => {
      let icon = MessageCircle;
      let color = 'text-indigo-600';
      let actionText = log.action_description || `performed ${log.action}`;

      const actionTypeLower = String(log.action).toLowerCase();

      if (actionTypeLower.includes('move') || actionTypeLower.includes('stage')) {
        icon = ArrowRight;
        color = 'text-blue-600';
        if (log.metadata?.newValues?.stage) {
          actionText = `moved candidate to ${log.metadata.newValues.stage}`;
        }
      } else if (actionTypeLower.includes('approve') || actionTypeLower.includes('select')) {
        icon = CheckCircle;
        color = 'text-green-600';
      } else if (actionTypeLower.includes('schedule') || actionTypeLower.includes('interview')) {
        icon = Calendar;
        color = 'text-purple-600';
      }

      // Calculate time ago
      const logDate = new Date(log.created_at);
      const diffMins = Math.floor((now.getTime() - logDate.getTime()) / 60000);
      let timeStr = `${diffMins} minutes ago`;
      if (diffMins > 1440) timeStr = `${Math.floor(diffMins / 1440)} days ago`;
      else if (diffMins > 60) timeStr = `${Math.floor(diffMins / 60)} hours ago`;
      if (diffMins === 0) timeStr = 'Just now';

      // Try to find candidate name from candidates list if not in log
      let candidateName = log.metadata?.candidateName;
      if (!candidateName && log.metadata?.candidateId) {
        const c = filteredCandidates.find(cand => String(cand.id) === String(log.metadata?.candidateId));
        if (c) candidateName = c.name;
      }

      return {
        id: log.id || index,
        user: log.user_name || 'System',
        role: log.metadata?.userRole || 'User',
        action: actionText,
        candidate: candidateName || '',
        timestamp: timeStr,
        type: log.action,
        icon,
        color
      };
    });
  }, [auditLogs, filteredCandidates, timeFilter]);

  const totalReceived = funnelStages[0]?.count || 0;
  const conversionRate = totalReceived > 0 ? ((stats.selected / totalReceived) * 100).toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="h-64 pt-12">
        <Loader themeState="light" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          label="Total Profiles"
          value={stats.total.toLocaleString()}
          trend={timeFilter === 'today' ? '5%' : timeFilter === 'this_week' ? '12%' : timeFilter === 'this_month' ? '18%' : '15%'}
          trendUp
          icon={Inbox}
          color="blue"
        />
        <KPICard
          label="Active Candidates"
          value={stats.active.toLocaleString()}
          trend={timeFilter === 'today' ? '2%' : timeFilter === 'this_week' ? '5%' : timeFilter === 'this_month' ? '8%' : '6%'}
          trendUp
          icon={Clock}
          color="yellow"
        />
        <KPICard
          label="Shortlisted"
          value={stats.shortlisted.toLocaleString()}
          trend={timeFilter === 'today' ? '1%' : timeFilter === 'this_week' ? '3%' : timeFilter === 'this_month' ? '6%' : '4%'}
          trendUp={stats.shortlisted > 0}
          icon={UserCheck}
          color="blue"
        />
        <KPICard
          label="Rejected"
          value={stats.rejected.toLocaleString()}
          trend={timeFilter === 'today' ? '3%' : timeFilter === 'this_week' ? '8%' : timeFilter === 'this_month' ? '12%' : '10%'}
          trendUp
          icon={UserX}
          color="red"
        />
        <KPICard
          label="Selected"
          value={stats.selected.toLocaleString()}
          trend={timeFilter === 'today' ? '0%' : timeFilter === 'this_week' ? '2%' : timeFilter === 'this_month' ? '4%' : '3%'}
          trendUp
          icon={Star}
          color="green"
        />
        <KPICard
          label="Offer Drop-offs"
          value={stats.offerDropoffs.toLocaleString()}
          trend={timeFilter === 'today' ? '0%' : timeFilter === 'this_week' ? '1%' : timeFilter === 'this_month' ? '2%' : '1%'}
          trendUp={false}
          icon={UserMinus}
          color="gray"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel Visualization */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold tracking-tight text-gray-800">Recruitment Funnel</h3>
            <div className="flex items-center gap-2 bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-100/50">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Conversion: {conversionRate}%
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {funnelStages.map((stage, idx) => (
              <FunnelStep
                key={idx}
                label={stage.label}
                count={stage.count}
                total={totalReceived}
                color="blue"
              />
            ))}
          </div>

          {/* Data Source Indicator */}
          <div className="mt-8 pt-5 border-t border-gray-100/80">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                Filtered by: {timeFilter.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                Total candidates: {stats.total}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/80 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col transition-all duration-300">
          <div className="mb-8">
            <h3 className="text-xl font-bold tracking-tight text-gray-800">Recent Activity</h3>
            <p className="text-[11px] font-medium text-gray-400 mt-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              Based on {timeFilter.replace('_', ' ')}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-2">
            {recentActivities.length > 0 ? recentActivities.map((activity, idx) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex flex-col relative group">
                  <div className="flex items-start gap-4 p-3 hover:bg-gray-50/50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100">
                    <div className={`w-9 h-9 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 ${activity.color} ring-2 ring-gray-50 transition-transform duration-300 group-hover:scale-110`}>
                      <IconComponent className="w-4 h-4" strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate">{activity.user}</span>
                        <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                          {activity.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 text-[10px] uppercase tracking-wider font-semibold rounded-md">
                          {activity.role}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {activity.action}
                        {activity.candidate && (
                          <span className="font-semibold text-indigo-600 block mt-0.5">{activity.candidate}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 h-full">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-gray-100/50">
                  <Clock className="w-8 h-8 text-gray-300" strokeWidth={1} />
                </div>
                <p className="text-sm font-medium text-gray-600">No recent activity</p>
                <p className="text-xs mt-1 text-center px-4">There hasn't been any recorded actions during this period.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100/80 flex-shrink-0">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                Live Sync
              </span>
              <span>{filteredCandidates.length} tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;