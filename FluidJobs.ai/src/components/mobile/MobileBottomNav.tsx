import React from 'react';
import { User, Notification, Work, Paper } from 'react-iconly';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'alerts', label: 'Alerts', icon: 'Notification', textColor: 'rgba(145, 145, 145, 1)' },
    { id: 'jobs', label: 'My Jobs', icon: 'Work', textColor: 'rgba(161, 159, 168, 1)' },
    { id: 'resume', label: 'My\u00A0Resume', icon: 'Paper', textColor: 'rgba(161, 159, 168, 1)' },
    { id: 'profile', label: 'Profile', icon: 'Profile', textColor: 'rgba(161, 159, 168, 1)' },
  ];

  return (
    <div 
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '305px',
        height: '70px',
        bottom: '20px',
        zIndex: 9999,
        background: 'transparent',
        boxShadow: '0px 0px 10px 2px rgba(0, 0, 0, 0.15)',
        borderRadius: '100px'
      }}
    >
      <div className="flex justify-around items-center h-full px-3">
        {tabs.map((tab, index) => {
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
                    background: 'rgba(66, 133, 244, 0.16)',
                    borderRadius: '30px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: tab.id === 'resume' ? '84px' : '62px',
                    height: '60px'
                  }}
                ></div>
              )}
              <div className="relative z-10 mb-1.5">
                {tab.icon === 'Notification' && <Notification set="bulk" primaryColor={isActive ? '#4285F4' : '#1F2937'} size={30} />}
                {tab.icon === 'Work' && <Work set="bulk" primaryColor={isActive ? '#4285F4' : '#1F2937'} size={25} />}
                {tab.icon === 'Paper' && <Paper set="bulk" primaryColor={isActive ? '#4285F4' : '#1F2937'} size={25} />}
                {tab.icon === 'Profile' && <User set="bulk" primaryColor={isActive ? '#4285F4' : 'rgba(19, 15, 38, 1)'} size={30} />}
              </div>
              <span 
                className="relative z-10"
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '10px',
                  lineHeight: '100%',
                  color: isActive ? '#4285F4' : tab.textColor,
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
