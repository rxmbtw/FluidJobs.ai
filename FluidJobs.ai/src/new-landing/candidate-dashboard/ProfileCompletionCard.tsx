import React from 'react';
import ProfileStep from './ProfileStep';
import { useTheme, getThemeColors } from './ThemeContext';

interface ProfileCompletionCardProps {
  profileData: {
    resumeUploaded: boolean;
    pictureUploaded: boolean;
    addressAdded: boolean;
  };
  onUpdateStatus: (field: string) => void;
}

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ profileData, onUpdateStatus }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const steps = [
    { field: 'resumeUploaded', label: 'Upload resume', icon: 'file-up' },
    { field: 'pictureUploaded', label: 'Upload profile picture', icon: 'image' },
    { field: 'addressAdded', label: 'Add your address', icon: 'map-pin' }
  ];

  const completedSteps = steps.filter(step => profileData[step.field as keyof typeof profileData]).length;
  const percentage = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="lg:col-span-1 space-y-4" style={{ order: 2 }}>
      <div className="p-6 rounded-xl shadow-xl" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>Complete your profile</h2>
        
        <p className="text-xs font-semibold mb-6 leading-tight" style={{ color: colors.textSecondary }}>
          By completing your profile you can start applying to job openings in one click...
        </p>

        <div className="mb-8">
          <div className="flex justify-start text-sm font-semibold mb-2">
            <span style={{ color: colors.textPrimary }}>{percentage}% Complete</span>
          </div>
          <div className="w-full rounded-full h-3" style={{ backgroundColor: colors.border }}>
            <div 
              className="h-3 rounded-full shadow-inner transition-all duration-500"
              style={{ width: `${percentage}%`, backgroundColor: colors.accent }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {steps.map(step => (
            <ProfileStep
              key={step.field}
              field={step.field}
              label={step.label}
              icon={step.icon}
              isComplete={profileData[step.field as keyof typeof profileData]}
              onClick={() => onUpdateStatus(step.field)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
