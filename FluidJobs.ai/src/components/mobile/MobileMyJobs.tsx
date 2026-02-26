import React, { useState, useEffect, useRef } from 'react';
import { User, Info, CheckCircle } from 'lucide-react';
import { Bookmark, AddUser } from 'react-iconly';
import { jobService } from '../../services/jobService';
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
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);

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
      let fetchedJobs: any[] = [];

      switch (activeTab) {
        case 'all':
          const response = await fetch('http://localhost:8000/api/jobs-enhanced/published');
          const data = await response.json();
          if (data.success) {
            fetchedJobs = data.jobs;
          }
          break;
        case 'saved':
          const savedResponse = await fetch('http://localhost:8000/api/saved-jobs', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('fluidjobs_token')}`
            }
          });
          const savedData = await savedResponse.json();
          if (savedData.success) {
            fetchedJobs = savedData.savedJobs;
          }
          break;
        case 'applied':
          const appliedResponse = await fetch('http://localhost:8000/api/job-applications', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('fluidjobs_token')}`
            }
          });
          const appliedData = await appliedResponse.json();
          if (appliedData.success) {
            fetchedJobs = appliedData.applications;
          }
          break;
        case 'match':
          const matchResponse = await fetch('http://localhost:8000/api/jobs-enhanced/published');
          const matchData = await matchResponse.json();
          if (matchData.success) {
            fetchedJobs = matchData.jobs;
          }
          break;
      }

      setJobs(fetchedJobs);

      // Fetch saved and applied status
      const savedJobsList = await jobService.getSavedJobs();
      setBookmarkedJobs(new Set(savedJobsList.map((j: any) => j.id)));

      const appliedJobsList = await jobService.getAppliedJobs();
      setAppliedJobIds(new Set(appliedJobsList.map((j: any) => j.id)));
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
        await jobService.unsaveJob(jobId);
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
        await jobService.saveJob(jobId);
        setBookmarkedJobs(prev => {
          const newSet = new Set(prev);
          newSet.add(jobId);
          return newSet;
        });
        // Add to displayed jobs if on saved tab
        if (activeTab === 'saved') {
          const allJobs: any[] = (await jobService.getPublishedJobs()) as any[];
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
      await jobService.applyForJob(jobId);
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

  const renderJobCard = (job: any, isApplied: boolean = false) => (
    <div
      key={job.id}
      onClick={() => setSelectedJob(job)}
      style={{
        width: '390px',
        height: '835px',
        borderRadius: '45px',
        background: 'rgba(255, 255, 255, 1)',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: 1,
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateY(0px)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{
        width: '345px',
        height: '175px',
        top: '25px',
        left: '23px',
        position: 'absolute',
        background: job.selectedImage ? `url(${job.selectedImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '25px',
        opacity: 1
      }}>
        <div
          style={{
            width: '85px',
            height: '85px',
            top: '136px',
            left: '23px',
            position: 'absolute',
            borderRadius: '50%',
            border: '12px solid rgba(66, 133, 244, 0.2)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            opacity: 1,
            boxShadow: '0 0 0 12px rgba(66, 133, 244, 0.1)'
          }}
        >
          <img
            src="/images/FLuid Live Icon light theme.png"
            alt="Company Logo"
            style={{
              width: '50px',
              height: '50px',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 1
            }}
          />
        </div>
        <div style={{
          position: 'absolute',
          top: '190px',
          right: '15px',
          display: 'flex',
          gap: '7px',
          zIndex: 10
        }}>
          {appliedJobIds.has(job.id) ? (
            <>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #000000',
                background: '#FFFFFF',
                cursor: 'pointer',
                width: '105px',
                height: '28px'
              }}>
                <Info style={{ width: '12px', height: '12px', color: '#000000' }} />
                <span style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: '#000000' }}>Under Review</span>
              </button>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '6px 6px',
                borderRadius: '6px',
                background: '#34A853',
                width: '75px',
                height: '28px'
              }}>
                <CheckCircle style={{ width: '12px', height: '12px', color: '#FFFFFF' }} />
                <span style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: '#FFFFFF' }}>Applied</span>
              </div>
            </>
          ) : (
            <>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 8px',
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)',
                cursor: 'pointer',
                width: '105px',
                height: '28px',
                boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.3)';
                }}>
                <span style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: '#FFFFFF' }}>Not Interested</span>
              </button>
              <button
                onClick={(e) => toggleBookmark(job.id, e)}
                onMouseEnter={() => setHoveredJobId(job.id)}
                onMouseLeave={() => setHoveredJobId(null)}
                style={{
                  width: '75px',
                  height: '28px',
                  borderRadius: '28px',
                  border: '1px solid rgba(66, 133, 244, 0.3)',
                  background: bookmarkedJobs.has(job.id) ? '#4285F4' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
              >
                <span
                  style={{
                    width: hoveredJobId === job.id ? '65px' : '20px',
                    height: '20px',
                    background: bookmarkedJobs.has(job.id) ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #4285F4 0%, #667eea 100%)',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    zIndex: 2,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg viewBox="0 0 384 512" style={{ height: '0.7em', borderRadius: '1px' }}>
                    <path fill="white" d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" />
                  </svg>
                </span>
                <span
                  style={{
                    height: '100%',
                    width: hoveredJobId === job.id ? '0' : '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: bookmarkedJobs.has(job.id) ? 'white' : (hoveredJobId === job.id ? 'white' : '#4285F4'),
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                    fontSize: hoveredJobId === job.id ? '0' : '10px',
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    transform: hoveredJobId === job.id ? 'translate(8px)' : 'translate(0px)',
                    overflow: 'hidden'
                  }}
                >
                  Save
                </span>
              </button>
            </>
          )}
        </div>
      </div>
      <div style={{ padding: '250px 20px 20px', maxHeight: isApplied ? 'none' : 'calc(100vh - 400px)', overflowY: isApplied ? 'visible' : 'hidden' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{
            width: '250px',
            height: '30px',
            position: 'absolute',
            top: '264px',
            left: '28px',
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '18px',
            color: '#000000',
            marginBottom: '4px',
            opacity: 1
          }}>
            {job.title}
          </h3>
          <p style={{
            width: '112px',
            height: '15px',
            position: 'absolute',
            top: '294px',
            left: '28px',
            fontFamily: 'Poppins',
            fontSize: '10px',
            fontWeight: 600,
            color: 'rgba(110, 110, 110, 1)',
            lineHeight: '100%',
            letterSpacing: '0%',
            opacity: 1,
            margin: 0
          }}>
            Posted on: {job.postedDate}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <p style={{
              width: '56px',
              height: '18px',
              position: 'absolute',
              top: '326px',
              left: '28px',
              fontFamily: 'Poppins',
              fontSize: '12px',
              color: 'rgba(110, 110, 110, 1)',
              fontWeight: 600,
              lineHeight: '100%',
              letterSpacing: '0%',
              opacity: 1,
              margin: 0
            }}>
              JOB TYPE
            </p>
            <p style={{
              width: '59px',
              height: '18px',
              position: 'absolute',
              top: '326px',
              left: '95px',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 1)',
              lineHeight: '100%',
              letterSpacing: '0%',
              textAlign: 'left',
              opacity: 1,
              margin: 0
            }}>
              {job.jobType}
            </p>
          </div>
          <div>
            <p style={{
              width: '59px',
              height: '18px',
              position: 'absolute',
              top: '326px',
              left: '170px',
              fontFamily: 'Poppins',
              fontSize: '12px',
              color: 'rgba(110, 110, 110, 1)',
              fontWeight: 600,
              marginBottom: '2px',
              lineHeight: '100%',
              letterSpacing: '0%',
              textAlign: 'center',
              opacity: 1
            }}>
              INDUSTRY
            </p>
            <p style={{
              width: '120px',
              height: '18px',
              position: 'absolute',
              top: '326px',
              left: '240px',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 1)',
              lineHeight: '100%',
              letterSpacing: '0%',
              textAlign: 'left',
              opacity: 1,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {job.industry}
            </p>
          </div>
          <div>
            <p style={{
              width: '26px',
              height: '18px',
              position: 'absolute',
              top: '347px',
              left: '28px',
              fontFamily: 'Poppins',
              fontSize: '12px',
              color: 'rgba(110, 110, 110, 1)',
              fontWeight: 600,
              lineHeight: '100%',
              letterSpacing: '0%',
              textAlign: 'left',
              opacity: 1,
              margin: 0
            }}>
              CTC
            </p>
            <p style={{
              width: '100px',
              height: '18px',
              position: 'absolute',
              top: '347px',
              left: '65px',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 1)',
              lineHeight: '100%',
              letterSpacing: '0%',
              textAlign: 'left',
              opacity: 1,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {job.ctc}
            </p>
          </div>
          <div>
            <p style={{
              width: '62px',
              height: '18px',
              position: 'absolute',
              top: '347px',
              left: '170px',
              fontFamily: 'Poppins',
              fontSize: '12px',
              color: 'rgba(110, 110, 110, 1)',
              fontWeight: 600,
              marginBottom: '2px',
              lineHeight: '100%',
              letterSpacing: '0%',
              opacity: 1
            }}>
              LOCATION
            </p>
            <p style={{
              width: '120px',
              height: 'auto',
              position: 'absolute',
              top: '347px',
              left: '240px',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 1)',
              lineHeight: '100%',
              letterSpacing: '0%',
              textAlign: 'left',
              opacity: 1,
              margin: 0
            }}>
              {job.location}
            </p>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            width: '79px',
            height: '18px',
            position: 'absolute',
            top: '390px',
            left: '28px',
            fontFamily: 'Poppins',
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(8, 8, 8, 1)',
            marginBottom: '8px',
            lineHeight: '100%',
            letterSpacing: '0%',
            opacity: 1
          }}>
            DESCRIPTION
          </p>
          <div style={{
            width: '340px',
            height: 'auto',
            position: 'absolute',
            top: '418px',
            left: '28px',
            opacity: 1,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
            }}>
            <p style={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: 600,
              color: '#6E6E6E',
              lineHeight: '140%',
              letterSpacing: '0%',
              margin: 0,
              background: 'linear-gradient(135deg, #6E6E6E 0%, #8E8E8E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {`${job.description.split(' ').slice(0, 25).join(' ')}...`}
              <span style={{
                color: '#4285F4',
                fontWeight: 600,
                fontFamily: 'Poppins',
                fontSize: '12px',
                lineHeight: '140%',
                letterSpacing: '0%',
                textDecoration: 'underline',
                textDecorationStyle: 'solid',
                cursor: 'pointer',
                marginLeft: '4px',
                background: 'none',
                WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: '#4285F4'
              }}>more</span>
            </p>
          </div>
        </div>
        <div style={{ marginTop: '100px' }}>
          <p style={{
            width: '88px',
            height: '18px',
            position: 'absolute',
            top: '550px',
            left: '28px',
            fontFamily: 'Poppins',
            fontSize: '12px',
            fontWeight: 600,
            color: '#000000',
            marginBottom: '10px',
            lineHeight: '100%',
            letterSpacing: '0%',
            opacity: 1
          }}>
            ELIGIBLE SKILLS
          </p>
          <div style={{
            position: 'absolute',
            top: '578px',
            left: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            maxHeight: isApplied ? 'none' : '80px',
            overflowY: isApplied ? 'visible' : 'hidden'
          }} className={!isApplied ? 'skills-container' : ''}>
            {(isApplied ? job.skills : job.skills.slice(0, 3)).map((skill: string, idx: number) => (
              <div
                key={idx}
                style={{
                  width: 'auto',
                  minWidth: '60px',
                  height: '32px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '2px solid rgba(66, 133, 244, 0.2)',
                  background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#4285F4',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 1,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(66, 133, 244, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.2)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(66, 133, 244, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)';
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Swipe to Apply Button - Bottom Center */}
        {!appliedJobIds.has(job.id) && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '250px',
            height: '45px',
            background: 'linear-gradient(135deg, #4285F4 0%, #667eea 100%)',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
            boxShadow: '0 8px 24px rgba(66, 133, 244, 0.3)',
            cursor: 'pointer',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
            onClick={(e) => handleApply(job.id, e)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(-50%) translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(66, 133, 244, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(-50%) translateY(0px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(66, 133, 244, 0.3)';
            }}>
            {/* Swipe Animation Background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              animation: 'swipeGlow 2s infinite',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '16px',
                color: '#FFFFFF',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>Apply Now</span>
              <div style={{
                width: '24px',
                height: '24px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite'
              }}>
                <div style={{
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid #FFFFFF',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  marginLeft: '1px'
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (selectedJob) {
    const isJobApplied = appliedJobIds.has(selectedJob.id);
    return <MobileJobDetail job={selectedJob} onBack={() => setSelectedJob(null)} isApplied={isJobApplied} />;
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Tabs - Enhanced styling */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px 16px 16px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{
          display: 'flex',
          gap: '12px',
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
                padding: '12px 20px',
                borderRadius: '25px',
                border: activeTab === tab.id ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.3)',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                fontFamily: 'Poppins',
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(10px)',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div style={{
        marginTop: '70px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '100px',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'transparent'
      }} className="job-cards-container">
        {loading ? (
          <MobileLoader />
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Bookmark set="bulk" primaryColor="rgba(19, 15, 38, 1)" size={60} />
            </div>
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
        
        @keyframes swipeGlow {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
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
