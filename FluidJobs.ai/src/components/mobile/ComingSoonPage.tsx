import React from 'react';
import { Clock } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ 
  title, 
  description = "We're working hard to bring you this feature. Stay tuned!" 
}) => {
  return (
    <div className="mobile-view" style={{ background: '#F1F1F1', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'fixed', width: '100%', top: 0, left: 0, padding: '20px 16px 100px 16px' }}>
      {/* Coming Soon Card */}
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '24px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Title inside container - top left */}
          <h1 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '25px',
            lineHeight: '29px',
            color: '#000000',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            {title}
          </h1>
          
          {/* Coming Soon Content - centered */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
            background: 'rgba(66, 133, 244, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Clock className="w-10 h-10" style={{ color: '#4285F4', strokeWidth: 2 }} />
          </div>
          
            <h2 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#000000',
            marginBottom: '12px'
          }}>
            Coming Soon
          </h2>
          
            <p style={{
            fontFamily: 'Poppins',
            fontWeight: 500,
            fontSize: '13px',
            lineHeight: '18px',
            color: '#6E6E6E',
            maxWidth: '260px'
          }}>
            {description}
          </p>

            <div className="flex items-center space-x-2 mt-6">
            <div style={{
              width: '6px',
              height: '6px',
              background: '#4285F4',
              borderRadius: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
            <span style={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '12px',
              color: '#4285F4'
            }}>
              We're working on it
            </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
