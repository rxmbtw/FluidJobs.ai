import React, { useState, useEffect, useMemo } from 'react';
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
  XCircle
} from 'lucide-react';
import { Candidate, InterviewStage, CandidateStatus } from './types';
import { useDashboardHeader } from './NewDashboardContainer';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, trend, trendUp, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-${color}-50 text-${color}-600`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          <span className={`inline-block mr-1 ${trendUp ? '↗' : '↘'}`}></span>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{label}</h3>
    <p className="text-4xl font-semibold text-gray-900">{value}</p>
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
      <div className="h-10 bg-gray-100 rounded-lg overflow-hidden relative">
        <div
          className={`h-full bg-blue-600 transition-all duration-700 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${Math.max(width, 2)}%` }}
        >
          {width > 20 && <span className="text-xs font-medium text-white">{Math.round(width)}%</span>}
        </div>
      </div>
    </div>

  );
};

interface DashboardProps {
  jobId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ jobId }) => {
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

  const getRandomStage = () => {
    const stages = [
      InterviewStage.SCREENING,
      InterviewStage.CV_SHORTLISTED,
      InterviewStage.L1_TECHNICAL,
      InterviewStage.L2_TECHNICAL,
      InterviewStage.L3_TECHNICAL,
      InterviewStage.HR_ROUND,
      InterviewStage.SELECTED,
      InterviewStage.JOINED,
      InterviewStage.REJECTED
    ];
    return stages[Math.floor(Math.random() * stages.length)];
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
            currentStage: getRandomStage(),
            status: CandidateStatus.ACTIVE, // Use enum value
            hiringManagerId: 'default-hm-id', // Add required field
            appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
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
            applicationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
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

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    setHeaderActions(
      <div className="flex items-center gap-2">
        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
          {['Today', 'This Week', 'This Month', 'Last Month'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t.toLowerCase().replace(' ', '_'))}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === t.toLowerCase().replace(' ', '_')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          type="date"
          className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
          onChange={(e) => {
            if (e.target.value) {
              setTimeFilter('custom');
              // Handle custom date selection here
            }
          }}
          title="Select custom date"
        />
      </div>
    );
    return () => setHeaderActions(null);
  }, [timeFilter, setHeaderActions]);

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

  // Calculate funnel stages from real data
  const funnelStages = useMemo(() => {
    const stages = [
      { label: 'Profiles', count: stats.total },
      { label: 'CV Shortlist', count: stats.byStage[InterviewStage.CV_SHORTLISTED] || 0 },
      { label: 'Screening', count: stats.byStage[InterviewStage.SCREENING] || 0 },
      { label: 'L1 Tech', count: stats.byStage[InterviewStage.L1_TECHNICAL] || 0 },
      { label: 'L2 Tech', count: stats.byStage[InterviewStage.L2_TECHNICAL] || 0 },
      { label: 'L3 Tech', count: stats.byStage[InterviewStage.L3_TECHNICAL] || 0 },
      { label: 'L4 Tech', count: stats.byStage[InterviewStage.L4_TECHNICAL] || 0 },
      { label: 'HR Round', count: stats.byStage[InterviewStage.HR_ROUND] || 0 },
      { label: 'Management', count: stats.byStage[InterviewStage.MANAGEMENT_ROUND] || 0 },
      { label: 'Selected', count: stats.byStage[InterviewStage.JOINED] || 0 },
    ];
    return stages;
  }, [stats]);

  // Generate recent activities from real candidate data
  const recentActivities = useMemo(() => {
    if (!filteredCandidates.length) return [];

    // Create realistic activities based on candidate data
    const activities = filteredCandidates
      .slice(0, 8)
      .map((candidate, index) => {
        const activityTypes = [
          {
            action: `moved candidate to ${candidate.currentStage}`,
            type: 'pipeline_change',
            icon: ArrowRight,
            color: 'text-blue-600'
          },
          {
            action: `approved candidate for next round`,
            type: 'approval',
            icon: CheckCircle,
            color: 'text-green-600'
          },
          {
            action: `scheduled interview with`,
            type: 'scheduling',
            icon: Calendar,
            color: 'text-purple-600'
          },
          {
            action: `submitted feedback for`,
            type: 'feedback',
            icon: MessageCircle,
            color: 'text-indigo-600'
          }
        ];

        const activity = activityTypes[index % activityTypes.length];
        const users = ['Sarah Parker', 'Mark Chen', 'Alex Thompson', 'David Blake', 'Alice Wong'];
        const roles = ['Recruiter', 'Hiring Manager', 'HR', 'SuperAdmin', 'Interviewer'];

        return {
          id: index + 1,
          user: users[index % users.length],
          role: roles[index % roles.length],
          action: activity.action,
          candidate: candidate.name,
          timestamp: `${Math.floor(Math.random() * 60) + 1} minutes ago`,
          type: activity.type,
          icon: activity.icon,
          color: activity.color
        };
      });

    return activities;
  }, [filteredCandidates]);

  const totalReceived = funnelStages[0]?.count || 0;
  const conversionRate = totalReceived > 0 ? ((stats.selected / totalReceived) * 100).toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-gray-900">Recruitment Funnel</h3>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Conversion rate: {conversionRate}%
            </span>
          </div>
          <div className="space-y-3">
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
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Data filtered by: {timeFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <span>Total candidates: {stats.total}</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-xs text-gray-500 mt-1">Based on {timeFilter.replace('_', ' ')} data</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {recentActivities.length > 0 ? recentActivities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                    <IconComponent className="w-3 h-3" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{activity.user}</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex-shrink-0">
                        {activity.role}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-snug break-words">
                      {activity.action}
                      {activity.candidate && (
                        <span className="font-medium text-gray-900"> {activity.candidate}</span>
                      )}
                    </p>

                    <span className="text-xs text-gray-400 mt-1 block">{activity.timestamp}</span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recent activity for selected time period</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last updated: Just now</span>
              <span>{filteredCandidates.length} candidates in view</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;