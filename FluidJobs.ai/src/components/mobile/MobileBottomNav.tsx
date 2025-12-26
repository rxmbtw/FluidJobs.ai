import React from 'react';
import { User, Bell, Briefcase, FileText } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'resume', label: 'My\u00A0Resume', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div 
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(360px, 92vw)',
        height: '72px',
        bottom: '20px',
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12), 0px 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: '100px',
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}
    >
      <div className="flex justify-around items-center h-full px-3">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center transition-all"
              style={{ 
                flex: 1,
                cursor: 'pointer', 
                background: 'transparent', 
                border: 'none', 
                padding: '8px 4px',
                minWidth: '70px'
              }}
            >
              {isActive && (
                <div
                  className="absolute"
                  style={{
                    background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.2), rgba(0, 96, 255, 0.15))',
                    borderRadius: '20px',
                    top: '0',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    boxShadow: '0px 2px 8px rgba(66, 133, 244, 0.2)'
                  }}
                ></div>
              )}
              <Icon 
                className="relative z-10 mb-1.5" 
                style={{ 
                  width: '24px', 
                  height: '24px',
                  color: isActive ? '#4285F4' : '#1F2937',
                  strokeWidth: isActive ? 2.5 : 2
                }} 
              />
              <span 
                className="relative z-10"
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '10px',
                  lineHeight: '12px',
                  color: isActive ? '#4285F4' : '#1F2937',
                  textAlign: 'center'
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
