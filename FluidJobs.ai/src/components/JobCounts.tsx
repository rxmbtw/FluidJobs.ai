import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobCounts: React.FC = () => {
  const [counts, setCounts] = useState({
    total_jobs: 0,
    published_jobs: 0,
    active_jobs: 0,
    active_published_jobs: 0,
    pending_jobs: 0,
    rejected_jobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobCounts();
  }, []);

  const fetchJobCounts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/jobs-enhanced/counts');
      const data = response.data as { success: boolean; counts: typeof counts };
      if (data.success) {
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching job counts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading job counts...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Openings Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{counts.total_jobs}</div>
          <div className="text-sm text-gray-600">Total Jobs</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{counts.active_published_jobs}</div>
          <div className="text-sm text-gray-600">Active & Published</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{counts.pending_jobs}</div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{counts.published_jobs}</div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">{counts.active_jobs}</div>
          <div className="text-sm text-gray-600">Active Status</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{counts.rejected_jobs}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>
      <button 
        onClick={fetchJobCounts}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Refresh Counts
      </button>
    </div>
  );
};

export default JobCounts;