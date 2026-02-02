
import React, { useState } from 'react';
import Header from './components/Header';
import NewSidebar from './components/NewSidebar';
import Dashboard from './components/Dashboard';
import CandidateTracker from './components/CandidateTracker';
import PipelineBoard from './components/PipelineBoard';
import StageAnalytics from './components/StageAnalytics';
import CandidateProfile from './components/CandidateProfile';
import SmartForms from './components/SmartForms';
import JobSettings from './components/JobSettings';
import { NAV_ITEMS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState<null | 'NEW_CANDIDATE' | 'FEEDBACK' | 'OFFER'>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [previousTab, setPreviousTab] = useState('candidates');
  
  // Job opening state - this would typically come from props or routing
  const [currentJobOpening] = useState({
    title: 'AI Lead',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time'
  });

  const handleBackToJobs = () => {
    // This would typically navigate back to the jobs list
    console.log('Navigate back to jobs list');
    // For now, we'll just show an alert
    alert('This would navigate back to the Jobs list page');
  };

  const handleViewProfile = (id: string) => {
    setSelectedCandidateId(id);
    setPreviousTab(activeTab);
    setShowCandidateProfile(true);
  };

  const handleBackFromProfile = () => {
    setShowCandidateProfile(false);
    setSelectedCandidateId(null);
  };

  const renderContent = () => {
    // Show candidate profile if selected
    if (showCandidateProfile && selectedCandidateId) {
      return <CandidateProfile candidateId={selectedCandidateId} onBack={handleBackFromProfile} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'candidates':
        return (
          <CandidateTracker 
            onAddCandidate={() => setShowForm('NEW_CANDIDATE')} 
            onViewProfile={handleViewProfile}
          />
        );
      case 'pipeline':
        return <PipelineBoard onViewProfile={handleViewProfile} />;
      case 'stage_analytics':
        return <StageAnalytics />;
      case 'job_settings':
        return <JobSettings />;
      default:
        return (
          <div className="max-w-7xl mx-auto h-full flex flex-col items-center justify-center text-center py-20">
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-4 uppercase">{activeTab.replace('_', ' ')}</h1>
              <p className="text-sm text-gray-600 max-w-lg mx-auto mb-8">
                This module is currently being optimized. Each component is functional and ready for production scaling.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NewSidebar 
        onAddCandidate={() => setShowForm('NEW_CANDIDATE')} 
        onSidebarToggle={setIsSidebarExpanded}
      />

      {/* Main Content with dynamic left margin for sidebar */}
      <div 
        className="transition-all duration-300"
        style={{ marginLeft: isSidebarExpanded ? '256px' : '80px' }}
      >
        {/* Job Opening Header + Navigation Tabs - Combined Sticky Section */}
        <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
          {/* Job Opening Header */}
          <div className="border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToJobs}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                  Back to Jobs
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-briefcase text-blue-600"></i>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{currentJobOpening.title}</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-building text-xs"></i>
                        {currentJobOpening.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-location-dot text-xs"></i>
                        {currentJobOpening.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-clock text-xs"></i>
                        {currentJobOpening.type}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === item.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <main className="p-4 lg:p-8 min-h-screen" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {showForm && <SmartForms type={showForm} onClose={() => setShowForm(null)} />}
    </div>
  );
};

export default App;
