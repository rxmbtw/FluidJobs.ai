import React, { useState } from 'react';
import DashboardHeader from '../DashboardHeader';
import Sidebar from '../Sidebar';
import MobileSidebar from '../MobileSidebar';
import JobSearchBar from './JobSearchBar';
import JobCard from './JobCard';
import JobDetailView from './job-detail/JobDetailView';
import { useTheme, getThemeColors } from '../ThemeContext';

interface JobOpeningsViewProps {
  savedJobIds: string[];
  onToggleSave: (jobId: string) => void;
  onNavigate: (view: string) => void;
}

const JobOpeningsView: React.FC<JobOpeningsViewProps> = ({ savedJobIds, onToggleSave, onNavigate }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [currentView, setCurrentView] = useState('list');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userName] = useState('Shriram Surse');

  if (currentView === 'detail') {
    return <JobDetailView onBackToList={() => setCurrentView('list')} />;
  }

  const jobData = [
    {
      id: 'job-1',
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
      id: 'job-2',
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
      id: 'job-3',
      title: 'Data Analyst - Supply Chain',
      companyInitial: 'C',
      postedOn: '25/10/2025',
      type: 'Part-Time',
      ctc: 'Rs.4.0L-Rs.8.0L',
      industry: 'Logistics',
      location: 'Gurgaon',
      status: 'Open until filled'
    },
    {
      id: 'job-4',
      title: 'Product Manager - AI',
      companyInitial: 'D',
      postedOn: '04/11/2025',
      type: 'Full-Time',
      ctc: 'Rs.15.0L-Rs.35.0L',
      industry: 'AI/ML',
      location: 'San Francisco, Remote',
      status: 'Open until filled'
    },
    {
      id: 'job-5',
      title: 'Cloud Security Architect',
      companyInitial: 'E',
      postedOn: '02/11/2025',
      type: 'Full-Time',
      ctc: 'Rs.20.0L-Rs.40.0L',
      industry: 'Cloud Computing',
      location: 'Hyderabad',
      status: 'Open until filled'
    },
    {
      id: 'job-6',
      title: 'UX/UI Designer',
      companyInitial: 'F',
      postedOn: '28/10/2025',
      type: 'Contract',
      ctc: 'Rs.5.0L-Rs.10.0L',
      industry: 'Creative Agency',
      location: 'Delhi',
      status: 'Open until filled'
    }
  ];

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
      <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} onSavedJobsClick={() => onNavigate('savedJobs')} />
      
      <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <Sidebar userName={userName} onNavigate={onNavigate} currentView="jobs" />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)}
          userName={userName}
        />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Job Openings</h2>
            <JobSearchBar />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jobData.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                isSaved={savedJobIds.includes(job.id)}
                onToggleSave={onToggleSave}
                onViewDetails={() => setCurrentView('detail')} 
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobOpeningsView;
