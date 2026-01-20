import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import JobSpecificDashboard from './JobSpecificDashboard';
import Loader from './Loader';

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
  status?: string;
}



interface JobOpeningsViewNewProps {
  hideHeader?: boolean;
  searchQuery?: string;
  showFilters?: boolean;
  jobTab?: string;
  onJobTabChange?: (tab: string) => void;
}

const JobOpeningsViewNew: React.FC<JobOpeningsViewNewProps> = ({ hideHeader = false, searchQuery: externalSearchQuery, showFilters: externalShowFilters, jobTab = 'all', onJobTabChange }) => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [showJobDashboard, setShowJobDashboard] = useState(false);
  const [selectedJobForDashboard, setSelectedJobForDashboard] = useState<JobData | null>(null);
  const [defaultDashboardTab, setDefaultDashboardTab] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Use external search query if provided
  const activeSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : searchQuery;
  const activeShowFilters = externalShowFilters !== undefined ? externalShowFilters : showFilters;
  
  // Filter states
  const [filterDomain, setFilterDomain] = useState<string>('');
  const [filterJobType, setFilterJobType] = useState<string>('');
  const [filterWorkMode, setFilterWorkMode] = useState<string>('');
  const [filterSalaryRange, setFilterSalaryRange] = useState<string>('');
  const [filterPostedDate, setFilterPostedDate] = useState<string>('');
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [skillsSearch, setSkillsSearch] = useState('');
  
  // Custom dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchJobs();
    
    // Refresh jobs when component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchJobs();
      }
    };
    
    // Listen for custom event to open job dashboard
    const handleOpenJobDashboard = (event: any) => {
      const { job, defaultTab } = event.detail;
      setDashboardLoading(true);
      
      // Add a small delay to show loading state
      setTimeout(() => {
        const jobData = {
          jobId: job.jobId,
          title: job.title,
          experience: '0-5 years', // Default values since we don't have full job data
          location: 'Not specified',
          workplace: 'Full-time',
          tags: ['Technology'],
          image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
          description: {
            overview: 'Job details will be loaded from the database.',
            responsibilities: ['Manage job responsibilities'],
            qualifications: ['Required qualifications']
          }
        };
        setSelectedJobForDashboard(jobData);
        setDefaultDashboardTab(defaultTab);
        setShowJobDashboard(true);
        setDashboardLoading(false);
      }, 800); // 800ms loading delay for smooth transition
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('openJobDashboard', handleOpenJobDashboard);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('openJobDashboard', handleOpenJobDashboard);
    };
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
          location: Array.isArray(job.locations) ? job.locations.join(', ') : (typeof job.locations === 'string' ? job.locations.replace(/[{}"]/g, '').split(',').map((l: string) => l.trim()).join(', ') : job.locations),
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
          job_domain: job.job_domain,
          status: job.status
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

  const filteredJobs = jobs.filter(job => {
    // Tab filter
    if (jobTab !== 'all') {
      if (jobTab === 'published' && job.status !== 'Published') return false;
      if (jobTab === 'pending' && job.status !== 'pending') return false;
      if (jobTab === 'unpublished' && job.status !== 'unpublished') return false;
      if (jobTab === 'closed' && job.status !== 'closed') return false;
    }
    
    // Search filter
    if (activeSearchQuery && !job.title.toLowerCase().includes(activeSearchQuery.toLowerCase())) {
      return false;
    }
    
    // Domain filter
    if (filterDomain && job.job_domain !== filterDomain) {
      return false;
    }
    
    // Job Type filter
    if (filterJobType && job.workplace !== filterJobType) {
      return false;
    }
    
    // Work Mode filter (stored in tags)
    if (filterWorkMode && !job.tags.includes(filterWorkMode)) {
      return false;
    }
    
    // Salary Range filter
    if (filterSalaryRange && job.min_salary && job.max_salary) {
      if (filterSalaryRange === '0-5 LPA') {
        const minRange = 0, maxRange = 5 * 100000;
        if (job.min_salary < minRange || job.max_salary > maxRange) return false;
      } else if (filterSalaryRange === '5-10 LPA') {
        const minRange = 5 * 100000, maxRange = 10 * 100000;
        if (job.min_salary < minRange || job.max_salary > maxRange) return false;
      } else if (filterSalaryRange === '10-15 LPA') {
        const minRange = 10 * 100000, maxRange = 15 * 100000;
        if (job.min_salary < minRange || job.max_salary > maxRange) return false;
      } else if (filterSalaryRange === '15-20 LPA') {
        const minRange = 15 * 100000, maxRange = 20 * 100000;
        if (job.min_salary < minRange || job.max_salary > maxRange) return false;
      } else if (filterSalaryRange === '20+ LPA') {
        const minRange = 20 * 100000;
        if (job.min_salary < minRange) return false;
      }
    }
    
    // Posted Date filter
    if (filterPostedDate && job.created_at) {
      const jobDate = new Date(job.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (filterPostedDate === '7' && daysDiff > 7) return false;
      if (filterPostedDate === '30' && daysDiff > 30) return false;
      if (filterPostedDate === '90' && daysDiff > 90) return false;
    }
    
    // Skills filter (if any selected skill matches)
    if (filterSkills.length > 0) {
      const hasMatchingSkill = filterSkills.some(skill => 
        job.tags && job.tags.some(tag => tag && tag.toLowerCase().includes(skill.toLowerCase()))
      );
      if (!hasMatchingSkill) return false;
    }
    
    return true;
  });

  const displayedJobs = filteredJobs.slice(0, visibleJobs);

  // Custom Dropdown Component
  const CustomDropdown: React.FC<{
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    dropdownKey: string;
  }> = ({ label, value, options, onChange, dropdownKey }) => {
    const isOpen = openDropdown === dropdownKey;
    
    return (
      <div className="custom-dropdown relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div
          onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:border-blue-400 transition"
        >
          {value || `All ${label}`}
        </div>
        {isOpen && (
          <div className="absolute top-full mt-1 z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  onChange(option);
                  setOpenDropdown(null);
                }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 transition ${
                  value === option ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Multi-Select Dropdown Component
  const MultiSelectDropdown: React.FC<{
    label: string;
    selectedItems: string[];
    options: string[];
    onChange: (items: string[]) => void;
    dropdownKey: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    placeholder: string;
  }> = ({ label, selectedItems, options, onChange, dropdownKey, searchValue, onSearchChange, placeholder }) => {
    const isOpen = openDropdown === dropdownKey;
    
    const filteredOptions = searchValue
      ? options.filter(option => option.toLowerCase().includes(searchValue.toLowerCase()))
      : options;
    
    const handleToggleItem = (item: string) => {
      if (selectedItems.includes(item)) {
        onChange(selectedItems.filter(i => i !== item));
      } else {
        onChange([...selectedItems, item]);
      }
    };
    
    const handleRemoveItem = (item: string) => {
      onChange(selectedItems.filter(i => i !== item));
    };
    
    const clearAll = () => {
      onChange([]);
      onSearchChange('');
    };
    
    return (
      <div className="custom-dropdown relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="border border-gray-300 rounded-lg bg-white min-h-[40px] p-2">
          {/* Selected items as tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded bg-blue-500 text-white text-xs"
              >
                {item}
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="ml-1 text-white hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {/* Search input */}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value.length > 0) {
                setOpenDropdown(dropdownKey);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchValue.trim()) {
                const skill = searchValue.trim();
                if (!selectedItems.includes(skill)) {
                  onChange([...selectedItems, skill]);
                }
                onSearchChange('');
                setOpenDropdown(null);
                e.preventDefault();
              }
            }}
            placeholder={selectedItems.length === 0 ? placeholder : ''}
            className="w-full text-sm outline-none bg-transparent"
          />
        </div>
        {isOpen && (
          <div className="absolute top-full mt-1 z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleToggleItem(option)}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition flex items-center justify-between ${
                      selectedItems.includes(option) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{option}</span>
                    {selectedItems.includes(option) && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </div>
                ))}
                {selectedItems.length > 0 && (
                  <div className="border-t border-gray-200 p-2">
                    <button
                      onClick={clearAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </>
            ) : searchValue.trim() ? (
              <div
                onClick={() => {
                  const skill = searchValue.trim();
                  if (!selectedItems.includes(skill)) {
                    onChange([...selectedItems, skill]);
                  }
                  onSearchChange('');
                  setOpenDropdown(null);
                }}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition text-blue-600"
              >
                Add "{searchValue.trim()}" as custom skill
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">Type to search or add custom skills</div>
            )}
          </div>
        )}
      </div>
    );
  };

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

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader themeState="light" />
      </div>
    );
  }

  if (showJobDashboard && selectedJobForDashboard) {
    return (
      <JobSpecificDashboard 
        jobTitle={selectedJobForDashboard.title}
        jobId={selectedJobForDashboard.jobId}
        defaultTab={defaultDashboardTab}
        onBack={() => {
          setShowJobDashboard(false);
          setSelectedJobForDashboard(null);
          setDefaultDashboardTab(undefined);
        }}
      />
    );
  }

  // When hideHeader is true (from SuperAdminDashboard), show header and tabs
  if (hideHeader) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">Job Openings</h1>
                <p className="text-gray-600">View and Manage all job openings</p>
              </div>
              <div className="flex items-center space-x-4">
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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-3 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Tab Navigation */}
          <div className="flex space-x-3 px-8 pb-4">
            <button
              onClick={() => onJobTabChange?.('all')}
              className={`px-8 py-3 rounded-full text-sm font-medium transition ${
                jobTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => onJobTabChange?.('published')}
              className={`px-8 py-3 rounded-full text-sm font-medium transition ${
                jobTab === 'published'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => onJobTabChange?.('pending')}
              className={`px-8 py-3 rounded-full text-sm font-medium transition ${
                jobTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => onJobTabChange?.('unpublished')}
              className={`px-8 py-3 rounded-full text-sm font-medium transition ${
                jobTab === 'unpublished'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Unpublished
            </button>
            <button
              onClick={() => onJobTabChange?.('closed')}
              className={`px-8 py-3 rounded-full text-sm font-medium transition ${
                jobTab === 'closed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => {
                    setFilterDomain('');
                    setFilterJobType('');
                    setFilterWorkMode('');
                    setFilterSalaryRange('');
                    setFilterPostedDate('');
                    setFilterSkills([]);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {/* Job Domain */}
                <CustomDropdown
                  label="Job Domain"
                  value={filterDomain}
                  options={['', 'Software Development', 'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development', 'DevOps', 'Quality Assurance', 'UI/UX Design', 'Product Management', 'Digital Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations']}
                  onChange={setFilterDomain}
                  dropdownKey="domain"
                />

                {/* Job Type */}
                <CustomDropdown
                  label="Job Type"
                  value={filterJobType}
                  options={['', 'Full-time', 'Part-time', 'Contract', 'Internship']}
                  onChange={setFilterJobType}
                  dropdownKey="jobType"
                />

                {/* Work Mode */}
                <CustomDropdown
                  label="Work Mode"
                  value={filterWorkMode}
                  options={['', 'Work From Home', 'Hybrid', 'On-site']}
                  onChange={setFilterWorkMode}
                  dropdownKey="workMode"
                />

                {/* Salary Range */}
                <CustomDropdown
                  label="Salary Range"
                  value={filterSalaryRange}
                  options={['', '0-5 LPA', '5-10 LPA', '10-15 LPA', '15-20 LPA', '20+ LPA']}
                  onChange={setFilterSalaryRange}
                  dropdownKey="salaryRange"
                />

                {/* Posted Date */}
                <CustomDropdown
                  label="Posted Date"
                  value={filterPostedDate}
                  options={['', 'Last 7 days', 'Last 30 days', 'Last 3 months']}
                  onChange={(value) => {
                    const mapping: {[key: string]: string} = {
                      'Last 7 days': '7',
                      'Last 30 days': '30', 
                      'Last 3 months': '90'
                    };
                    setFilterPostedDate(mapping[value] || '');
                  }}
                  dropdownKey="postedDate"
                />

                {/* Skills */}
                <MultiSelectDropdown
                  label="Skills"
                  selectedItems={filterSkills}
                  options={['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes', 'HTML', 'CSS', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Flutter', 'React Native']}
                  onChange={setFilterSkills}
                  dropdownKey="skills"
                  searchValue={skillsSearch}
                  onSearchChange={setSkillsSearch}
                  placeholder="Select skills..."
                />
              </div>
            </div>
          )}

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedJobs.map((job) => (
              <div 
                key={job.jobId} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 cursor-pointer"
                onClick={() => {
                  setDashboardLoading(true);
                  setTimeout(() => {
                    setSelectedJobForDashboard(job);
                    setShowJobDashboard(true);
                    setDashboardLoading(false);
                  }, 500);
                }}
              >
                {/* Job Image */}
                <div className="h-40 bg-gray-200">
                  <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
                </div>

                {/* Job Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-medium text-gray-900">{job.title}</h2>
                    {job.status === 'pending' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        Pending Approval
                      </span>
                    )}
                    {job.status === 'Published' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Published
                      </span>
                    )}
                    {job.status === 'unpublished' && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        Unpublished
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Posted on: {formatDate(job.created_at)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">JOB TYPE</div>
                      <div className="text-base font-medium text-gray-900">{job.workplace}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">Annual CTC</div>
                      <div className="text-base font-medium text-gray-900">{formatSalary(job.min_salary, job.max_salary)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">INDUSTRY</div>
                      <div className="text-base font-medium text-gray-900">{job.job_domain || 'Technology'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">LOCATION</div>
                      <div className="text-base font-medium text-gray-900">{job.location}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
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
        </div>
      </div>
    );
  }

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
        {!hideHeader && (
          <>
            <div className="bg-white rounded-xl p-6 mb-4 text-center shadow-sm border border-gray-200">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">View Openings</h1>
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
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 hover:bg-gray-100 rounded-lg" 
                title="Filter jobs"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Filters Panel */}
        {activeShowFilters && (
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => {
                  setFilterDomain('');
                  setFilterJobType('');
                  setFilterWorkMode('');
                  setFilterSalaryRange('');
                  setFilterPostedDate('');
                  setFilterSkills([]);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {/* Job Domain */}
              <CustomDropdown
                label="Job Domain"
                value={filterDomain}
                options={['', 'Software Development', 'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development', 'DevOps', 'Quality Assurance', 'UI/UX Design', 'Product Management', 'Digital Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations']}
                onChange={setFilterDomain}
                dropdownKey="domain2"
              />

              {/* Job Type */}
              <CustomDropdown
                label="Job Type"
                value={filterJobType}
                options={['', 'Full-time', 'Part-time', 'Contract', 'Internship']}
                onChange={setFilterJobType}
                dropdownKey="jobType2"
              />

              {/* Work Mode */}
              <CustomDropdown
                label="Work Mode"
                value={filterWorkMode}
                options={['', 'Work From Home', 'Hybrid', 'On-site']}
                onChange={setFilterWorkMode}
                dropdownKey="workMode2"
              />

              {/* Salary Range */}
              <CustomDropdown
                label="Salary Range"
                value={filterSalaryRange}
                options={['', '0-5 LPA', '5-10 LPA', '10-15 LPA', '15-20 LPA', '20+ LPA']}
                onChange={setFilterSalaryRange}
                dropdownKey="salaryRange2"
              />

              {/* Posted Date */}
              <CustomDropdown
                label="Posted Date"
                value={filterPostedDate}
                options={['', 'Last 7 days', 'Last 30 days', 'Last 3 months']}
                onChange={(value) => {
                  const mapping: {[key: string]: string} = {
                    'Last 7 days': '7',
                    'Last 30 days': '30', 
                    'Last 3 months': '90'
                  };
                  setFilterPostedDate(mapping[value] || '');
                }}
                dropdownKey="postedDate2"
              />

              {/* Skills */}
              <MultiSelectDropdown
                label="Skills"
                selectedItems={filterSkills}
                options={['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes', 'HTML', 'CSS', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Flutter', 'React Native']}
                onChange={setFilterSkills}
                dropdownKey="skills2"
                searchValue={skillsSearch}
                onSearchChange={setSkillsSearch}
                placeholder="Select skills..."
              />
            </div>
          </div>
        )}

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedJobs.map((job) => (
            <div 
              key={job.jobId} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 cursor-pointer"
              onClick={() => {
                setDashboardLoading(true);
                setTimeout(() => {
                  setSelectedJobForDashboard(job);
                  setShowJobDashboard(true);
                  setDashboardLoading(false);
                }, 500);
              }}
            >
              {/* Job Image */}
              <div className="h-40 bg-gray-200">
                <img src={job.image} alt={job.title} className="w-full h-full object-cover" />
              </div>

              {/* Job Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-medium text-gray-900">{job.title}</h2>
                  {job.status === 'pending' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      Pending Approval
                    </span>
                  )}
                  {job.status === 'Published' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Published
                    </span>
                  )}
                  {job.status === 'unpublished' && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                      Unpublished
                    </span>
                  )}
                </div>
                
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Posted on: {formatDate(job.created_at)}</span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">JOB TYPE</div>
                    <div className="text-base font-medium text-gray-900">{job.workplace}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Annual CTC</div>
                    <div className="text-base font-medium text-gray-900">{formatSalary(job.min_salary, job.max_salary)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">INDUSTRY</div>
                    <div className="text-base font-medium text-gray-900">{job.job_domain || 'Technology'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">LOCATION</div>
                    <div className="text-base font-medium text-gray-900">{job.location}</div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDashboardLoading(true);
                    setTimeout(() => {
                      setSelectedJobForDashboard(job);
                      setShowJobDashboard(true);
                      setDashboardLoading(false);
                    }, 500);
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
