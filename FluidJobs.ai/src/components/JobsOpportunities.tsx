import React, { useState, useEffect } from 'react';
import { FileText, Users, Award, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService, Job } from '../services/jobService';
import { useJobs } from '../contexts/JobsProvider';
import DashboardLayout from './DashboardLayout';

const JobsOpportunities: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('opportunities');
  const [eligibleFilter, setEligibleFilter] = useState(true);
  const [nonEligibleFilter, setNonEligibleFilter] = useState(false);
  const { jobs: contextJobs, loading: contextLoading, refreshJobs } = useJobs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobStats, setJobStats] = useState({ total: 0, eligible: 0, applied: 0, offers: 0 });
  const [activeTags, setActiveTags] = useState<string[]>(['IT Product & Services', 'IT / Computers - Software']);

  const popularTags = [
    'IT Product & Services',
    'IT / Computers - Software', 
    'Machinery / Equipment Manufacturing',
    'Education',
    'Others'
  ];

  useEffect(() => {
    fetchJobs();
    
    // Listen for new job creation events
    const handleJobCreated = () => {
      refreshJobs();
      fetchJobs();
    };
    
    window.addEventListener('jobCreated', handleJobCreated);
    return () => window.removeEventListener('jobCreated', handleJobCreated);
  }, [refreshJobs]);

  useEffect(() => {
    // Convert context jobs to Job format and merge with existing jobs
    if (contextJobs.length > 0) {
      const convertedJobs = contextJobs.map(job => ({
        id: job.jobId,
        title: job.title,
        company: 'FluidJobs.ai',
        type: job.employmentType,
        industry: job.domain,
        salary: job.salaryRange,
        location: job.location,
        postedDate: job.publishedDate,
        isEligible: true,
        registrationDeadline: job.closingDate
      }));
      setJobs(prev => {
        const existingIds = prev.map(j => j.id);
        const newJobs = convertedJobs.filter(j => !existingIds.includes(j.id));
        return [...newJobs, ...prev];
      });
    }
  }, [contextJobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobData, stats] = await Promise.all([
        jobService.getAllJobs(),
        jobService.getJobStats()
      ]);
      setJobs(prev => {
        const contextJobIds = contextJobs.map(j => j.jobId);
        const filteredJobData = jobData.filter(j => !contextJobIds.includes(j.id));
        return [...prev.filter(j => contextJobIds.includes(j.id)), ...filteredJobData];
      });
      setJobStats(stats);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (eligibleFilter && job.isEligible) return true;
    if (nonEligibleFilter && !job.isEligible) return true;
    return false;
  });

  const toggleTag = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApplyNow = (jobId: string) => {
    // Navigate to job application page
    navigate(`/careers/${jobId}/apply`);
  };

  const handleViewDetails = (jobId: string) => {
    // Navigate to job details page
    navigate(`/careers/${jobId}`);
  };

  return (
    <DashboardLayout>
      <div className="-m-8 p-6 min-h-full">
        {/* Main Content Column */}
        <div>
          {/* Navigation Tabs */}
          <div className="border-b-2 border-gray-200 mb-6">
            <div className="flex space-x-8">
              {['opportunities', 'applications', 'offers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'text-purple-600 border-b-2 border-purple-600 font-bold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-end mb-4">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={eligibleFilter}
                  onChange={(e) => setEligibleFilter(e.target.checked)}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Eligible</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={nonEligibleFilter}
                  onChange={(e) => setNonEligibleFilter(e.target.checked)}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Non Eligible</span>
              </label>
            </div>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No jobs found matching your criteria.</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
                          <img src="/images/FluidHire_logo.png" alt="FluidJobs.ai" className="w-full h-full object-cover rounded" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{job.postedDate}</span>
                        {job.isEligible && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Eligible
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body - Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Job type</p>
                        <p className="text-sm font-medium text-gray-900">{job.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Industry</p>
                        <p className="text-sm font-medium text-gray-900">{job.industry}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">CTC</p>
                        <p className="text-sm font-medium text-gray-900">{job.salary}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="text-sm font-medium text-gray-900">{job.location}</p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex justify-between items-center">
                      <div>
                        {job.registrationDeadline ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            Registrations open till {job.registrationDeadline}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Registrations closed
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApplyNow(job.id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors font-medium"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>


      </div>
    </DashboardLayout>
  );
};

export default JobsOpportunities;