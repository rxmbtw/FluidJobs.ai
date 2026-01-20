import React from 'react';
import { ArrowLeft, Bookmark, User, Info, CheckCircle } from 'lucide-react';

interface JobDetailProps {
  job: any;
  onBack: () => void;
  isApplied?: boolean;
}

const MobileJobDetail: React.FC<JobDetailProps> = ({ job, onBack, isApplied = false }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showSavePopup, setShowSavePopup] = React.useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    setShowSavePopup(true);
    setTimeout(() => setShowSavePopup(false), 3000);
  };

  return (
    <div style={{ background: '#F1F1F1', minHeight: '100vh', paddingBottom: '100px', position: 'relative' }}>
      {/* Save Popup */}
      {showSavePopup && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          backgroundColor: '#4285F4',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
          fontFamily: 'Poppins'
        }}>
          <svg viewBox="0 0 384 512" style={{ height: '14px', width: '14px' }}>
            <path fill="white" d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z" />
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{isBookmarked ? 'Saved job' : 'Unsaved job'}</span>
        </div>
      )}
      {/* Header - Enhanced styling */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '8px', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
          <ArrowLeft style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
        </button>
        <h2 style={{ fontFamily: 'Poppins', fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          Job Details
        </h2>
      </div>

      {/* Job Card - Matching all jobs card dimensions */}
      <div style={{ 
        width: '390px', 
        height: '1400px', 
        background: '#FFFFFF', 
        margin: '16px auto', 
        borderRadius: '45px', 
        overflow: 'hidden', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        position: 'relative',
        fontFamily: 'Poppins, sans-serif'
      }}>
        {/* Banner */}
        <div style={{ 
          margin: '20px', 
          height: '175px', 
          background: job.selectedImage ? `url(${job.selectedImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative', 
          borderRadius: '25px', 
          opacity: 1 
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-35px',
            left: '20px',
            width: '85px',
            height: '85px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '12px solid rgba(66, 133, 244, 0.2)',
            boxShadow: '0 0 0 12px rgba(66, 133, 244, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1
          }}>
            <img src="/images/FLuid Live Icon light theme.png" alt="Company Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
          </div>

          {/* Apply & Status Buttons - Top Right */}
          <div style={{ 
            position: 'absolute', 
            top: '190px', 
            right: '20px', 
            display: 'flex', 
            gap: '7px',
            zIndex: 10
          }}>
            {isApplied ? (
              <>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #000000',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  minWidth: '90px',
                  height: '28px'
                }}>
                  <Info style={{ width: '12px', height: '12px', color: '#000000' }} />
                  <span style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 600, color: '#000000' }}>Under Review</span>
                </button>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#34A853',
                  minWidth: '70px',
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
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)',
                  cursor: 'pointer',
                  minWidth: '90px',
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
                  onClick={toggleBookmark}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    width: '70px',
                    height: '28px',
                    borderRadius: '28px',
                    border: '1px solid rgba(66, 133, 244, 0.3)',
                    background: isBookmarked ? '#4285F4' : '#FFFFFF',
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
                      width: (isHovered || isBookmarked) ? '60px' : '20px',
                      height: '20px',
                      background: 'linear-gradient(135deg, #4285F4 0%, #667eea 100%)',
                      borderRadius: '50px',
                      display: 'flex',
                      alignItems:'center',
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
                      width: (isHovered || isBookmarked) ? '0' : '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isBookmarked ? 'white' : '#4285F4',
                      zIndex: 1,
                      transition: 'all 0.3s ease',
                      fontSize: (isHovered || isBookmarked) ? '0' : '10px',
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      transform: (isHovered || isBookmarked) ? 'translate(8px)' : 'translate(0px)',
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

        {/* Content */}
        <div style={{ padding: '30px 20px 40px', fontFamily: 'Poppins, sans-serif' }}>

          {/* Title */}
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', color: '#000000', marginBottom: '4px' }}>
            {job.title || job.job_title}
          </h3>
          <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 500, color: '#6E6E6E', marginBottom: '20px' }}>
            Posted on: {job.postedDate || (job.saved_at ? new Date(job.saved_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A')}
          </p>

          {/* Apply Now Button - Only show if not applied */}
          {!isApplied && (
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <button style={{
                background: 'linear-gradient(135deg, #4285F4 0%, #667eea 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(66, 133, 244, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
              }}>
                Apply Now <User style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          )}

          {/* Enhanced Metadata Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px', 
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.03) 0%, rgba(102, 126, 234, 0.03) 100%)',
            border: '1px solid rgba(66, 133, 244, 0.1)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(66, 133, 244, 0.05)'
          }}>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '4px' }}>JOB TYPE</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>{job.jobType || job.job_type}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '4px' }}>INDUSTRY</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>Technology</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '4px' }}>CTC</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>{job.salary_range || 'Rs.6.0L-Rs.15.0L'}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '4px' }}>LOCATION</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>{job.location}</p>
            </div>
          </div>

          {/* Registration Schedule - Creative Card */}
          <div style={{ 
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
            border: '2px solid rgba(66, 133, 244, 0.15)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(66, 133, 244, 0.08)'
          }}>
            <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: '#4285F4', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📅 REGISTRATION SCHEDULE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(52, 168, 83, 0.1)', borderRadius: '12px', border: '1px solid rgba(52, 168, 83, 0.2)' }}>
                <span style={{ fontSize: '16px' }}>🟢</span>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: '#34A853', fontWeight: 600 }}>
                  <strong>Opens:</strong> 11:00AM, 25 Oct 2025
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(234, 67, 53, 0.1)', borderRadius: '12px', border: '1px solid rgba(234, 67, 53, 0.2)' }}>
                <span style={{ fontSize: '16px' }}>🔴</span>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: '#EA4335', fontWeight: 600 }}>
                  <strong>Closes:</strong> 11:00AM, 29 Oct 2025
                </span>
              </div>
            </div>
          </div>

          {/* About Organization - Enhanced Card */}
          <div style={{ 
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
          }}>
            <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: '#000000', marginBottom: '12px' }}>
              🏢 ABOUT THE ORGANIZATION
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 500, color: '#6E6E6E', lineHeight: '1.6', marginBottom: '16px' }}>
              FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable solutions for businesses worldwide.
            </p>
            <button style={{
              background: 'linear-gradient(135deg, #4285F4 0%, #667eea 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: 'Poppins',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(66, 133, 244, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
            }}>
              🚀 View Website
            </button>
          </div>

          {/* Description - Enhanced */}
          <div style={{ 
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
          }}>
            <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: '#000000', marginBottom: '12px' }}>
              📝 DESCRIPTION
            </p>
            <p style={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontSize: '12px', 
              fontWeight: 500, 
              color: '#64748B', 
              lineHeight: '1.7',
              letterSpacing: '0.2px'
            }}>
              FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable solutions that meet the evolving needs of modern businesses.
            </p>
          </div>

          {/* Skills - Enhanced */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            marginBottom: '20px'
          }}>
            <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 700, color: '#000000', marginBottom: '16px' }}>
              🎯 ELIGIBLE SKILLS
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['Python', 'C/C++', 'Java', 'React', 'Node.js'].map((skill) => (
                <div key={skill} style={{
                  padding: '10px 16px',
                  borderRadius: '20px',
                  border: '2px solid rgba(66, 133, 244, 0.2)',
                  background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#4285F4',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(66, 133, 244, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.1)';
                }}>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
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
      `}</style>
    </div>
  );
};

export default MobileJobDetail;
