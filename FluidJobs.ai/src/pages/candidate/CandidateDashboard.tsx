import React from 'react';
import { ThemeProvider } from '../../components/candidate/ThemeContext';
import { ProfileProvider } from '../../contexts/ProfileContext';
import { ProfileCompletionProvider } from '../../contexts/ProfileCompletionContext';
import { ResponsiveCandidateDashboard } from '../../components/mobile';
import DesktopCandidateDashboard from '../../components/desktop/DesktopCandidateDashboard';

const CandidateDashboard: React.FC = () => {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <ProfileCompletionProvider>
          <ResponsiveCandidateDashboard desktopDashboard={<DesktopCandidateDashboard />} />
        </ProfileCompletionProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
};

export default CandidateDashboard;
