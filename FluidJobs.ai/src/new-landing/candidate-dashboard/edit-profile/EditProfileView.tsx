import React from 'react';
import EditProfileCard from './EditProfileCard';
import InformationEditCard from './InformationEditCard';
import WorkExperienceEditCard from './WorkExperienceEditCard';
import ResumeUploadCard from './ResumeUploadCard';
import { useTheme, getThemeColors } from '../ThemeContext';

const EditProfileView: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6" style={{ color: colors.textPrimary }}>Edit Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="space-y-6 flex flex-col lg:col-span-2">
          <EditProfileCard />
          <InformationEditCard />
        </div>

        <div className="space-y-6 lg:col-span-3">
          <WorkExperienceEditCard />
          <ResumeUploadCard />
        </div>
      </div>
    </div>
  );
};

export default EditProfileView;
