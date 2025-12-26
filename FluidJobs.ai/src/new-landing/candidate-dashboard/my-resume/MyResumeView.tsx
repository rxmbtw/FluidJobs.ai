import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Info, FilePlus, Sparkles } from 'lucide-react';
import Loader from '../../../components/Loader';
import AIResumeReviewer from './AIResumeReviewer';

interface MyResumeViewProps {
  themeState?: 'light' | 'dark';
}

const MyResumeView: React.FC<MyResumeViewProps> = ({ themeState = 'light' }) => {
  const [loading, setLoading] = useState(true);
  const [showAIReviewer, setShowAIReviewer] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
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

  if (showAIReviewer) {
    return <AIResumeReviewer themeState={themeState} onBack={() => setShowAIReviewer(false)} />;
  }

  return (
    <div style={{ backgroundColor: bgColor, height: 'calc(100vh - 116px)', padding: '12px 40px', overflow: 'hidden' }}>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '24px', color: textPrimary, marginBottom: '12px' }}>My Resume</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '12px', height: 'calc(50% - 30px)' }}>
        {/* Profile Card */}
        <div style={{ backgroundColor: cardBg, borderRadius: '20px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
          {/* Blue Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4285F4 0%, #0060FF 100%)',
            height: '80px',
            borderRadius: '16px',
            marginBottom: '45px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              bottom: '-35px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#6BA3F7',
              border: '4px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User style={{ width: '35px', height: '35px', color: '#FFFFFF' }} />
            </div>
          </div>

          {/* User Info */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '16px', color: textPrimary, marginBottom: '4px' }}>
              Shriram Surse
            </h2>
            <p style={{ fontFamily: 'Poppins', fontSize: '10px', fontWeight: 500, color: '#4285F4' }}>
              Pune, Maharashtra | Joined Oct 2025
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              flex: 1,
              background: '#4285F4',
              color: 'white',
              padding: '8px 6px',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}>
              <FilePlus style={{ width: '13px', height: '13px', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>Generate Resume</span>
            </button>
            <button 
              onClick={() => setShowAIReviewer(true)}
              style={{
              flex: 1,
              background: '#34A853',
              color: 'white',
              padding: '8px 6px',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}>
              <Sparkles style={{ width: '13px', height: '13px', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>AI Resume Reviewer</span>
            </button>
          </div>
        </div>

        {/* Work Experience */}
        <div style={{ backgroundColor: cardBg, borderRadius: '20px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '16px', color: textPrimary, marginBottom: '12px' }}>Work Experience</h3>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <p style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: textPrimary, marginBottom: '3px' }}>
                  FluidLive Solutions Pvt Ltd
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: '#4285F4' }}>
                  Pune, Maharashtra
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: textPrimary, marginBottom: '3px' }}>
                  Aug 2025 - Present
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: '10px', color: textSecondary }}>
                  Current CTC: 3LPA
                </p>
              </div>
            </div>
            <div style={{ width: '100%', height: '1px', background: '#E0E0E0' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', height: 'calc(50% - 30px)' }}>
        {/* Information */}
        <div style={{ backgroundColor: cardBg, borderRadius: '20px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '16px', color: textPrimary, marginBottom: '12px' }}>Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid #6E6E6E', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail style={{ width: '11px', height: '11px', color: textSecondary }} />
                </div>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: textSecondary }}>Email Address</span>
              </div>
              <span style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: textPrimary }}>ram@fluid.live</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid #6E6E6E', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone style={{ width: '11px', height: '11px', color: textSecondary }} />
                </div>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: textSecondary }}>Phone Number</span>
              </div>
              <span style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: textPrimary }}>+91 98765 XXXXX</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid #6E6E6E', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar style={{ width: '11px', height: '11px', color: textSecondary }} />
                </div>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: textSecondary }}>DOB (Date of Birth)</span>
              </div>
              <span style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: textPrimary }}>01/01/2004</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid #6E6E6E', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin style={{ width: '11px', height: '11px', color: textSecondary }} />
                </div>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: textSecondary }}>Current City</span>
              </div>
              <span style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: textPrimary }}>Pune, Maharashtra</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid #6E6E6E', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info style={{ width: '11px', height: '11px', color: textSecondary }} />
                </div>
                <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: textSecondary }}>Joined</span>
              </div>
              <span style={{ fontFamily: 'Poppins', fontSize: '11px', fontWeight: 600, color: textPrimary }}>5 Oct 2025</span>
            </div>
          </div>
        </div>

        {/* Resume & Skills - Merged */}
        <div style={{ backgroundColor: cardBg, borderRadius: '20px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '16px', color: textPrimary, marginBottom: '12px' }}>Resume</h3>
          
          {/* Resume upload area will go here */}
          
          {/* Separator Line */}
          <div style={{ width: '100%', height: '1px', background: '#E0E0E0', margin: '60px 0 24px 0' }} />
          
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '16px', color: textPrimary, marginBottom: '12px' }}>Skills</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['Python', 'C/C++', 'Java'].map((skill) => (
              <div key={skill} style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: '1px solid #4285F4',
                fontFamily: 'Poppins',
                fontSize: '14px',
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
  );
};

export default MyResumeView;
