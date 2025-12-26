import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import Loader from './Loader';

interface ComingSoonPageProps {
  title: string;
  description?: string;
  themeState?: 'light' | 'dark';
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ 
  title, 
  description = "We're working hard to bring you this feature. Stay tuned!",
  themeState = 'light'
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const bgColor = themeState === 'light' ? '#F1F1F1' : '#1a1a1a';
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6E6E6E' : '#9ca3af';

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: bgColor, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Loader themeState={themeState} />
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: bgColor, 
      minHeight: '100vh', 
      padding: '20px 16px 100px 16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Coming Soon Card */}
      <div style={{ flex: 1, display: 'flex', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{
          backgroundColor: cardBg,
          borderRadius: '25px',
          padding: '40px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Title - top left */}
          <h1 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '32px',
            lineHeight: '38px',
            color: textPrimary,
            textAlign: 'left',
            marginBottom: '40px'
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
            textAlign: 'center',
            minHeight: '400px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'rgba(66, 133, 244, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px'
            }}>
              <Clock style={{ width: '60px', height: '60px', color: '#4285F4', strokeWidth: 2 }} />
            </div>
          
            <h2 style={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '34px',
              color: textPrimary,
              marginBottom: '16px'
            }}>
              Coming Soon
            </h2>
          
            <p style={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '24px',
              color: textSecondary,
              maxWidth: '400px'
            }}>
              {description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#4285F4',
                borderRadius: '50%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}></div>
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '14px',
                color: '#4285F4'
              }}>
                We're working on it
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default ComingSoonPage;
