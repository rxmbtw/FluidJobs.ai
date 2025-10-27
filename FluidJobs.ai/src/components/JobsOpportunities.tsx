import React, { useState, useEffect } from 'react';
import { FileText, Users, Award, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService, Job } from '../services/jobService';
import DashboardLayout from './DashboardLayout';

const JobsOpportunities: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('opportunities');
  const [eligibleFilter, setEligibleFilter] = useState(true);
  const [nonEligibleFilter, setNonEligibleFilter] = useState(false);
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
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobData, stats] = await Promise.all([
        jobService.getAllJobs(),
        jobService.getJobStats()
      ]);
      setJobs(jobData);
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
    // Navigate to application process
    console.log('Apply to job:', jobId);
  };

  const handleViewDetails = (jobId: string) => {
    // Navigate to job details page
    navigate(`/careers/${jobId}`);
  };

  return (
    <DashboardLayout>
      <div className="flex gap-6 -m-8 p-6 min-h-full">
        {/* Main Content Column */}
        <div className="flex-1">
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
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-500" />
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
                          onClick={() => handleViewDetails(job.id)}
                          className="text-purple-600 text-sm underline hover:text-purple-700 font-medium"
                        >
                          View details
                        </button>
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

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          {/* Popular Tags */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Card */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Opportunities
            </h3>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{jobStats.eligible}</div>
                <div className="text-sm text-purple-600">
                  Opportunities you are / were eligible
                </div>
              </div>
            </div>
          </div>

          {/* Application Card */}
          <div className="bg-cyan-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Application
            </h3>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-cyan-600" />
              <div>
                <div className="text-2xl font-bold text-cyan-600">{jobStats.applied}</div>
                <div className="text-sm text-cyan-600">
                  Opportunities you have applied for
                </div>
              </div>
            </div>
          </div>

          {/* Offer in Hand Card */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Offer in Hand
            </h3>
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{jobStats.offers}</div>
                <div className="text-sm text-yellow-600">
                  Opportunities you have received an offer for
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobsOpportunities;