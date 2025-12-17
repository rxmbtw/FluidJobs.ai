import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { indianCities } from '../data/indianCities';

interface JobSettingsProps {
  jobTitle?: string;
  jobId?: string;
  onJobUpdate?: (updatedJob: any) => void;
}

const JobSettings: React.FC<JobSettingsProps> = ({ jobTitle, jobId, onJobUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [userRole, setUserRole] = useState('');

  // Get user role
  React.useEffect(() => {
    const userStr = sessionStorage.getItem('fluidjobs_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || '');
    }
  }, []);
  const [formData, setFormData] = useState<any>({
    job_title: '',
    job_domain: '',
    min_experience: '',
    max_experience: '',
    job_type: '',
    min_salary: '',
    max_salary: '',
    show_salary_to_candidate: true,
    registration_opening_date: '',
    registration_closing_date: '',
    locations: '',
    mode_of_job: '',
    skills: '',
    job_description: ''
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const experienceOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const modeOptions = ['Work From Home', 'Hybrid', 'On-site'];
  const domainSuggestions = [
    'Software Development', 'Data Science', 'Machine Learning', 'Web Development',
    'Mobile Development', 'DevOps', 'Quality Assurance', 'UI/UX Design',
    'Product Management', 'Digital Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations'
  ];

  useEffect(() => {
    fetchJobData();
    const interval = setInterval(fetchJobData, 5000);
    return () => clearInterval(interval);
  }, [jobId]);

  const fetchJobData = async () => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching job data for jobId:', jobId);
      // Try the jobs-enhanced list endpoint first to get job data
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/list`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched jobs list:', result);
        
        // Find the specific job by ID
        const job = result.jobs?.find((j: any) => j.job_id.toString() === jobId.toString());
        if (!job) {
          console.error('Job not found with ID:', jobId);
          setLoading(false);
          return;
        }
        
        console.log('Found job data:', job);
        
        // Parse PostgreSQL array format {"item1","item2"} to actual array
        let skillsArray: string[] = [];
        if (job.skills) {
          if (Array.isArray(job.skills)) {
            skillsArray = job.skills;
          } else if (typeof job.skills === 'string') {
            // Handle PostgreSQL array format like {"Python","SQL"}
            skillsArray = job.skills.replace(/[{}"]/g, '').split(',').filter((s: string) => s.trim());
          }
        }
        
        let locationsArray: string[] = [];
        if (job.locations) {
          if (Array.isArray(job.locations)) {
            locationsArray = job.locations;
          } else if (typeof job.locations === 'string') {
            // Handle PostgreSQL array format or comma-separated string
            locationsArray = job.locations.replace(/[{}"]/g, '').split(',').map((l: string) => l.trim()).filter((l: string) => l);
          }
        }
        
        setFormData({
          job_title: job.job_title || '',
          job_domain: job.job_domain || '',
          min_experience: job.min_experience?.toString() || '',
          max_experience: job.max_experience?.toString() || '',
          job_type: job.job_type || '',
          min_salary: job.min_salary?.toString() || '',
          max_salary: job.max_salary?.toString() || '',
          show_salary_to_candidate: true,
          registration_opening_date: job.registration_opening_date?.split('T')[0] || '',
          registration_closing_date: job.registration_closing_date?.split('T')[0] || '',
          locations: locationsArray.join(', '),
          mode_of_job: job.mode_of_job || '',
          skills: skillsArray.join(', '),
          job_description: job.job_description || ''
        });
        
        setSelectedSkills(skillsArray);
        const locs = locationsArray;
        setSelectedLocations(locs);
        setIsPublished(job.status === 'Published');
      } else {
        console.error('Failed to fetch job data. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updated = selectedSkills.filter(s => s !== skillToRemove);
    setSelectedSkills(updated);
    setFormData((prev: any) => ({ ...prev, skills: updated.join(', ') }));
  };

  const handlePublishToggle = () => {
    if (isPublished) {
      setShowUnpublishModal(true);
    } else {
      // Re-publish: Send for approval
      updateJobStatus('pending');
      alert('Re-publish request sent to SuperAdmin for approval');
    }
  };

  const updateJobStatus = async (status: string) => {
    if (!jobId) return;
    
    setIsPublished(status === 'Published');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/update-status/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          unpublish_reason: status === 'unpublished' ? unpublishReason : null
        })
      });
      
      if (!response.ok) {
        setIsPublished(status !== 'Published');
        alert('Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
      setIsPublished(status !== 'Published');
      alert('Error updating job status');
    }
  };

  const confirmUnpublish = async () => {
    if (!unpublishReason.trim()) {
      alert('Please enter a reason for unpublishing');
      return;
    }
    
    setShowUnpublishModal(false);
    await updateJobStatus('unpublished');
    setUnpublishReason('');
  };

  const handleSaveUpdates = async () => {
    if (!jobId) {
      alert('No job ID available');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/update/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: formData.job_title,
          job_domain: formData.job_domain,
          job_type: formData.job_type,
          locations: selectedLocations,
          mode_of_job: formData.mode_of_job,
          min_experience: formData.min_experience,
          max_experience: formData.max_experience,
          skills: selectedSkills,
          min_salary: formData.min_salary,
          max_salary: formData.max_salary,
          show_salary_to_candidate: formData.show_salary_to_candidate,
          job_description: formData.job_description,
          registration_opening_date: formData.registration_opening_date,
          registration_closing_date: formData.registration_closing_date,
          is_published: isPublished
        })
      });

      if (response.ok) {
        alert('Job updated successfully!');
        fetchJobData();
      } else {
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('Error saving updates:', error);
      alert('Failed to save updates');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Settings</h1>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Job Posted On & Publish Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Posted On</h3>
                <p className="text-gray-900">{formatDate(formData.registration_opening_date)}</p>
              </div>

              {userRole !== 'Sales' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Job Publish Status</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{isPublished ? 'Published' : 'Republish'}</span>
                      <button
                        onClick={handlePublishToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isPublished ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isPublished ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Control whether this job is published for private sharing. Once published, you can share the link directly with the candidates.
                  </p>
                </div>
              )}
            </div>

            {/* Basic Job Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Domain <span className="text-red-500">*</span>
                </label>
                <select
                  name="job_domain"
                  value={formData.job_domain}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Domain</option>
                  {domainSuggestions.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Experience (Yrs) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="min_experience"
                    value={formData.min_experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select</option>
                    {experienceOptions.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Experience (Yrs) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="max_experience"
                    value={formData.max_experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select</option>
                    {experienceOptions.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Type</option>
                  {jobTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary & Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Compensation & Timeline</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Salary (₹) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="min_salary"
                    value={formData.min_salary}
                    onChange={handleInputChange}
                    placeholder="Min Salary"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    name="max_salary"
                    value={formData.max_salary}
                    onChange={handleInputChange}
                    placeholder="Max Salary"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="show_salary_to_candidate"
                    checked={formData.show_salary_to_candidate}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Show this to candidate</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Opening Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="registration_opening_date"
                    value={formData.registration_opening_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Closing Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="registration_closing_date"
                    value={formData.registration_closing_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Location & Mode */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Work Mode</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locations <span className="text-red-500">*</span>
                </label>
                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedLocations.map(location => (
                      <span key={location} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                        {location}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedLocations.filter(l => l !== location);
                            setSelectedLocations(updated);
                            setFormData((prev: any) => ({ ...prev, locations: updated.join(', ') }));
                          }}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    placeholder="Search cities..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {showLocationSuggestions && locationInput && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {indianCities
                        .filter(city => city.toLowerCase().includes(locationInput.toLowerCase()) && !selectedLocations.includes(city))
                        .slice(0, 10)
                        .map(city => (
                          <div
                            key={city}
                            onClick={() => {
                              const updated = [...selectedLocations, city];
                              setSelectedLocations(updated);
                              setFormData((prev: any) => ({ ...prev, locations: updated.join(', ') }));
                              setLocationInput('');
                              setShowLocationSuggestions(false);
                            }}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          >
                            {city}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode of Job <span className="text-red-500">*</span>
                </label>
                <select
                  name="mode_of_job"
                  value={formData.mode_of_job}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Mode</option>
                  {modeOptions.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Skills <span className="text-red-500">*</span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full text-sm"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a skill and press Enter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const skill = input.value.trim();
                    if (skill && !selectedSkills.includes(skill)) {
                      const updated = [...selectedSkills, skill];
                      setSelectedSkills(updated);
                      setFormData((prev: any) => ({ ...prev, skills: updated.join(', ') }));
                      input.value = '';
                    }
                  }
                }}
              />
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Job Description <span className="text-red-500">*</span>
              </h3>

              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-4 p-2 border border-gray-300 rounded-t-lg bg-gray-50">
                <button type="button" onClick={() => document.execCommand('undo', false)} className="p-2 hover:bg-gray-200 rounded">
                  ↶
                </button>
                <button type="button" onClick={() => document.execCommand('redo', false)} className="p-2 hover:bg-gray-200 rounded">
                  ↷
                </button>
                <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                  <option>Paragraph</option>
                </select>
                <button type="button" onClick={() => document.execCommand('bold', false)} className="px-3 py-1 hover:bg-gray-200 rounded font-bold">
                  B
                </button>
                <button type="button" onClick={() => document.execCommand('italic', false)} className="px-3 py-1 hover:bg-gray-200 rounded italic">
                  I
                </button>
                <button type="button" onClick={() => document.execCommand('underline', false)} className="px-3 py-1 hover:bg-gray-200 rounded underline">
                  U
                </button>
                <button type="button" onClick={() => document.execCommand('strikeThrough', false)} className="px-3 py-1 hover:bg-gray-200 rounded line-through">
                  S
                </button>
                <button type="button" onClick={() => document.execCommand('insertUnorderedList', false)} className="px-3 py-1 hover:bg-gray-200 rounded">
                  • List
                </button>
                <button type="button" onClick={() => document.execCommand('insertOrderedList', false)} className="px-3 py-1 hover:bg-gray-200 rounded">
                  1. List
                </button>
                <button type="button" onClick={() => document.execCommand('insertHorizontalRule', false)} className="px-3 py-1 hover:bg-gray-200 rounded">
                  —
                </button>
              </div>

              {/* Editor */}
              <textarea
                name="job_description"
                value={formData.job_description}
                onChange={handleInputChange}
                rows={15}
                className="w-full p-4 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-pre-wrap"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveUpdates}
              disabled={saving}
              className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>

          {/* Sidebar */}
          <div className="w-64">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Total Applications</h3>
              <div className="text-6xl font-bold text-indigo-600">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>


    {/* Unpublish Confirmation Modal */}
    {showUnpublishModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Unpublish Job</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Unpublishing *</label>
            <textarea
              value={unpublishReason}
              onChange={(e) => setUnpublishReason(e.target.value)}
              placeholder="Enter reason for unpublishing this job..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
          
          <p className="text-gray-600 mb-6">Are you sure you want to unpublish this job? It will no longer be visible to candidates.</p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowUnpublishModal(false);
                setUnpublishReason('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmUnpublish}
              disabled={!unpublishReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Unpublish
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default JobSettings;
