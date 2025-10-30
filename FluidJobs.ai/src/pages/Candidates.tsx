import React, { useState, useEffect } from 'react';

interface Candidate {
  candidate_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  current_company: string;
  location: string;
  experience_years: string;
  currently_employed: string;
}

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);

  const fetchCandidates = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8000/api/candidates?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setCandidates(data.data.candidates);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
        setTotalCandidates(data.data.pagination.totalCandidates);
      } else {
        setError(data.message || 'Failed to load candidates');
      }
    } catch (err: any) {
      setError('Cannot connect to server. Please ensure backend is running on port 8000.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching candidates...');
    fetchCandidates(1);
  }, []);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchCandidates(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchCandidates(currentPage + 1);
    }
  };

  console.log('Render state:', { loading, error, candidatesCount: candidates.length, totalCandidates });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading candidates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button 
          onClick={() => fetchCandidates(1)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Candidates</h1>
      <p className="mb-4">Total: {totalCandidates} candidates</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Experience</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr key={candidate.candidate_id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.full_name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.email}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.phone_number}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.current_company || 'N/A'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.location}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.experience_years} years</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    candidate.currently_employed === 'Yes' 
                      ? 'bg-green-100 text-green-800' 
                      : candidate.currently_employed === 'Fresher'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {candidate.currently_employed}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCandidates)} of {totalCandidates} candidates
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentPage <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentPage >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Candidates;
