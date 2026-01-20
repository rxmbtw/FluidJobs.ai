import React from 'react';
import { BellOff } from 'lucide-react';
import { Notification } from 'react-iconly';
import ProfileCompletion from '../ProfileCompletion';

interface DesktopAlertsPageProps {
  themeState: 'light' | 'dark';
  isProfileComplete: boolean;
  loading?: boolean;
  onNavigateToEdit: () => void;
  onNavigateToResume: () => void;
}

const DesktopAlertsPage: React.FC<DesktopAlertsPageProps> = ({
  themeState,
  isProfileComplete,
  loading = false,
  onNavigateToEdit,
  onNavigateToResume
}) => {
  return (
    <div className="p-6 w-full h-full overflow-hidden">
      <div className={`grid gap-4 h-full ${isProfileComplete ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* Alerts Section */}
        <div 
          className={`${isProfileComplete ? 'col-span-1' : 'col-span-1 lg:col-span-2'} px-6 py-6 rounded-[25px] flex flex-col`} 
          style={{ 
            maxHeight: 'calc(100vh - 180px)', 
            backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' 
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Notification 
              set="bulk" 
              primaryColor={themeState === 'light' ? '#000000' : '#f9fafb'} 
              size={28} 
            />
            <h2 
              className="text-3xl font-semibold" 
              style={{ 
                fontFamily: 'Poppins, sans-serif', 
                color: themeState === 'light' ? '#000000' : '#f9fafb' 
              }}
            >
              Alerts
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center text-center flex-1">
            <p 
              className="text-lg font-medium" 
              style={{ 
                fontFamily: 'Roboto, sans-serif', 
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '100%',
                color: 'rgba(110, 110, 110, 1)',
                maxWidth: '323px',
                textAlign: 'center'
              }}
            >
              Complete your profile to start getting announcements of the latest job openings!
            </p>
          </div>
        </div>

        {/* Profile Completion Card */}
        {!isProfileComplete && !loading && (
          <div className="col-span-1 flex" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <ProfileCompletion 
              themeState={themeState}
              onNavigateToEdit={onNavigateToEdit}
              onNavigateToResume={onNavigateToResume}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopAlertsPage;
