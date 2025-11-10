import React from 'react';
import { Bookmark, UserPlus } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

interface Job {
  id: string;
  title: string;
  companyInitial: string;
  postedOn: string;
  type: string;
  ctc: string;
  industry: string;
  location: string;
  status: string;
}

interface JobCardProps {
  job: Job;
  onViewDetails?: (jobId: string) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  isApplied?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails, isSaved, onToggleSave, isApplied }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'registrations closing soon':
      case 'interviewing phase':
        return '#F59E0B';
      case 'open until filled':
      case 'new opening!':
        return '#10B981';
      case 'registrations closed':
        return '#EF4444';
      default:
        return '#9ca3af';
    }
  };

  return (
    <div 
      onClick={() => onViewDetails?.(job.id)}
      className="p-6 rounded-xl shadow-xl transition duration-300 cursor-pointer"
      style={{ 
        backgroundColor: colors.bgCard, 
        border: `1px solid ${colors.border}` 
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div 
            className="w-14 h-14 rounded-lg flex items-center justify-center"
            style={{ 
              backgroundColor: colors.bgCard, 
              border: `1px solid ${colors.border}`
            }}
          >
            <img src="/images/Fluid Live Icon.png" alt="FluidJobs.ai" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{job.title}</h3>
            <p className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Posted on: {job.postedOn}</p>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(job.id); }}
          className="p-2 rounded-full transition" 
          style={{ color: isSaved ? colors.accent : colors.textSecondary }}
        >
          <Bookmark className="w-6 h-6" fill={isSaved ? colors.accent : 'none'} />
        </button>
      </div>

      <div 
        className="grid grid-cols-2 gap-y-3 mb-6 py-4"
        style={{ borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Job Type</span>
          <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{job.type}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>CTC</span>
          <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{job.ctc}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Industry</span>
          <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{job.industry}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Location</span>
          <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{job.location}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <a href="#" onClick={(e) => { e.stopPropagation(); onViewDetails?.(job.id); }} className="text-sm font-semibold underline transition" style={{ color: colors.accent }}>
            View more
          </a>
          <p className="text-xs font-bold mt-1" style={{ color: getStatusColor(job.status) }}>
            {job.status}
          </p>
        </div>
        
        <button 
          className="flex items-center px-4 py-2 font-semibold text-sm rounded-xl shadow-lg transition duration-150"
          style={{ backgroundColor: isApplied ? '#10B981' : colors.accent, color: '#FFFFFF' }}
        >
          <UserPlus className="w-4 h-4 mr-1" />
          {isApplied ? 'Applied' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
