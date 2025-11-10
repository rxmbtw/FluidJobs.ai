import React from 'react';
import { useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';
import ManageCandidatesWrapper from '../../components/ManageCandidatesWrapper';

const ThemedManageCandidates: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <div style={{ backgroundColor: colors.bgMain, minHeight: '100vh' }}>
      <style>{`
        .bg-gray-50 { background-color: ${colors.bgMain} !important; }
        .bg-white { background-color: ${colors.bgCard} !important; }
        .text-gray-900 { color: ${colors.textPrimary} !important; }
        .text-gray-800 { color: ${colors.textPrimary} !important; }
        .text-gray-700 { color: ${colors.textPrimary} !important; }
        .text-gray-600 { color: ${colors.textSecondary} !important; }
        .text-gray-500 { color: ${colors.textSecondary} !important; }
        .border-gray-200 { border-color: ${colors.border} !important; }
        .border-gray-300 { border-color: ${colors.border} !important; }
        input, select, textarea { 
          background-color: ${colors.bgCard} !important; 
          color: ${colors.textPrimary} !important;
          border-color: ${colors.border} !important;
        }
        input::placeholder, textarea::placeholder, select option {
          color: ${colors.textSecondary} !important;
          opacity: 1 !important;
        }
        select { color: ${colors.textPrimary} !important; }
        option { background-color: ${colors.bgCard} !important; color: ${colors.textPrimary} !important; }
      `}</style>
      <ManageCandidatesWrapper />
    </div>
  );
};

export default ThemedManageCandidates;
