import React, { useState } from 'react';
import DashboardHeader from '../DashboardHeader';
import Sidebar from '../Sidebar';
import MobileSidebar from '../MobileSidebar';
import JobSearchBar from '../job-openings/JobSearchBar';
import JobCard from '../job-openings/JobCard';
import { useTheme, getThemeColors } from '../ThemeContext';

interface SavedJobsViewProps {
  savedJobIds: string[];
  onToggleSave: (jobId: string) => void;
  onNavigate: (view: string) => void;
}

const SavedJobsView: React.FC<SavedJobsViewProps> = ({ savedJobIds, onToggleSave, onNavigate }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userName] = useState('Shriram Surse');

  const allJobs = [
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

  const displayJobs = allJobs.filter(job => savedJobIds.includes(job.id));

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
      <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} onSavedJobsClick={() => {}} />
      
      <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <Sidebar userName={userName} onNavigate={onNavigate} currentView="savedJobs" />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)}
          userName={userName}
        />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-left" style={{ color: colors.textPrimary }}>Saved Jobs</h2>
            <JobSearchBar />
          </div>
          
          {displayJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: colors.textSecondary }}>No saved jobs yet. Start saving jobs from Job Openings!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {displayJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  isSaved={true}
                  onToggleSave={onToggleSave}
                  onViewDetails={() => {}}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SavedJobsView;
