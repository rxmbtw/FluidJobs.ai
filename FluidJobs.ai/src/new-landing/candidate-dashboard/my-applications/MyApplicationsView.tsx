import React, { useState } from 'react';
import DashboardHeader from '../DashboardHeader';
import Sidebar from '../Sidebar';
import MobileSidebar from '../MobileSidebar';
import JobSearchBar from '../job-openings/JobSearchBar';
import JobCard from '../job-openings/JobCard';
import { useTheme, getThemeColors } from '../ThemeContext';

interface MyApplicationsViewProps {
  onNavigate: (view: string) => void;
}

const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userName] = useState('Shriram Surse');

  const appliedJobs = [
    {
      id: 'app-1',
      title: 'QA Engineer - Insurance',
      companyInitial: 'A',
      postedOn: '30/10/2025',
      type: 'Full-Time',
      ctc: 'Rs.6.0L-Rs.15.0L',
      industry: 'Technology',
      location: 'Pune, Mumbai',
      status: 'Open until filled'
    },
    {
      id: 'app-2',
      title: 'Senior Frontend Developer',
      companyInitial: 'B',
      postedOn: '01/11/2025',
      type: 'Full-Time',
      ctc: 'Rs.12.0L-Rs.25.0L',
      industry: 'FinTech',
      location: 'Bengaluru, Remote',
      status: 'Open until filled'
    },
    {
      id: 'app-3',
      title: 'Cloud Security Architect',
      companyInitial: 'E',
      postedOn: '02/11/2025',
      type: 'Full-Time',
      ctc: 'Rs.20.0L-Rs.40.0L',
      industry: 'Cloud Computing',
      location: 'Hyderabad',
      status: 'Open until filled'
    }
  ];

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
      <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} onSavedJobsClick={() => onNavigate('savedJobs')} />
      
      <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <Sidebar userName={userName} onNavigate={onNavigate} currentView="applications" />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)}
          userName={userName}
        />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-left" style={{ color: colors.textPrimary }}>My Applications</h2>
            <JobSearchBar />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {appliedJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                isApplied={true}
                onViewDetails={() => {}}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyApplicationsView;
