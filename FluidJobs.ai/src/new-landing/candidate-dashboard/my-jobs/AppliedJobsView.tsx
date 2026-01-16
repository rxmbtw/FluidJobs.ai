import React from 'react';
import { Info, CheckCircle } from 'lucide-react';

interface AppliedJobsViewProps {
  themeState?: 'light' | 'dark';
  onJobClick: (job: any) => void;
}

const AppliedJobsView: React.FC<AppliedJobsViewProps> = ({ themeState = 'light', onJobClick }) => {
  const bgColor = themeState === 'light' ? '#F1F1F1' : '#1a1a1a';
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6E6E6E' : '#9ca3af';

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

  return (
    <div>
      {/* Job Card */}
      <div 
        onClick={() => onJobClick(mockJob)}
        style={{
        backgroundColor: cardBg,
        borderRadius: '20px',
        padding: '20px',
        maxWidth: '896px',
        margin: '0 auto',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Banner */}
        <div style={{ width: '100%', height: '120px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative', borderRadius: '20px', marginBottom: '40px' }}>
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
            <img src="/images/FLuid Live Icon light theme.png" alt="Company Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Title & Status Badges */}
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #000000',
                background: '#FFFFFF'
              }}>
                <Info style={{ width: '16px', height: '16px', color: '#000000' }} />
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: '#000000' }}>Under Review</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#34A853'
              }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Applied</span>
              </div>
            </div>
          </div>

          {/* Job Details - Grid Layout */}
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
    </div>
  );
};

export default AppliedJobsView;
