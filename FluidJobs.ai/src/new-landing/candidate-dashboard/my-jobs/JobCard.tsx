import React from 'react';
import { UserPlus, Bookmark } from 'lucide-react';
import { Job } from './jobsData';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onViewDetails: () => void;
  themeState?: 'light' | 'dark';
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onToggleSave,
  onViewDetails,
  themeState = 'light'
}) => {
  const { title, postedDate, jobType, ctc, industry, location, description, skills, id } = job;
  const shortDescription = description.split(' ').slice(0, 12).join(' ');
  
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6b7280' : '#9ca3af';
  const logoBg = themeState === 'light' ? '#E5E7EB' : '#374151';
  const hoverBg = themeState === 'light' ? '#F3F4F6' : '#374151';

  return (
    <div className="rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition" style={{ backgroundColor: cardBg }} onClick={onViewDetails}>
      {/* Company Logo */}
      <div className="relative mb-4">
        <div className="w-full h-28 rounded-lg" style={{ backgroundColor: logoBg }}></div>
        <div className="absolute -bottom-7 left-5 w-14 h-14 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: cardBg }}>
          <div className="w-12 h-12 bg-blue-500 rounded-full text-white flex items-center justify-center text-base font-bold">
            FL
          </div>
        </div>
      </div>

      {/* Job Title and Actions */}
      <div className="flex justify-between items-start mt-9">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1" style={{ color: textPrimary }}>{title}</h3>
          <p className="text-sm" style={{ color: textSecondary }}>Posted on: {postedDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
            <UserPlus className="w-4 h-4" />
            <span>Apply Now</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleSave(id); }} 
            className="p-2 rounded-lg transition"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} style={{ color: isSaved ? '#2563EB' : textSecondary }} />
          </button>
        </div>
      </div>

      {/* Job Metadata */}
      <div className="grid grid-cols-4 gap-4 mt-5 text-sm">
        <div>
          <p className="font-bold uppercase text-xs" style={{ color: textSecondary }}>Job Type</p>
          <p className="font-semibold mt-1" style={{ color: textPrimary }}>{jobType}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-xs" style={{ color: textSecondary }}>CTC</p>
          <p className="font-semibold mt-1" style={{ color: textPrimary }}>{ctc}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-xs" style={{ color: textSecondary }}>Industry</p>
          <p className="font-semibold mt-1" style={{ color: textPrimary }}>{industry}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-xs" style={{ color: textSecondary }}>Location</p>
          <p className="font-semibold mt-1" style={{ color: textPrimary }}>{location}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase mb-2" style={{ color: textPrimary }}>Description</h4>
        <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
          {shortDescription}...{' '}
          <span className="text-blue-500 font-semibold cursor-pointer hover:underline">more</span>
        </p>
      </div>

      {/* Skills */}
      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase mb-2" style={{ color: textPrimary }}>Eligible Skills</h4>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-400 rounded-md">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
