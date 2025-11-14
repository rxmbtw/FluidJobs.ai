import React, { useState, useEffect } from 'react';
import DashboardHeader from '../DashboardHeader';
import Sidebar from '../Sidebar';
import MobileSidebar from '../MobileSidebar';
import JobSearchBar from './JobSearchBar';
import JobCard from './JobCard';
import JobDetailView from './job-detail/JobDetailView';
import { useTheme, getThemeColors } from '../ThemeContext';
import axios from 'axios';

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
  const [jobData, setJobData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('Fetching jobs from API...');
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced`);
        console.log('API Response:', response.data);
        const jobs = response.data as any[];
        const mappedJobs = jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          companyInitial: job.company?.[0] || 'F',
          postedOn: job.postedDate,
          type: job.type,
          ctc: job.salary,
          industry: job.industry,
          location: job.location,
          status: 'Open until filled'
        }));
        console.log('Mapped jobs:', mappedJobs);
        setJobData(mappedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (currentView === 'detail') {
    return <JobDetailView onBackToList={() => setCurrentView('list')} />;
  }

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
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4" style={{ color: colors.textSecondary }}>Loading jobs...</p>
            </div>
          ) : jobData.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: colors.textSecondary }}>No jobs available at the moment.</p>
            </div>
          ) : (
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
          )}
        </main>
      </div>
    </div>
  );
};

export default JobOpeningsView;
