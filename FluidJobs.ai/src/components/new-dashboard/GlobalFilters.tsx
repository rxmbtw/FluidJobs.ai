import React from 'react';
import { Search, Filter, Briefcase, Calendar, User } from 'lucide-react';

interface FilterProps {
  onFilterChange: (filters: any) => void;
  activeFilters: any;
  availableJobs?: { job_id: number | string, job_title: string }[];
}

const GlobalFilters: React.FC<FilterProps> = ({ onFilterChange, activeFilters, availableJobs = [] }) => {
  const handleChange = (key: string, value: string) => {
    onFilterChange({ ...activeFilters, [key]: value });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      {/* Top Row: Search and Primary Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Field */}
        <div className="flex-1 relative min-w-[300px]">
          <input
            type="text"
            placeholder="Search Name, Email, or Skills..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            onChange={(e) => handleChange('query', e.target.value)}
            value={activeFilters.query || ''}
          />
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-3">
          {/* Source Filter */}
          <div className="relative min-w-[150px]">
            <select
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
              onChange={(e) => handleChange('source', e.target.value)}
              value={activeFilters.source || ''}
            >
              <option value="">All Sources</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Naukri">Naukri</option>
              <option value="Indeed">Indeed</option>
              <option value="Agency">Agency</option>
              <option value="Referral">Referral</option>
              <option value="Career Page">Career Page</option>
              <option value="Database">Database</option>
            </select>
            <User className="absolute left-3 top-3 text-gray-400 w-4 h-4 pointer-events-none" />
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Job Filter */}
          <div className="relative min-w-[200px]">
            <select
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
              onChange={(e) => handleChange('jobId', e.target.value)}
              value={activeFilters.jobId || ''}
            >
              <option value="">All Jobs</option>
              {availableJobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.job_title}
                </option>
              ))}
            </select>
            <Briefcase className="absolute left-3 top-3 text-gray-400 w-4 h-4 pointer-events-none" />
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Date Filters */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied Date:</span>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              className="pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => handleChange('fromDate', e.target.value)}
              value={activeFilters.fromDate || ''}
              placeholder="From"
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative">
            <input
              type="date"
              className="pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => handleChange('toDate', e.target.value)}
              value={activeFilters.toDate || ''}
              placeholder="To"
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(activeFilters.source || activeFilters.jobId || activeFilters.fromDate || activeFilters.toDate || activeFilters.query) && (
          <button
            onClick={() => onFilterChange({})}
            className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default GlobalFilters;