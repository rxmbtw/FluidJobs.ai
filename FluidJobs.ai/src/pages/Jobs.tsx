import React, { useState } from 'react';
import { Search, MapPin, Clock, IndianRupee, User, Bookmark, ChevronDown } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  status: string;
  saved: boolean;
  description: string;
}

const Jobs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('Most Recent');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: [] as string[],
    jobType: [] as string[],
    salaryRange: [] as string[],
    experience: [] as string[]
  });
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '₹12L - ₹18L',
      skills: ['React', 'TypeScript', 'Node.js'],
      status: 'Just Posted',
      saved: false,
      description: 'We are looking for a Senior React Developer to join our dynamic team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows. Experience with TypeScript and Node.js is required.'
    },
    {
      id: 2,
      title: 'Frontend Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '₹8L - ₹12L',
      skills: ['Vue.js', 'JavaScript', 'CSS'],
      status: 'Actively Hiring',
      saved: false,
      description: 'Join our innovative startup as a Frontend Engineer. You will work on cutting-edge web applications using Vue.js and modern JavaScript. Strong CSS skills and eye for design are essential.'
    },
    {
      id: 3,
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Remote',
      type: 'Contract',
      salary: '₹5L - ₹8L',
      skills: ['Figma', 'Sketch', 'Prototyping'],
      status: 'Actively Hiring',
      saved: false,
      description: 'We need a talented UX Designer to create intuitive and engaging user experiences. Proficiency in Figma and Sketch is required. Experience with prototyping and user research is a plus.'
    }
  ]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([
  ]);

  React.useEffect(() => {
    setFilteredJobs(jobs);
  }, [jobs]);

  // Auto-search when filters change
  React.useEffect(() => {
    handleSearch();
  }, [filters]);

  const handleSaveJob = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, saved: !job.saved } : job
    ));
  };

  const handleJobClick = (jobId: number) => {
    console.log(`Navigate to job ${jobId}`);
    // Add actual navigation logic here
  };

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  const handleViewDetails = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const job = filteredJobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowJobModal(true);
    }
  };

  const JobDetailsModal = () => {
    if (!selectedJob) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <p className="text-lg text-gray-600">{selectedJob.company}</p>
              </div>
              <button
                onClick={() => setShowJobModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-wrap items-center text-gray-500 text-sm mb-6 space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {selectedJob.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {selectedJob.type}
              </div>
              <div className="flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {selectedJob.salary}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Job Description</h3>
              <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex-1">
                Apply Now
              </button>
              <button 
                onClick={(e) => handleSaveJob(selectedJob.id, e)}
                className={`px-6 py-3 rounded-lg border transition-colors flex items-center space-x-2 ${
                  selectedJob.saved 
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${selectedJob.saved ? 'fill-current' : ''}`} />
                <span>{selectedJob.saved ? 'Saved' : 'Save Job'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const getSuggestions = () => {
    if (!searchTerm.trim()) return [];
    const searchWords = searchTerm.toLowerCase().split(' ');
    const suggestions = new Set<string>();
    
    jobs.forEach(job => {
      // Add job titles
      if (job.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(job.title);
      }
      // Add company names
      if (job.company.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(job.company);
      }
      // Add skills
      job.skills.forEach(skill => {
        if (skill.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.add(skill);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    console.log('Search clicked', { searchTerm, filters });
    const filtered = jobs.filter(job => {
      const matchesSearch = !searchTerm.trim() || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = filters.location.length === 0 || filters.location.includes(job.location);
      const matchesJobType = filters.jobType.length === 0 || filters.jobType.includes(job.type);
      const matchesSalary = filters.salaryRange.length === 0 || filters.salaryRange.includes(job.salary);
      
      return matchesSearch && matchesLocation && matchesJobType && matchesSalary;
    });
    
    console.log('Filtered jobs:', filtered);
    setFilteredJobs(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      location: [],
      jobType: [],
      salaryRange: [],
      experience: []
    });
    setFilteredJobs(jobs);
  };

  const NoResultsState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        Try adjusting your search filters to find what you're looking for.
      </p>
      <button
        onClick={clearAllFilters}
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Job Search</h1>
          
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Search Input */}
              <div className="flex-1 relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Search icon clicked');
                    handleSearch();
                  }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 cursor-pointer transition-colors z-10"
                >
                  <Search className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Search by job title, keyword, or company..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchTerm && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {/* Search Suggestions */}
                {showSuggestions && getSuggestions().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {getSuggestions().map((suggestion, index) => (
                      <div
                        key={index}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectSuggestion(suggestion);
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center"
                      >
                        <Search className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-700">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-3">
                {/* Location Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown('location')}
                    className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    Location {filters.location.length > 0 && `(${filters.location.length})`}
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                  </button>
                  {openDropdown === 'location' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA'].map(location => (
                        <label key={location} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.location.includes(location)}
                            onChange={() => handleFilterChange('location', location)}
                            className="mr-2"
                          />
                          {location}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Job Type Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown('jobType')}
                    className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    Job Type {filters.jobType.length > 0 && `(${filters.jobType.length})`}
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                  </button>
                  {openDropdown === 'jobType' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map(type => (
                        <label key={type} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.jobType.includes(type)}
                            onChange={() => handleFilterChange('jobType', type)}
                            className="mr-2"
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Salary Range Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown('salaryRange')}
                    className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <IndianRupee className="w-4 h-4 mr-2 text-gray-500" />
                    Salary Range {filters.salaryRange.length > 0 && `(${filters.salaryRange.length})`}
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                  </button>
                  {openDropdown === 'salaryRange' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {['₹5L - ₹8L', '₹8L - ₹12L', '₹12L - ₹18L', '₹18L - ₹25L', '₹25L+'].map(range => (
                        <label key={range} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.salaryRange.includes(range)}
                            onChange={() => handleFilterChange('salaryRange', range)}
                            className="mr-2"
                          />
                          {range}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Experience Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown('experience')}
                    className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    Experience {filters.experience.length > 0 && `(${filters.experience.length})`}
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                  </button>
                  {openDropdown === 'experience' && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {['Entry Level', '1-3 years', '3-5 years', '5-10 years', '10+ years'].map(level => (
                        <label key={level} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.experience.includes(level)}
                            onChange={() => handleFilterChange('experience', level)}
                            className="mr-2"
                          />
                          {level}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  type="button"
                  onClick={() => {
                    console.log('Search button clicked');
                    handleSearch();
                  }}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          
          {/* Sort Controls */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">{filteredJobs.length} jobs found</p>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option>Most Recent</option>
                <option>Most Relevant</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Job Results List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <NoResultsState />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job.id)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer relative"
            >
              {/* Save Button */}
              <button
                onClick={(e) => handleSaveJob(job.id, e)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  job.saved ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${job.saved ? 'fill-current' : ''}`} />
              </button>
              
              {/* Status Tag */}
              <div className="absolute top-4 right-16">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === 'Just Posted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {job.status}
                </span>
              </div>
              
              <div className="pr-20">
                {/* Job Title and Company */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-gray-600 mb-3">{job.company}</p>
                
                {/* Key Details */}
                <div className="flex flex-wrap items-center text-gray-500 text-sm mb-4 space-x-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {job.type}
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {job.salary}
                  </div>
                </div>
                
                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                {/* View Details Button */}
                <button
                  onClick={(e) => handleViewDetails(job.id, e)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
        
        {/* Job Details Modal */}
        {showJobModal && <JobDetailsModal />}
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
