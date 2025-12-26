import React, { useState, useEffect } from 'react';
import { Search, Bookmark, MapPin, Clock, DollarSign, Trash2, Briefcase, CheckCircle } from 'lucide-react';
import savedJobsService, { SavedJob } from '../../services/savedJobsService';

const DesktopMyJobs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const jobs = await savedJobsService.getSavedJobs();
      setSavedJobs(jobs);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId: number) => {
    try {
      await savedJobsService.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.job_id !== jobId));
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  const filteredJobs = savedJobs.filter(job => 
    searchQuery === '' || 
    job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSavedJobs = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No saved jobs yet</h3>
          <p className="text-gray-500">Start saving jobs you're interested in to view them here.</p>
        </div>
      ) : (
        filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.job_title}</h3>
                <p className="text-lg text-gray-700 mb-3">{job.company_name}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.job_type}
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.salary_range}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">
                  Saved on {new Date(job.saved_at).toLocaleDateString()}
                </p>
              </div>
              
              <button
                onClick={() => handleUnsaveJob(job.job_id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove from saved jobs"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center py-12">
        <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No applications yet</h3>
        <p className="text-gray-500">Your job applications will appear here.</p>
      </div>
    </div>
  );

  const renderOffers = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No offers yet</h3>
        <p className="text-gray-500">Job offers will appear here when you receive them.</p>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-b-2 border-gray-200 mb-6">
          <div className="flex space-x-8">
            {[
              { id: 'saved', label: 'Saved Jobs', icon: Bookmark },
              { id: 'applications', label: 'Applications', icon: Briefcase },
              { id: 'offers', label: 'Offers', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Search Bar - Only show for saved jobs */}
        {activeTab === 'saved' && savedJobs.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search saved jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'saved' && renderSavedJobs()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'offers' && renderOffers()}
      </div>
    </div>
  );
};

export default DesktopMyJobs;
