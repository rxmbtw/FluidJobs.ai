import React from 'react';
import { Bookmark, AddUser } from 'react-iconly';
import { Job } from './jobsData';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onViewDetails: () => void;
  themeState?: 'light' | 'dark';
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onToggleSave,
  onViewDetails,
  themeState = 'light',
  isExpanded = false,
  onToggleExpand
}) => {
  const { 
    title, 
    postedDate, 
    jobType, 
    ctc, 
    industry, 
    location, 
    description, 
    skills, 
    id,
    modeOfJob,
    noOfOpenings,
    experienceRange,
    selectedImage,
    showSalaryToCandidate
  } = job;
  
  const truncateDescription = (text: string, maxWords: number = 15) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ');
  };
  
  const shortDescription = truncateDescription(description);
  const shouldShowMore = description.split(' ').length > 15;
  
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
          <div 
            className="w-full h-[175px] rounded-[25px] bg-cover bg-center relative"
            style={{
              backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
              backgroundColor: selectedImage ? 'transparent' : '#D9D9D9'
            }}
          >
            {/* Perfect Match Badge - Inside Banner */}
            {job.matchScore && (
              <div className="absolute top-6 right-6 px-4 py-1.5 bg-[#D9D9D9] rounded-full">
                <span className="text-[12px] font-semibold text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>Perfect Match</span>
              </div>
            )}
          </div>
          {/* Company Logo Circle */}
          <div className="absolute -bottom-10 left-5 w-[79px] h-[79px] rounded-full bg-white border-[12px] border-[rgba(66,133,244,1)] flex items-center justify-center">
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
              className="flex items-center gap-2 px-4 py-2 rounded-[10px]"
              style={{ backgroundColor: 'rgba(66, 133, 244, 1)' }}
            >
              <span className="text-white" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '13px', lineHeight: '100%' }}>Apply Now</span>
              <AddUser set="light" primaryColor="rgba(255, 255, 255, 1)" size={17} style={{ strokeWidth: 1.5 }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleSave(id); }} className="w-[20px] h-[24px] rounded-[5px] flex items-center justify-center" style={{ backgroundColor: '#D9D9D9' }}>
              <Bookmark set="bulk" primaryColor={isSaved ? 'rgba(19, 15, 38, 1)' : 'rgba(19, 15, 38, 1)'} size={20} style={{ width: '16px', height: '20px' }} />
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
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {showSalaryToCandidate !== false ? ctc : 'Not Disclosed'}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>LOCATION</p>
            <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{location}</p>
          </div>
          {modeOfJob && (
            <div>
              <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>WORK MODE</p>
              <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{modeOfJob}</p>
            </div>
          )}
          {experienceRange && (
            <div>
              <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>EXPERIENCE</p>
              <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{experienceRange}</p>
            </div>
          )}
          {noOfOpenings && (
            <div>
              <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E]" style={{ fontFamily: 'Poppins, sans-serif' }}>OPENINGS</p>
              <p className="text-[12px] font-semibold leading-[18px] text-black mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{noOfOpenings}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-6">
          <h4 className="text-[12px] font-semibold leading-[18px] text-[#080808]" style={{ fontFamily: 'Poppins, sans-serif' }}>DESCRIPTION</h4>
          <p className="text-[12px] font-semibold leading-[18px] text-[#6E6E6E] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {isExpanded ? description : shortDescription}
            {shouldShowMore && (
              <span 
                className="text-[#4285F4] cursor-pointer ml-1"
                onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
              >
                {isExpanded ? 'less' : 'more'}
              </span>
            )}
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
      <div 
        className="hidden md:block cursor-pointer hover:shadow-lg transition"
        style={{
          width: '850px',
          height: '715px',
          backgroundColor: cardBg,
          borderRadius: '25px',
          opacity: 1,
          position: 'relative',
          margin: '0 auto'
        }}
        onClick={onViewDetails}
      >
        {/* Cover Image */}
        <div 
          style={{
            width: '808px',
            height: '200px',
            top: '21px',
            left: '21px',
            position: 'absolute',
            borderRadius: '15px',
            backgroundColor: selectedImage ? 'transparent' : 'rgba(217, 217, 217, 1)',
            backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 1
          }}
        ></div>

        {/* Logo Circle Stroke */}
        <div 
          style={{
            width: '100px',
            height: '100px',
            top: '170px',
            left: '46px',
            position: 'absolute',
            borderRadius: '50%',
            border: '12px solid rgba(66, 133, 244, 0.2)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            opacity: 1,
            boxShadow: '0 0 0 12px rgba(66, 133, 244, 0.1)'
          }}
        >
          {/* Logo Image */}
          <img 
            src="/images/FLuid Live Icon light theme.png" 
            alt="Company Logo" 
            style={{
              width: '59px',
              height: '59px',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 1
            }}
          />
        </div>

        {/* Apply Now Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          style={{
            width: '151px',
            height: '39px',
            top: '378px',
            left: '647px',
            position: 'absolute',
            borderRadius: '10px',
            backgroundColor: 'rgba(66, 133, 244, 1)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: 1
          }}
        >
          <span style={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '13px',
            lineHeight: '100%',
            color: 'rgba(255, 255, 255, 1)',
            textAlign: 'center'
          }}>Apply Now</span>
          <AddUser 
            set="light" 
            primaryColor="rgba(255, 255, 255, 1)" 
            size={13} 
            style={{ strokeWidth: 1.5 }} 
          />
        </button>

        {/* Bookmark Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSave(id); }}
          style={{
            width: '24px',
            height: '24px',
            top: '386px',
            left: '806px',
            position: 'absolute',
            backgroundColor: 'transparent',
            border: 'none',
            opacity: 1
          }}
        >
          <Bookmark 
            set="bulk" 
            primaryColor={isSaved ? 'rgba(19, 15, 38, 1)' : 'rgba(62, 62, 62, 1)'} 
            size={24} 
          />
        </button>

        {/* Job Title */}
        <h3 style={{
          width: '287px',
          height: '35px',
          top: '302px',
          left: '36px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontSize: '23px',
          lineHeight: '100%',
          color: 'rgba(0, 0, 0, 1)',
          margin: 0,
          opacity: 1
        }}>{title}</h3>

        {/* Posted Date */}
        <p style={{
          width: '400px',
          height: '20px',
          top: '359px',
          left: '36px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: 'rgba(110, 110, 110, 1)',
          margin: 0,
          opacity: 1
        }}>Posted on: {postedDate}</p>

        {/* Job Metadata Labels */}
        <p style={{
          width: '60px',
          height: '20px',
          top: '399px',
          left: '36px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: 'rgba(110, 110, 110, 1)',
          margin: 0,
          opacity: 1
        }}>JOB TYPE</p>

        <p style={{
          width: '28px',
          height: '20px',
          top: '400px',
          left: '229px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: 'rgba(110, 110, 110, 1)',
          margin: 0,
          opacity: 1
        }}>CTC</p>

        <p style={{
          width: '64px',
          height: '20px',
          top: '400px',
          left: '436px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: 'rgba(110, 110, 110, 1)',
          margin: 0,
          opacity: 1
        }}>INDUSTRY</p>

        <p style={{
          width: '67px',
          height: '20px',
          top: '400px',
          left: '643px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: 'rgba(110, 110, 110, 1)',
          margin: 0,
          opacity: 1
        }}>LOCATION</p>

        {/* Job Metadata Values */}
        <p style={{
          width: '64px',
          height: '20px',
          top: '419px',
          left: '105px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: textPrimary,
          textAlign: 'center',
          margin: 0,
          opacity: 1
        }}>{jobType}</p>

        <p style={{
          width: '103px',
          height: '20px',
          top: '420px',
          left: '266px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: textPrimary,
          textAlign: 'center',
          margin: 0,
          opacity: 1
        }}>{showSalaryToCandidate !== false ? ctc : 'Not Disclosed'}</p>

        <p style={{
          width: '78px',
          height: '20px',
          top: '420px',
          left: '509px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: textPrimary,
          textAlign: 'center',
          margin: 0,
          opacity: 1
        }}>{industry}</p>

        <p style={{
          width: '95px',
          height: '20px',
          top: '420px',
          left: '719px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: textPrimary,
          textAlign: 'center',
          margin: 0,
          opacity: 1
        }}>{location}</p>

        {/* Description Label */}
        <p style={{
          width: '85px',
          height: '20px',
          top: '462px',
          left: '36px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: 'rgba(8, 8, 8, 1)',
          margin: 0,
          opacity: 1
        }}>DESCRIPTION</p>

        {/* Description Content */}
        <p style={{
          width: '778px',
          height: '40px',
          top: '478px',
          left: '36px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: 'rgba(110, 110, 110, 1)',
          margin: 0,
          opacity: 1
        }}>
          {isExpanded ? description : shortDescription}
          {shouldShowMore && (
            <span 
              onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
              style={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '13px',
                lineHeight: '100%',
                textDecoration: 'underline',
                color: 'rgba(0, 96, 255, 1)',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              {isExpanded ? 'less' : 'more'}
            </span>
          )}
        </p>

        {/* Eligible Skills Label */}
        <p style={{
          width: '95px',
          height: '20px',
          top: '541px',
          left: '36px',
          position: 'absolute',
          fontFamily: 'Poppins',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: '100%',
          color: 'rgba(8, 8, 8, 1)',
          margin: 0,
          opacity: 1
        }}>ELIGIBLE SKILLS</p>

        {/* Skills */}
        <div style={{
          position: 'absolute',
          top: '577px',
          left: '36px',
          display: 'flex',
          gap: '10px'
        }}>
          {skills.map((skill, index) => (
            <div 
              key={index}
              style={{
                height: '27px',
                padding: '0 15px',
                borderRadius: '5px',
                border: '1px solid rgba(66, 133, 244, 1)',
                backgroundColor: 'rgba(217, 217, 217, 0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 1
              }}
            >
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                lineHeight: '100%',
                color: 'rgba(66, 133, 244, 1)',
                textAlign: 'center'
              }}>{skill}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default JobCard;
