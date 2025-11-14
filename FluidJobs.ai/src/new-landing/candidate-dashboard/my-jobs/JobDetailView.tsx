import React from 'react';
import { UserPlus, Bookmark, Calendar, ExternalLink } from 'lucide-react';
import { Job } from './jobsData';

interface JobDetailViewProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onBack: () => void;
  themeState?: 'light' | 'dark';
}

const JobDetailView: React.FC<JobDetailViewProps> = ({ job, isSaved, onToggleSave, onBack, themeState = 'light' }) => {
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6b7280' : '#9ca3af';
  const sectionBg = themeState === 'light' ? '#F9FAFB' : '#111827';
  const hoverBg = themeState === 'light' ? '#F3F4F6' : '#374151';
  const backBtnBg = themeState === 'light' ? '#E5E7EB' : '#374151';
  const backBtnHover = themeState === 'light' ? '#D1D5DB' : '#4B5563';
  
  return (
    <div className="rounded-3xl shadow-xl w-full max-w-5xl mx-auto p-6 md:p-10" style={{ backgroundColor: cardBg }}>
      {/* Company Logo and Header */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          FL
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1" style={{ color: textPrimary }}>{job.title}</h1>
          <p className="text-sm font-semibold" style={{ color: textSecondary }}>Posted on: {job.postedDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
            <UserPlus className="w-4 h-4" />
            <span>Apply Now</span>
          </button>
          <button 
            onClick={() => onToggleSave(job.id)}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase" style={{ color: textSecondary }}>Job Type</p>
          <p className="text-sm font-semibold mt-1" style={{ color: textPrimary }}>{job.jobType}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase" style={{ color: textSecondary }}>Industry</p>
          <p className="text-sm font-semibold mt-1" style={{ color: textPrimary }}>{job.industry}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase" style={{ color: textSecondary }}>CTC</p>
          <p className="text-sm font-semibold mt-1" style={{ color: textPrimary }}>{job.ctc}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase" style={{ color: textSecondary }}>Location</p>
          <p className="text-sm font-semibold mt-1" style={{ color: textPrimary }}>{job.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Description and Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-base font-bold uppercase mb-3" style={{ color: textPrimary }}>Description</h3>
            <p className="text-sm font-medium leading-relaxed" style={{ color: textSecondary }}>
              {job.description}
            </p>
          </div>

          {/* Eligible Skills */}
          <div>
            <h3 className="text-base font-bold uppercase mb-3" style={{ color: textPrimary }}>Eligible Skills</h3>
            <div className="flex flex-wrap gap-3">
              {job.skills.map((skill, index) => (
                <span key={index} className="px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-400 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Registration Schedule and About */}
        <div className="space-y-6">
          {/* Registration Schedule */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: sectionBg }}>
            <h3 className="text-base font-bold uppercase mb-3" style={{ color: textPrimary }}>Registration Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold" style={{ color: textSecondary }}>Opens:</p>
                  <p className="text-sm font-semibold" style={{ color: textPrimary }}>11:00AM, 26 Oct 2025</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold" style={{ color: textSecondary }}>Closes:</p>
                  <p className="text-sm font-semibold" style={{ color: textPrimary }}>11:00AM, 28 Oct 2025</p>
                </div>
              </div>
            </div>
          </div>

          {/* About the Organization */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: sectionBg }}>
            <h3 className="text-base font-bold uppercase mb-3" style={{ color: textPrimary }}>About the Organization</h3>
            <p className="text-sm font-medium leading-relaxed mb-3" style={{ color: textSecondary }}>
              FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable.
            </p>
            <button className="flex items-center space-x-1 text-blue-600 font-semibold text-sm hover:underline">
              <span>View Website</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button 
          onClick={onBack} 
          className="px-6 py-2 font-semibold rounded-lg transition"
          style={{ backgroundColor: backBtnBg, color: textPrimary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = backBtnHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = backBtnBg}
        >
          Back to Jobs
        </button>
      </div>
    </div>
  );
};

export default JobDetailView;
