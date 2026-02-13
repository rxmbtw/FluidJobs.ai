import React, { useState } from 'react';
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
  Settings 
} from 'lucide-react';

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

interface NewJobSpecificDashboardProps {
  jobId?: string;
  jobTitle?: string;
}

const NewJobSpecificDashboard: React.FC<NewJobSpecificDashboardProps> = ({ jobId, jobTitle }) => {
  const [timeFilter, setTimeFilter] = useState('30_days');

  const funnelStages = [
    { label: 'Profiles', count: 1250 },
    { label: 'CV Shortlist', count: 480 },
    { label: 'Assignment', count: 320 },
    { label: 'L1 Tech', count: 180 },
    { label: 'L2 Tech', count: 95 },
    { label: 'L3 Tech', count: 62 },
    { label: 'L4 Tech', count: 45 },
    { label: 'HR Round', count: 32 },
    { label: 'Management', count: 28 },
    { label: 'Selected', count: 24 },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'Sarah Parker',
      role: 'Recruiter',
      action: 'moved candidate to L2 Technical',
      candidate: 'John Smith',
      timestamp: '2 minutes ago',
      icon: ArrowRight,
      color: 'text-blue-600'
    },
    {
      id: 2,
      user: 'Mark Chen',
      role: 'Hiring Manager',
      action: 'approved candidate for HR Round',
      candidate: 'Emily Davis',
      timestamp: '15 minutes ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 3,
      user: 'Alex Thompson',
      role: 'HR',
      action: 'scheduled interview with',
      candidate: 'Michael Brown',
      timestamp: '1 hour ago',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      id: 4,
      user: 'David Blake',
      role: 'SuperAdmin',
      action: 'updated job requirements',
      candidate: null,
      timestamp: '2 hours ago',
      icon: Settings,
      color: 'text-orange-600'
    }
  ];

  const totalReceived = funnelStages[0].count;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Executive Summary</h1>
          <p className="text-sm text-gray-600">Real-time overview of your recruitment pipeline{jobTitle && ` for ${jobTitle}`}.</p>
        </div>
        
        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
          {['Today', '7 Days', '30 Days', 'Custom'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t.toLowerCase().replace(' ', '_'))}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeFilter === t.toLowerCase().replace(' ', '_')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total Profiles" value="1,250" trend="12%" trendUp icon={Inbox} color="blue" />
        <KPICard label="Active Candidates" value="458" trend="5%" trendUp icon={Clock} color="yellow" />
        <KPICard label="Shortlisted" value="120" trend="2%" trendUp={false} icon={UserCheck} color="blue" />
        <KPICard label="Rejected" value="642" trend="8%" trendUp icon={UserX} color="red" />
        <KPICard label="Selected" value="32" trend="15%" trendUp icon={Star} color="green" />
        <KPICard label="Offer Drop-offs" value="4" trend="1%" trendUp={false} icon={UserMinus} color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-gray-900">Recruitment Funnel</h3>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Conversion rate: 1.44%</span>
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
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto">
            {recentActivities.map((activity) => {
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
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last updated: Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewJobSpecificDashboard;