import React, { useState, useEffect } from 'react';
import { FileText, Users, Award, Building2, Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService, Job, JobAttachment } from '../services/jobService';
import { useJobs } from '../contexts/JobsProvider';
import DashboardLayout from './DashboardLayout';

const JobsOpportunities: React.FC = () => {
  const navigate = useNavigate();

  const [eligibleFilter, setEligibleFilter] = useState(true);
  const [nonEligibleFilter, setNonEligibleFilter] = useState(false);
  const { jobs: contextJobs, loading: contextLoading, refreshJobs } = useJobs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobStats, setJobStats] = useState({ total: 0, eligible: 0, applied: 0, offers: 0 });
  const [activeTags, setActiveTags] = useState<string[]>(['IT Product & Services', 'IT / Computers - Software']);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobAttachments, setJobAttachments] = useState<{[key: string]: JobAttachment[]}>({});

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



  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobData, stats] = await Promise.all([
        jobService.getAllJobs(),
        jobService.getJobStats()
      ]);
      setJobs(jobData);
      setJobStats(stats);
      
      // Fetch attachments for all jobs
      const attachmentsMap: {[key: string]: JobAttachment[]} = {};
      await Promise.all(
        jobData.map(async (job) => {
          const attachments = await jobService.getJobAttachments(job.id);
          attachmentsMap[job.id] = attachments;
        })
      );
      setJobAttachments(attachmentsMap);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = (eligibleFilter && job.isEligible) || (nonEligibleFilter && !job.isEligible);
    
    return matchesSearch && matchesFilter;
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


          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
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
                          <img 
                            src="/images/FLuid Live Icon.png" 
                            alt="FluidJobs.ai" 
                            className="w-8 h-8 object-contain rounded"
                          />
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