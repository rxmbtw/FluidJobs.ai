import React, { useState, useEffect } from 'react';
import { Bookmark, User, Filter } from 'lucide-react';
import Loader from '../../../components/Loader';
import JobDetailView from './JobDetailView';
import AppliedJobsView from './AppliedJobsView';

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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialFilter && initialFilter !== 'all') {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

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

  const mockJob = {
    id: '1',
    title: 'QA Engineer - Insurance',
    postedDate: '30/10/2025',
    jobType: 'Full-Time',
    ctc: 'Rs.6.0L-Rs.15.0L',
    industry: 'Technology',
    location: 'Pune, Mumbai',
    description: 'FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable',
    skills: ['Python', 'C/C++', 'Java']
  };

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

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    setSelectedJob(null);
    if (onFilterChange) {
      onFilterChange();
    }
  };

  if (selectedJob) {
    return (
      <div style={{ backgroundColor: bgColor, minHeight: 'calc(100vh - 116px)', padding: '20px 40px', position: 'relative' }}>
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
            <Bookmark style={{ width: '20px', height: '20px', fill: '#FFFFFF' }} />
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
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', justifyContent: 'center' }}>
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '30px',
                border: 'none',
                background: activeFilter === filter.id ? '#4285F4' : '#D9D9D9',
                color: activeFilter === filter.id ? '#FFFFFF' : '#6E6E6E',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {filter.label}
            </button>
          ))}
          <button style={{
            padding: '12px',
            borderRadius: '50%',
            border: 'none',
            background: '#D9D9D9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Filter style={{ width: '20px', height: '20px', color: '#6E6E6E' }} />
          </button>
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
    <div style={{ backgroundColor: bgColor, minHeight: 'calc(100vh - 116px)', padding: '20px 40px', position: 'relative' }}>
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
          <Bookmark style={{ width: '20px', height: '20px', fill: '#FFFFFF' }} />
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
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', justifyContent: 'center' }}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '30px',
              border: 'none',
              background: activeFilter === filter.id ? '#4285F4' : '#D9D9D9',
              color: activeFilter === filter.id ? '#FFFFFF' : '#6E6E6E',
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {filter.label}
          </button>
        ))}
        <button style={{
          padding: '12px',
          borderRadius: '50%',
          border: 'none',
          background: '#D9D9D9',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Filter style={{ width: '20px', height: '20px', color: '#6E6E6E' }} />
        </button>
      </div>

      {activeFilter === 'applied' ? (
        <AppliedJobsView themeState={themeState} onJobClick={(job) => setSelectedJob(job)} />
      ) : activeFilter === 'saved' ? (
        savedJobs.length > 0 ? (
          <div 
            onClick={() => setSelectedJob(mockJob)}
            style={{
          backgroundColor: cardBg,
          borderRadius: '20px',
          padding: '20px',
          maxWidth: '896px',
          margin: '0 auto',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          cursor: 'pointer'
        }}>
          <div style={{ width: '100%', height: '120px', background: '#C4C4C4', position: 'relative', borderRadius: '20px', marginBottom: '40px' }}>
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '24px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '6px solid rgba(66, 133, 244, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src="/images/FLuid Live Icon.png" alt="Company Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '20px', color: textPrimary, marginBottom: '4px' }}>QA Engineer - Insurance</h2>
                <p style={{ fontFamily: 'Poppins', fontSize: '11px', color: '#9E9E9E' }}>Posted on: 30/10/2025</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button style={{ background: '#4285F4', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  Apply Now <User style={{ width: '18px', height: '18px' }} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleToggleSave(mockJob.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <Bookmark style={{ width: '24px', height: '24px', color: '#4285F4', fill: '#4285F4' }} />
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>JOB TYPE</p>
                <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>Full-Time</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CTC</p>
                <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>Rs.6.0L-Rs.15.0L</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>INDUSTRY</p>
                <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>Technology</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LOCATION</p>
                <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>Pune, Mumbai</p>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: textPrimary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESCRIPTION</h3>
              <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 500, color: textSecondary, lineHeight: '1.5' }}>FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, <span style={{ color: '#4285F4', fontWeight: 600, cursor: 'pointer' }}>more</span></p>
            </div>
            <div>
              <h3 style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: textPrimary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ELIGIBLE SKILLS</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Python', 'C/C++', 'Java'].map((skill) => (
                  <div key={skill} style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #4285F4', fontFamily: 'Poppins', fontSize: '13px', color: '#4285F4', fontWeight: 500 }}>{skill}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Bookmark style={{ width: '64px', height: '64px', color: textSecondary, margin: '0 auto 20px' }} />
            <h3 style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 600, color: textPrimary, marginBottom: '8px' }}>No Saved Jobs Yet</h3>
            <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: textSecondary }}>Start saving jobs to view them here</p>
          </div>
        )
      ) : (
        <div 
          onClick={() => setSelectedJob(mockJob)}
          style={{
        backgroundColor: cardBg,
        borderRadius: '20px',
        padding: '20px',
        maxWidth: '896px',
        margin: '0 auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        cursor: 'pointer'
      }}>
        {/* Banner */}
        <div style={{ width: '100%', height: '120px', background: '#C4C4C4', position: 'relative', borderRadius: '20px', marginBottom: '40px' }}>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '6px solid rgba(66, 133, 244, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/images/FLuid Live Icon.png" alt="Company Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Title & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '20px', color: textPrimary, marginBottom: '4px' }}>
                QA Engineer - Insurance
              </h2>
              <p style={{ fontFamily: 'Poppins', fontSize: '11px', color: '#9E9E9E' }}>
                Posted on: 30/10/2025
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button style={{
                background: '#4285F4',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                Apply Now <User style={{ width: '18px', height: '18px' }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleToggleSave(mockJob.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <Bookmark style={{ width: '24px', height: '24px', color: savedJobs.includes(mockJob.id) ? '#4285F4' : textPrimary, fill: savedJobs.includes(mockJob.id) ? '#4285F4' : 'none' }} />
              </button>
            </div>
          </div>

          {/* Job Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>JOB TYPE</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>Full-Time</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CTC</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>Rs.6.0L-Rs.15.0L</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>INDUSTRY</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>Technology</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LOCATION</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 600, color: textPrimary }}>Pune, Mumbai</p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: textPrimary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DESCRIPTION</h3>
            <p style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: 500, color: textSecondary, lineHeight: '1.5' }}>
              FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, <span style={{ color: '#4285F4', fontWeight: 600, cursor: 'pointer' }}>more</span>
            </p>
          </div>

          {/* Skills */}
          <div>
            <h3 style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: textPrimary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ELIGIBLE SKILLS</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Python', 'C/C++', 'Java'].map((skill) => (
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
      )}
    </div>
  );
};

export default MyJobsView;
