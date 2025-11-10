import React from 'react';
import { useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';
import JobOpenings from '../../pages/JobOpenings';

interface ThemedJobOpeningsProps {
  onJobSelect: (jobTitle: string) => void;
}

const ThemedJobOpenings: React.FC<ThemedJobOpeningsProps> = ({ onJobSelect }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <div style={{ backgroundColor: colors.bgMain, minHeight: '100vh', padding: '2rem' }}>
      <style>{`
        .bg-gray-50 { background-color: ${colors.bgMain} !important; }
        .bg-white { background-color: ${colors.bgCard} !important; }
        .text-gray-900 { color: ${colors.textPrimary} !important; }
        .text-gray-700 { color: ${colors.textPrimary} !important; }
        .text-gray-600 { color: ${colors.textSecondary} !important; }
        .border-gray-200 { border-color: ${colors.border} !important; }
        .border-gray-100 { border-color: ${colors.border} !important; }
        .bg-slate-800 { background-color: ${colors.bgCard} !important; }
        .text-white { color: ${colors.textPrimary} !important; }
        .text-slate-300 { color: ${colors.textSecondary} !important; }
      `}</style>
      <JobOpenings onJobSelect={onJobSelect} />
    </div>
  );
};

export default ThemedJobOpenings;
