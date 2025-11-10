import React from 'react';
import { useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';
import BulkImportSection from '../../components/BulkImportSection';

const ThemedBulkImport: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <div style={{ backgroundColor: colors.bgMain, minHeight: '100vh', padding: '2rem' }}>
      <style>{`
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
        input::placeholder, textarea::placeholder {
          color: ${colors.textSecondary} !important;
          opacity: 1 !important;
        }
        input[type="file"] { 
          color: ${colors.textPrimary} !important;
        }
        input::file-selector-button {
          background-color: ${colors.accent} !important;
          color: white !important;
        }
        select { color: ${colors.textPrimary} !important; }
        option { background-color: ${colors.bgCard} !important; color: ${colors.textPrimary} !important; }
      `}</style>
      <BulkImportSection />
    </div>
  );
};

export default ThemedBulkImport;
