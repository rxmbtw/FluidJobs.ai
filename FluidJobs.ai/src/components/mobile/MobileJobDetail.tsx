import React from 'react';
import { ArrowLeft, Bookmark, User } from 'lucide-react';

interface JobDetailProps {
  job: any;
  onBack: () => void;
}

const MobileJobDetail: React.FC<JobDetailProps> = ({ job, onBack }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div style={{ background: '#F1F1F1', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: '#FFFFFF', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '24px', height: '24px', color: '#000000' }} />
        </button>
        <h2 style={{ fontFamily: 'Poppins', fontSize: '16px', fontWeight: 600, color: '#000000', margin: 0 }}>
          Job Details
        </h2>
      </div>

      {/* Job Card */}
      <div style={{ background: '#FFFFFF', margin: '16px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {/* Banner */}
        <div style={{ margin: '20px', height: '145px', background: '#C4C4C4', position: 'relative', borderRadius: '20px' }}>
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
            <img src="/images/FLuid Live Icon.png" alt="Company Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
          </div>

          {/* Apply & Bookmark - Positioned below banner */}
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
              onClick={toggleBookmark}
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
                  fill: isBookmarked ? '#000000' : 'none'
                }} 
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '30px 20px 20px' }}>

          {/* Title */}
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', color: '#000000', marginBottom: '4px' }}>
            {job.job_title}
          </h3>
          <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 500, color: '#6E6E6E', marginBottom: '16px' }}>
            Posted on: {new Date(job.saved_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>

          {/* Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>JOB TYPE</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>{job.job_type}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>INDUSTRY</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>technology</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>CTC</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>{job.salary_range || 'Rs.6.0L-Rs.15.0L'}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#6E6E6E', fontWeight: 600, marginBottom: '2px' }}>LOCATION</p>
              <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: '#000000' }}>{job.location}</p>
            </div>
          </div>

          {/* Registration Schedule */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '10px' }}>
              REGISTRATION SCHEDULE
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📅</span>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: '#000000' }}>
                  <strong>Opens:</strong> 11:00AM, 25 Oct 2025
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', filter: 'hue-rotate(180deg)' }}>📅</span>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: '#000000' }}>
                  <strong>Closes:</strong> 11:00AM, 29 Oct 2025
                </span>
              </div>
            </div>
          </div>

          {/* About Organization */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '10px' }}>
              ABOUT THE ORGANIZATION
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 500, color: '#6E6E6E', lineHeight: '1.5', marginBottom: '10px' }}>
              FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, <span style={{ color: '#4285F4', fontWeight: 600 }}>more</span>
            </p>
            <button style={{
              background: 'transparent',
              border: 'none',
              color: '#4285F4',
              fontFamily: 'Poppins',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
              cursor: 'pointer'
            }}>
              View Website 🚀
            </button>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '10px' }}>
              DESCRIPTION
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 500, color: '#6E6E6E', lineHeight: '1.5' }}>
              FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable
            </p>
          </div>

          {/* Skills */}
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 700, color: '#000000', marginBottom: '10px' }}>
              ELIGIBLE SKILLS
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['Python', 'C/C++', 'Java'].map((skill) => (
                <div key={skill} style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #4285F4',
                  background: '#FFFFFF',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
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
    </div>
  );
};

export default MobileJobDetail;
