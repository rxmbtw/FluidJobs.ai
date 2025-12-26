import React from 'react';
import { Bell, Briefcase, FileText, User } from 'lucide-react';

const MobileLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      {/* Logo and Progress Bar - Centered */}
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center mb-6">
          <img 
            src="/images/FLuid Live Icon light theme.png" 
            alt="FluidJobs" 
            style={{ width: '40px', height: '40px', marginRight: '8px' }}
          />
          <h1 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '24px',
            color: '#4285F4'
          }}>
            FluidJobs.ai
          </h1>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '260px',
          height: '8px',
          background: '#E5E7EB',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #4285F4 0%, #9CA3AF 100%)',
            borderRadius: '4px',
            animation: 'loadProgress 2s ease-out forwards'
          }}></div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '305px',
        height: '70px',
        background: '#F1F1F1',
        boxShadow: '0px 0px 10px 2px rgba(0, 0, 0, 0.1)',
        borderRadius: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bell style={{ width: '24px', height: '24px', color: '#6B7280', marginBottom: '4px' }} />
          <span style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'Poppins', fontWeight: 600 }}>Alerts</span>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(66, 133, 244, 0.16)',
          borderRadius: '30px',
          padding: '8px 16px'
        }}>
          <Briefcase style={{ width: '24px', height: '24px', color: '#4285F4', marginBottom: '4px' }} />
          <span style={{ fontSize: '10px', color: '#4285F4', fontFamily: 'Poppins', fontWeight: 600 }}>My Jobs</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FileText style={{ width: '24px', height: '24px', color: '#6B7280', marginBottom: '4px' }} />
          <span style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'Poppins', fontWeight: 600 }}>My Resume</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <User style={{ width: '24px', height: '24px', color: '#6B7280', marginBottom: '4px' }} />
          <span style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'Poppins', fontWeight: 600 }}>Profile</span>
        </div>
      </div>

      <style>{`
        @keyframes loadProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MobileLoader;
