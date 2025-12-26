import React, { useState, useEffect } from 'react';
import { User, Download, Share2, Eye, FileText, Plus } from 'lucide-react';
import axios from 'axios';
import ResumeProfileForm from './ResumeProfileForm';

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  views?: number;
  downloads?: number;
}

const MobileMyResume: React.FC = () => {
  const [profileData, setProfileData] = useState<any>({});
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResumeForm, setShowResumeForm] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.get('http://localhost:8000/api/profile/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile: any = response.data;
      setProfileData(profile);
      
      // Fetch resumes
      if (profile.resumes && profile.resumes.length > 0) {
        setResumes(profile.resumes);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = () => {
    setShowResumeForm(true);
  };

  const handleAIReview = () => {
    // Navigate to AI resume reviewer
    console.log('AI Resume Reviewer clicked');
  };

  if (loading) {
    return (
      <div style={{ background: '#F1F1F1', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #E5E7EB', borderTop: '4px solid #4285F4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <ResumeProfileForm isOpen={showResumeForm} onClose={() => setShowResumeForm(false)} />
      
      <div style={{ background: '#F1F1F1', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Profile Header Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '0 0 30px 30px', overflow: 'hidden', marginBottom: '16px' }}>
        {/* Blue Header Background */}
        <div style={{ 
          background: 'linear-gradient(135deg, #4285F4 0%, #0060FF 100%)', 
          height: '180px',
          borderRadius: '0 0 30px 30px',
          position: 'relative'
        }}>
          {/* Profile Picture Circle */}
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: profileData.profile_image_url ? `url(${profileData.profile_image_url})` : '#6BA3F7',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '6px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            {!profileData.profile_image_url && <User style={{ width: '50px', height: '50px', color: '#FFFFFF' }} />}
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ padding: '60px 24px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '20px', color: '#000000', marginBottom: '4px' }}>
            {profileData.full_name || 'Shriram Surse'}
          </h2>
          <p style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 500, color: '#4285F4', marginBottom: '20px' }}>
            {profileData.city || 'Pune, Maharashtra'} | Joined {new Date(profileData.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleGenerateResume}
              style={{
                width: '100%',
                background: '#4285F4',
                color: 'white',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              📄 Generate Resume
            </button>
            <button 
              onClick={handleAIReview}
              style={{
                width: '100%',
                background: '#34A853',
                color: 'white',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🤖 AI Resume Reviewer
            </button>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '20px', margin: '0 16px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', color: '#000000', marginBottom: '16px' }}>
          Information
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>✉️</span>
              <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 500, color: '#6E6E6E' }}>Email Address</span>
            </div>
            <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>
              {profileData.email || 'ram@fluid.live'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📞</span>
              <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 500, color: '#6E6E6E' }}>Phone Number</span>
            </div>
            <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>
              {profileData.phone || '+91 98765 XXXXX'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>🎂</span>
              <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 500, color: '#6E6E6E' }}>DOB (Date of Birth)</span>
            </div>
            <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>
              {profileData.dob || '01/01/2004'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 500, color: '#6E6E6E' }}>Current City</span>
            </div>
            <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>
              {profileData.city || 'Pune, Maharashtra'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>ℹ️</span>
              <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 500, color: '#6E6E6E' }}>Joined</span>
            </div>
            <span style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#000000' }}>
              {new Date(profileData.created_at || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Work Experience Section */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '20px', margin: '0 16px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', color: '#000000' }}>
          Work Experience
        </h3>
      </div>

      {/* Resume Section */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '20px', margin: '0 16px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', color: '#000000' }}>
          Resume
        </h3>
      </div>

      {/* Skills Section */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '20px', margin: '0 16px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '18px', color: '#000000', marginBottom: '16px' }}>
          Skills
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {['Python', 'C/C++', 'Java'].map((skill) => (
            <div
              key={skill}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: '1px solid #4285F4',
                background: '#FFFFFF',
                fontFamily: 'Poppins',
                fontSize: '13px',
                color: '#4285F4',
                fontWeight: 500
              }}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    </>
  );
};

export default MobileMyResume;
