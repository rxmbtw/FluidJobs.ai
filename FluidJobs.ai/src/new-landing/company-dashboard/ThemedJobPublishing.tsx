import React from 'react';
import { useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';
import JobCreationForm from '../../components/JobCreationForm';

interface ThemedJobPublishingProps {
  onBack: () => void;
}

const ThemedJobPublishing: React.FC<ThemedJobPublishingProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <div style={{ backgroundColor: colors.bgMain, minHeight: '100vh' }}>
      <style>{`
        .bg-gradient-to-br { background: ${colors.bgMain} !important; }
        .from-indigo-50 { background: ${colors.bgMain} !important; }
        .via-white { background: ${colors.bgMain} !important; }
        .to-purple-50 { background: ${colors.bgMain} !important; }
        .bg-white { background-color: ${colors.bgCard} !important; }
        .text-gray-900 { color: ${colors.textPrimary} !important; }
        .text-gray-800 { color: ${colors.textPrimary} !important; }
        .text-gray-700 { color: ${colors.textPrimary} !important; }
        .text-gray-600 { color: ${colors.textSecondary} !important; }
        .text-gray-500 { color: ${colors.textSecondary} !important; }
        .text-gray-400 { color: ${colors.textSecondary} !important; }
        .border-gray-200 { border-color: ${colors.border} !important; }
        .border-gray-300 { border-color: ${colors.border} !important; }
        .bg-gray-50 { background-color: ${theme === 'dark' ? '#1f2937' : '#f9fafb'} !important; }
        input, select, textarea { 
          background-color: ${colors.bgCard} !important; 
          color: ${colors.textPrimary} !important;
          border-color: ${colors.border} !important;
        }
        input::placeholder, textarea::placeholder {
          color: ${colors.textSecondary} !important;
          opacity: 1 !important;
        }
        select { color: ${colors.textPrimary} !important; }
        option { background-color: ${colors.bgCard} !important; color: ${colors.textPrimary} !important; }
        [contenteditable] {
          background-color: ${colors.bgCard} !important;
          color: ${colors.textPrimary} !important;
        }
        .bg-gradient-to-r.from-indigo-500.to-purple-500 { 
          background: ${colors.accent} !important; 
        }
        .from-indigo-100.to-purple-100 { 
          background-color: ${colors.activeItemBg} !important; 
        }
        .text-indigo-800 { color: ${colors.accent} !important; }
        .text-indigo-600 { color: ${colors.accent} !important; }
        .text-indigo-700 { color: ${colors.accent} !important; }
        .bg-indigo-600 { background-color: ${colors.accent} !important; }
        .hover\:bg-indigo-700:hover { background-color: ${colors.accentHover} !important; }
        .ring-indigo-500 { --tw-ring-color: ${colors.accent} !important; }
        .focus\:ring-indigo-500:focus { --tw-ring-color: ${colors.accent} !important; }
        .border-indigo-300 { border-color: ${colors.accent} !important; }
        .hover\:border-indigo-300:hover { border-color: ${colors.accent} !important; }
      `}</style>
      <JobCreationForm onBack={onBack} />
    </div>
  );
};

export default ThemedJobPublishing;
