import React, { useState } from 'react';
import { ArrowLeft, Users, Zap, Settings, TestTube, User } from 'lucide-react';
import { useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';
import ManageCandidates from '../../components/ManageCandidates';

interface ThemedJobSpecificDashboardProps {
  jobTitle: string;
  onBack: () => void;
}

const ThemedJobSpecificDashboard: React.FC<ThemedJobSpecificDashboardProps> = ({ jobTitle, onBack }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [activeSection, setActiveSection] = useState('manage-candidates');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const menuItems = [
    { id: 'manage-candidates', label: 'Manage Candidates', icon: Users },
    { id: 'hiring-automation', label: 'Hiring Automation', icon: Zap },
    { id: 'job-settings', label: 'Job Settings', icon: Settings },
    { id: 'testing-environment', label: 'Testing Environment', icon: TestTube }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'manage-candidates':
        return (
          <div style={{ backgroundColor: colors.bgMain, minHeight: '100vh' }}>
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
            `}</style>
            <ManageCandidates isJobSpecific={true} />
          </div>
        );
      case 'hiring-automation':
        return (
          <div style={{ backgroundColor: colors.bgMain, minHeight: '100vh' }}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>Hiring Automation</h2>
            </div>
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 120px)' }}>
              <h2 className="text-4xl font-bold text-gray-400">Coming Soon !</h2>
            </div>
          </div>
        );
      case 'job-settings':
        return (
          <div className="p-8" style={{ backgroundColor: colors.bgMain, minHeight: '100vh' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>Job Settings</h2>
            <p style={{ color: colors.textSecondary }}>Job configuration and settings.</p>
          </div>
        );
      case 'testing-environment':
        return (
          <div style={{ backgroundColor: colors.bgMain, minHeight: '100vh' }}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>Testing Environment</h2>
            </div>
            <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 120px)' }}>
              <h2 className="text-4xl font-bold text-gray-400">Coming Soon !</h2>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.bgMain }}>
      <div 
        className="flex flex-col transition-all duration-300 ease-in-out"
        style={{ 
          width: isCollapsed ? '80px' : '297px',
          backgroundColor: colors.bgSidebar,
          borderRight: `1px solid ${colors.border}`
        }}
        onMouseEnter={() => isCollapsed && setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="p-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <img 
              src={theme === 'dark' ? "/images/Fluid Live Icon.png" : "/images/FLuid Live Icon light theme.png"}
              alt="FluidJobs.ai Logo" 
              className="object-contain flex-shrink-0"
              style={{ width: theme === 'dark' ? '2rem' : '1.75rem', height: theme === 'dark' ? '2rem' : '1.75rem' }}
            />
            {!isCollapsed && <span className="text-xl font-bold" style={{ color: colors.accent }}>FluidJobs.ai</span>}
          </div>
          {!isCollapsed && (
            <>
              <button
                onClick={onBack}
                className="flex items-center space-x-2 hover:opacity-80 w-full text-left mt-4 transition"
                style={{ color: colors.textPrimary }}
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                <h1 className="text-sm font-medium leading-tight">
                  {jobTitle}
                </h1>
              </button>
              <button
                onClick={() => setShowCompletedModal(true)}
                className="mt-3 w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: isCompleted ? '#10B981' : '#E5E7EB',
                  color: isCompleted ? '#FFFFFF' : '#374151'
                }}
              >
                {isCompleted ? '✓ Completed' : 'Mark as Completed'}
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-left transition-colors`}
                style={{
                  backgroundColor: activeSection === item.id ? colors.activeItemBg : 'transparent',
                  color: activeSection === item.id ? colors.accent : colors.iconColor,
                  borderRadius: '40px'
                }}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0" style={{ backgroundColor: colors.accent }}>
              <User className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && <span className="text-sm font-medium" style={{ color: colors.accent }}>HR Manager</span>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Completed Confirmation Modal */}
      {showCompletedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mark Job as Completed</h2>
              <button
                onClick={() => setShowCompletedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to mark <strong>"{jobTitle}"</strong> as completed?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This will update the job status to completed.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCompletedModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsCompleted(true);
                  setShowCompletedModal(false);
                  alert(`Job "${jobTitle}" marked as completed!`);
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemedJobSpecificDashboard;
