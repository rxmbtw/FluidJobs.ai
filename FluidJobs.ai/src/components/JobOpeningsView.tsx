import React, { useState, useEffect } from 'react';
import { Calendar, BarChart, Users, MapPin, Clock, DollarSign, Loader2, Filter } from 'lucide-react';
import Loader from './Loader';

const JobOpeningsView: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState({ published: true, unpublished: true });
  
  const jobOpenings = [
    {
      id: 'jpeueQhz',
      title: 'Software Developer Engineer (SDE)',
      description: 'You Are Hiring For A Software Developer Engineer (sde) Role Requiring A Minimum Of 2 Years Of Experience. The Position Highlights Key Skills Such As Python, Java 8, Aws... With The Mode Of Work Being Work From Office.',
      publishedDate: '29 Sep \'25',
      stageCount: 2,
      candidatesCount: 0,
      stageStatus: '',
      location: 'Pune',
      employmentType: 'Fullstack Engineer',
      experience: '2 - 4 years',
      salaryRange: '8 LPA - 9 LPA',
      status: 'Unpublished'
    },
    {
      id: 'fZogASXr',
      title: 'Python Fullstack Developer',
      description: 'You Are Hiring For A Python Fullstack Developer Role Requiring A Minimum Of 5 Years Of Experience. The Position Highlights Key Skills Such As Python, Django, Fastapi... With The Mode Of Work Being Work From Office.',
      publishedDate: '27 Sep \'25',
      stageCount: 1,
      candidatesCount: 117,
      stageStatus: 'Ongoing',
      location: 'Pune',
      employmentType: 'Fullstack Engineer',
      experience: '5 - 7 years',
      salaryRange: '18 LPA - 18 LPA',
      status: 'Published'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <div className="p-8">
      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Clear All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="relative">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between text-sm">
              <span>All Status</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="relative">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between text-sm">
              <span>All Domains</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="relative">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between text-sm">
              <span>All Types</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="relative">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between text-sm">
              <span>All Modes</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="relative">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between text-sm">
              <span>All Ranges</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="relative">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between text-sm">
              <span>All Time</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div className="relative">
            <input type="text" placeholder="Type skills..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 text-sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-8">
          <img 
            src="/images/FLuid Live Icon.png" 
            alt="FluidJobs.ai Logo" 
            className="w-8 h-8 object-contain"
          />
        <h1 className="text-2xl font-bold text-indigo-600">Fluid Live</h1>
      </div>

      <div className="space-y-6">
        {jobOpenings
          .filter(job => 
            (statusFilter.published && job.status === 'Published') ||
            (statusFilter.unpublished && job.status === 'Unpublished')
          )
          .map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
                <p className="text-sm text-gray-500">Job ID: {job.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'Published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {job.status}
              </span>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {job.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Published date: {job.publishedDate}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BarChart className="w-4 h-4 text-blue-500" />
                <span>Stage Count: {job.stageCount}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-blue-600 font-medium">{job.candidatesCount} Candidates</span>
              </div>
              {job.stageStatus && (
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600">Stage 1: {job.stageStatus}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                <Clock className="w-4 h-4" />
                <span>{job.employmentType}</span>
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                <Clock className="w-4 h-4" />
                <span>{job.experience}</span>
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                <DollarSign className="w-4 h-4" />
                <span>{job.salaryRange}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobOpeningsView;