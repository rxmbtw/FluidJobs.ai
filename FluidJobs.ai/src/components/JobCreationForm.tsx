import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Minus,
  Undo2,
  Redo2,
  ChevronDown
} from 'lucide-react';
import { indianCities } from '../data/indianCities';
import './JobCreationForm.css';
import SuccessModal from './SuccessModal';

interface JobCreationFormProps {
  onBack: () => void;
  isSuperAdmin?: boolean;
}

const JobCreationForm: React.FC<JobCreationFormProps> = ({ onBack, isSuperAdmin = false }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [formData, setFormData] = useState({
    job_title: '',
    job_domain: '',
    min_experience: '',
    max_experience: '',
    job_type: '',
    no_of_openings: '1',
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
  const [skillsInput, setSkillsInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);
  const [showMinExpSuggestions, setShowMinExpSuggestions] = useState(false);
  const [showMaxExpSuggestions, setShowMaxExpSuggestions] = useState(false);
  const [showJobTypeSuggestions, setShowJobTypeSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showModeSuggestions, setShowModeSuggestions] = useState(false);

  const [selectedImage, setSelectedImage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [isGeneratingFromPdf, setIsGeneratingFromPdf] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [showPdfSuccessModal, setShowPdfSuccessModal] = useState(false);

  // Fetch accounts and current admin on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('superadmin_token');
        if (!token) return;
        
        const endpoint = isSuperAdmin 
          ? 'http://localhost:8000/api/superadmin/accounts'
          : 'http://localhost:8000/api/auth/my-accounts';
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch accounts');
        }
        
        const data = await response.json();
        
        // Transform data to match expected format
        const transformedAccounts = isSuperAdmin
          ? data.map((account: any) => ({
              account_id: account.id,
              account_name: account.name
            }))
          : data.map((account: any) => ({
              account_id: account.account_id,
              account_name: account.account_name
            }));
        
        setAccounts(transformedAccounts);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    const userStr = isSuperAdmin 
      ? localStorage.getItem('superadmin')
      : sessionStorage.getItem('fluidjobs_user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentAdmin(user);
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }

    fetchAccounts();
  }, [isSuperAdmin]);

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

  const experienceOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const openingsOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const modeOptions = ['Work From Home', 'Hybrid', 'On-site'];
  const domainSuggestions = [
    'Software Development',
    'Data Science',
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'DevOps',
    'Quality Assurance',
    'UI/UX Design',
    'Product Management',
    'Digital Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations'
  ];

  const skillsSuggestions = [
    'Python', 'JavaScript', 'Java', 'C#', 'TypeScript', 'Go', 'PHP', 'C++', 'Ruby', 'Swift', 'Kotlin', 'Rust', 'SQL', 'HTML5', 'CSS3',
    'React.js', 'Angular', 'Vue.js', 'Next.js', 'Svelte', 'Redux', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Webpack',
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', '.NET', 'ASP.NET', 'Ruby on Rails', 'Laravel',
    'Data Structures', 'Algorithms', 'OOP', 'REST APIs', 'GraphQL', 'Microservices', 'Git', 'SDLC', 'TDD',
    'AWS', 'Microsoft Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Database Design', 'Query Optimization',
    'Network Security', 'Application Security', 'Penetration Testing', 'SIEM', 'Cryptography',
    'Linux Administration', 'Windows Server', 'Active Directory', 'VMware', 'System Monitoring',
    'Agile', 'Scrum', 'Kanban', 'Jira', 'Project Management',
    'Figma', 'Sketch', 'Adobe XD', 'Wireframing', 'User Research', 'Usability Testing',
    'Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Time Management',
    'Generative AI', 'Prompt Engineering', 'MLOps', 'Blockchain', 'Smart Contracts', 'Solidity', 'Web3', 'IoT', 'AR/VR'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    setIsCurrentStepValid(isStepValid(currentStep));
  }, [formData, currentStep, selectedAccount]);

  const handleSkillsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillsInput(value);
    setShowSkillsSuggestions(value.length > 0);
  };

  const handleSkillsKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillsInput.trim()) {
      e.preventDefault();
      const skill = skillsInput.trim();
      if (!selectedSkills.includes(skill)) {
        toggleSkill(skill);
      }
      setSkillsInput('');
      setShowSkillsSuggestions(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      const updated = prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill];
      setFormData(prevForm => ({ ...prevForm, skills: updated.join(', ') }));
      if (updated.length > 0) {
        setErrors(prevErrors => ({ ...prevErrors, skills: '' }));
      }
      return updated;
    });
  };

  const filteredSkills = skillsSuggestions.filter(skill => 
    skill.toLowerCase().includes(skillsInput.toLowerCase()) && 
    !selectedSkills.includes(skill)
  ).slice(0, 10);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowDomainSuggestions(false);
        setShowMinExpSuggestions(false);
        setShowMaxExpSuggestions(false);
        setShowJobTypeSuggestions(false);
        setShowLocationSuggestions(false);
        setShowModeSuggestions(false);
        setShowSkillsSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 0) {
      if (!selectedAccount) newErrors.selectedAccount = 'Please select an account';
    } else if (step === 1) {
      if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
      if (!formData.job_domain.trim()) newErrors.job_domain = 'Job domain is required';
      if (!formData.min_experience.trim()) newErrors.min_experience = 'Min experience is required';
      if (!formData.max_experience.trim()) newErrors.max_experience = 'Max experience is required';
      if (!formData.job_type.trim()) newErrors.job_type = 'Job type is required';
      if (!formData.no_of_openings.trim()) newErrors.no_of_openings = 'Number of openings is required';
    } else if (step === 2) {
      if (!formData.min_salary.trim()) newErrors.min_salary = 'Min salary is required';
      if (!formData.max_salary.trim()) newErrors.max_salary = 'Max salary is required';
      if (!formData.registration_opening_date.trim()) newErrors.registration_opening_date = 'Registration opening date is required';
    } else if (step === 3) {
      if (!formData.locations.trim()) newErrors.locations = 'At least one location is required';
      if (!formData.mode_of_job.trim()) newErrors.mode_of_job = 'Mode of job is required';
    } else if (step === 4) {
      if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required';
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.job_description;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      if (!textContent.trim()) newErrors.job_description = 'Job description is required';
      if (!selectedImage) newErrors.selectedImage = 'Please select a job posting image';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = (step: number): boolean => {
    if (step === 0) {
      return selectedAccount.length > 0;
    } else if (step === 1) {
      return formData.job_title.trim().length > 0 && 
             formData.job_domain.trim().length > 0 && 
             formData.min_experience.trim().length > 0 && 
             formData.max_experience.trim().length > 0 && 
             formData.job_type.trim().length > 0 &&
             formData.no_of_openings.trim().length > 0;
    } else if (step === 2) {
      return formData.min_salary.trim().length > 0 && 
             formData.max_salary.trim().length > 0 &&
             formData.registration_opening_date.trim().length > 0;
    } else if (step === 3) {
      return formData.locations.trim().length > 0 && 
             formData.mode_of_job.trim().length > 0;
    } else if (step === 4) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.job_description;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      return formData.skills.trim().length > 0 && 
             textContent.trim().length > 0 &&
             selectedImage.length > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const numberToWords = (num: number): string => {
    if (!num || num === 0) return 'Zero Rupees';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convert = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return (tens[Math.floor(n / 10)] + ' ' + ones[n % 10]).trim();
      if (n < 1000) {
        const remainder = convert(n % 100);
        return (ones[Math.floor(n / 100)] + ' Hundred' + (remainder ? ' ' + remainder : '')).trim();
      }
      if (n < 100000) {
        const remainder = convert(n % 1000);
        return (convert(Math.floor(n / 1000)) + ' Thousand' + (remainder ? ' ' + remainder : '')).trim();
      }
      if (n < 10000000) {
        const remainder = convert(n % 100000);
        return (convert(Math.floor(n / 100000)) + ' Lakh' + (remainder ? ' ' + remainder : '')).trim();
      }
      const remainder = convert(n % 10000000);
      return (convert(Math.floor(n / 10000000)) + ' Crore' + (remainder ? ' ' + remainder : '')).trim();
    };
    
    return convert(num) + ' Rupees';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      try {
        // Calculate closing date if not provided (6 months from opening date)
        let closingDate = formData.registration_closing_date;
        if (!closingDate && formData.registration_opening_date) {
          const openDate = new Date(formData.registration_opening_date);
          openDate.setMonth(openDate.getMonth() + 6);
          closingDate = openDate.toISOString().split('T')[0];
        }
        
        const jobPayload = {
          job_title: formData.job_title,
          job_domain: formData.job_domain,
          job_type: formData.job_type,
          locations: formData.locations.split(', ').filter(loc => loc.trim()),
          mode_of_job: formData.mode_of_job,
          min_experience: formData.min_experience,
          max_experience: formData.max_experience,
          skills: formData.skills.split(', ').filter(skill => skill.trim()),
          min_salary: formData.min_salary,
          max_salary: formData.max_salary,
          show_salary_to_candidate: formData.show_salary_to_candidate,
          job_description: formData.job_description,
          selected_image: selectedImage,
          jd_attachment_name: uploadedPdfUrl,
          registration_opening_date: formData.registration_opening_date,
          registration_closing_date: closingDate,
          job_close_days: 30,
          no_of_openings: parseInt(formData.no_of_openings),
          account_id: parseInt(selectedAccount),
          created_by_user_id: currentAdmin?.id || null
        };

        const endpoint = isSuperAdmin
          ? 'http://localhost:8000/api/superadmin/create-job'
          : 'http://localhost:8000/api/jobs-enhanced/create';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobPayload)
        });

        const data = await response.json();

        if (data.success) {
          // Show success modal
          setShowSuccessModal(true);
          // Dispatch event to refresh job list
          window.dispatchEvent(new Event('jobCreated'));
          // Auto close and redirect after 2 seconds
          setTimeout(() => {
            setShowSuccessModal(false);
            onBack();
          }, 5000);
        } else {
          alert('Failed to create job: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error creating job:', error);
        alert('Failed to create job. Please try again.');
      }
    }
  };

  const generateDescription = async () => {
    // If PDF is uploaded, generate from PDF
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
          setFormData(prev => ({ ...prev, job_description: generateData.jobDescription }));
          setErrors(prev => ({ ...prev, job_description: '' }));
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
      // Generate template description
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
      setFormData(prev => ({ ...prev, job_description: description }));
      setErrors(prev => ({ ...prev, job_description: '' }));
    }
  };

  const execEditorCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setIsUserEditing(true);
      setFormData(prev => ({ ...prev, job_description: editorRef.current!.innerHTML }));
    }
  };

  useEffect(() => {
    if (editorRef.current && formData.job_description && !isUserEditing) {
      editorRef.current.innerHTML = formData.job_description;
    }
  }, [formData.job_description, isUserEditing]);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="w-full p-8">
        <div className="max-w-4xl mx-auto">
          <div ref={formRef} className="bg-white rounded-lg p-8 shadow-md">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h1 className="text-xl font-bold mb-2">Job Creation Form - Step {currentStep === 0 ? 1 : currentStep + 1} of 5</h1>
              <p className="text-gray-600">
                {currentStep === 0 && 'Select your account'}
                {currentStep === 1 && 'Basic job information'}
                {currentStep === 2 && 'Salary and timeline details'}
                {currentStep === 3 && 'Location and work mode'}
                {currentStep === 4 && 'Skills and job description'}
              </p>
              
              {/* Progress Bar */}
              {currentStep > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Basic Info</span>
                    <span>Compensation</span>
                    <span>Location</span>
                    <span>Skills & Description</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Step 0: Account Selection */}
              {currentStep === 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select your account <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-gray-700"
                    >
                      <option value="">Select an account</option>
                      {accounts.map(account => (
                        <option key={account.account_id} value={account.account_id}>
                          {account.account_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Basic Job Info */}
              {currentStep === 1 && (
                <>
                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleInputChange}
                      placeholder="Ex. Software Engineer"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.job_title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.job_title && <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>}
                  </div>

                  {/* Job Domain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Domain <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="job_domain"
                        value={formData.job_domain}
                        onChange={handleInputChange}
                        onFocus={() => setShowDomainSuggestions(true)}
                        placeholder="Search Domain"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.job_domain ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.job_domain && <p className="text-red-500 text-sm mt-1">{errors.job_domain}</p>}
                      {showDomainSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {domainSuggestions.filter(domain => domain.toLowerCase().includes(formData.job_domain.toLowerCase())).map(domain => (
                            <label key={domain} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.job_domain === domain}
                                onChange={() => {
                                  setFormData(prev => ({ ...prev, job_domain: domain }));
                                  setShowDomainSuggestions(false);
                                }}
                                className="mr-3 text-indigo-600"
                              />
                              <span className="text-sm">{domain}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Experience (in Yrs) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="min_experience"
                          value={formData.min_experience}
                          onChange={handleInputChange}
                          onFocus={() => setShowMinExpSuggestions(true)}
                          placeholder="Ex. 2 years"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.min_experience ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.min_experience && <p className="text-red-500 text-sm mt-1">{errors.min_experience}</p>}
                        {showMinExpSuggestions && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {experienceOptions.map(exp => (
                              <label key={exp} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.min_experience === exp}
                                  onChange={() => {
                                    setFormData(prev => ({ ...prev, min_experience: exp }));
                                    setShowMinExpSuggestions(false);
                                  }}
                                  className="mr-3 text-indigo-600"
                                />
                                <span className="text-sm">{exp}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Experience (in Yrs) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="max_experience"
                          value={formData.max_experience}
                          onChange={handleInputChange}
                          onFocus={() => setShowMaxExpSuggestions(true)}
                          placeholder="Ex. 5 years"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.max_experience ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.max_experience && <p className="text-red-500 text-sm mt-1">{errors.max_experience}</p>}
                        {showMaxExpSuggestions && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {experienceOptions.map(exp => (
                              <label key={exp} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.max_experience === exp}
                                  onChange={() => {
                                    setFormData(prev => ({ ...prev, max_experience: exp }));
                                    setShowMaxExpSuggestions(false);
                                  }}
                                  className="mr-3 text-indigo-600"
                                />
                                <span className="text-sm">{exp}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Job Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="job_type"
                        value={formData.job_type}
                        onChange={handleInputChange}
                        onFocus={() => setShowJobTypeSuggestions(true)}
                        placeholder="Ex. Full time"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.job_type ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.job_type && <p className="text-red-500 text-sm mt-1">{errors.job_type}</p>}
                      {showJobTypeSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {jobTypeOptions.map(type => (
                            <label key={type} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.job_type === type}
                                onChange={() => {
                                  setFormData(prev => ({ ...prev, job_type: type }));
                                  setShowJobTypeSuggestions(false);
                                }}
                                className="mr-3 text-indigo-600"
                              />
                              <span className="text-sm">{type}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* No of Openings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No of Openings <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="no_of_openings"
                      value={formData.no_of_openings}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.no_of_openings ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {openingsOptions.map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    {errors.no_of_openings && <p className="text-red-500 text-sm mt-1">{errors.no_of_openings}</p>}
                  </div>
                </>
              )}

              {/* Step 2: Salary and Timeline */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Salary Per annum (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            name="min_salary"
                            value={formData.min_salary}
                            onChange={handleInputChange}
                            placeholder="Min Salary"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.min_salary ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formData.min_salary && (
                            <p className="text-xs text-gray-600 mt-1 italic">{numberToWords(parseInt(formData.min_salary))}</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            name="max_salary"
                            value={formData.max_salary}
                            onChange={handleInputChange}
                            placeholder="Max Salary"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.max_salary ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formData.max_salary && (
                            <p className="text-xs text-gray-600 mt-1 italic">{numberToWords(parseInt(formData.max_salary))}</p>
                          )}
                        </div>
                      </div>
                      {(errors.min_salary || errors.max_salary) && (
                        <p className="text-red-500 text-sm">{errors.min_salary || errors.max_salary}</p>
                      )}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="show_salary_to_candidate"
                          checked={formData.show_salary_to_candidate}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">Show this to candidate.</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Opening Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="registration_opening_date"
                        value={formData.registration_opening_date}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.registration_opening_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.registration_opening_date && <p className="text-red-500 text-sm mt-1">{errors.registration_opening_date}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Closing Date <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        name="registration_closing_date"
                        value={formData.registration_closing_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">If not provided, defaults to 6 months from opening date</p>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Location and Mode */}
              {currentStep === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedLocation || locationInput}
                          onChange={(e) => {
                            if (!selectedLocation) {
                              setLocationInput(e.target.value);
                              setShowLocationSuggestions(true);
                            }
                          }}
                          onFocus={() => {
                            if (!selectedLocation) {
                              setShowLocationSuggestions(true);
                            }
                          }}
                          placeholder="Search city..."
                          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.locations ? 'border-red-500' : 'border-gray-300'
                          }`}
                          readOnly={!!selectedLocation}
                        />
                        
                        {/* Clear button */}
                        {selectedLocation && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLocation('');
                              setFormData(prev => ({ ...prev, locations: '' }));
                              setLocationInput('');
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        
                        {errors.locations && <p className="text-red-500 text-sm mt-1">{errors.locations}</p>}
                        
                        {/* Suggestions dropdown */}
                        {showLocationSuggestions && locationInput && !selectedLocation && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {indianCities
                              .filter(city => city.toLowerCase().includes(locationInput.toLowerCase()))
                              .slice(0, 10)
                              .map(city => (
                                <div
                                  key={city}
                                  onClick={() => {
                                    setSelectedLocation(city);
                                    setFormData(prev => ({ ...prev, locations: city }));
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
                      <div className="relative">
                        <input
                          type="text"
                          name="mode_of_job"
                          value={formData.mode_of_job}
                          onChange={handleInputChange}
                          onFocus={() => setShowModeSuggestions(true)}
                          placeholder="Ex. Work From Home"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.mode_of_job ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.mode_of_job && <p className="text-red-500 text-sm mt-1">{errors.mode_of_job}</p>}
                        {showModeSuggestions && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {modeOptions.map(mode => (
                              <label key={mode} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.mode_of_job === mode}
                                  onChange={() => {
                                    setFormData(prev => ({ ...prev, mode_of_job: mode }));
                                    setShowModeSuggestions(false);
                                  }}
                                  className="mr-3 text-indigo-600"
                                />
                                <span className="text-sm">{mode}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Skills and Description */}
              {currentStep === 4 && (
                <>
                  {/* Job Posting Image Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Posting Image <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {jobImages.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedImage(image);
                            setErrors(prev => ({ ...prev, selectedImage: '' }));
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
                    {errors.selectedImage && <p className="text-red-500 text-sm mt-1">{errors.selectedImage}</p>}
                  </div>

                  {/* Job Description PDF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description PDF
                    </label>
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
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Selected Skills */}
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedSkills.map(skill => (
                          <span key={skill} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                            {skill}
                            <button
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className="ml-2 text-indigo-600 hover:text-indigo-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={handleSkillsInputChange}
                      onKeyPress={handleSkillsKeyPress}
                      onFocus={() => setShowSkillsSuggestions(skillsInput.length > 0)}
                      placeholder="Type to search skills or press Enter to add custom skill..."
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.skills ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                    
                    {/* Skills Suggestions */}
                    {showSkillsSuggestions && filteredSkills.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredSkills.map(skill => (
                          <label key={skill} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSkills.includes(skill)}
                              onChange={() => toggleSkill(skill)}
                              className="mr-3 text-indigo-600"
                            />
                            <span className="text-sm">{skill}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Job Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description <span className="text-red-500">*</span>
                    </label>
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
                  
                      {/* Rich Text Editor */}
                      <div className={`border rounded-lg ${errors.job_description ? 'border-red-500' : 'border-gray-300'}`}>
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
                                setFormData(prev => ({ ...prev, job_description: '' }));
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
                      {errors.job_description && <p className="text-red-500 text-sm mt-1">{errors.job_description}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep === 0 ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-2 rounded-md font-medium bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-2 rounded-md font-medium bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentStepValid}
                    className={`px-6 py-2 rounded-md font-medium ${
                      isCurrentStepValid
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                  >
                    Create Opening
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center relative">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onBack();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">Job created successfully</p>
            
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onBack();
              }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* PDF Generation Success Modal */}
      <SuccessModal
        isOpen={showPdfSuccessModal}
        onClose={() => setShowPdfSuccessModal(false)}
        title="Success!"
        message="✅ Job description generated from PDF successfully!"
      />
    </div>
  );
};

export default JobCreationForm;