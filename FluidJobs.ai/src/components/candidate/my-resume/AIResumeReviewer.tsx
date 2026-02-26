import React from 'react';
import { ChevronRight } from 'lucide-react';

interface AIResumeReviewerProps {
  themeState?: 'light' | 'dark';
  onBack: () => void;
}

const AIResumeReviewer: React.FC<AIResumeReviewerProps> = ({ themeState = 'light', onBack }) => {
  const bgColor = themeState === 'light' ? '#F1F1F1' : '#1a1a1a';
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#9E9E9E' : '#9ca3af';

  return (
    <div style={{ backgroundColor: bgColor, minHeight: 'calc(100vh - 116px)', padding: '20px 40px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <span 
          onClick={onBack}
          style={{ 
            fontFamily: 'Poppins', 
            fontSize: '20px', 
            fontWeight: 700, 
            color: textSecondary,
            cursor: 'pointer'
          }}
        >
          My Resume
        </span>
        <ChevronRight style={{ width: '20px', height: '20px', color: textSecondary }} />
        <span style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 700, color: textPrimary }}>
          AI Resume Reviewer
        </span>
      </div>

      {/* Coming Soon Card */}
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '20px',
        padding: '200px 40px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '500px'
      }}>
        <h1 style={{
          fontFamily: 'Poppins',
          fontSize: '48px',
          fontWeight: 700,
          color: '#C4C4C4',
          textAlign: 'center'
        }}>
          Coming Soon...
        </h1>
      </div>
    </div>
  );
};

export default AIResumeReviewer;
