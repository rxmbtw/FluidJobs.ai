import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, User, Info, CheckCircle } from 'lucide-react';
import { jobsService } from '../../services/jobsService';
import { Job } from '../../types';
import MobileJobDetail from './MobileJobDetail';
import MobileLoader from './MobileLoader';

const MobileMyJobs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  useEffect(() => {
    const handleJobCreated = () => {
      if (activeTab === 'all') {
        fetchJobs();
      }
    };
    window.addEventListener('jobCreated', handleJobCreated);
    return () => window.removeEventListener('jobCreated', handleJobCreated);
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let fetchedJobs: Job[] = [];
      
      switch (activeTab) {
        case 'all':
          fetchedJobs = await jobsService.getPublishedJobs();
          break;
        case 'saved':
          fetchedJobs = await jobsService.getSavedJobs();
          break;
        case 'applied':
          fetchedJobs = await jobsService.getAppliedJobs();
          break;
        case 'match':
          fetchedJobs = await jobsService.getPublishedJobs();
          break;
      }
      
      setJobs(fetchedJobs);
      
      // Fetch saved and applied status
      const savedJobsList = await jobsService.getSavedJobs();
      setBookmarkedJobs(new Set(savedJobsList.map(j => j.id)));
      
      const appliedJobsList = await jobsService.getAppliedJobs();
      setAppliedJobIds(new Set(appliedJobsList.map(j => j.id)));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isBookmarked = bookmarkedJobs.has(jobId);
      if (isBookmarked) {
        await jobsService.unsaveJob(jobId);
        setBookmarkedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        // Remove from displayed jobs if on saved tab
        if (activeTab === 'saved') {
          setJobs(prev => prev.filter(job => job.id !== jobId));
        }
      } else {
        await jobsService.saveJob(jobId);
        setBookmarkedJobs(prev => {
          const newSet = new Set(prev);
          newSet.add(jobId);
          return newSet;
        });
        // Add to displayed jobs if on saved tab
        if (activeTab === 'saved') {
          const allJobs = await jobsService.getPublishedJobs();
          const jobToAdd = allJobs.find(job => job.id === jobId);
          if (jobToAdd) {
            setJobs(prev => [...prev, jobToAdd]);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleApply = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await jobsService.applyForJob(jobId);
      setAppliedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });
      alert('Application submitted successfully!');
      
      if (activeTab === 'applied') {
        fetchJobs();
      }
    } catch (error: any) {
      console.error('Error applying:', error);
      alert(error.message || 'Failed to apply');
    }
  };

  const renderJobCard = (job: Job, isApplied: boolean = false) => (
    <div
      key={job.id}
      onClick={() => setSelectedJob(job)}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        cursor: 'pointer',
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        flexDirection: 'column',
        scrollSnapAlign: 'start'
      }}
    >
      <div style={{
        margin: '20px',
        height: '145px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        borderRadius: '20px'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-35px',
          left: '20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '8px solid rgba(66, 133, 244, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/images/FLuid Live Icon light theme.png" 
            alt="Company Logo" 
            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
          />
        </div>
        <div style={{ 
          position: 'absolute', 
          top: '170px', 
          right: '20px', 
          display: 'flex', 
          gap: '4px',
          zIndex: 10
        }}>
          {appliedJobIds.has(job.id) ? (
            <>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '3px 6px',
                borderRadius: '4px',
                border: '1px solid #000000',
                background: '#FFFFFF',
                cursor: 'pointer'
              }}>
                <Info style={{ width: '10px', height: '10px', color: '#000000' }} />
                <span style={{ fontFamily: 'Poppins', fontSize: '9px', fontWeight: 600, color: '#000000' }}>Under Review</span>
              </button>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '3px 6px',
                borderRadius: '4px',
                background: '#34A853'
              }}>
                <CheckCircle style={{ width: '10px', height: '10px', color: '#FFFFFF' }} />
                <span style={{ fontFamily: 'Poppins', fontSize: '9px', fontWeight: 600, color: '#FFFFFF' }}>Applied</span>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={(e) => handleApply(job.id, e)}
                style={{
                background: '#4285F4',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '9px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer'
              }}>
                Apply Now <User style={{ width: '10px', height: '10px' }} />
              </button>
              <button 
                onClick={(e) => toggleBookmark(job.id, e)}
                style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #6E6E6E', 
                  padding: '3px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bookmark 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    color: '#6E6E6E', 
                    strokeWidth: 2,
                    fill: bookmarkedJobs.has(job.id) ? '#000000' : 'none'
                  }} 
                />
              </button>
            </>
          )}
        </div>
      </div>
      <div style={{ padding: '30px 20px 20px', maxHeight: isApplied ? 'none' : 'calc(100vh - 400px)', overflowY: isApplied ? 'visible' : 'hidden' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', color: '#000000', marginBottom: '4px' }}>
            {job.title}
          </h3>
          <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 500, color: '#6E6E6E' }}>
            Posted on: {job.postedDate}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>
              JOB TYPE
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>
              {job.jobType}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>
              INDUSTRY
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>
              {job.industry}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>
              CTC
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>
              {job.ctc}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>
              LOCATION
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>
              {job.location}
            </p>
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '8px' }}>
            DESCRIPTION
          </p>
          <div style={{ 
            maxHeight: '120px', 
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#4285F4 #f1f1f1'
          }}>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 500, color: '#6E6E6E', lineHeight: '1.5', paddingRight: '8px' }}>
              {isApplied ? job.description : `${job.description.substring(0, 150)}...`} 
              {!isApplied && <span style={{ color: '#4285F4', fontWeight: 600 }}>more</span>}
            </p>
          </div>
        </div>
        <div>
          <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '10px' }}>
            ELIGIBLE SKILLS
          </p>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px',
            maxHeight: isApplied ? 'none' : '80px',
            overflowY: isApplied ? 'visible' : 'hidden'
          }} className={!isApplied ? 'skills-container' : ''}>
            {(isApplied ? job.skills : job.skills.slice(0, 3)).map((skill, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #4285F4',
                  background: '#FFFFFF',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#4285F4',
                  fontWeight: 500
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedJob) {
    const isJobApplied = appliedJobIds.has(selectedJob.id);
    return <MobileJobDetail job={selectedJob} onBack={() => setSelectedJob(null)} isApplied={isJobApplied} />;
  }

  return (
    <div style={{ background: '#F1F1F1', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Tabs */}
      <div style={{ background: '#FFFFFF', padding: '16px 16px 12px', marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'saved', label: 'Saved Jobs' },
            { id: 'applied', label: 'Applied Jobs' },
            { id: 'match', label: 'Perfect Match' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '0 0 auto',
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === tab.id ? '#4285F4' : '#E8E8E8',
                color: activeTab === tab.id ? '#FFFFFF' : '#6E6E6E',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div style={{ 
        padding: '0 16px',
        height: 'calc(100vh - 180px)',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }} className="job-cards-container">
        {loading ? (
          <MobileLoader />
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Bookmark style={{ width: '60px', height: '60px', color: '#D1D5DB', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: '#6E6E6E' }}>
              {activeTab === 'applied' ? 'No applied jobs yet' : activeTab === 'saved' ? 'No saved jobs yet' : 'No jobs available'}
            </p>
          </div>
        ) : (
          jobs.map(job => renderJobCard(job, activeTab === 'applied'))
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Custom scrollbar styles for job cards container */
        .job-cards-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .job-cards-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .job-cards-container::-webkit-scrollbar-thumb {
          background: #4285F4;
          border-radius: 3px;
        }
        
        .job-cards-container::-webkit-scrollbar-thumb:hover {
          background: #3367d6;
        }
        
        /* Custom scrollbar styles for description */
        div::-webkit-scrollbar {
          width: 4px;
        }
        
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: #4285F4;
          border-radius: 2px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #3367d6;
        }
        
        /* Hide scrollbars for skills section when not applied */
        .skills-container::-webkit-scrollbar {
          display: none;
        }
        
        .skills-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
};

export default MobileMyJobs;
