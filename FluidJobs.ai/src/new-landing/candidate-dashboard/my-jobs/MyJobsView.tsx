import React, { useState, useEffect } from 'react';
import JobFilters from './JobFilters';
import JobCard from './JobCard';
import AppliedJobsView from './AppliedJobsView';
import JobDetailView from './JobDetailView';
import { jobsData, Job } from './jobsData';

interface MyJobsViewProps {
  initialFilter?: string;
  themeState?: 'light' | 'dark';
}

const MyJobsView: React.FC<MyJobsViewProps> = ({ initialFilter, themeState = 'light' }) => {
  const bgColor = themeState === 'light' ? '#F1F1F1' : '#1a1a1a';
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textColor = themeState === 'light' ? '#000000' : '#f9fafb';
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'All Jobs');
  
  useEffect(() => {
    if (initialFilter && initialFilter !== activeFilter) {
      setActiveFilter(initialFilter);
      setShowDetail(false);
    }
  }, [initialFilter]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetail(true);
  };

  const displayJobs = activeFilter === 'Saved Jobs' 
    ? jobsData.filter(job => savedJobIds.includes(job.id))
    : jobsData;

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-10 pt-8 pb-4" style={{ backgroundColor: bgColor }}>
          <JobFilters activeFilter={activeFilter} onFilterChange={(filter) => { setActiveFilter(filter); setShowDetail(false); }} themeState={themeState} />
        </div>
        <div className="max-w-4xl mx-auto pb-8">
          {showDetail && selectedJob ? (
            <JobDetailView 
              job={selectedJob}
              isSaved={savedJobIds.includes(selectedJob.id)}
              onToggleSave={handleToggleSave}
              onBack={() => setShowDetail(false)}
              themeState={themeState}
            />
          ) : activeFilter === 'Applied Jobs' ? (
            <AppliedJobsView themeState={themeState} />
          ) : (
            <div className="space-y-6">
              {displayJobs.map(job => (
                <JobCard 
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.includes(job.id)}
                  onToggleSave={handleToggleSave}
                  onViewDetails={() => handleViewDetails(job)}
                  themeState={themeState}
                />
              ))}
              {displayJobs.length === 0 && activeFilter === 'Saved Jobs' && (
                <div className="text-center py-12 rounded-xl" style={{ backgroundColor: cardBg }}>
                  <p style={{ color: textColor === '#000000' ? '#6b7280' : '#9ca3af' }}>No saved jobs yet. Start saving jobs!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyJobsView;
