import React, { useState } from 'react';
import DashboardHeader from '../../DashboardHeader';
import Sidebar from '../../Sidebar';
import MobileSidebar from '../../MobileSidebar';
import JobDetailsCard from './JobDetailsCard';
import AboutOrganizationCard from './AboutOrganizationCard';
import ApplyScheduleCard from './ApplyScheduleCard';
import DescriptionCard from './DescriptionCard';
import EligibleSkillsCard from './EligibleSkillsCard';
import { useTheme, getThemeColors } from '../../ThemeContext';

interface JobDetailViewProps {
  onBackToList: () => void;
}

const JobDetailView: React.FC<JobDetailViewProps> = ({ onBackToList }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userName] = useState('Shriram Surse');

  const jobData = {
    title: 'QA Engineer - Insurance',
    postedOn: '30/10/2025',
    type: 'Full-Time',
    ctc: 'Rs.6.0L-Rs.15.0L',
    industry: 'Technology',
    location: 'Pune, Mumbai',
    opensDate: '11:00AM, 25 Oct 2025',
    closesDate: '11:00AM, 29 Oct 2025'
  };

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: colors.bgMain, color: colors.textPrimary, width: '100%' }}>
      <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
      <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <Sidebar userName={userName} onNavigate={(view) => { if (view === 'jobs') onBackToList(); }} />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)}
          userName={userName}
        />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ backgroundColor: colors.bgMain }}>
          <h2 className="text-3xl font-bold mb-6 text-left" style={{ color: colors.textPrimary }}>
            Job Description
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 mb-8 items-stretch">
            <JobDetailsCard job={jobData} />
            
            <div className="flex flex-col sm:flex-row flex-grow gap-8 items-stretch">
              <AboutOrganizationCard />
              <ApplyScheduleCard opensDate={jobData.opensDate} closesDate={jobData.closesDate} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DescriptionCard />
            <EligibleSkillsCard />
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobDetailView;
