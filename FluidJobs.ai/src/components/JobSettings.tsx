import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, Bold, Italic, Underline, Strikethrough, Undo2, Redo2 } from 'lucide-react';
import { indianCities } from '../data/indianCities';
import SuccessModal from './SuccessModal';
import Loader from './Loader';

interface JobSettingsProps {
  jobTitle?: string;
  jobId?: string;
  onJobUpdate?: (updatedJob: any) => void;
}

const JobSettings: React.FC<JobSettingsProps> = ({ jobTitle, jobId, onJobUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [jobStatus, setJobStatus] = useState('');
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [selectedImage, setSelectedImage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [isGeneratingFromPdf, setIsGeneratingFromPdf] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [showPdfSuccessModal, setShowPdfSuccessModal] = useState(false);
  const [isRestricting, setIsRestricting] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Get user role
  React.useEffect(() => {
    // Check both sessionStorage locations for user data
    const userStr = sessionStorage.getItem('fluidjobs_user');
    const superAdminStr = localStorage.getItem('superadmin');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || '');
    } else if (superAdminStr) {
      const superAdmin = JSON.parse(superAdminStr);
      setUserRole('SuperAdmin'); // Set role as SuperAdmin for localStorage users
    }
  }, []);
  const [formData, setFormData] = useState<any>({
    job_title: '',
    job_domain: '',
    min_experience: '',
    max_experience: '',
    job_type: '',
    no_of_openings: '',
    min_salary: '',
    max_salary: '',
    show_salary_to_candidate: true,
    registration_opening_date: '',
    registration_closing_date: '',
    locations: '',
    mode_of_job: '',
    skills: '',
    job_description: '',
    selected_image: '',
    jd_attachment_name: ''
  });
  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const experienceOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const openingsOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+'];
  const modeOptions = ['Work From Home', 'Hybrid', 'On-site'];
  const domainSuggestions = [
    'Software Development', 'Data Science', 'Machine Learning', 'Web Development',
    'Mobile Development', 'DevOps', 'Quality Assurance', 'UI/UX Design',
    'Product Management', 'Digital Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations'
  ];

  useEffect(() => {
    fetchJobData();
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
        
        const newFormData = {
          job_title: job.job_title || '',
          job_domain: job.job_domain || '',
          min_experience: job.min_experience?.toString() || '',
          max_experience: job.max_experience?.toString() || '',
          job_type: job.job_type || '',
          no_of_openings: (job.number_of_openings || job.no_of_openings)?.toString() || '',
          min_salary: job.min_salary?.toString() || '',
          max_salary: job.max_salary?.toString() || '',
          show_salary_to_candidate: true,
          registration_opening_date: job.registration_opening_date?.split('T')[0] || '',
          registration_closing_date: job.registration_closing_date?.split('T')[0] || '',
          locations: locationsArray.join(', '),
          mode_of_job: job.mode_of_job || '',
          skills: skillsArray.join(', '),
          job_description: job.job_description || ''
        };
        
        setFormData(newFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));
        
        setSelectedSkills(skillsArray);
        const locs = locationsArray;
        setSelectedLocations(locs);
        setJobStatus(job.status || '');
        setIsPublished(job.status === 'Published');
        setSelectedImage(job.selected_image || '');
        setUploadedPdfUrl(job.jd_attachment_name || '');
        setPdfFileName(job.jd_attachment_name || '');
        setHasChanges(false);
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
    setHasChanges(true);
  };

  const removeSkill = (skillToRemove: string) => {
    const updated = selectedSkills.filter(s => s !== skillToRemove);
    setSelectedSkills(updated);
    setFormData((prev: any) => ({ ...prev, skills: updated.join(', ') }));
    setHasChanges(true);
  };

  const handlePublishToggle = () => {
    if (isPublished) {
      setShowUnpublishModal(true);
    } else {
      // Re-publish: Send for approval
      updateJobStatus('pending');
      setSuccessMessage({
        title: 'Request Sent!',
        message: 'Re-publish request sent to SuperAdmin for approval'
      });
      setShowSuccessModal(true);
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
    setSuccessMessage({
      title: 'Success!',
      message: 'Job unpublished successfully'
    });
    setShowSuccessModal(true);
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
          no_of_openings: formData.no_of_openings,
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
          selected_image: selectedImage,
          jd_attachment_name: uploadedPdfUrl,
          is_published: isPublished
        })
      });

      if (response.ok) {
        setSuccessMessage({
          title: 'Success!',
          message: 'Job updated successfully!'
        });
        setShowSuccessModal(true);
        setHasChanges(false);
        fetchJobData();
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to update job');
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

  // Job Images (same as JobCreationForm)
  const jobImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop'
  ];

  // FluidJobs Image Collection
  const fluidJobsImages = {
    tech: [
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/ai-technology-microchip-background-digital-transformation-concept.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/annie-spratt-QckxruozjRg-unsplash.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/Custom%20Education%20&%20Training%20Systems%20with%20Python%20Development.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/Frontend%20vs%20Backend%20What%20Happens%20Behind%20a%20Website.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/nubelson-fernandes--Xqckh_XVU4-unsplash.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/patrick-tomasso-fMntI8HAAB8-unsplash.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/person-front-computer-working-html.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/representation-user-experience-interface-design.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/roman-synkevych-E-V6EMtGSUU-unsplash.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Tech/software-development-6523979_1280.jpg'
    ],
    management: [
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/business-meeting-office.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/business-people-board-room-meeting.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/close-up-woman-working-laptop.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/closeup-job-applicant-giving-his-resume-job-interview-office.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/Data%20Science%20Meeting.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/hunters-race-MYbhN8KaaEc-unsplash.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/lukas-blazek-mcSDtbWXUZU-unsplash.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/portrait-smiling-woman-startup-office-coding.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/smiley-man-work-holding-laptop-posing.jpg',
      'https://s3.fluidjobs.ai:9002/fluidjobsai/FLuidJobs%20AI%20-%20Image%20Deck/Management/woman-retoucher-looking-camera-smiling-sitting-creative-design-media-agency.jpg'
    ]
  };

  const handleRestrictUnrestrict = async (action: 'restrict' | 'unrestrict') => {
    if (!jobId) return;
    
    setIsRestricting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/${action}/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setSuccessMessage({
          title: 'Success!',
          message: `Job ${action}ed successfully!`
        });
        setShowSuccessModal(true);
        fetchJobData(); // Refresh job data
      } else {
        alert(`Failed to ${action} job`);
      }
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
      alert(`Error ${action}ing job`);
    } finally {
      setIsRestricting(false);
    }
  };

  const generateDescription = async () => {
    if (uploadedPdfFile) {
      setIsGeneratingFromPdf(true);
      try {
        const formDataGenerate = new FormData();
        formDataGenerate.append('jdFile', uploadedPdfFile);
        
        const generateResponse = await fetch('http://localhost:8000/api/jobs-enhanced/generate-jd-from-pdf', {
          method: 'POST',
          body: formDataGenerate
        });
        const generateData = await generateResponse.json();
        
        if (generateData.success && generateData.jobDescription) {
          setIsUserEditing(false);
          setFormData((prev: any) => ({ ...prev, job_description: generateData.jobDescription }));
          setShowPdfSuccessModal(true);
        } else {
          alert('Failed to generate description from PDF');
        }
      } catch (error) {
        console.error('Error generating from PDF:', error);
        alert('Failed to generate description from PDF');
      } finally {
        setIsGeneratingFromPdf(false);
      }
    } else {
      const description = `We are looking for a talented ${formData.job_title} to join our dynamic team. 

Key Responsibilities:
• Develop and maintain high-quality software solutions
• Collaborate with cross-functional teams
• Participate in code reviews and technical discussions
• Contribute to architectural decisions

Requirements:
• ${formData.min_experience}-${formData.max_experience} years of experience
• Strong technical skills and problem-solving abilities
• Excellent communication and teamwork skills

What We Offer:
• Competitive salary package
• Flexible working arrangements
• Growth opportunities
• Collaborative work environment`;

      setIsUserEditing(false);
      setFormData((prev: any) => ({ ...prev, job_description: description }));
    }
  };

  const execEditorCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setIsUserEditing(true);
      setFormData((prev: any) => ({ ...prev, job_description: editorRef.current!.innerHTML }));
    }
  };

  useEffect(() => {
    if (editorRef.current && formData.job_description) {
      editorRef.current.innerHTML = formData.job_description;
    }
  }, [formData.job_description]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Settings</h1>
          {userRole === 'SuperAdmin' && (
            <div className="flex space-x-3">
              <button
                onClick={() => handleRestrictUnrestrict('restrict')}
                disabled={isRestricting}
                className="px-6 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRestricting ? 'Processing...' : 'Restrict'}
              </button>
              <button
                onClick={() => handleRestrictUnrestrict('unrestrict')}
                disabled={isRestricting}
                className="px-6 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRestricting ? 'Processing...' : 'Unrestrict'}
              </button>
            </div>
          )}
        </div>

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
                      {jobStatus === 'Published' && <span className="text-sm text-gray-600">Published</span>}
                      {jobStatus === 'unpublished' && <span className="text-sm text-gray-600">Republish</span>}
                      <button
                        onClick={handlePublishToggle}
                        disabled={jobStatus === 'pending'}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          jobStatus === 'pending' ? 'bg-gray-200 cursor-not-allowed opacity-50' : isPublished ? 'bg-indigo-600' : 'bg-gray-300'
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No of Openings <span className="text-red-500">*</span>
                </label>
                <select
                  name="no_of_openings"
                  value={formData.no_of_openings}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {openingsOptions.map(num => (
                    <option key={num} value={num}>{num}</option>
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

            {/* Job Posting Image Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Job Posting Image <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {jobImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedImage(image);
                      setFormData((prev: any) => ({ ...prev, selected_image: image }));
                      setHasChanges(true);
                    }}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image
                        ? 'border-indigo-600 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Job image ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    {selectedImage === image && (
                      <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  More Images
                </button>
              </div>
            </div>

            {/* Job Description PDF */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Job Description PDF
              </h3>
              <input
                type="file"
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsUploadingPdf(true);
                    const formDataUpload = new FormData();
                    formDataUpload.append('jdFile', file);
                    
                    try {
                      const uploadResponse = await fetch('http://localhost:8000/api/jobs-enhanced/upload-jd', {
                        method: 'POST',
                        body: formDataUpload
                      });
                      const uploadData = await uploadResponse.json();
                      
                      if (uploadData.success) {
                        setUploadedPdfUrl(uploadData.filename);
                        setPdfFileName(uploadData.originalName);
                        setUploadedPdfFile(file);
                        setFormData((prev: any) => ({ ...prev, jd_attachment_name: uploadData.filename }));
                        setHasChanges(true);
                      } else {
                        alert('Failed to upload PDF');
                      }
                    } catch (error) {
                      console.error('Error uploading PDF:', error);
                      alert('Failed to upload PDF');
                    } finally {
                      setIsUploadingPdf(false);
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {isUploadingPdf && <p className="text-sm text-gray-500 mt-1">🔄 Uploading PDF...</p>}
              {pdfFileName && <p className="text-sm text-green-600 mt-1">✓ {pdfFileName} uploaded. Click "Generate Description" to extract text.</p>}
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
              <div className="space-y-1">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={isGeneratingFromPdf}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm ${
                      isGeneratingFromPdf
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingFromPdf ? 'Generating...' : uploadedPdfFile ? 'Generate from PDF' : 'Generate Description'}
                  </button>
                </div>
            
                <div className="border rounded-lg border-gray-300">
                  {/* Toolbar */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-300 rounded-t-lg flex-wrap">
                    <select
                      onChange={(e) => execEditorCommand('formatBlock', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                      defaultValue="p"
                    >
                      <option value="p">Paragraph</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                    </select>

                    <div className="w-px h-6 bg-gray-300"></div>

                    <button type="button" onClick={() => execEditorCommand('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => execEditorCommand('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => execEditorCommand('underline')} className="p-2 hover:bg-gray-200 rounded" title="Underline">
                      <Underline className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => execEditorCommand('strikeThrough')} className="p-2 hover:bg-gray-200 rounded" title="Strikethrough">
                      <Strikethrough className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-gray-300"></div>

                    <button type="button" onClick={() => execEditorCommand('insertUnorderedList')} className="px-3 py-1 hover:bg-gray-200 rounded text-sm" title="Bullet List">
                      • List
                    </button>
                    <button type="button" onClick={() => execEditorCommand('insertOrderedList')} className="px-3 py-1 hover:bg-gray-200 rounded text-sm" title="Numbered List">
                      1. List
                    </button>

                    <div className="w-px h-6 bg-gray-300"></div>

                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) execEditorCommand('createLink', url);
                      }}
                      className="px-3 py-1 hover:bg-gray-200 rounded text-sm"
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editorRef.current) {
                          editorRef.current.innerHTML = '';
                          setFormData((prev: any) => ({ ...prev, job_description: '' }));
                        }
                      }}
                      className="px-3 py-1 hover:bg-gray-200 rounded text-sm text-red-600"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Editor */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorChange}
                    className="min-h-[200px] max-h-[400px] overflow-y-auto p-3 focus:outline-none"
                    style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                    data-placeholder="Enter job description here..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveUpdates}
              disabled={saving || !hasChanges}
              className={`w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                hasChanges ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600'
              }`}
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


    {/* Success Modal */}
    <SuccessModal
      isOpen={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      title={successMessage.title}
      message={successMessage.message}
    />

    {/* PDF Generation Success Modal */}
    <SuccessModal
      isOpen={showPdfSuccessModal}
      onClose={() => setShowPdfSuccessModal(false)}
      title="Success!"
      message="✅ Job description generated from PDF successfully!"
    />

    {/* Image Selection Modal */}
    {showImageModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Select Job Posting Image</h2>
            <button
              onClick={() => setShowImageModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tech Images */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Technology & Development</h3>
            <div className="grid grid-cols-4 gap-4">
              {fluidJobsImages.tech.map((image, index) => (
                <div
                  key={`tech-${index}`}
                  onClick={() => {
                    setSelectedImage(image);
                    setFormData((prev: any) => ({ ...prev, selected_image: image }));
                    setHasChanges(true);
                    setShowImageModal(false);
                  }}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImage === image
                      ? 'border-indigo-600 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Tech image ${index + 1}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {selectedImage === image && (
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Management Images */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Management & Business</h3>
            <div className="grid grid-cols-4 gap-4">
              {fluidJobsImages.management.map((image, index) => (
                <div
                  key={`mgmt-${index}`}
                  onClick={() => {
                    setSelectedImage(image);
                    setFormData((prev: any) => ({ ...prev, selected_image: image }));
                    setHasChanges(true);
                    setShowImageModal(false);
                  }}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImage === image
                      ? 'border-indigo-600 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Management image ${index + 1}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {selectedImage === image && (
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Original Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">General Professional</h3>
            <div className="grid grid-cols-4 gap-4">
              {jobImages.map((image, index) => (
                <div
                  key={`original-${index}`}
                  onClick={() => {
                    setSelectedImage(image);
                    setFormData((prev: any) => ({ ...prev, selected_image: image }));
                    setHasChanges(true);
                    setShowImageModal(false);
                  }}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImage === image
                      ? 'border-indigo-600 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Professional image ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  {selectedImage === image && (
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
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
