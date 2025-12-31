import React from 'react';
import { Bell, BellOff } from 'lucide-react';
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
            <Bell 
              className="w-7 h-7" 
              strokeWidth={1.5} 
              style={{ color: themeState === 'light' ? '#000000' : '#f9fafb' }} 
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
            <BellOff 
              className="w-20 h-20 mb-6" 
              style={{ color: themeState === 'light' ? '#D1D5DB' : '#4B5563' }} 
            />
            <p 
              className="text-lg font-medium" 
              style={{ 
                fontFamily: 'Poppins, sans-serif', 
                color: themeState === 'light' ? '#6E6E6E' : '#9ca3af' 
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
