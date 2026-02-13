import React, { useState, useEffect } from 'react';
import { Info, FileText, CheckSquare, DollarSign, Users, ClipboardList, Trash2, Calendar, MapPin, Briefcase, Upload, Sparkles, X, Plus, ChevronUp, ChevronDown, Edit3, GripVertical, Image } from 'lucide-react';

const JobSettings: React.FC = () => {
  const [jobDetails, setJobDetails] = useState({
    title: 'AI Lead',
    domain: 'Software Development',
    location: 'Remote',
    type: 'Full-time',
    minExperience: '3',
    maxExperience: '7',
    numberOfOpenings: '2',
    modeOfJob: 'Remote',
    description: 'We are looking for an experienced AI Lead to drive our artificial intelligence initiatives and lead a team of ML engineers.',
    requirements: [
      '5+ years of experience in AI/ML',
      'Strong leadership skills',
      'Experience with Python, TensorFlow, PyTorch',
      'PhD in Computer Science or related field preferred'
    ],
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Leadership'],
    salary: {
      min: 150000,
      max: 200000,
      currency: 'INR',
      showToCandidate: true
    },
    registrationOpeningDate: '2024-02-01',
    registrationClosingDate: '2024-03-01',
    status: 'Active',
    isPublished: true,
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
  const [selectedLocations, setSelectedLocations] = useState(['Mumbai', 'Bangalore']);
  const [locationInput, setLocationInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [newStageInput, setNewStageInput] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<{ [userId: string]: string[] }>({});

  // Predefined stage options for quick selection
  const predefinedStages = [
    'Application Review',
    'Phone Screening',
    'Technical Assessment',
    'L1 Technical Interview',
    'L2 Technical Interview',
    'L3 Technical Interview',
    'L4 Technical Interview',
    'System Design Round',
    'HR Round',
    'Management Round',
    'Cultural Fit Interview',
    'Final Interview',
    'Reference Check',
    'Background Verification'
  ];

  // Options
  const domainOptions = [
    'Software Development', 'Data Science', 'Machine Learning', 'Web Development',
    'Mobile Development', 'DevOps', 'Quality Assurance', 'UI/UX Design',
    'Product Management', 'Digital Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations'
  ];

  const experienceOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const openingsOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+'];
  const modeOptions = ['Remote', 'Hybrid', 'On-site'];

  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad'
  ];

  const handleInputChange = (field: string, value: any) => {
    setJobDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSalaryChange = (field: string, value: number | string | boolean) => {
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

  const addLocation = (city: string) => {
    if (!selectedLocations.includes(city)) {
      setSelectedLocations([...selectedLocations, city]);
      setLocationInput('');
      setShowLocationSuggestions(false);
    }
  };

  const removeLocation = (city: string) => {
    setSelectedLocations(selectedLocations.filter(loc => loc !== city));
  };

  const addSkill = () => {
    if (skillInput.trim() && !jobDetails.skills.includes(skillInput.trim())) {
      setJobDetails(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setJobDetails(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handlePublishToggle = () => {
    if (jobDetails.isPublished) {
      setShowUnpublishModal(true);
    } else {
      setJobDetails(prev => ({ ...prev, isPublished: true }));
    }
  };

  const confirmUnpublish = () => {
    if (unpublishReason.trim()) {
      setJobDetails(prev => ({ ...prev, isPublished: false }));
      setShowUnpublishModal(false);
      setUnpublishReason('');
    }
  };

  const addHiringStage = (stageName: string) => {
    if (stageName.trim() && !jobDetails.interviewStages.includes(stageName.trim())) {
      setJobDetails(prev => ({
        ...prev,
        interviewStages: [...prev.interviewStages, stageName.trim()]
      }));
      setNewStageInput('');
    }
  };

  const removeHiringStage = (index: number) => {
    setJobDetails(prev => ({
      ...prev,
      interviewStages: prev.interviewStages.filter((_, i) => i !== index)
    }));
  };

  const moveStageUp = (index: number) => {
    if (index > 0) {
      const newStages = [...jobDetails.interviewStages];
      [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
      setJobDetails(prev => ({ ...prev, interviewStages: newStages }));
    }
  };

  const moveStageDown = (index: number) => {
    if (index < jobDetails.interviewStages.length - 1) {
      const newStages = [...jobDetails.interviewStages];
      [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
      setJobDetails(prev => ({ ...prev, interviewStages: newStages }));
    }
  };

  const updateStageName = (index: number, newName: string) => {
    setJobDetails(prev => ({
      ...prev,
      interviewStages: prev.interviewStages.map((stage, i) => i === index ? newName : stage)
    }));
  };

  // Fetch users for team assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('superadmin_token');
        if (!token) return;

        // TODO: Replace with actual account_id from job details or props
        const accountId = 1; // Placeholder - should come from job data

        const isSuperAdmin = !!localStorage.getItem('superadmin_token');
        const endpoint = isSuperAdmin
          ? `http://localhost:8000/api/superadmin/users?account_id=${accountId}`
          : `http://localhost:8000/api/auth/users?account_id=${accountId}`;

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('[JobSettings] Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const sections = [
    { id: 'basic', label: 'Basic Information', icon: Info },
    { id: 'image', label: 'Job Image', icon: Image },
    { id: 'timeline', label: 'Timeline & Dates', icon: Calendar },
    { id: 'location', label: 'Location & Mode', icon: MapPin },
    { id: 'description', label: 'Job Description', icon: FileText },
    { id: 'requirements', label: 'Requirements & Skills', icon: CheckSquare },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'team', label: 'Team & Recruiters', icon: Users },
    { id: 'process', label: 'Hiring Process', icon: ClipboardList },
  ];

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

      {/* Job Status Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Publish Status</h3>
            <p className="text-sm text-gray-600">Control whether this job is published and visible to candidates.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{jobDetails.isPublished ? 'Published' : 'Unpublished'}</span>
            <button
              onClick={handlePublishToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${jobDetails.isPublished ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${jobDetails.isPublished ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${activeSection === section.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <section.icon className="w-4 h-4" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobDetails.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Domain <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobDetails.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {domainOptions.map(domain => (
                        <option key={domain} value={domain}>{domain}</option>
                      ))}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobDetails.minExperience}
                      onChange={(e) => handleInputChange('minExperience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {experienceOptions.map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobDetails.maxExperience}
                      onChange={(e) => handleInputChange('maxExperience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {experienceOptions.map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Openings <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobDetails.numberOfOpenings}
                      onChange={(e) => handleInputChange('numberOfOpenings', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {openingsOptions.map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
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

            {activeSection === 'image' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Job Opening Image</h3>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Select an attractive image for your job opening to make it stand out to candidates.
                  </div>

                  {/* Current Image Display */}
                  {selectedImage && (
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Selected job image"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Image Selection Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm transition-all flex items-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      {selectedImage ? 'Change Image' : 'Select Image'}
                    </button>

                    <button
                      className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Custom
                    </button>
                  </div>

                  {/* Image Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Recommended size: 1200x600 pixels</li>
                      <li>• Formats: JPG, PNG, WebP</li>
                      <li>• Maximum file size: 2MB</li>
                      <li>• Use professional, relevant imagery</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'timeline' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Timeline & Dates</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Opening Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={jobDetails.registrationOpeningDate}
                      onChange={(e) => handleInputChange('registrationOpeningDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Closing Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={jobDetails.registrationClosingDate}
                      onChange={(e) => handleInputChange('registrationClosingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'location' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Location & Work Mode</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode of Job <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jobDetails.modeOfJob}
                    onChange={(e) => handleInputChange('modeOfJob', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {modeOptions.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locations <span className="text-red-500">*</span>
                  </label>

                  {selectedLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedLocations.map(location => (
                        <span key={location} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {location}
                          <button
                            type="button"
                            onClick={() => removeLocation(location)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
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
                      placeholder="Search and add cities..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showLocationSuggestions && locationInput && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {indianCities
                          .filter(city =>
                            city.toLowerCase().includes(locationInput.toLowerCase()) &&
                            !selectedLocations.includes(city)
                          )
                          .slice(0, 10)
                          .map(city => (
                            <div
                              key={city}
                              onClick={() => addLocation(city)}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              {city}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'description' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>

                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Description
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={jobDetails.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter job description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Description PDF</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".pdf"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm transition-all flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'requirements' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Requirements & Skills</h3>
                </div>

                {/* Requirements */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Requirements</label>
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
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Skills <span className="text-red-500">*</span>
                  </label>

                  {jobDetails.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {jobDetails.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800 text-white rounded-full text-sm"
                        >
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="hover:text-gray-300">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Add a skill and press Enter"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Add
                    </button>
                  </div>
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
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={jobDetails.salary.showToCandidate}
                      onChange={(e) => handleSalaryChange('showToCandidate', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Show salary to candidates</span>
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'team' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Hiring Team</h3>
                  <p className="text-sm text-gray-500 mt-1">Select responsibilities for each team member for this specific job opening.</p>
                </div>

                {users.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-medium text-yellow-800">No users found for this account</p>
                    <p className="text-xs text-yellow-600 mt-1">Please add users to your account before assigning team roles.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map(user => {
                      const userAssignments = teamAssignments[user.id] || [];
                      const hasAssignments = userAssignments.length > 0;

                      return (
                        <div
                          key={user.id}
                          className={`p-4 rounded-lg border transition-all ${hasAssignments
                            ? 'bg-blue-50/30 border-blue-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {/* User Info Section */}
                          <div className="flex items-start gap-3 mb-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                            </div>

                            {/* Name, Role, and Email */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{user.name || 'Unknown User'}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                  {user.role || 'User'}
                                </span>
                                <span className="text-xs text-gray-400 truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>

                          {/* Assigned Responsibilities Section */}
                          {userAssignments.length > 0 && (
                            <div className="mb-3 pb-3 border-b border-gray-200">
                              <div className="text-xs font-medium text-gray-500 mb-2">Assigned Responsibilities:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {userAssignments.map(responsibility => (
                                  <span
                                    key={responsibility}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
                                  >
                                    {responsibility.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTeamAssignments(prev => ({
                                          ...prev,
                                          [user.id]: prev[user.id].filter(r => r !== responsibility)
                                        }));
                                      }}
                                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Hidden Select for Form Compatibility */}
                          <select
                            multiple
                            value={userAssignments}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value);
                              setTeamAssignments(prev => ({
                                ...prev,
                                [user.id]: selected
                              }));
                            }}
                            className="hidden"
                            id={`responsibilities-${user.id}`}
                          >
                            <option value="hiring_manager">Hiring Manager</option>
                            <option value="screening_reviewer">Screening Reviewer</option>
                            <option value="cv_shortlist_reviewer">CV Shortlist Reviewer</option>
                            <option value="assignment_reviewer">Assignment Reviewer</option>
                            <option value="l1_technical_interviewer">L1 Technical Interviewer</option>
                            <option value="l2_technical_interviewer">L2 Technical Interviewer</option>
                            <option value="l3_technical_interviewer">L3 Technical Interviewer</option>
                            <option value="l4_technical_interviewer">L4 Technical Interviewer</option>
                            <option value="hr_round">HR Round</option>
                            <option value="management_round">Management Round</option>
                            <option value="final_decision_maker">Final Decision Maker</option>
                          </select>

                          {/* Add Responsibility Dropdown */}
                          <div className="relative">
                            <details className="group">
                              <summary className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium list-none flex items-center gap-1">
                                <span>+ Add responsibility</span>
                                <svg className="w-3 h-3 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </summary>
                              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div className="p-1">
                                  {(() => {
                                    const allResponsibilities = [
                                      { value: 'hiring_manager', label: 'Hiring Manager' },
                                      { value: 'screening_reviewer', label: 'Screening Reviewer' },
                                      { value: 'cv_shortlist_reviewer', label: 'CV Shortlist Reviewer' },
                                      { value: 'assignment_reviewer', label: 'Assignment Reviewer' },
                                      { value: 'l1_technical_interviewer', label: 'L1 Technical Interviewer' },
                                      { value: 'l2_technical_interviewer', label: 'L2 Technical Interviewer' },
                                      { value: 'l3_technical_interviewer', label: 'L3 Technical Interviewer' },
                                      { value: 'l4_technical_interviewer', label: 'L4 Technical Interviewer' },
                                      { value: 'hr_round', label: 'HR Round' },
                                      { value: 'management_round', label: 'Management Round' },
                                      { value: 'final_decision_maker', label: 'Final Decision Maker' }
                                    ];

                                    const isAdminOrSuperAdmin = user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'superadmin';
                                    const allResponsibilityValues = allResponsibilities.map(r => r.value);
                                    const hasAllResponsibilities = allResponsibilityValues.every(value => userAssignments.includes(value));

                                    return (
                                      <>
                                        {isAdminOrSuperAdmin && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setTeamAssignments(prev => {
                                                  return {
                                                    ...prev,
                                                    [user.id]: hasAllResponsibilities ? [] : allResponsibilityValues
                                                  };
                                                });
                                              }}
                                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2 ${hasAllResponsibilities ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                }`}
                                            >
                                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${hasAllResponsibilities ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                                }`}>
                                                {hasAllResponsibilities && (
                                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                  </svg>
                                                )}
                                              </div>
                                              All responsibilities
                                            </button>
                                            <div className="border-t border-gray-200 my-1"></div>
                                          </>
                                        )}
                                        {allResponsibilities.map(option => {
                                          const isSelected = userAssignments.includes(option.value);
                                          return (
                                            <button
                                              key={option.value}
                                              type="button"
                                              onClick={() => {
                                                setTeamAssignments(prev => {
                                                  const current = prev[user.id] || [];
                                                  return {
                                                    ...prev,
                                                    [user.id]: isSelected
                                                      ? current.filter(r => r !== option.value)
                                                      : [...current, option.value]
                                                  };
                                                });
                                              }}
                                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2 ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                }`}
                                            >
                                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                                }`}>
                                                {isSelected && (
                                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                  </svg>
                                                )}
                                              </div>
                                              {option.label}
                                            </button>
                                          );
                                        })}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </details>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary */}
                {Object.keys(teamAssignments).filter(userId => teamAssignments[userId].length > 0).length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {Object.keys(teamAssignments).filter(userId => teamAssignments[userId].length > 0).length} team member(s) assigned
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          These assignments will determine stage ownership and notification routing in the hiring pipeline.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'process' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Hiring Process</h3>
                  <span className="text-sm text-gray-500">{jobDetails.interviewStages.length} stages</span>
                </div>

                <div className="space-y-3">
                  {jobDetails.interviewStages.map((stage, index) => (
                    <div key={index} className="group flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                      {/* Drag Handle */}
                      <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-60 cursor-move">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>

                      {/* Stage Number */}
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>

                      {/* Stage Name - Editable */}
                      <input
                        type="text"
                        value={stage}
                        onChange={(e) => updateStageName(index, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 focus:bg-white focus:border focus:border-blue-300 focus:rounded px-2 py-1 transition-all"
                        placeholder="Enter stage name..."
                      />

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Move Up */}
                        <button
                          onClick={() => moveStageUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={() => moveStageDown(index)}
                          disabled={index === jobDetails.interviewStages.length - 1}
                          className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => removeHiringStage(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Stage */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="space-y-3">
                      {/* Custom Stage Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newStageInput}
                          onChange={(e) => setNewStageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addHiringStage(newStageInput);
                            }
                          }}
                          placeholder="Enter custom stage name..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <button
                          onClick={() => addHiringStage(newStageInput)}
                          disabled={!newStageInput.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {/* Quick Add Buttons */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Quick add common stages:</p>
                        <div className="flex flex-wrap gap-2">
                          {predefinedStages
                            .filter(stage => !jobDetails.interviewStages.includes(stage))
                            .slice(0, 6)
                            .map(stage => (
                              <button
                                key={stage}
                                onClick={() => addHiringStage(stage)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all"
                              >
                                + {stage}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Customize your hiring process</p>
                        <ul className="text-xs space-y-1 text-blue-700">
                          <li>• Click on stage names to edit them</li>
                          <li>• Use ↑↓ arrows to reorder stages</li>
                          <li>• Add custom stages or use quick-add buttons</li>
                          <li>• Remove stages you don't need with the trash icon</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unpublish Modal */}
      {showUnpublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unpublish Job</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Unpublishing <span className="text-red-500">*</span>
              </label>
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

      {/* Image Selection Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Select Job Opening Image</h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Image Categories */}
              <div className="space-y-8">
                {/* Technology Images */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Technology & Engineering
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=200&fit=crop'
                    ].map((imagePath, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedImage(imagePath);
                          setShowImageModal(false);
                        }}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-blue-500 hover:shadow-lg ${selectedImage === imagePath ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                          }`}
                      >
                        <img
                          src={imagePath}
                          alt={`Tech option ${index + 1}`}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            // Fallback to a placeholder if image doesn't load
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/tech${index}/400/200`;
                          }}
                        />
                        {selectedImage === imagePath && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-blue-500 text-white rounded-full p-1">
                              <CheckSquare className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Management & Business Images */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Management & Business
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop'
                    ].map((imagePath, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedImage(imagePath);
                          setShowImageModal(false);
                        }}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-green-500 hover:shadow-lg ${selectedImage === imagePath ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
                          }`}
                      >
                        <img
                          src={imagePath}
                          alt={`Management option ${index + 1}`}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            // Fallback to a placeholder if image doesn't load
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/mgmt${index}/400/200`;
                          }}
                        />
                        {selectedImage === imagePath && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-green-500 text-white rounded-full p-1">
                              <CheckSquare className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generic Professional Images */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Professional & Generic
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1486312338219-ce68e2c6b696?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=200&fit=crop'
                    ].map((imagePath, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedImage(imagePath);
                          setShowImageModal(false);
                        }}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-purple-500 hover:shadow-lg ${selectedImage === imagePath ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'
                          }`}
                      >
                        <img
                          src={imagePath}
                          alt={`Professional option ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        {selectedImage === imagePath && (
                          <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-purple-500 text-white rounded-full p-1">
                              <CheckSquare className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {selectedImage ? 'Image selected! Click "Select Image" again to change.' : 'Click on any image to select it for your job opening.'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {selectedImage && (
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Use Selected Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSettings;