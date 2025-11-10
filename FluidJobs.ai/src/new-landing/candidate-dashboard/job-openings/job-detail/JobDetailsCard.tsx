import React from 'react';
import { Bookmark } from 'lucide-react';
import { useTheme, getThemeColors } from '../../ThemeContext';

interface JobDetailsCardProps {
  job: {
    title: string;
    postedOn: string;
    type: string;
    ctc: string;
    industry: string;
    location: string;
  };
}

const JobDetailsCard: React.FC<JobDetailsCardProps> = ({ job }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div 
      className="p-6 rounded-xl shadow-lg flex-shrink-0"
      style={{ 
        backgroundColor: colors.bgCard, 
        border: `1px solid ${colors.border}`,
        width: '100%',
        maxWidth: '540px'
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div 
            className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ border: `1px solid ${colors.border}` }}
          >
            <img src="/images/Fluid Live Icon.png" alt="FluidJobs.ai" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {job.title}
            </h3>
            <p className="text-sm font-semibold mt-1" style={{ color: colors.textSecondary }}>
              Posted on: {job.postedOn}
            </p>
          </div>
        </div>
        
        <Bookmark className="w-6 h-6 flex-shrink-0 cursor-pointer" style={{ color: colors.accent }} fill={colors.accent} />
      </div>

      <div 
        className="grid grid-cols-2 gap-y-4 text-sm pt-4"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <div className="flex flex-col">
          <span className="uppercase font-semibold" style={{ color: colors.textSecondary }}>JOB TYPE</span>
          <span className="font-bold" style={{ color: colors.textPrimary }}>{job.type}</span>
        </div>
        
        <div className="flex flex-col text-left sm:text-right">
          <span className="uppercase font-semibold" style={{ color: colors.textSecondary }}>CTC</span>
          <span className="font-bold" style={{ color: colors.textPrimary }}>{job.ctc}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="uppercase font-semibold" style={{ color: colors.textSecondary }}>INDUSTRY</span>
          <span className="font-bold" style={{ color: colors.textPrimary }}>{job.industry}</span>
        </div>
        
        <div className="flex flex-col text-left sm:text-right">
          <span className="uppercase font-semibold" style={{ color: colors.textSecondary }}>LOCATION</span>
          <span className="font-bold" style={{ color: colors.textPrimary }}>{job.location}</span>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsCard;
