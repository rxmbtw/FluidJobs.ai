import React, { useState } from 'react';

const JobSettings: React.FC = () => {
  const [jobDetails, setJobDetails] = useState({
    title: 'AI Lead',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are looking for an experienced AI Lead to drive our artificial intelligence initiatives and lead a team of ML engineers.',
    requirements: [
      '5+ years of experience in AI/ML',
      'Strong leadership skills',
      'Experience with Python, TensorFlow, PyTorch',
      'PhD in Computer Science or related field preferred'
    ],
    salary: {
      min: 150000,
      max: 200000,
      currency: 'USD'
    },
    status: 'Active',
    hiringManager: 'Sarah Parker',
    recruiters: ['Alex Thompson', 'James Wilson'],
    interviewStages: [
      'Screening',
      'Technical Assessment',
      'L1 Technical',
      'L2 Technical',
      'L3 Technical',
      'L4 Technical',
      'HR Round',
      'Management Round'
    ]
  });

  const [activeSection, setActiveSection] = useState('basic');

  const handleInputChange = (field: string, value: any) => {
    setJobDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSalaryChange = (field: string, value: number) => {
    setJobDetails(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: value
      }
    }));
  };

  const addRequirement = () => {
    setJobDetails(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setJobDetails(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setJobDetails(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Job Settings</h1>
          <p className="text-sm text-gray-600">Configure job details, requirements, and hiring process settings.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all">
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <nav className="space-y-1">
              {[
                { id: 'basic', label: 'Basic Information', icon: 'fa-info-circle' },
                { id: 'description', label: 'Job Description', icon: 'fa-file-text' },
                { id: 'requirements', label: 'Requirements', icon: 'fa-list-check' },
                { id: 'compensation', label: 'Compensation', icon: 'fa-dollar-sign' },
                { id: 'team', label: 'Team & Recruiters', icon: 'fa-users' },
                { id: 'process', label: 'Interview Process', icon: 'fa-clipboard-list' },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={`fa-solid ${section.icon} text-sm`}></i>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      value={jobDetails.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      value={jobDetails.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Engineering</option>
                      <option>Product</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={jobDetails.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-site</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                    <select
                      value={jobDetails.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex gap-4">
                    {['Active', 'Paused', 'Closed'].map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={jobDetails.status === status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'description' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={jobDetails.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter job description..."
                  />
                </div>
              </div>
            )}

            {activeSection === 'requirements' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                  <button
                    onClick={addRequirement}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Add Requirement
                  </button>
                </div>
                
                <div className="space-y-3">
                  {jobDetails.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter requirement..."
                      />
                      <button
                        onClick={() => removeRequirement(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <i className="fa-solid fa-trash text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'compensation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Compensation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                    <input
                      type="number"
                      value={jobDetails.salary.min}
                      onChange={(e) => handleSalaryChange('min', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary</label>
                    <input
                      type="number"
                      value={jobDetails.salary.max}
                      onChange={(e) => handleSalaryChange('max', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={jobDetails.salary.currency}
                      onChange={(e) => handleSalaryChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>INR</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'team' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Team & Recruiters</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Manager</label>
                    <select
                      value={jobDetails.hiringManager}
                      onChange={(e) => handleInputChange('hiringManager', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Sarah Parker</option>
                      <option>Mark Chen</option>
                      <option>David Blake</option>
                      <option>Alice Wong</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Recruiters</label>
                    <div className="space-y-2">
                      {jobDetails.recruiters.map((recruiter, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{recruiter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'process' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Interview Process</h3>
                
                <div className="space-y-3">
                  {jobDetails.interviewStages.map((stage, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSettings;