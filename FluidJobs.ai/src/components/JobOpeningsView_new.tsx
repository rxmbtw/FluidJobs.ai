import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import JobSpecificDashboard from './JobSpecificDashboard';

interface JobData {
  jobId: string;
  title: string;
  experience: string;
  location: string;
  workplace: string;
  tags: string[];
  image: string;
  description: {
    overview: string;
    responsibilities: string[];
    qualifications: string[];
  };
  created_at?: string;
  registration_closing_date?: string;
  min_salary?: number;
  max_salary?: number;
  job_domain?: string;
}



const JobOpeningsViewNew: React.FC = () => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [showJobDashboard, setShowJobDashboard] = useState(false);
  const [selectedJobForDashboard, setSelectedJobForDashboard] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    
    // Refresh jobs when component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchJobs();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        if (visibleJobs < filteredJobs.length) {
          setVisibleJobs(prev => Math.min(prev + 2, filteredJobs.length));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleJobs]);

  useEffect(() => {
    const handleJobCreated = () => {
      fetchJobs();
    };
    
    const handleJobDeleted = () => {
      fetchJobs();
    };
    
    window.addEventListener('jobCreated', handleJobCreated);
    window.addEventListener('jobDeleted', handleJobDeleted);
    return () => {
      window.removeEventListener('jobCreated', handleJobCreated);
      window.removeEventListener('jobDeleted', handleJobDeleted);
    };
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/jobs-enhanced/list');
      const data = await response.json();
      console.log('Fetched jobs:', data);
      
      if (data.success && data.jobs) {
        const formattedJobs: JobData[] = data.jobs.map((job: any) => ({
          jobId: job.job_id.toString(),
          title: job.job_title,
          experience: `${job.min_experience}-${job.max_experience} years`,
          location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations,
          workplace: job.job_type,
          tags: [job.job_domain],
          image: job.selected_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
          description: {
            overview: job.job_description || 'Join our team and contribute to exciting projects.',
            responsibilities: [
              'Work on innovative projects',
              'Collaborate with cross-functional teams',
              'Drive technical excellence'
            ],
            qualifications: [
              `${job.min_experience}-${job.max_experience} years of experience`,
              'Strong communication skills'
            ]
          },
          created_at: job.created_at,
          registration_closing_date: job.registration_closing_date,
          min_salary: job.min_salary,
          max_salary: job.max_salary,
          job_domain: job.job_domain
        }));
        console.log('Formatted jobs:', formattedJobs);
        setJobs(formattedJobs);
        setVisibleJobs(formattedJobs.length);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedJobs = filteredJobs.slice(0, visibleJobs);

  if (showJobDashboard && selectedJobForDashboard) {
    return (
      <JobSpecificDashboard 
        jobTitle={selectedJobForDashboard.title}
        onBack={() => {
          setShowJobDashboard(false);
          setSelectedJobForDashboard(null);
        }}
      />
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatSalary = (min?: number | string, max?: number | string) => {
    if (!min || !max) return 'Not Specified';
    const minNum = typeof min === 'string' ? parseFloat(min) : min;
    const maxNum = typeof max === 'string' ? parseFloat(max) : max;
    return `₹${(minNum/100000).toFixed(1)} LPA to ₹${(maxNum/100000).toFixed(1)} LPA`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-4 text-center shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">View Openings</h1>
          <p className="text-gray-500">View and Manage all the openings created under your organization</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative" style={{ width: '400px' }}>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search job openings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchJobs}
              className="p-3 hover:bg-gray-100 rounded-lg" 
              title="Refresh jobs"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedJobs.map((job) => (
            <div key={job.jobId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Job Image */}
              <div className="h-40 bg-gray-200">
                <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
              </div>

              {/* Job Content */}
              <div className="p-5">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h2>
                
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Posted on: {formatDate(job.created_at)}</span>
                  <span className="text-sm text-gray-500">Registrations closed</span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">JOB TYPE</div>
                    <div className="text-base font-semibold text-gray-900">{job.workplace}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Annual CTC</div>
                    <div className="text-base font-semibold text-gray-900">{formatSalary(job.min_salary, job.max_salary)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">INDUSTRY</div>
                    <div className="text-base font-semibold text-gray-900">{job.job_domain || 'Technology'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">LOCATION</div>
                    <div className="text-base font-semibold text-gray-900">{job.location}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedJobForDashboard(job);
                    setShowJobDashboard(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  View more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{selectedJob.location}</span>
                    <span>{selectedJob.experience}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedJob.description.overview}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Responsibilities</h3>
                    <ul className="space-y-2">
                      {selectedJob.description.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications</h3>
                    <ul className="space-y-2">
                      {selectedJob.description.qualifications.map((qual, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobOpeningsViewNew;
