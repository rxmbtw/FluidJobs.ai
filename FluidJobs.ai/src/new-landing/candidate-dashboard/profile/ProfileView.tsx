import React from 'react';
import ProfileCard from './ProfileCard';
import WorkExperienceCard from './WorkExperienceCard';
import InformationCard from './InformationCard';
import SkillsResumeCard from './SkillsResumeCard';
import { useTheme, getThemeColors } from '../ThemeContext';

interface ProfileViewProps {
  onNavigateToEdit?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToEdit }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div className="w-full">
      <h2 className="text-[23px] font-bold mb-6" style={{ color: colors.textPrimary }}>Candidate Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-min">
        <ProfileCard onNavigateToEdit={onNavigateToEdit} />
        <WorkExperienceCard />
        <InformationCard />
        <SkillsResumeCard />
      </div>
    </div>
  );
};

export default ProfileView;
