import React from 'react';
import { Megaphone, Zap } from 'lucide-react';
import { useTheme, getThemeColors } from './ThemeContext';

interface AnnouncementsSectionProps {
  profileData: {
    resumeUploaded: boolean;
    pictureUploaded: boolean;
    addressAdded: boolean;
  };
}

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ profileData }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const completedSteps = [
    profileData.resumeUploaded,
    profileData.pictureUploaded,
    profileData.addressAdded
  ].filter(Boolean).length;
  
  const totalSteps = 3;
  const isComplete = completedSteps === totalSteps;

  return (
    <div className="lg:col-span-2 space-y-4" style={{ order: 1 }}>
      <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Announcements</h2>

      {isComplete ? (
        <div className="p-8 rounded-xl shadow-xl flex flex-col items-center justify-center text-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', minHeight: '400px', border: '1px solid #10B981' }}>
          <Zap className="w-16 h-16 mb-6 animate-pulse" style={{ color: '#10B981' }} />
          <p className="text-2xl font-bold mb-2" style={{ color: '#10B981' }}>Profile Complete!</p>
          <p className="text-sm md:text-base font-semibold max-w-md" style={{ color: colors.textPrimary }}>
            Great job! You're all set to use our one-click application feature. Stay tuned for job announcements tailored to your profile.
          </p>
        </div>
      ) : (
        <div className="p-8 rounded-xl shadow-xl flex flex-col items-center justify-center text-center" style={{ backgroundColor: colors.bgCard, minHeight: '400px', border: `1px solid ${colors.border}` }}>
          <Megaphone className="w-16 h-16 mb-6" style={{ color: colors.textSecondary }} />
          <p className="text-sm md:text-base font-semibold max-w-sm" style={{ color: colors.textSecondary }}>
            Complete your profile ({completedSteps}/{totalSteps}) to start getting announcements of the latest job openings!
          </p>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsSection;
