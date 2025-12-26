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
    <>
      {/* Mobile View */}
      <div className="md:hidden px-6 py-6 cursor-pointer" onClick={onViewDetails}>
        {/* Company Banner */}
        <div className="relative mb-4">
          <div className="w-full h-[175px] rounded-[25px] bg-[#D9D9D9] relative">
            {/* Perfect Match Badge - Inside Banner */}
            {job.matchScore && (
              <div className="absolute top-6 right-6 px-4 py-1.5 bg-[#D9D9D9] rounded-full">
                <span className="text-[12px] font-semibold text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>Perfect Match</span>
              </div>
            )}
          </div>
          {/* Company Logo Circle */}
          <div className="absolute -bottom-10 left-5 w-[79px] h-[79px] rounded-full bg-white border-[12px] border-[rgba(66,133,244,0.2)] flex items-center justify-center">
            <img src="/images/FLuid Live Icon light theme.png" alt="Company" className="w-[57px] h-[57px]" />
          </div>
        </div>

        {/* Job Title and Apply Button */}
        <div className="mt-12 flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-[20px] font-bold leading-[30px] text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
            <p className="text-[10px] font-semibold leading-[15px] text-[#6E6E6E] mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Posted on: {postedDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); }} 
              className="flex items-center gap-2 px-4 py-2 bg-[#4285F4] rounded-[10px]"
            >
              <span className="text-[12px] font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Apply Now</span>
              <UserPlus className="w-4 h-4 text-white" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleSave(id); }} className="p-2">
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-black' : ''}`} style={{ color: 'black' }} />
            </button>
          </div>
        </div>

        {/* Job Metadata */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>JOB TYPE</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{jobType}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>INDUSTRY</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{industry}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>CTC</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{ctc}</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>LOCATION</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{location}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h4 className="text-[12px] font-semibold leading-[18px] text-[#080808]" style={{ fontFamily: 'Poppins, sans-serif' }}>DESCRIPTION</h4>
          <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {shortDescription}...{' '}
            <span className="text-[#4285F4] cursor-pointer">more</span>
          </p>
        </div>

        {/* Skills */}
        <div className="mt-6">
          <h4 className="text-[12px] font-semibold leading-[18px] text-[#080808]" style={{ fontFamily: 'Poppins, sans-serif' }}>ELIGIBLE SKILLS</h4>
          <div className="flex flex-wrap gap-3 mt-3">
            {skills.slice(0, 3).map((skill, index) => (
              <div key={index} className="px-4 py-1 border border-[#4285F4] rounded-[5px]">
                <span className="text-[13px] font-medium leading-[20px] text-[#4285F4]" style={{ fontFamily: 'Poppins, sans-serif' }}>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition" style={{ backgroundColor: cardBg }} onClick={onViewDetails}>
        {/* Company Logo */}
        <div className="relative mb-4">
          <div className="w-full h-20 sm:h-28 rounded-lg" style={{ backgroundColor: logoBg }}></div>
          <div className="absolute -bottom-6 sm:-bottom-7 left-3 sm:left-5 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: cardBg }}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full text-white flex items-center justify-center text-sm sm:text-base font-bold">
              FL
            </div>
          </div>
        </div>

        {/* Job Title and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mt-8 sm:mt-9">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: textPrimary }}>{title}</h3>
              {job.matchScore && (
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  {job.matchScore}% Match
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm" style={{ color: textSecondary }}>Posted on: {postedDate}</p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center justify-center space-x-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition flex-1 sm:flex-initial">
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Apply Now</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleSave(id); }} 
              className="p-2 rounded-lg transition"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} style={{ color: isSaved ? '#2563EB' : textSecondary }} />
            </button>
          </div>
        </div>

        {/* Job Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-5 text-sm">
          <div>
            <p className="font-bold uppercase text-[10px] sm:text-xs" style={{ color: textSecondary }}>Job Type</p>
            <p className="font-semibold mt-1 text-xs sm:text-sm" style={{ color: textPrimary }}>{jobType}</p>
          </div>
          <div>
            <p className="font-bold uppercase text-[10px] sm:text-xs" style={{ color: textSecondary }}>CTC</p>
            <p className="font-semibold mt-1 text-xs sm:text-sm" style={{ color: textPrimary }}>{ctc}</p>
          </div>
          <div>
            <p className="font-bold uppercase text-[10px] sm:text-xs" style={{ color: textSecondary }}>Industry</p>
            <p className="font-semibold mt-1 text-xs sm:text-sm" style={{ color: textPrimary }}>{industry}</p>
          </div>
          <div>
            <p className="font-bold uppercase text-[10px] sm:text-xs" style={{ color: textSecondary }}>Location</p>
            <p className="font-semibold mt-1 text-xs sm:text-sm" style={{ color: textPrimary }}>{location}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 sm:mt-5">
          <h4 className="text-[10px] sm:text-xs font-bold uppercase mb-2" style={{ color: textPrimary }}>Description</h4>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: textSecondary }}>
            {shortDescription}...{' '}
            <span className="text-blue-500 font-semibold cursor-pointer hover:underline">more</span>
          </p>
        </div>

        {/* Skills */}
        <div className="mt-4 sm:mt-5">
          <h4 className="text-[10px] sm:text-xs font-bold uppercase mb-2" style={{ color: textPrimary }}>Eligible Skills</h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-blue-600 border border-blue-400 rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobCard;
