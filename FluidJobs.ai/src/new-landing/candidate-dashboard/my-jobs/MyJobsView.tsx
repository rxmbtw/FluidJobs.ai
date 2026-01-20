import React, { useState, useEffect } from 'react';
import { User, Filter } from 'lucide-react';
import { Bookmark, AddUser } from 'react-iconly';
import Loader from '../../../components/Loader';
import JobDetailView from './JobDetailView';
import AppliedJobsView from './AppliedJobsView';
import SavedJobsView from './SavedJobsView';

interface MyJobsViewProps {
  initialFilter?: string;
  themeState?: 'light' | 'dark';
  onFilterChange?: () => void;
}

const MyJobsView: React.FC<MyJobsViewProps> = ({ themeState = 'light', initialFilter = 'all', onFilterChange }) => {
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialFilter && initialFilter !== 'all') {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/jobs-enhanced/published');
        const data = await response.json();
        if (data.success) {
          setJobs(data.jobs);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setJobsLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  const bgColor = themeState === 'light' ? '#F1F1F1' : '#1a1a1a';
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6E6E6E' : '#9ca3af';

  if (loading) {
    return (
      <div style={{ backgroundColor: bgColor, minHeight: 'calc(100vh - 116px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader themeState={themeState} />
      </div>
    );
  }

  const filters = [
    { id: 'all', label: 'All Jobs' },
    { id: 'recent', label: 'Recently Posted Jobs' },
    { id: 'match', label: 'Perfect Match' },
    { id: 'applied', label: 'Applied Jobs' },
    { id: 'saved', label: 'Saved Jobs' }
  ];

  const handleToggleSave = (jobId: string) => {
    setSavedJobs(prev => {
      const isCurrentlySaved = prev.includes(jobId);
      if (!isCurrentlySaved) {
        setShowSavePopup(true);
        setTimeout(() => setShowSavePopup(false), 3000);
      }
      return isCurrentlySaved ? prev.filter(id => id !== jobId) : [...prev, jobId];
    });
  };

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

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    setSelectedJob(null);
    if (onFilterChange) {
      onFilterChange();
    }
  };

  if (selectedJob) {
    return (
      <div style={{ backgroundColor: bgColor, minHeight: 'calc(100vh - 80px)', padding: '20px 40px', position: 'relative' }}>
        {showSavePopup && (
          <div style={{
            position: 'fixed',
            top: '140px',
            right: '40px',
            backgroundColor: '#4285F4',
            color: '#FFFFFF',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            fontFamily: 'Poppins'
          }}>
            <Bookmark set="bulk" primaryColor="rgba(19, 15, 38, 1)" size={20} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Added to Saved Jobs</span>
          </div>
        )}
        <style>
          {`
            @keyframes slideIn {
              from {
                transform: translateX(400px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}
        </style>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', justifyContent: 'center' }}>
          {filters.map((filter) => (
            <div key={filter.id} style={{
              backgroundColor: activeFilter === filter.id ? (themeState === 'light' ? '#DBEAFE' : 'rgba(37, 99, 235, 0.2)') : '#FFFFFF',
              borderRadius: '30px',
              padding: '3px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <button
                onClick={() => handleFilterClick(filter.id)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
                style={{
                  backgroundColor: 'transparent',
                  color: activeFilter === filter.id ? '#2563EB' : (themeState === 'light' ? '#000000' : '#E5E7EB'),
                  fontFamily: 'Poppins',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <span>{filter.label}</span>
              </button>
            </div>
          ))}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            padding: '3px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}>
            <button 
              className="flex items-center space-x-1 px-2 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
              style={{
                backgroundColor: 'transparent',
                color: themeState === 'light' ? '#000000' : '#E5E7EB',
                fontFamily: 'Poppins',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Filter style={{ width: '16px', height: '16px', color: themeState === 'light' ? '#000000' : '#E5E7EB' }} />
            </button>
          </div>
        </div>
        
        <JobDetailView 
          job={selectedJob} 
          isSaved={savedJobs.includes(selectedJob.id)}
          onToggleSave={handleToggleSave}
          onBack={() => setSelectedJob(null)}
          themeState={themeState}
          showSavePopup={() => { setShowSavePopup(true); setTimeout(() => setShowSavePopup(false), 3000); }}
        />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: bgColor, minHeight: 'calc(100vh - 80px)', padding: '20px 40px', position: 'relative', overflowY: 'auto' }}>
      {showSavePopup && (
        <div style={{
          position: 'fixed',
          top: '140px',
          right: '40px',
          backgroundColor: '#4285F4',
          color: '#FFFFFF',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
          fontFamily: 'Poppins'
        }}>
          <Bookmark set="bulk" primaryColor="rgba(19, 15, 38, 1)" size={20} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Added to Saved Jobs</span>
        </div>
      )}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', justifyContent: 'center' }}>
        {filters.map((filter) => (
          <div key={filter.id} style={{
            backgroundColor: activeFilter === filter.id ? (themeState === 'light' ? '#DBEAFE' : 'rgba(37, 99, 235, 0.2)') : '#FFFFFF',
            borderRadius: '30px',
            padding: '3px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}>
            <button
              onClick={() => handleFilterClick(filter.id)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
              style={{
                backgroundColor: 'transparent',
                color: activeFilter === filter.id ? '#2563EB' : (themeState === 'light' ? '#000000' : '#E5E7EB'),
                fontFamily: 'Poppins',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <span>{filter.label}</span>
            </button>
          </div>
        ))}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          padding: '3px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <button 
            className="flex items-center space-x-1 px-2 py-1.5 rounded-full transition-all font-semibold whitespace-nowrap"
            style={{
              backgroundColor: 'transparent',
              color: themeState === 'light' ? '#000000' : '#E5E7EB',
              fontFamily: 'Poppins',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Filter style={{ width: '16px', height: '16px', color: themeState === 'light' ? '#000000' : '#E5E7EB' }} />
          </button>
        </div>
      </div>

      {activeFilter === 'applied' ? (
        <AppliedJobsView themeState={themeState} onJobClick={(job) => setSelectedJob(job)} savedJobs={savedJobs} onToggleSave={handleToggleSave} />
      ) : activeFilter === 'saved' ? (
        <SavedJobsView 
          themeState={themeState} 
          onJobClick={(job) => setSelectedJob(job)}
          savedJobs={savedJobs}
          onToggleSave={handleToggleSave}
        />
      ) : (
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
                  const jobCard = document.getElementById(`job-card-${index}`);
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
            {jobs.map((job) => (
            <div 
              id={`job-card-${jobs.indexOf(job)}`}
              key={job.id}
              onClick={() => setSelectedJob(job)}
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
                    <button onClick={(e) => { e.stopPropagation(); handleToggleSave(job.id); }} className="w-[29px] h-[29px] rounded-[5px] flex items-center justify-center" style={{ backgroundColor: '#D9D9D9' }}>
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
                    {(job.skills || []).map((skill: string) => (
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
      )}
    </div>
  );
};

export default MyJobsView;
