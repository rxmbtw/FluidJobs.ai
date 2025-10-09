import React, { useState } from 'react';
import { Search, Plus, MoreVertical, X, MapPin, Users, Calendar, ChevronDown } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  applications: number;
  status: string;
}

const JobManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([
    { id: 1, title: 'Senior React Developer', department: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$120k - $150k', postedDate: '2 days ago', applications: 15, status: 'Active' },
    { id: 2, title: 'Product Manager', department: 'Product', location: 'Hybrid', type: 'Full-time', salary: '$90k - $130k', postedDate: '1 week ago', applications: 8, status: 'Active' },
    { id: 3, title: 'UX Designer', department: 'Design', location: 'On-site', type: 'Contract', salary: '$60k - $80k', postedDate: '3 days ago', applications: 22, status: 'Draft' }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '',
    salaryMin: '',
    salaryMax: '',
    salaryFrequency: 'per year',
    description: '',
    responsibilities: '',
    qualifications: ''
  });

  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const jobTitleSuggestions = [
    'Senior React Developer',
    'Product Manager',
    'UX Designer',
    'Frontend Engineer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Marketing Manager',
    'Sales Representative',
    'Business Analyst',
    'Project Manager'
  ];

  const filteredSuggestions = jobTitleSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(formData.title.toLowerCase())
  );

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || job.department.toLowerCase() === departmentFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleMenuAction = (action: string, jobId: number) => {
    setActiveMenu(null);
    // Handle different actions
    switch (action) {
      case 'View Applicants':
        // Navigate to applicants page or show modal
        break;
      case 'Edit':
        // Open edit modal with job data
        break;
      case 'Duplicate':
        const jobToDuplicate = jobs.find(j => j.id === jobId);
        if (jobToDuplicate) {
          const duplicatedJob = {
            ...jobToDuplicate,
            id: jobs.length + 1,
            title: `${jobToDuplicate.title} (Copy)`,
            postedDate: 'Just now',
            applications: 0,
            status: 'Draft'
          };
          setJobs([duplicatedJob, ...jobs]);
        }
        break;
      case 'Archive':
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, status: 'Archived' } : job
        ));
        break;
    }
  };

  const handleSubmit = (isDraft: boolean) => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Job title is required');
      return;
    }
    if (!formData.department) {
      alert('Department is required');
      return;
    }
    if (!formData.location) {
      alert('Location is required');
      return;
    }
    if (!formData.type) {
      alert('Employment type is required');
      return;
    }
    
    // Create job with validation
    const newJob: Job = {
      id: jobs.length + 1,
      title: formData.title.trim(),
      department: formData.department,
      location: formData.location,
      type: formData.type,
      salary: formData.salaryMin && formData.salaryMax 
        ? `$${formData.salaryMin}k - $${formData.salaryMax}k`
        : 'Salary not specified',
      postedDate: 'Just now',
      applications: 0,
      status: isDraft ? 'Draft' : 'Active'
    };
    setJobs([newJob, ...jobs]);
    setShowModal(false);
    setFormData({
      title: '', department: '', location: '', type: '',
      salaryMin: '', salaryMax: '', salaryFrequency: 'per year',
      description: '', responsibilities: '', qualifications: ''
    });
    setShowJobTitleSuggestions(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </button>
        </div>

        {/* Control Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Filter by Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Filter by Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
            </select>
          </div>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleMenuAction('View Applicants', job.id)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === job.id ? null : job.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      {activeMenu === job.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[160px]">
                          <button
                            onClick={() => handleMenuAction('View Applicants', job.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            View Applicants
                          </button>
                          <button
                            onClick={() => handleMenuAction('Edit', job.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleMenuAction('Duplicate', job.id)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleMenuAction('Archive', job.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </span>
                    <span>{job.type}</span>
                    <span>{job.salary}</span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted {job.postedDate}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {job.applications} applications
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowJobTitleSuggestions(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={() => setShowJobTitleSuggestions(false)}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create a New Job Posting</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <div 
                className="p-6 space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({...formData, title: e.target.value});
                          setShowJobTitleSuggestions(true);
                        }}
                        onFocus={() => setShowJobTitleSuggestions(true)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g. Senior React Developer"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowJobTitleSuggestions(!showJobTitleSuggestions)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {showJobTitleSuggestions && (formData.title.length > 0 ? filteredSuggestions.length > 0 : jobTitleSuggestions.length > 0) && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {(formData.title.length > 0 ? filteredSuggestions : jobTitleSuggestions).map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData({...formData, title: suggestion});
                                setShowJobTitleSuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Location</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        placeholder="50,000"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({...formData, salaryMin: e.target.value})}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <label className="absolute -top-5 left-0 text-xs text-gray-600">Minimum</label>
                    </div>
                    <span className="text-gray-400">to</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        placeholder="80,000"
                        value={formData.salaryMax}
                        onChange={(e) => setFormData({...formData, salaryMax: e.target.value})}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <label className="absolute -top-5 left-0 text-xs text-gray-600">Maximum</label>
                    </div>
                    <select
                      value={formData.salaryFrequency}
                      onChange={(e) => setFormData({...formData, salaryFrequency: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="per year">per year</option>
                      <option value="per month">per month</option>
                      <option value="per hour">per hour</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                  <textarea
                    value={formData.qualifications}
                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => handleSubmit(true)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Post Job
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobManagement;