import React from 'react';
import { UserPlus, Bookmark, Calendar, ExternalLink } from 'lucide-react';
import { Job } from './jobsData';

interface JobDetailViewProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onBack: () => void;
  themeState?: 'light' | 'dark';
  showSavePopup?: () => void;
}

const JobDetailView: React.FC<JobDetailViewProps> = ({ job, isSaved, onToggleSave, onBack, themeState = 'light', showSavePopup }) => {
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6b7280' : '#9ca3af';
  const sectionBg = themeState === 'light' ? '#F9FAFB' : '#111827';
  const hoverBg = themeState === 'light' ? '#F3F4F6' : '#374151';
  const backBtnBg = themeState === 'light' ? '#E5E7EB' : '#374151';
  const backBtnHover = themeState === 'light' ? '#D1D5DB' : '#4B5563';
  
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden overflow-y-auto pb-32" style={{ maxHeight: 'calc(100vh - 100px)' }}>
        <div className="px-6 py-4">
        {/* Company Banner */}
        <div className="relative mb-4">
          <div className="w-full h-[175px] rounded-[25px] bg-[#D9D9D9]"></div>
          {/* Company Logo Circle */}
          <div className="absolute -bottom-10 left-5 w-[79px] h-[79px] rounded-full bg-white border-[12px] border-[rgba(66,133,244,0.2)] flex items-center justify-center">
            <img src="/images/FLuid Live Icon light theme.png" alt="Company" className="w-[57px] h-[57px]" />
          </div>
        </div>

        {/* Job Title and Apply Button */}
        <div className="mt-12 flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-[20px] font-bold leading-[30px] text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.title}</h3>
            <p className="text-[10px] font-semibold leading-[15px] text-[#6E6E6E] mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Posted on: {job.postedDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#4285F4] rounded-[10px]">
              <span className="text-[12px] font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Apply Now</span>
              <UserPlus className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => { onToggleSave(job.id); if (!isSaved && showSavePopup) showSavePopup(); }}>
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[#4285F4]' : ''}`} style={{ color: isSaved ? '#4285F4' : 'black' }} />
            </button>
          </div>
        </div>

        {/* Job Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>JOB TYPE</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.jobType}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>INDUSTRY</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.industry}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>CTC</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.ctc}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>LOCATION</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.location}</p>
          </div>
        </div>

        {/* Registration Schedule */}
        <div className="mb-6">
          <h4 className="text-[13px] font-semibold leading-[20px] text-[#080808] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>REGISTRATION SCHEDULE</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#008311] mt-0.5" />
              <p className="text-[13px] font-semibold leading-[20px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>Opens: 11:00AM, 25 Oct 2025</p>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#DD0004] mt-0.5" />
              <p className="text-[13px] font-semibold leading-[20px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>Closes: 11:00AM, 29 Oct 2025</p>
            </div>
          </div>
        </div>

        {/* About the Organization */}
        <div className="mb-6">
          <h4 className="text-[13px] font-semibold leading-[20px] text-[#080808] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>ABOUT THE ORGANIZATION</h4>
          <p className="text-[13px] font-semibold leading-[20px] text-[#6E6E6E] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable.
          </p>
          <a href="https://fluid.live/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#4285F4] text-[13px] font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <span>View Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className="text-[13px] font-semibold leading-[20px] text-[#080808] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>DESCRIPTION</h4>
          <p className="text-[13px] font-semibold leading-[20px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {job.description} FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable
          </p>
        </div>

        {/* Eligible Skills */}
        <div className="mb-6">
          <h4 className="text-[13px] font-semibold leading-[20px] text-[#080808] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>ELIGIBLE SKILLS</h4>
          <div className="flex flex-wrap gap-3">
            {job.skills.map((skill, index) => (
              <div key={index} className="px-4 py-1 border border-[#4285F4] rounded-[5px]">
                <span className="text-[13px] font-medium leading-[20px] text-[#4285F4]" style={{ fontFamily: 'Poppins, sans-serif' }}>{skill}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-2xl shadow-xl w-full max-w-4xl mx-auto p-6" style={{ backgroundColor: cardBg, position: 'relative' }}>
        {/* Company Logo and Title */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            FL
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1" style={{ color: textPrimary, fontFamily: 'Poppins' }}>{job.title}</h1>
            <p className="text-sm font-semibold" style={{ color: textSecondary, fontFamily: 'Poppins' }}>Posted on: {job.postedDate}</p>
          </div>
          
          {/* Apply Button and Bookmark - Absolute positioned */}
          <div className="flex items-center space-x-3" style={{ position: 'absolute', top: '24px', right: '24px' }}>
            <button className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition" style={{ fontFamily: 'Poppins' }}>
              <span>Apply Now</span>
              <UserPlus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { onToggleSave(job.id); if (!isSaved && showSavePopup) showSavePopup(); }}
              className="p-2 rounded-lg transition"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-[#4285F4]' : ''}`} style={{ color: isSaved ? '#4285F4' : textPrimary }} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            {/* Job Metadata - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase mb-1" style={{ color: textPrimary, fontFamily: 'Poppins' }}>JOB TYPE</p>
                <p className="text-sm font-semibold" style={{ color: textSecondary, fontFamily: 'Poppins' }}>{job.jobType}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase mb-1" style={{ color: textPrimary, fontFamily: 'Poppins' }}>INDUSTRY</p>
                <p className="text-sm font-semibold" style={{ color: textSecondary, fontFamily: 'Poppins' }}>{job.industry}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase mb-1" style={{ color: textPrimary, fontFamily: 'Poppins' }}>CTC</p>
                <p className="text-sm font-semibold" style={{ color: textSecondary, fontFamily: 'Poppins' }}>{job.ctc}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase mb-1" style={{ color: textPrimary, fontFamily: 'Poppins' }}>LOCATION</p>
                <p className="text-sm font-semibold" style={{ color: textSecondary, fontFamily: 'Poppins' }}>{job.location}</p>
              </div>
            </div>

            {/* Separator Line - Only under metadata */}
            <div style={{ width: '100%', height: '1px', background: '#E0E0E0', marginBottom: '24px' }} />

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase mb-3" style={{ color: textPrimary, fontFamily: 'Poppins' }}>DESCRIPTION</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: textSecondary, fontFamily: 'Poppins' }}>
                {job.description}
              </p>
            </div>

            {/* Eligible Skills */}
            <div>
              <h3 className="text-sm font-bold uppercase mb-3" style={{ color: textPrimary, fontFamily: 'Poppins' }}>ELIGIBLE SKILLS</h3>
              <div className="flex flex-wrap gap-3">
                {job.skills.map((skill, index) => (
                  <span key={index} className="px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-400 rounded-md" style={{ fontFamily: 'Poppins' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Registration Schedule */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase mb-3" style={{ color: textPrimary, fontFamily: 'Poppins' }}>REGISTRATION SCHEDULE</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold" style={{ color: textSecondary, fontFamily: 'Poppins' }}>Opens: 11:00AM, 25 Oct 2025</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold" style={{ color: textSecondary, fontFamily: 'Poppins' }}>Closes: 11:00AM, 29 Oct 2025</p>
                </div>
              </div>
            </div>

            {/* About the Organization */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase mb-3" style={{ color: textPrimary, fontFamily: 'Poppins' }}>ABOUT THE ORGANIZATION</h3>
              <p className="text-sm font-medium leading-relaxed mb-3" style={{ color: textSecondary, fontFamily: 'Poppins' }}>
                FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable.
              </p>
              <a href="https://fluid.live/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-blue-600 font-semibold text-sm hover:underline" style={{ fontFamily: 'Poppins' }}>
                <span>View Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Organization Image */}
            <div>
              <div className="w-full h-32 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1D5DB' }}>
                <span className="text-xs font-medium" style={{ color: textSecondary }}>Organization Image</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetailView;
