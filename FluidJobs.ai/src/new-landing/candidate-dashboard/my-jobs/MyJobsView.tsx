import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import JobFilters from './JobFilters';
import JobCard from './JobCard';
import AppliedJobsView from './AppliedJobsView';
import JobDetailView from './JobDetailView';
import { Job } from './jobsData';
import axios from 'axios';
import Loader from '../../../components/Loader';

interface MyJobsViewProps {
  initialFilter?: string;
  themeState?: 'light' | 'dark';
}

const MyJobsView: React.FC<MyJobsViewProps> = ({ initialFilter, themeState = 'light' }) => {
  const bgColor = themeState === 'light' ? '#F1F1F1' : '#1a1a1a';
  const cardBg = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textColor = themeState === 'light' ? '#000000' : '#f9fafb';
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'All Jobs');
  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  useEffect(() => {
    fetchJobs();
    fetchMatchedJobs();
  }, []);

  useEffect(() => {
    if (initialFilter && initialFilter !== activeFilter) {
      setActiveFilter(initialFilter);
      setShowDetail(false);
    }
  }, [initialFilter]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get<any[]>('http://localhost:8000/api/jobs-enhanced');
      const formattedJobs = response.data.map((job: any) => ({
        id: job.id,
        title: job.title,
        postedDate: job.postedDate,
        jobType: job.type || 'Full-Time',
        ctc: job.salary || 'Competitive',
        industry: job.industry || 'Technology',
        location: job.location || 'Remote',
        description: 'View full job description in the attached PDF file.',
        skills: job.skills || []
      }));
      setJobsData(formattedJobs);
      console.log('Fetched jobs:', formattedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchedJobs = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      if (!token) {
        console.log('No token found, skipping matched jobs fetch');
        return;
      }
      const response = await axios.get('http://localhost:8000/api/profile/matched-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data: any = response.data;
      console.log('Matched jobs response:', data);
      if (data.success) {
        const formatted = data.matches.map((match: any) => ({
          id: match.job_id.toString(),
          title: match.job_title,
          postedDate: new Date(match.created_at).toLocaleDateString(),
          jobType: match.job_type || 'Full-Time',
          ctc: match.min_salary && match.max_salary ? `₹${(match.min_salary/100000).toFixed(1)}L - ₹${(match.max_salary/100000).toFixed(1)}L` : 'Competitive',
          industry: match.job_domain || 'Technology',
          location: Array.isArray(match.locations) ? match.locations.join(', ') : match.locations || 'Remote',
          description: match.job_description || 'View full job description.',
          skills: match.skills || [],
          matchScore: match.match_score
        }));
        setMatchedJobs(formatted);
        console.log(`✅ ${formatted.length} matched jobs loaded with scores:`, formatted);
      }
    } catch (error) {
      console.error('Error fetching matched jobs:', error);
    }
  };

  const handleAnalyzeResume = async () => {
    try {
      setAnalyzing(true);
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.post<any>('http://localhost:8000/api/profile/analyze-resume', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Analysis result:', response.data);
      alert(`✅ Analysis complete! Found ${response.data.matchCount} job matches.`);
      await fetchMatchedJobs();
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      alert(error.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

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
    : activeFilter === 'Perfect Match'
    ? matchedJobs
    : jobsData;

  useEffect(() => {
    setCurrentJobIndex(0);
  }, [activeFilter, jobsData.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const cardHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / cardHeight);
      
      if (newIndex !== currentJobIndex && newIndex >= 0 && newIndex < displayJobs.length) {
        setCurrentJobIndex(newIndex);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDetail) return;
      const container = scrollContainerRef.current;
      if (!container) return;
      
      if (e.key === 'ArrowDown' && currentJobIndex < displayJobs.length - 1) {
        e.preventDefault();
        const newIndex = currentJobIndex + 1;
        setCurrentJobIndex(newIndex);
        container.scrollTo({ top: newIndex * container.clientHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' && currentJobIndex > 0) {
        e.preventDefault();
        const newIndex = currentJobIndex - 1;
        setCurrentJobIndex(newIndex);
        container.scrollTo({ top: newIndex * container.clientHeight, behavior: 'smooth' });
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentJobIndex, displayJobs.length, showDetail]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="sticky top-0 z-10 pt-6 sm:pt-8 pb-0" style={{ backgroundColor: bgColor }}>
          <JobFilters activeFilter={activeFilter} onFilterChange={(filter) => { setActiveFilter(filter); setShowDetail(false); }} themeState={themeState} />
        </div>
        <div className="max-w-4xl mx-auto pb-4 sm:pb-8">
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
          ) : loading ? (
            <div className="text-center py-12 rounded-xl" style={{ backgroundColor: cardBg }}>
              <Loader themeState={themeState} />
            </div>
          ) : (
            <>
              {activeFilter === 'Perfect Match' && (
                <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleAnalyzeResume}
                    disabled={analyzing}
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {analyzing ? '⏳ Analyzing...' : '🔄 Re-analyze Resume'}
                  </button>
                  {displayJobs.length > 0 && displayJobs.every((job: any) => job.matchScore < 50) && (
                    <div className="flex-1 p-3 rounded-xl border-2 border-yellow-400" style={{ backgroundColor: themeState === 'light' ? '#fef3c7' : '#78350f' }}>
                      <p className="text-xs sm:text-sm font-semibold" style={{ color: themeState === 'light' ? '#92400e' : '#fcd34d' }}>
                        ⚠️ All matches below 50%. Update your resume with relevant skills.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {displayJobs.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ backgroundColor: cardBg }}>
                  <p style={{ color: textColor === '#000000' ? '#6b7280' : '#9ca3af' }}>
                    {activeFilter === 'Saved Jobs' 
                      ? 'No saved jobs yet. Start saving jobs!' 
                      : activeFilter === 'Perfect Match'
                      ? 'No job matches found. Click "Re-analyze Resume" button above to analyze your resume!'
                      : 'No jobs available'}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex justify-center items-center gap-4 mb-0" style={{ backgroundColor: bgColor }}>
                <button
                  onClick={() => {
                    if (currentJobIndex > 0) {
                      const newIndex = currentJobIndex - 1;
                      setCurrentJobIndex(newIndex);
                      scrollContainerRef.current?.scrollTo({ top: newIndex * scrollContainerRef.current.clientHeight, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentJobIndex === 0}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundColor: cardBg, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: textColor === '#000000' ? '#2563EB' : '#93C5FD' }} />
                </button>
                <button
                  onClick={() => {
                    if (currentJobIndex < displayJobs.length - 1) {
                      const newIndex = currentJobIndex + 1;
                      setCurrentJobIndex(newIndex);
                      scrollContainerRef.current?.scrollTo({ top: newIndex * scrollContainerRef.current.clientHeight, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentJobIndex === displayJobs.length - 1}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundColor: cardBg, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: textColor === '#000000' ? '#2563EB' : '#93C5FD' }} />
                </button>
              </div>
              <div
                ref={scrollContainerRef}
                className="overflow-y-scroll snap-y snap-mandatory scroll-smooth"
                style={{ 
                  height: 'calc(100vh - 200px)', 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollSnapType: 'y mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <style>{`
                  @media (min-width: 640px) {
                    .overflow-y-scroll {
                      height: calc(100vh - 280px) !important;
                    }
                  }
                `}</style>
                <style>{`
                  .overflow-y-scroll::-webkit-scrollbar {
                    display: none;
                  }
                  .scroll-smooth {
                    scroll-behavior: smooth;
                  }
                `}</style>
                {displayJobs.map((job) => (
                  <div key={job.id} className="snap-start snap-always" style={{ height: 'calc(100vh - 200px)', scrollSnapAlign: 'start' }}>
                    <style>{`
                      @media (min-width: 640px) {
                        .snap-start {
                          height: calc(100vh - 280px) !important;
                        }
                      }
                    `}</style>
                    <JobCard 
                      job={job}
                      isSaved={savedJobIds.includes(job.id)}
                      onToggleSave={handleToggleSave}
                      onViewDetails={() => handleViewDetails(job)}
                      themeState={themeState}
                    />
                  </div>
                ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyJobsView;
