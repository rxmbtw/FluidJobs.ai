import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Clock,
  Users,
  Briefcase,
  DollarSign,
  Eye,
  EyeOff,
  X,
  FileText,
  Upload
} from 'lucide-react';
import { useJobs } from '../contexts/JobsProvider';
import MultiSelectDropdown from './MultiSelectDropdown';
import jobsEnhancedService from '../services/jobsEnhancedService';

const defaultImages = [
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop'
];

interface JobPublishingAssistantProps {
  onBack: () => void;
}

interface FormData {
  job_title: string;
  job_domain: string;
  job_type: string;
  locations: string[];
  mode_of_job: string;
  min_experience: number;
  max_experience: number;
  skills: string[];
  min_salary: string;
  max_salary: string;
  show_salary_to_candidate: boolean;
  job_close_days: number;
  job_description: string;
  selected_image: string;
  jd_attachment: File | null;
  eligible_courses: string[];
  eligibility_criteria: string;
  selection_process: string;
  other_details: string;
  registration_schedule: string;
  about_organisation: string;
  website: string;
  industry: string;
  organisation_size: string;
  contact_person: string;
}

const JobPublishingAssistant: React.FC<JobPublishingAssistantProps> = ({ onBack }) => {
  const { addJob } = useJobs();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('jobFormData');
    return saved ? JSON.parse(saved) : {
      job_title: '',
      job_domain: '',
      job_type: '',
      locations: [],
      mode_of_job: '',
      min_experience: 0,
      max_experience: 10,
      skills: [],
      min_salary: '',
      max_salary: '',
      show_salary_to_candidate: true,
      job_close_days: 30,
      job_description: '',
      selected_image: defaultImages[0],
      jd_attachment: null,
      eligible_courses: [],
      eligibility_criteria: '',
      selection_process: '',
      other_details: '',
      registration_schedule: '',
      about_organisation: '',
      website: '',
      industry: '',
      organisation_size: '',
      contact_person: ''
    };
  });

  const [skillsInput, setSkillsInput] = useState(() => {
    const saved = localStorage.getItem('jobFormData');
    return saved ? '' : '';
  });
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState(() => {
    const saved = localStorage.getItem('jobFormData');
    return saved ? JSON.parse(saved).job_title || '' : '';
  });
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [coursesInput, setCoursesInput] = useState('');
  const [showCoursesSuggestions, setShowCoursesSuggestions] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      setIsLoading(true);
      const result = await jobsEnhancedService.getDraft();
      if (result.success && result.draft) {
        const draft = result.draft;
        setCurrentStep(draft.current_step || 1);
        setFormData({
          job_title: draft.job_title || '',
          job_domain: draft.job_domain || '',
          job_type: draft.job_type || '',
          locations: draft.locations || [],
          mode_of_job: draft.mode_of_job || '',
          min_experience: draft.min_experience || 0,
          max_experience: draft.max_experience || 10,
          skills: draft.skills || [],
          min_salary: draft.min_salary || '',
          max_salary: draft.max_salary || '',
          show_salary_to_candidate: draft.show_salary_to_candidate ?? true,
          job_close_days: draft.job_close_days || 30,
          job_description: draft.job_description || '',
          selected_image: draft.selected_image || defaultImages[0],
          jd_attachment: null,
          eligible_courses: draft.eligible_courses || [],
          eligibility_criteria: draft.eligibility_criteria || '',
          selection_process: draft.selection_process || '',
          other_details: draft.other_details || '',
          registration_schedule: draft.registration_schedule || '',
          about_organisation: draft.about_organisation || '',
          website: draft.website || '',
          industry: draft.industry || '',
          organisation_size: draft.organisation_size || '',
          contact_person: draft.contact_person || ''
        });
        setJobTitleInput(draft.job_title || '');
      }
      setIsLoading(false);
    };
    
    loadDraft();
  }, []);

  useEffect(() => {
    const autoSave = async () => {
      if (Object.keys(formData).some(key => formData[key as keyof FormData])) {
        await jobsEnhancedService.saveDraft(formData, currentStep);
      }
    };

    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep]);

  useEffect(() => {
    if (editorRef.current && currentStep === 4) {
      if (formData.job_description) {
        editorRef.current.innerHTML = formData.job_description;
      } else {
        editorRef.current.innerHTML = '';
      }
    }
  }, [currentStep]);



  const skillsSuggestions = [
    'Python', 'JavaScript', 'Java', 'React.js', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'Data Science', 'SQL', 'MongoDB', 'Git', 'Agile', 'Scrum'
  ];

  const coursesSuggestions = [
    'B.Tech. - CSE - Blockchain Technology',
    'B.Tech. - CSE - Big Data and Cloud Engineering',
    'B.Tech. - CSE - Artificial Intelligence & Edge Computing',
    'B.Tech. - CSE - Cloud Computing',
    'B.Tech. - Computer Science & Engineering',
    'B.Tech. - Information Technology',
    'B.Tech. - CSE - Artificial Intelligence & Analytics',
    'B.Tech. - CSE - Cyber Security and Forensic',
    'Master of Business Administration (MBA) in IT / Systems',
    'Master of Computer Applications (MCA)',
    'Master of Technology (M.Tech) in Computer Science',
    'Master of Technology (M.Tech) in Information Technology',
    'Master of Science (M.Sc.) in Computer Science',
    'Master of Science (M.Sc.) in Information Technology',
    'Master of Science (M.Sc.) in Data Science',
    'Bachelor of Business Administration (BBA) in IT / Business Analytics',
    'Bachelor of Computer Applications (BCA)',
    'Bachelor of Technology (B.Tech) in Computer Science',
    'Bachelor of Technology (B.Tech) in Information Technology',
    'Bachelor of Engineering (B.E.) in Computer Science',
    'Bachelor of Engineering (B.E.) in Information Technology',
    'Bachelor of Science (B.Sc.) in Computer Science',
    'Bachelor of Science (B.Sc.) in Information Technology',
    'Diploma in Information Technology',
    'Diploma in Computer Science',
    'Diploma in Computer Engineering',
    'Diploma in Web Development',
    'Diploma in Cybersecurity'
  ];

  const jobTitleSuggestions = {
    'IT (Information Technology)': [
      'Software Engineer', 'Front-End Developer', 'Back-End Developer', 'Full-Stack Developer',
      'DevOps Engineer', 'Cloud Architect', 'System Administrator', 'Network Engineer',
      'Database Administrator (DBA)', 'Data Scientist', 'Data Analyst', 'Cybersecurity Analyst',
      'IT Project Manager', 'Solutions Architect'
    ],
    'Support': [
      'IT Support Specialist', 'Help Desk Technician', 'Technical Support Engineer',
      'Customer Support Representative', 'Customer Success Manager', 'Support Team Lead'
    ],
    'Business': [
      'Business Analyst', 'Financial Analyst', 'Market Research Analyst', 'Sales Representative',
      'Account Executive', 'Marketing Manager', 'Digital Marketing Specialist',
      'Business Development Manager', 'Human Resources (HR) Generalist', 'Recruiter'
    ],
    'Management': [
      'Project Manager', 'Product Manager', 'Program Manager', 'Team Lead',
      'Operations Manager', 'Director / Head of Department', 'Vice President (VP)',
      'Chief Executive Officer (CEO)', 'Chief Technology Officer (CTO)', 'Chief Financial Officer (CFO)'
    ],
    'Other': ['Consultant', 'Intern', 'Other']
  };

  const domainSuggestions = [
    'Software Development', 'Data Science', 'Web Development', 'Mobile Development',
    'DevOps', 'UI/UX Design', 'Product Management', 'Quality Assurance'
  ];

  const locationOptions = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const modeOptions = ['Work From Home', 'Hybrid', 'On-site'];

  const steps = [
    { id: 1, title: 'Role Fundamentals', icon: Briefcase },
    { id: 2, title: 'Candidate Profile', icon: Users },
    { id: 3, title: 'Additional Requirements', icon: FileText },
    { id: 4, title: 'The Pitch', icon: Sparkles }
  ];

  const getAISuggestions = (jobTitle: string) => {
    const suggestions: { [key: string]: { domain: string; skills: string[] } } = {
      'software engineer': { domain: 'Software Development', skills: ['JavaScript', 'Python', 'React.js', 'Node.js'] },
      'data scientist': { domain: 'Data Science', skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'] },
      'frontend developer': { domain: 'Web Development', skills: ['React.js', 'JavaScript', 'HTML5', 'CSS3'] }
    };
    
    return suggestions[jobTitle.toLowerCase()] || null;
  };

  const handleJobTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, job_title: title }));
    setJobTitleInput(title);
    
    const suggestions = getAISuggestions(title);
    if (suggestions && !formData.job_domain) {
      setFormData(prev => ({ 
        ...prev, 
        job_domain: suggestions.domain,
        skills: [...prev.skills, ...suggestions.skills.filter(s => !prev.skills.includes(s))]
      }));
    }
  };

  const selectJobTitle = (title: string) => {
    setFormData(prev => ({ ...prev, job_title: title }));
    setJobTitleInput(title);
    setShowJobTitleSuggestions(false);
    
    const suggestions = getAISuggestions(title);
    if (suggestions && !formData.job_domain) {
      setFormData(prev => ({ 
        ...prev, 
        job_domain: suggestions.domain,
        skills: [...prev.skills, ...suggestions.skills.filter(s => !prev.skills.includes(s))]
      }));
    }
  };

  const generateJobDescription = () => {
    if (!formData.job_title || !formData.job_domain) {
      alert('Please fill in Job Title and Domain first');
      return;
    }

    const salaryText = formData.min_salary && formData.max_salary 
      ? `₹${parseInt(formData.min_salary)/100000}-${parseInt(formData.max_salary)/100000} LPA`
      : 'Competitive salary package';
    
    const locationText = formData.locations.length > 0 
      ? `Location: ${formData.locations.join(', ')}`
      : '';
    
    const skillsText = formData.skills.length > 0 
      ? `Skills: ${formData.skills.join(', ')}`
      : 'Relevant technical skills';

    const description = `<div style="text-align: left; line-height: 1.6;">
<h2 style="color: #1f2937; margin-bottom: 16px; font-size: 24px;">🚀 Join Our Team as a ${formData.job_title}!</h2>

<p style="margin-bottom: 16px; color: #374151;">We're seeking a talented ${formData.job_title} to join our ${formData.job_domain} team.</p>

<div style="margin-bottom: 20px; padding: 12px; background-color: #f9fafb; border-left: 4px solid #6366f1; border-radius: 4px;">
<p style="margin: 0;"><strong>📍 ${locationText}</strong></p>
<p style="margin: 4px 0 0 0;"><strong>💼 Employment Type:</strong> ${formData.job_type || 'Full-time'}</p>
<p style="margin: 4px 0 0 0;"><strong>🏢 Work Mode:</strong> ${formData.mode_of_job || 'Hybrid'}</p>
</div>

<h3 style="color: #1f2937; margin: 24px 0 12px 0; font-size: 18px;">✨ What You'll Do:</h3>
<ul style="margin-left: 20px; margin-bottom: 20px;">
<li style="margin-bottom: 8px; color: #374151;">Lead projects in ${formData.job_domain}</li>
<li style="margin-bottom: 8px; color: #374151;">Collaborate with cross-functional teams</li>
<li style="margin-bottom: 8px; color: #374151;">Drive technical excellence</li>
<li style="margin-bottom: 8px; color: #374151;">Contribute to innovative solutions</li>
</ul>

<h3 style="color: #1f2937; margin: 24px 0 12px 0; font-size: 18px;">🎯 Requirements:</h3>
<ul style="margin-left: 20px; margin-bottom: 20px;">
<li style="margin-bottom: 8px; color: #374151;">${formData.min_experience}-${formData.max_experience} years of experience</li>
<li style="margin-bottom: 8px; color: #374151;">${skillsText}</li>
<li style="margin-bottom: 8px; color: #374151;">Strong problem-solving abilities</li>
<li style="margin-bottom: 8px; color: #374151;">Team collaboration skills</li>
</ul>

<h3 style="color: #1f2937; margin: 24px 0 12px 0; font-size: 18px;">🌟 What We Offer:</h3>
<ul style="margin-left: 20px; margin-bottom: 20px;">
<li style="margin-bottom: 8px; color: #374151;">${salaryText}</li>
<li style="margin-bottom: 8px; color: #374151;">${formData.mode_of_job || 'Flexible'} working flexibility</li>
<li style="margin-bottom: 8px; color: #374151;">Professional growth opportunities</li>
<li style="margin-bottom: 8px; color: #374151;">Collaborative work environment</li>
</ul>

<p style="margin-top: 24px; font-weight: bold; color: #1f2937; font-size: 16px;">🚀 Apply now to be part of our team!</p>
</div>`;

    setFormData(prev => ({ ...prev, job_description: description }));
    if (editorRef.current) {
      editorRef.current.innerHTML = description;
    }
    setAiGenerated(true);
  };



  const removeSkill = (skill: string) => {
    const newFormData = { ...formData, skills: formData.skills.filter(s => s !== skill) };
    setFormData(newFormData);
    localStorage.setItem('jobFormData', JSON.stringify(newFormData));
  };

  const nextStep = async () => {
    if (currentStep < 4) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      await jobsEnhancedService.saveDraft(formData, newStep);
    }
  };

  const prevStep = async () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      await jobsEnhancedService.saveDraft(formData, newStep);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await jobsEnhancedService.createJob(formData);
      
      if (result.success) {
        const jobData = {
          jobId: result.jobId?.toString() || `JOB_${Date.now()}`,
          title: formData.job_title,
          description: formData.job_description,
          location: formData.locations.join(', '),
          employmentType: formData.job_type,
          experience: `${formData.min_experience}-${formData.max_experience} years`,
          salaryRange: `₹${parseInt(formData.min_salary)/100000}-${parseInt(formData.max_salary)/100000} LPA`,
          domain: formData.job_domain,
          skills: formData.skills,
          mode: formData.mode_of_job,
          workplace: formData.mode_of_job,
          tags: [formData.job_domain, ...formData.skills.slice(0, 3)],
          image: formData.selected_image,
          status: 'Published',
          publishedDate: new Date().toISOString().split('T')[0],
          stageCount: 3,
          candidatesCount: 0,
          closingDate: new Date(Date.now() + formData.job_close_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        addJob(jobData);
        // Refresh jobs across all components
        window.dispatchEvent(new CustomEvent('jobCreated'));
        alert('🎉 Job opening created successfully!');
        onBack();
      } else {
        alert('Failed to create job opening. Please try again.');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('An error occurred while creating the job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center mb-4 relative">
        {/* Background line */}
        <div className="absolute top-1/2 left-5 right-5 h-1 bg-gray-200 -translate-y-1/2 z-0" />
        <div className={`absolute top-1/2 left-5 h-1 -translate-y-1/2 z-0 transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500`} 
             style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * (100 - 10)}% + 20px)` }} />
        
        {steps.map((step, index) => (
          <div key={step.id} className={`flex-1 flex items-center ${index === 0 ? 'justify-start' : index === steps.length - 1 ? 'justify-end' : 'justify-center'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 relative ${
              currentStep >= step.id 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                : 'bg-white border-2 border-gray-200 text-gray-500'
            }`}>
              {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep - 1].title}</h2>
        <p className="text-gray-600">Step {currentStep} of {steps.length}</p>
      </div>
    </div>
  );



  const selectSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      const newFormData = { ...formData, skills: [...formData.skills, skill] };
      setFormData(newFormData);
      localStorage.setItem('jobFormData', JSON.stringify(newFormData));
    }
    setSkillsInput('');
    setShowSkillsSuggestions(false);
  };

  const SkillsInput = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Skills</label>
      
      {formData.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.skills.map(skill => (
            <span key={skill} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm rounded-full">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
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
          value={skillsInput}
          onChange={(e) => {
            const value = e.target.value;
            setSkillsInput(value);
            setShowSkillsSuggestions(value.length > 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && skillsInput.trim()) {
              e.preventDefault();
              selectSkill(skillsInput.trim());
            }
          }}
          placeholder="Type skills and press Enter..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        
        {showSkillsSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {skillsSuggestions
              .filter(skill => skill.toLowerCase().includes(skillsInput.toLowerCase()) && !formData.skills.includes(skill))
              .map(skill => (
                <button
                  key={skill}
                  onClick={() => selectSkill(skill)}
                  className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors"
                >
                  {skill}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={jobTitleInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setJobTitleInput(value);
                    setFormData(prev => ({ ...prev, job_title: value }));
                    setShowJobTitleSuggestions(value.length > 0);
                  }}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                
                {showJobTitleSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {Object.entries(jobTitleSuggestions).map(([category, titles]) => (
                      <div key={category}>
                        <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-b">
                          {category}
                        </div>
                        {titles
                          .filter(title => title.toLowerCase().includes(jobTitleInput.toLowerCase()))
                          .map(title => (
                            <button
                              key={title}
                              onClick={() => selectJobTitle(title)}
                              className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors"
                            >
                              {title}
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
              <select
                value={formData.job_domain}
                onChange={(e) => {
                  const newFormData = { ...formData, job_domain: e.target.value };
                  setFormData(newFormData);
                  localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select Domain</option>
                {domainSuggestions.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  value={formData.job_type}
                  onChange={(e) => {
                    const newFormData = { ...formData, job_type: e.target.value };
                    setFormData(newFormData);
                    localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Type</option>
                  {jobTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode</label>
                <select
                  value={formData.mode_of_job}
                  onChange={(e) => {
                    const newFormData = { ...formData, mode_of_job: e.target.value };
                    setFormData(newFormData);
                    localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Mode</option>
                  {modeOptions.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <MultiSelectDropdown
                label="Locations"
                options={locationOptions.map(location => ({ value: location, label: location }))}
                selectedValues={formData.locations}
                onChange={(values) => {
                  const newFormData = { ...formData, locations: values };
                  setFormData(newFormData);
                  localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                }}
                placeholder="Select locations..."
                searchable={true}
                selectAll={true}
                maxDisplayItems={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Experience Range (Years)</label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Min Years</label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={formData.min_experience}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const newFormData = { ...formData, min_experience: value };
                      setFormData(newFormData);
                      localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="text-gray-400">to</div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Max Years</label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={formData.max_experience}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const newFormData = { ...formData, max_experience: value };
                      setFormData(newFormData);
                      localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Skills</label>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm rounded-full">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
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
                  value={skillsInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSkillsInput(value);
                    setShowSkillsSuggestions(value.length > 0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && skillsInput.trim()) {
                      e.preventDefault();
                      selectSkill(skillsInput.trim());
                    }
                  }}
                  placeholder="Type skills and press Enter..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                
                {showSkillsSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {skillsSuggestions
                      .filter(skill => skill.toLowerCase().includes(skillsInput.toLowerCase()) && !formData.skills.includes(skill))
                      .map(skill => (
                        <button
                          key={skill}
                          onClick={() => selectSkill(skill)}
                          className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors"
                        >
                          {skill}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Salary Range (INR)</label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Min Salary</label>
                  <input
                    type="number"
                    value={formData.min_salary}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newFormData = { ...formData, min_salary: value };
                      setFormData(newFormData);
                      localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                    }}
                    placeholder="300000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="text-gray-400">to</div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Max Salary</label>
                  <input
                    type="number"
                    value={formData.max_salary}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newFormData = { ...formData, max_salary: value };
                      setFormData(newFormData);
                      localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                    }}
                    placeholder="1000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.show_salary_to_candidate}
                  onChange={(e) => {
                    const newFormData = { ...formData, show_salary_to_candidate: e.target.checked };
                    setFormData(newFormData);
                    localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                  }}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Show salary to candidates</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Job Closes In</label>
              <div className="flex space-x-2">
                {[15, 30, 45].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, job_close_days: days }))}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      formData.job_close_days === days
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">JD Attachment (PDF)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    const newFormData = { ...formData, jd_attachment: file };
                    setFormData(newFormData);
                    localStorage.setItem('jobFormData', JSON.stringify({...newFormData, jd_attachment: file?.name || null}));
                  }}
                  className="hidden"
                  id="jd-upload"
                />
                <label htmlFor="jd-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.jd_attachment ? formData.jd_attachment.name : 'Click to upload JD PDF or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF files only, max 10MB</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Courses</label>
              <div className="space-y-3">
                {formData.eligible_courses.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.eligible_courses.map(course => (
                      <span key={course} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm rounded-full">
                        {course}
                        <button
                          type="button"
                          onClick={() => {
                            const newCourses = formData.eligible_courses.filter(c => c !== course);
                            const newFormData = { ...formData, eligible_courses: newCourses };
                            setFormData(newFormData);
                            localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                          }}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
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
                    value={coursesInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCoursesInput(value);
                      setShowCoursesSuggestions(value.length > 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && coursesInput.trim()) {
                        e.preventDefault();
                        const course = coursesInput.trim();
                        if (!formData.eligible_courses.includes(course)) {
                          const newFormData = { ...formData, eligible_courses: [...formData.eligible_courses, course] };
                          setFormData(newFormData);
                          localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                        }
                        setCoursesInput('');
                        setShowCoursesSuggestions(false);
                      }
                    }}
                    placeholder="Type course name and press Enter (e.g., B.Tech, MBA, BCA)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  
                  {showCoursesSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {coursesSuggestions
                        .filter(course => course.toLowerCase().includes(coursesInput.toLowerCase()) && !formData.eligible_courses.includes(course))
                        .map(course => (
                          <button
                            key={course}
                            onClick={() => {
                              if (!formData.eligible_courses.includes(course)) {
                                const newFormData = { ...formData, eligible_courses: [...formData.eligible_courses, course] };
                                setFormData(newFormData);
                                localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                              }
                              setCoursesInput('');
                              setShowCoursesSuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors text-sm"
                          >
                            {course}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
              <textarea
                value={formData.eligibility_criteria}
                onChange={(e) => {
                  const newFormData = { ...formData, eligibility_criteria: e.target.value };
                  setFormData(newFormData);
                  localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                }}
                placeholder="Specify minimum qualifications, certifications, or other eligibility requirements..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selection Process Details</label>
              <textarea
                value={formData.selection_process}
                onChange={(e) => {
                  const newFormData = { ...formData, selection_process: e.target.value };
                  setFormData(newFormData);
                  localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                }}
                placeholder="Describe the interview process, rounds, assessments, timeline, etc..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other Details</label>
              <textarea
                value={formData.other_details}
                onChange={(e) => {
                  const newFormData = { ...formData, other_details: e.target.value };
                  setFormData(newFormData);
                  localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                }}
                placeholder="Any additional information, benefits, company culture, or special requirements..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Schedule</label>
                <input
                  type="text"
                  value={formData.registration_schedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_schedule: e.target.value }))}
                  placeholder="e.g., Open till 15th Dec 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organisation Size</label>
                <select
                  value={formData.organisation_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, organisation_size: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About the Organisation</label>
                <textarea
                  value={formData.about_organisation}
                  onChange={(e) => setFormData(prev => ({ ...prev, about_organisation: e.target.value }))}
                  placeholder="Brief description about the company..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  placeholder="HR Manager / Recruiter Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        const execCommand = (command: string, value?: string) => {
          if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            setTimeout(() => updateContent(), 10);
          }
        };

        const updateContent = () => {
          if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            if (content !== formData.job_description) {
              const newFormData = { ...formData, job_description: content };
              setFormData(newFormData);
              localStorage.setItem('jobFormData', JSON.stringify(newFormData));
            }
          }
        };

        const applyFormat = (format: string) => {
          if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand('formatBlock', false, format);
            updateContent();
          }
        };

        const applyList = (listType: string) => {
          if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(listType, false);
            updateContent();
          }
        };



        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Job Image</label>
              <div className="grid grid-cols-5 gap-3 mb-6 max-h-64 overflow-y-auto">
                {defaultImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const newFormData = { ...formData, selected_image: image };
                      setFormData(newFormData);
                      localStorage.setItem('jobFormData', JSON.stringify(newFormData));
                    }}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      formData.selected_image === image 
                        ? 'border-indigo-500 ring-2 ring-indigo-200' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Option ${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                    {formData.selected_image === image && (
                      <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  generateJobDescription();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-lg hover:from-indigo-200 hover:to-purple-200 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate with AI</span>
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              {/* Rich Text Editor Toolbar */}
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Format Dropdown */}
                  <select onChange={(e) => { 
                    const value = e.target.value;
                    if(value) {
                      applyFormat(value);
                      e.target.value = '';
                    }
                  }} className="px-2 py-1 text-sm border rounded bg-white">
                    <option value="">Format</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="p">Paragraph</option>
                  </select>
                  
                  {/* Font Family */}
                  <select onChange={(e) => { if(e.target.value && editorRef.current) { editorRef.current.focus(); document.execCommand('fontName', false, e.target.value); updateContent(); e.target.selectedIndex = 0; }}} className="px-2 py-1 text-sm border rounded bg-white">
                    <option>Font</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  
                  {/* Font Size */}
                  <select onChange={(e) => { if(e.target.value && editorRef.current) { editorRef.current.focus(); document.execCommand('fontSize', false, e.target.value); updateContent(); e.target.selectedIndex = 0; }}} className="px-2 py-1 text-sm border rounded bg-white">
                    <option>Size</option>
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Medium</option>
                    <option value="7">Large</option>
                  </select>
                  
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  
                  {/* Text Formatting */}
                  <button onClick={() => execCommand('bold')} className="w-7 h-7 text-sm font-bold border rounded hover:bg-blue-50">B</button>
                  <button onClick={() => execCommand('italic')} className="w-7 h-7 text-sm italic border rounded hover:bg-blue-50">I</button>
                  <button onClick={() => execCommand('underline')} className="w-7 h-7 text-sm underline border rounded hover:bg-blue-50">U</button>
                  <button onClick={() => execCommand('strikeThrough')} className="w-7 h-7 text-sm line-through border rounded hover:bg-blue-50">S</button>
                  
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  
                  {/* Lists Dropdown */}
                  <select onChange={(e) => { 
                    const value = e.target.value;
                    if(value) {
                      applyList(value);
                      e.target.value = '';
                    }
                  }} className="px-2 py-1 text-sm border rounded bg-white">
                    <option value="">Lists</option>
                    <option value="insertUnorderedList">• Bullet List</option>
                    <option value="insertOrderedList">1. Numbered List</option>
                  </select>
                  
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  
                  {/* Link & Clear */}
                  <button onClick={() => { const url = prompt('Enter URL:'); if(url) execCommand('createLink', url); }} className="px-2 py-1 text-sm border rounded bg-white hover:bg-gray-100">Link</button>
                  <button onClick={() => { if(editorRef.current) { editorRef.current.innerHTML = ''; setFormData(prev => ({...prev, job_description: ''})); localStorage.setItem('jobFormData', JSON.stringify({...formData, job_description: ''})); }}} className="px-2 py-1 text-sm border border-red-300 rounded text-red-600 hover:bg-red-50">Clear</button>
                </div>
              </div>
              
              {/* Rich Text Editor */}
              <div className="relative">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={updateContent}
                  onFocus={() => {
                    setIsEditorFocused(true);
                    if (editorRef.current && editorRef.current.textContent?.trim() === 'Describe the role, responsibilities, and what makes this opportunity exciting...') {
                      editorRef.current.innerHTML = '';
                    }
                  }}
                  onBlur={() => setIsEditorFocused(false)}
                  className="w-full px-4 py-3 border-0 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 min-h-[300px] focus:outline-none"
                  style={{ 
                    minHeight: '300px', 
                    lineHeight: '1.6',
                    fontFamily: 'inherit',
                    direction: 'ltr',
                    textAlign: 'left'
                  }}
                />
                {!formData.job_description && !isEditorFocused && (
                  <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
                    Describe the role, responsibilities, and what makes this opportunity exciting...
                  </div>
                )}
              </div>
            </div>
            
            {aiGenerated && (
              <div className="flex items-center space-x-2 text-sm text-indigo-600">
                <Sparkles className="w-4 h-4" />
                <span>AI-generated content - customize as needed!</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <ProgressBar />
          
          <div className="mb-8">
            {renderStep()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={currentStep === 1 ? onBack : prevStep}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
            </button>

            <button
              onClick={currentStep === 4 ? handleSubmit : nextStep}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{currentStep === 4 ? 'Create Opening' : 'Next'}</span>
                  {currentStep === 4 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPublishingAssistant;