import React, { useState, useEffect } from 'react';
import { Heart, MapPin, DollarSign, Clock, Trash2 } from 'lucide-react';
import savedJobsService, { SavedJob } from '../services/savedJobsService';

const SavedJobs: React.FC = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 mb-4">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Heart className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
          <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {savedJobs.length}
          </span>
        </div>

        {savedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-500">Start saving jobs you're interested in to view them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
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
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleUnsaveJob(job.job_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved jobs"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;