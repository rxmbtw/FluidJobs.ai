import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import { Bookmark, AddUser } from 'react-iconly';
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
  
  // Format registration dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden overflow-y-auto pb-32" style={{ maxHeight: 'calc(100vh - 100px)' }}>
        <div className="px-6 py-4">
        {/* Company Banner */}
        <div className="relative mb-4">
          <div 
            className="w-full h-[175px] rounded-[25px] bg-cover bg-center"
            style={{
              backgroundImage: job.selectedImage ? `url(${job.selectedImage})` : 'none',
              backgroundColor: job.selectedImage ? 'transparent' : '#D9D9D9'
            }}
          ></div>
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-[10px]" style={{ backgroundColor: 'rgba(66, 133, 244, 1)' }}>
              <span className="text-white" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>Apply Now</span>
              <AddUser set="light" primaryColor="rgba(255, 255, 255, 1)" size={13} style={{ strokeWidth: 1.5 }} />
            </button>
            <button onClick={() => { onToggleSave(job.id); if (!isSaved && showSavePopup) showSavePopup(); }} className="w-[20px] h-[24px] rounded-[5px] flex items-center justify-center" style={{ backgroundColor: '#D9D9D9' }}>
              <Bookmark set="bulk" primaryColor={isSaved ? 'rgba(19, 15, 38, 1)' : 'rgba(19, 15, 38, 1)'} size={20} style={{ width: '16px', height: '20px' }} />
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
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {job.showSalaryToCandidate !== false ? job.ctc : 'Not Disclosed'}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>LOCATION</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.location}</p>
          </div>
          {job.modeOfJob && (
            <div>
              <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>WORK MODE</p>
              <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.modeOfJob}</p>
            </div>
          )}
          {job.experienceRange && (
            <div>
              <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>EXPERIENCE</p>
              <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.experienceRange}</p>
            </div>
          )}
          {job.noOfOpenings && (
            <div>
              <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>OPENINGS</p>
              <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.noOfOpenings}</p>
            </div>
          )}
        </div>

        {/* Registration Schedule */}
        <div className="mb-6">
          <h4 className="text-[13px] font-semibold leading-[20px] text-[#080808] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>REGISTRATION SCHEDULE</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#008311] mt-0.5" />
              <p className="text-[13px] font-semibold leading-[20px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Opens: {formatDate(job.registrationOpeningDate) || '11:00AM, 25 Oct 2025'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-[#DD0004] mt-0.5" />
              <p className="text-[13px] font-semibold leading-[20px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Closes: {formatDate(job.registrationClosingDate) || '11:00AM, 29 Oct 2025'}
              </p>
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
            {(job.skills || []).map((skill, index) => (
              <div key={index} className="px-4 py-1 border border-[#4285F4] rounded-[5px]">
                <span className="text-[13px] font-medium leading-[20px] text-[#4285F4]" style={{ fontFamily: 'Poppins, sans-serif' }}>{skill}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Desktop View - Removed */}
    </>
  );
};

export default JobDetailView;
