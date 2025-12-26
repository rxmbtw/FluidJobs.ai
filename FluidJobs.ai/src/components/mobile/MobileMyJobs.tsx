import React, { useState, useEffect } from 'react';
import { Bookmark, User } from 'lucide-react';
import savedJobsService, { SavedJob } from '../../services/savedJobsService';
import MobileJobDetail from './MobileJobDetail';

const MobileMyJobs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const jobs = await savedJobsService.getSavedJobs();
      setSavedJobs(jobs);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      // Show mock data when API fails
      setSavedJobs([{
        id: 1,
        job_id: 1,
        candidate_id: '1',
        job_title: 'QA Engineer - Insurance',
        company_name: 'FluidLive',
        job_type: 'Full-Time',
        location: 'Pune, Mumbai',
        salary_range: 'Rs.6.0L-Rs.15.0L',
        saved_at: '2025-10-30'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const renderJobCard = (job: SavedJob) => (
    <div
      key={job.id}
      onClick={() => setSelectedJob(job)}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {/* Company Banner */}
      <div style={{
        margin: '20px',
        height: '145px',
        background: '#C4C4C4',
        position: 'relative',
        borderRadius: '20px'
      }}>
        {/* Company Logo Circle */}
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
            src="/images/FLuid Live Icon.png" 
            alt="Company Logo" 
            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
          />
        </div>

        {/* Apply Button & Bookmark - Positioned below banner */}
        <div style={{ 
          position: 'absolute', 
          top: '155px', 
          right: '20px', 
          display: 'flex', 
          gap: '8px',
          zIndex: 10
        }}>
          <button style={{
            background: '#4285F4',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}>
            Apply Now <User style={{ width: '14px', height: '14px' }} />
          </button>
          <button 
            onClick={(e) => toggleBookmark(job.id, e)}
            style={{ 
              background: '#FFFFFF', 
              border: '2px solid #6E6E6E', 
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bookmark 
              style={{ 
                width: '16px', 
                height: '16px', 
                color: '#6E6E6E', 
                strokeWidth: 2,
                fill: bookmarkedJobs.has(job.id) ? '#000000' : 'none'
              }} 
            />
          </button>
        </div>
      </div>

      {/* Job Content */}
      <div style={{ padding: '30px 20px 20px' }}>

        {/* Job Title */}
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', color: '#000000', marginBottom: '4px' }}>
          {job.job_title}
        </h3>
        <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 500, color: '#6E6E6E', marginBottom: '16px' }}>
          Posted on: {new Date(job.saved_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>

        {/* Job Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>
              JOB TYPE
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>
              {job.job_type}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>
              INDUSTRY
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>
              technology
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>
              CTC
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>
              {job.salary_range || 'Rs.6.0L-Rs.15.0L'}
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

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '8px' }}>
            DESCRIPTION
          </p>
          <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 500, color: '#6E6E6E', lineHeight: '1.5' }}>
            FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, <span style={{ color: '#4285F4', fontWeight: 600 }}>more</span>
          </p>
        </div>

        {/* Skills */}
        <div>
          <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '10px' }}>
            ELIGIBLE SKILLS
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['Python', 'C/C++', 'Java'].map((skill) => (
              <div
                key={skill}
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
    return <MobileJobDetail job={selectedJob} onBack={() => setSelectedJob(null)} />;
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
      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTop: '3px solid #4285F4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : savedJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Bookmark style={{ width: '60px', height: '60px', color: '#D1D5DB', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: '#6E6E6E' }}>
              No saved jobs yet
            </p>
          </div>
        ) : (
          savedJobs.map(renderJobCard)
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MobileMyJobs;
