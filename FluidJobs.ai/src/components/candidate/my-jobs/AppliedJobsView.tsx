import React, { useState } from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { Bookmark } from 'react-iconly';

interface AppliedJobsViewProps {
  themeState?: 'light' | 'dark';
  onJobClick: (job: any) => void;
  savedJobs: string[];
  onToggleSave: (jobId: string) => void;
  jobs: any[];
}

const AppliedJobsView: React.FC<AppliedJobsViewProps> = ({ themeState = 'light', onJobClick, savedJobs, onToggleSave, jobs }) => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6E6E6E' : '#9ca3af';

  // mockJobs removed

  const toggleDescription = (jobId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const truncateDescription = (description: string, maxWords: number = 20) => {
    const words = description.split(' ');
    if (words.length <= maxWords) return description;
    return words.slice(0, maxWords).join(' ');
  };

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      {/* Navigation Dots */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '215px',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 10
      }}>
        {jobs.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const jobCard = document.getElementById(`applied-job-card-${index}`);
              if (jobCard) {
                jobCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setCurrentJobIndex(index);
              }
            }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: currentJobIndex === index ? '#4285F4' : '#D9D9D9',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Jobs Container */}
      <div
        style={{
          width: '100%',
          padding: '0 10px 150px 10px',
          height: 'calc(100vh - 150px)',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        onScroll={(e) => {
          const container = e.target as HTMLElement;
          const scrollTop = container.scrollTop;
          const cardHeight = 500;
          const newIndex = Math.round(scrollTop / cardHeight);
          setCurrentJobIndex(Math.min(newIndex, jobs.length - 1));
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {jobs.map((job, index) => (
          <div
            id={`applied-job-card-${index}`}
            key={job.id}
            onClick={() => onJobClick(job)}
            style={{
              backgroundColor: cardBg,
              borderRadius: '20px',
              padding: '20px',
              maxWidth: '920px',
              margin: '0 auto 50px auto',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              cursor: 'pointer',
              minHeight: '450px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Banner with selected image */}
            <div style={{
              width: '100%',
              height: '200px',
              background: job.selectedImage ? `url(${job.selectedImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              borderRadius: '15px',
              marginBottom: '60px'
            }}>
              {/* Logo with stroke */}
              <div style={{
                position: 'absolute',
                bottom: '-50px',
                left: '46px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '12px solid rgba(66, 133, 244, 0.2)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 12px rgba(66, 133, 244, 0.1)'
              }}>
                <img src="/images/FLuid Live Icon light theme.png" alt="Company Logo" style={{ width: '59px', height: '59px', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Content */}
            <div>
              {/* Title & Status Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '20px', color: textPrimary, marginBottom: '4px' }}>
                    {job.title}
                  </h2>
                  <p style={{ fontFamily: 'Poppins', fontSize: '11px', color: '#9E9E9E' }}>
                    Posted on: {job.postedDate}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #000000',
                    background: '#FFFFFF',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000000',
                    cursor: 'pointer'
                  }}>
                    <Info style={{ width: '16px', height: '16px', color: '#000000' }} />
                    Under Review
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#34A853',
                    border: 'none',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}>
                    <CheckCircle style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                    Applied
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onToggleSave(job.id); }} className="w-[29px] h-[29px] rounded-[5px] flex items-center justify-center" style={{ backgroundColor: '#D9D9D9' }}>
                    <Bookmark set="bulk" primaryColor={savedJobs.includes(job.id) ? '#4285F4' : 'rgba(19, 15, 38, 1)'} size={20} style={{ width: '16px', height: '20px' }} />
                  </button>
                </div>
              </div>

              {/* Job Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>JOB TYPE</p>
                  <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>{job.jobType}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CTC</p>
                  <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>{job.ctc}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>INDUSTRY</p>
                  <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>{job.industry}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LOCATION</p>
                  <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>{job.location}</p>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: textPrimary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESCRIPTION</h3>
                <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 500, color: textSecondary, lineHeight: '1.5' }}>
                  {expandedDescriptions.has(job.id)
                    ? job.description
                    : truncateDescription(job.description)
                  }
                  {job.description.split(' ').length > 20 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); toggleDescription(job.id); }}
                      style={{ color: '#4285F4', fontWeight: 600, cursor: 'pointer', marginLeft: '4px' }}
                    >
                      {expandedDescriptions.has(job.id) ? 'less' : 'more'}
                    </span>
                  )}
                </p>
              </div>

              {/* Skills */}
              <div style={{ marginTop: 'auto' }}>
                <h3 style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: textPrimary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ELIGIBLE SKILLS</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {job.skills.map((skill: string) => (
                    <div key={skill} style={{
                      padding: '6px 16px',
                      borderRadius: '6px',
                      border: '1px solid #4285F4',
                      fontFamily: 'Poppins',
                      fontSize: '13px',
                      color: '#4285F4',
                      fontWeight: 500
                    }}>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppliedJobsView;
