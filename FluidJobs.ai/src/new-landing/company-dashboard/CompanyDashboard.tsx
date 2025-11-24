import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import { ThemeProvider, useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';
import { JobsProvider } from '../../contexts/JobsProvider';
import ThemedJobPublishing from './ThemedJobPublishing';
import JobOpeningsViewNew from '../../components/JobOpeningsView_new';
import ThemedManageCandidates from './ThemedManageCandidates';
import ThemedBulkImport from './ThemedBulkImport';
import ThemedJobSpecificDashboard from './ThemedJobSpecificDashboard';
import BulkImportSection from '../../components/BulkImportSection';
import ManageCandidatesWrapper from '../../components/ManageCandidatesWrapper';

const DashboardContent: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [currentView, setCurrentView] = useState('view_opening');
  const [showJobSpecificDashboard, setShowJobSpecificDashboard] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.reload();
  };

  const handleBackToDashboard = () => {
    setCurrentView('view_opening');
    localStorage.removeItem('showCreateJob');
    localStorage.removeItem('jobFormData');
    localStorage.removeItem('jobFormStep');
  };

  if (showJobSpecificDashboard) {
    return (
      <ThemedJobSpecificDashboard 
        jobTitle={selectedJobTitle}
        onBack={() => {
          setShowJobSpecificDashboard(false);
          setSelectedJobTitle('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
      <DashboardHeader />
      
      <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <Sidebar currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
          {currentView === 'view_opening' && (
            <JobOpeningsViewNew />
          )}
          
          {currentView === 'create_job' && (
            <ThemedJobPublishing onBack={handleBackToDashboard} />
          )}
          
          {currentView === 'manage_candidates' && (
            <ThemedManageCandidates />
          )}
          
          {currentView === 'bulk_import' && (
            <ThemedBulkImport />
          )}
        </main>
      </div>
    </div>
  );
};

const CompanyDashboard: React.FC = () => {
  return (
    <JobsProvider>
      <ThemeProvider>
        <DashboardContent />
      </ThemeProvider>
    </JobsProvider>
  );
};

export default CompanyDashboard;
