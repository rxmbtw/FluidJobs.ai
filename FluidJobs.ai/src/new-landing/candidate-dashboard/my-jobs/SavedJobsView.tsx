import React, { useState } from 'react';
import { Bookmark, AddUser } from 'react-iconly';

interface SavedJobsViewProps {
  themeState?: 'light' | 'dark';
  onJobClick: (job: any) => void;
  savedJobs: string[];
  onToggleSave: (jobId: string) => void;
}

const SavedJobsView: React.FC<SavedJobsViewProps> = ({ themeState = 'light', onJobClick, savedJobs, onToggleSave }) => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6E6E6E' : '#9ca3af';

  const mockSavedJobs = [
    {
      id: '1',
      title: 'QA Engineer - Insurance',
      postedDate: '30/10/2025',
      jobType: 'Full-Time',
      ctc: 'Rs.6.0L-Rs.15.0L',
      industry: 'Technology',
      location: 'Pune, Mumbai',
      description: 'FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable',
      skills: ['Python', 'C/C++', 'Java'],
      selectedImage: null
    },
    {
      id: '2',
      title: 'Senior Frontend Developer',
      postedDate: '28/10/2025',
      jobType: 'Full-Time',
      ctc: 'Rs.10.0L-Rs.20.0L',
      industry: 'Technology',
      location: 'Mumbai, Pune',
      description: 'Join our team as a Senior Frontend Developer and work on cutting-edge web applications using modern frameworks and technologies.',
      skills: ['React', 'TypeScript', 'CSS'],
      selectedImage: null
    }
  ];

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

  if (savedJobs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Bookmark set="bulk" primaryColor="rgba(19, 15, 38, 1)" size={64} />
        </div>
        <h3 style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 600, color: textPrimary, marginBottom: '8px' }}>No Saved Jobs Yet</h3>
        <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: textSecondary }}>Start saving jobs to view them here</p>
      </div>
    );
  }

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
        {mockSavedJobs.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const jobCard = document.getElementById(`saved-job-card-${index}`);
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
          setCurrentJobIndex(Math.min(newIndex, mockSavedJobs.length - 1));
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        {mockSavedJobs.map((job, index) => (
          <div 
            id={`saved-job-card-${index}`}
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
              {/* Title & Actions */}
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
                    background: 'rgba(66, 133, 244, 1)',
                    color: 'rgba(255, 255, 255, 1)',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '13px',
                    lineHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    Apply Now <AddUser set="light" primaryColor="rgba(255, 255, 255, 1)" size={17} style={{ strokeWidth: 1.5 }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onToggleSave(job.id); }} className="w-[29px] h-[29px] rounded-[5px] flex items-center justify-center" style={{ backgroundColor: '#D9D9D9' }}>
                    <Bookmark set="bulk" primaryColor="#4285F4" size={20} style={{ width: '16px', height: '20px' }} />
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
                  {job.skills.map((skill) => (
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

export default SavedJobsView;