import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough
} from 'lucide-react';
import { indianCities } from '../../data/indianCities';
import './JobCreationForm.css';
import SuccessModal from '../../components/SuccessModal';
import { safeClosest } from '../../utils/domHelpers';

interface JobCreationFormProps {
  onBack: () => void;
  isSuperAdmin?: boolean;
}

// Refactored to section-based layout
const IMG_PROXY = (url: string) => `http://localhost:8000/api/image-proxy?url=${encodeURIComponent(url)}`;

const JobCreationForm: React.FC<JobCreationFormProps> = ({ onBack, isSuperAdmin = false }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [activeSection, setActiveSection] = useState('account');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
    job_description: '',
    primary_recruiter_id: ''
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
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [isGeneratingFromPdf, setIsGeneratingFromPdf] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [showPdfSuccessModal, setShowPdfSuccessModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [minioImages, setMinioImages] = useState<{ tech: any[], management: any[] }>({ tech: [], management: [] });
  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllManagement, setShowAllManagement] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedHiringManager, setSelectedHiringManager] = useState('');
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([]);
  const [hiringStages, setHiringStages] = useState<any[]>([
    { id: 'screening', name: 'Screening', type: 'standard', isMandatory: true, remarksRequired: false, order: 1 },
    { id: 'tech_assess', name: 'Technical Assessment', type: 'standard', isMandatory: false, remarksRequired: true, order: 2 },
    { id: 'l1_tech', name: 'L1 Technical', type: 'standard', isMandatory: false, remarksRequired: true, order: 3 },
    { id: 'l2_tech', name: 'L2 Technical', type: 'standard', isMandatory: false, remarksRequired: true, order: 4 },
    { id: 'l3_tech', name: 'L3 Technical', type: 'standard', isMandatory: false, remarksRequired: true, order: 5 },
    { id: 'l4_tech', name: 'L4 Technical', type: 'standard', isMandatory: false, remarksRequired: true, order: 6 },
    { id: 'hr_round', name: 'HR Round', type: 'standard', isMandatory: true, remarksRequired: true, order: 7 },
    { id: 'management', name: 'Management Round', type: 'standard', isMandatory: false, remarksRequired: true, order: 8 }
  ]);
  const [newStageInput, setNewStageInput] = useState('');
  const [currentStageType, setCurrentStageType] = useState<'standard' | 'custom'>('standard');
  const [showNewStageInput, setShowNewStageInput] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [teamAssignments, setTeamAssignments] = useState<{ [userId: string]: string[] }>({});

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

  const fluidJobsImages = {
    tech: [
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/ai-technology-microchip-background-digital-transformation-concept.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/annie-spratt-QckxruozjRg-unsplash.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/Custom%20Education%20&%20Training%20Systems%20with%20Python%20Development.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/Frontend%20vs%20Backend%20What%20Happens%20Behind%20a%20Website.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/nubelson-fernandes--Xqckh_XVU4-unsplash.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/patrick-tomasso-fMntI8HAAB8-unsplash.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/person-front-computer-working-html.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/representation-user-experience-interface-design.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/roman-synkevych-E-V6EMtGSUU-unsplash.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Tech/software-development-6523979_1280.jpg')
    ],
    management: [
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/business-meeting-office.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/business-people-board-room-meeting.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/close-up-woman-working-laptop.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/closeup-job-applicant-giving-his-resume-job-interview-office.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/Data%20Science%20Meeting.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/hunters-race-MYbhN8KaaEc-unsplash.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/lukas-blazek-mcSDtbWXUZU-unsplash.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/portrait-smiling-woman-startup-office-coding.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/smiley-man-work-holding-laptop-posing.jpg'),
      IMG_PROXY('https://72.60.103.151:9100/fluidai-bucket/FLuidJobs%20AI%20-%20Image%20Deck/Management/woman-retoucher-looking-camera-smiling-sitting-creative-design-media-agency.jpg')
    ]
  };

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

  const sections = [
    { id: 'account', label: 'Account Selection' },
    { id: 'basic', label: 'Basic Information' },
    { id: 'image', label: 'Job Image' },
    { id: 'timeline', label: 'Timeline & Dates' },
    { id: 'location', label: 'Location & Mode' },
    { id: 'description', label: 'Job Description' },
    { id: 'requirements', label: 'Requirements & Skills' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'team', label: 'Team & Recruiters' },
    { id: 'process', label: 'Hiring Process' }
  ];

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
    'Final Interview'
  ];

  useEffect(() => {
    const hasOpenDropdown = showDomainSuggestions || showMinExpSuggestions || showMaxExpSuggestions ||
      showJobTypeSuggestions || showLocationSuggestions || showModeSuggestions || showSkillsSuggestions;

    if (hasOpenDropdown) {
      document.body.classList.add('dropdown-open');
    } else {
      document.body.classList.remove('dropdown-open');
    }

    return () => {
      document.body.classList.remove('dropdown-open');
    };
  }, [showDomainSuggestions, showMinExpSuggestions, showMaxExpSuggestions, showJobTypeSuggestions, showLocationSuggestions, showModeSuggestions, showSkillsSuggestions]);

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

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('superadmin_token');
        if (!token || !selectedAccount) return;

        // Use the correct endpoint based on whether user is superadmin or not
        const endpoint = isSuperAdmin
          ? `http://localhost:8000/api/superadmin/users?account_id=${selectedAccount}`
          : `http://localhost:8000/api/auth/users?account_id=${selectedAccount}`;

        console.log('[JobCreationForm] Fetching users for account:', selectedAccount);
        console.log('[JobCreationForm] Using endpoint:', endpoint);

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('[JobCreationForm] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[JobCreationForm] Users data received:', data);
          console.log('[JobCreationForm] Number of users:', data?.length || 0);
          setUsers(data);
        } else {
          console.error('[JobCreationForm] Failed to fetch users. Status:', response.status);
          const errorText = await response.text();
          console.error('[JobCreationForm] Error response:', errorText);
        }
      } catch (error) {
        console.error('[JobCreationForm] Error fetching users:', error);
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
    if (selectedAccount) {
      fetchUsers();
    }
  }, [selectedAccount, isSuperAdmin]);

  // Fetch MinIO images when modal opens
  useEffect(() => {
    const fetchMinioImages = async () => {
      if (!showImageModal) return;

      setLoadingImages(true);
      setImageError('');

      try {
        const response = await fetch('http://localhost:8000/api/job-images/list');

        if (!response.ok) {
          throw new Error('Failed to fetch images from server');
        }

        const data = await response.json();

        if (data.success && data.images) {
          setMinioImages(data.images);
          console.log(`✅ Loaded ${data.totalCount} images from MinIO`);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching MinIO images:', error);
        setImageError('Failed to load images. Using fallback images.');
        // Keep the hardcoded fallback images
      } finally {
        setLoadingImages(false);
      }
    };

    fetchMinioImages();
  }, [showImageModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (formRef.current && !formRef.current.contains(target)) {
        setShowDomainSuggestions(false);
        setShowMinExpSuggestions(false);
        setShowMaxExpSuggestions(false);
        setShowJobTypeSuggestions(false);
        setShowLocationSuggestions(false);
        setShowModeSuggestions(false);
        setShowSkillsSuggestions(false);
        setShowAccountDropdown(false);
      }
    };

    const handleScroll = (event: Event) => {
      const target = event.target as Element;
      if (safeClosest(target, '.dropdown-content')) {
        return;
      }
      setShowDomainSuggestions(false);
      setShowMinExpSuggestions(false);
      setShowMaxExpSuggestions(false);
      setShowJobTypeSuggestions(false);
      setShowLocationSuggestions(false);
      setShowModeSuggestions(false);
      setShowSkillsSuggestions(false);
      setShowAccountDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && formData.job_description && !isUserEditing) {
      editorRef.current.innerHTML = formData.job_description;
    }
  }, [formData.job_description, isUserEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedAccount) newErrors.selectedAccount = 'Please select an account';
    if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
    if (!formData.job_domain.trim()) newErrors.job_domain = 'Job domain is required';
    if (!formData.min_experience.trim()) newErrors.min_experience = 'Min experience is required';
    if (!formData.max_experience.trim()) newErrors.max_experience = 'Max experience is required';
    if (!formData.job_type.trim()) newErrors.job_type = 'Job type is required';
    if (!formData.no_of_openings.trim()) newErrors.no_of_openings = 'Number of openings is required';
    if (!formData.min_salary.trim()) newErrors.min_salary = 'Min salary is required';
    if (!formData.max_salary.trim()) newErrors.max_salary = 'Max salary is required';
    if (!formData.registration_opening_date.trim()) newErrors.registration_opening_date = 'Registration opening date is required';
    if (!formData.locations.trim()) newErrors.locations = 'At least one location is required';
    if (!formData.mode_of_job.trim()) newErrors.mode_of_job = 'Mode of job is required';
    if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.job_description;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    if (!textContent.trim()) newErrors.job_description = 'Job description is required';
    if (!selectedImage) newErrors.selectedImage = 'Please select a job posting image';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSection = (sectionId: string): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (sectionId) {
      case 'account':
        if (!selectedAccount) newErrors.selectedAccount = 'Please select an account';
        break;
      case 'basic':
        if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
        if (!formData.job_domain.trim()) newErrors.job_domain = 'Job domain is required';
        if (!formData.min_experience.trim()) newErrors.min_experience = 'Min experience is required';
        if (!formData.max_experience.trim()) newErrors.max_experience = 'Max experience is required';
        if (!formData.job_type.trim()) newErrors.job_type = 'Job type is required';
        if (!formData.no_of_openings.trim()) newErrors.no_of_openings = 'Number of openings is required';
        break;
      case 'image':
        if (!selectedImage) newErrors.selectedImage = 'Please select a job posting image';
        break;
      case 'timeline':
        if (!formData.registration_opening_date.trim()) newErrors.registration_opening_date = 'Registration opening date is required';
        break;
      case 'location':
        if (!formData.locations.trim()) newErrors.locations = 'At least one location is required';
        if (!formData.mode_of_job.trim()) newErrors.mode_of_job = 'Mode of job is required';
        break;
      case 'description':
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formData.job_description;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        if (!textContent.trim()) newErrors.job_description = 'Job description is required';
        break;
      case 'requirements':
        if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required';
        break;
      case 'compensation':
        if (!formData.min_salary.trim()) newErrors.min_salary = 'Min salary is required';
        if (!formData.max_salary.trim()) newErrors.max_salary = 'Max salary is required';
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length === 0) {
      setCompletedSections(prev => {
        const newSet = new Set(prev);
        newSet.add(sectionId);
        return newSet;
      });
      return true;
    }
    return false;
  };

  const handleSectionChange = (sectionId: string) => {
    validateSection(activeSection);
    setActiveSection(sectionId);
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
    if (validateForm()) {
      try {
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
          created_by_user_id: currentAdmin?.id || null,
          primary_recruiter_id: formData.primary_recruiter_id,
          interview_stages: hiringStages // Add interview stages to payload
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
          setShowSuccessModal(true);
          window.dispatchEvent(new Event('jobCreated'));
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

  return (
    <div className="min-h-screen bg-white job-form-container">
      <div className="w-full p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-4">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${activeSection === section.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : completedSections.has(section.id)
                          ? 'text-gray-600 hover:bg-gray-50 border border-green-300 bg-green-50'
                          : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <span className="text-left flex-1">{section.label}</span>
                      {completedSections.has(section.id) && (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  {activeSection === 'account' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Account Selection</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select your account <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between"
                          >
                            <span>{selectedAccount ? accounts.find(acc => acc.account_id.toString() === selectedAccount)?.account_name || 'Select an account' : 'Select an account'}</span>
                            <svg className={`w-5 h-5 transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showAccountDropdown && (
                            <div className="dropdown-content absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 transition-all duration-300 ease-in-out">
                              <div className="p-2">
                                {accounts.map(account => (
                                  <div
                                    key={account.account_id}
                                    onClick={() => {
                                      setSelectedAccount(account.account_id.toString());
                                      setShowAccountDropdown(false);
                                      setErrors(prev => ({ ...prev, selectedAccount: '' }));
                                    }}
                                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                  >
                                    {account.account_name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {errors.selectedAccount && <p className="text-red-500 text-sm mt-1">{errors.selectedAccount}</p>}
                      </div>
                    </div>
                  )}

                  {activeSection === 'basic' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.job_title ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.job_title && <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Domain <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowDomainSuggestions(!showDomainSuggestions)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 flex items-center justify-between ${errors.job_domain ? 'border-red-500' : 'border-gray-300'
                              }`}
                          >
                            <span>{formData.job_domain || 'Select Domain'}</span>
                            <svg className={`w-4 h-4 transition-transform ${showDomainSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {errors.job_domain && <p className="text-red-500 text-sm mt-1">{errors.job_domain}</p>}
                          {showDomainSuggestions && (
                            <div className="dropdown-content absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 transition-all duration-300 ease-in-out">
                              <div className="p-2">
                                {domainSuggestions.map(domain => (
                                  <div
                                    key={domain}
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, job_domain: domain }));
                                      setShowDomainSuggestions(false);
                                      setErrors(prev => ({ ...prev, job_domain: '' }));
                                    }}
                                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                  >
                                    {domain}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Experience (in Yrs) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowMinExpSuggestions(!showMinExpSuggestions)}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 flex items-center justify-between ${errors.min_experience ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                              <span>{formData.min_experience || 'Select Experience'}</span>
                              <svg className={`w-4 h-4 transition-transform ${showMinExpSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {errors.min_experience && <p className="text-red-500 text-sm mt-1">{errors.min_experience}</p>}
                            {showMinExpSuggestions && (
                              <div className="dropdown-content absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 transition-all duration-300 ease-in-out">
                                <div className="p-2">
                                  {experienceOptions.map(exp => (
                                    <div
                                      key={exp}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, min_experience: exp }));
                                        setShowMinExpSuggestions(false);
                                        setErrors(prev => ({ ...prev, min_experience: '' }));
                                      }}
                                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                    >
                                      {exp}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Experience (in Yrs) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowMaxExpSuggestions(!showMaxExpSuggestions)}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 flex items-center justify-between ${errors.max_experience ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                              <span>{formData.max_experience || 'Select Experience'}</span>
                              <svg className={`w-4 h-4 transition-transform ${showMaxExpSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {errors.max_experience && <p className="text-red-500 text-sm mt-1">{errors.max_experience}</p>}
                            {showMaxExpSuggestions && (
                              <div className="dropdown-content absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 transition-all duration-300 ease-in-out">
                                <div className="p-2">
                                  {experienceOptions.map(exp => (
                                    <div
                                      key={exp}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, max_experience: exp }));
                                        setShowMaxExpSuggestions(false);
                                        setErrors(prev => ({ ...prev, max_experience: '' }));
                                      }}
                                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                    >
                                      {exp}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowJobTypeSuggestions(!showJobTypeSuggestions)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 flex items-center justify-between ${errors.job_type ? 'border-red-500' : 'border-gray-300'
                              }`}
                          >
                            <span>{formData.job_type || 'Select Job Type'}</span>
                            <svg className={`w-4 h-4 transition-transform ${showJobTypeSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {errors.job_type && <p className="text-red-500 text-sm mt-1">{errors.job_type}</p>}
                          {showJobTypeSuggestions && (
                            <div className="dropdown-content absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 transition-all duration-300 ease-in-out">
                              <div className="p-2">
                                {jobTypeOptions.map(type => (
                                  <div
                                    key={type}
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, job_type: type }));
                                      setShowJobTypeSuggestions(false);
                                      setErrors(prev => ({ ...prev, job_type: '' }));
                                    }}
                                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                  >
                                    {type}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          No of Openings <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="no_of_openings"
                          value={formData.no_of_openings}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="Enter number of openings"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.no_of_openings ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.no_of_openings && <p className="text-red-500 text-sm mt-1">{errors.no_of_openings}</p>}
                      </div>
                    </div>
                  )}

                  {activeSection === 'image' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Job Image</h3>
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
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedImage === image
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
                        {errors.selectedImage && <p className="text-red-500 text-sm mt-1">{errors.selectedImage}</p>}
                      </div>
                    </div>
                  )}

                  {activeSection === 'timeline' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Timeline & Dates</h3>
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
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.registration_opening_date ? 'border-red-500' : 'border-gray-300'
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
                            min={formData.registration_opening_date || new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">If not provided, defaults to 6 months from opening date</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'location' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Location & Mode</h3>
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
                              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.locations ? 'border-red-500' : 'border-gray-300'
                                }`}
                              readOnly={!!selectedLocation}
                            />
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
                            {showLocationSuggestions && locationInput && !selectedLocation && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                                        setErrors(prev => ({ ...prev, locations: '' }));
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
                            <button
                              type="button"
                              onClick={() => setShowModeSuggestions(!showModeSuggestions)}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 flex items-center justify-between ${errors.mode_of_job ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                              <span>{formData.mode_of_job || 'Select Mode'}</span>
                              <svg className={`w-4 h-4 transition-transform ${showModeSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {errors.mode_of_job && <p className="text-red-500 text-sm mt-1">{errors.mode_of_job}</p>}
                            {showModeSuggestions && (
                              <div className="dropdown-content absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 transition-all duration-300 ease-in-out">
                                <div className="p-2">
                                  {modeOptions.map(mode => (
                                    <div
                                      key={mode}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, mode_of_job: mode }));
                                        setShowModeSuggestions(false);
                                        setErrors(prev => ({ ...prev, mode_of_job: '' }));
                                      }}
                                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                    >
                                      {mode}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'description' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
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

                      <div className="rich-text-editor">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Description <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-1">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={generateDescription}
                              disabled={isGeneratingFromPdf}
                              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm ${isGeneratingFromPdf
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                }`}
                            >
                              <Sparkles className="w-4 h-4" />
                              {isGeneratingFromPdf ? 'Generating...' : uploadedPdfFile ? 'Generate from PDF' : 'Generate Description'}
                            </button>
                          </div>

                          <div className={`border rounded-lg ${errors.job_description ? 'border-red-500' : 'border-gray-300'}`}>
                            <div className="rich-text-toolbar flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-300 rounded-t-lg flex-wrap">
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
                    </div>
                  )}

                  {activeSection === 'requirements' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Requirements & Skills</h3>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills <span className="text-red-500">*</span>
                        </label>

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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.skills ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}

                        {showSkillsSuggestions && filteredSkills.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredSkills.map(skill => (
                              <label key={skill} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedSkills.includes(skill)}
                                  onChange={() => {
                                    toggleSkill(skill);
                                    setSkillsInput('');
                                    setShowSkillsSuggestions(false);
                                  }}
                                  className="mr-3 text-indigo-600"
                                />
                                <span className="text-sm">{skill}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === 'compensation' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Compensation</h3>
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
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.min_salary ? 'border-red-500' : 'border-gray-300'
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
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.max_salary ? 'border-red-500' : 'border-gray-300'
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
                    </div>
                  )}

                  {activeSection === 'team' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Assign Hiring Team</h3>
                        <p className="text-sm text-gray-500 mt-1">Select responsibilities for each team member for this specific job opening.</p>
                      </div>

                      {/* Primary Sourcing Recruiter Selection */}
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Primary Sourcing Recruiter
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          Select the main recruiter responsible for sourcing and candidate pipelines for this role.
                        </p>
                        <select
                          value={formData.primary_recruiter_id}
                          onChange={handleInputChange}
                          name="primary_recruiter_id"
                          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="">-- Select Primary Recruiter --</option>
                          {users?.filter(u => u.role === 'Recruiter' || u.role === 'Admin' || u.role === 'SuperAdmin').map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                          ))}
                        </select>
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
                        <span className="text-sm text-gray-500">{hiringStages.length} stages</span>
                      </div>

                      <div className="space-y-3">
                        {hiringStages.map((stage, index) => (
                          <div key={stage.id} className={`group flex items-center gap-3 p-4 bg-gray-50 rounded-lg border ${stage.isMandatory ? 'border-amber-200 bg-amber-50' : 'border-gray-200'} hover:border-blue-300 transition-all`}>
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${stage.isMandatory ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-600'}`}>
                              {index + 1}
                            </span>

                            <div className="flex-1">
                              {stage.isMandatory ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{stage.name}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 uppercase tracking-wide">
                                    Mandatory
                                  </span>
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={stage.name}
                                  onChange={(e) => {
                                    const newStages = [...hiringStages];
                                    newStages[index] = { ...newStages[index], name: e.target.value };
                                    setHiringStages(newStages);
                                  }}
                                  className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-700 focus:bg-white focus:border focus:border-blue-300 focus:rounded px-2 py-1 transition-all"
                                  placeholder="Enter stage name..."
                                />
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  if (index > 0) {
                                    const newStages = [...hiringStages];
                                    [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
                                    // Update order
                                    newStages.forEach((s, i) => s.order = i + 1);
                                    setHiringStages(newStages);
                                  }
                                }}
                                disabled={index === 0 || stage.isMandatory || hiringStages[index - 1].isMandatory}
                                className={`p-1 transition-colors ${index === 0 || stage.isMandatory || hiringStages[index - 1].isMandatory ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`}
                                title={stage.isMandatory || hiringStages[index - 1]?.isMandatory ? "Cannot reorder mandatory stages" : "Move up"}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>

                              <button
                                onClick={() => {
                                  if (index < hiringStages.length - 1) {
                                    const newStages = [...hiringStages];
                                    [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
                                    // Update order
                                    newStages.forEach((s, i) => s.order = i + 1);
                                    setHiringStages(newStages);
                                  }
                                }}
                                disabled={index === hiringStages.length - 1 || stage.isMandatory || hiringStages[index + 1].isMandatory}
                                className={`p-1 transition-colors ${index === hiringStages.length - 1 || stage.isMandatory || hiringStages[index + 1].isMandatory ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`}
                                title={stage.isMandatory || hiringStages[index + 1]?.isMandatory ? "Cannot reorder mandatory stages" : "Move down"}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              <button
                                onClick={() => setHiringStages(hiringStages.filter((_, i) => i !== index))}
                                disabled={stage.isMandatory}
                                className={`p-1 transition-colors ${stage.isMandatory ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'}`}
                                title={stage.isMandatory ? "Cannot remove mandatory stage" : "Remove stage"}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newStageInput}
                                onChange={(e) => setNewStageInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && newStageInput.trim()) {
                                    e.preventDefault();
                                    const newStage = {
                                      id: `stage_${Date.now()}`,
                                      name: newStageInput.trim(),
                                      type: 'custom',
                                      isMandatory: false,
                                      remarksRequired: true,
                                      order: hiringStages.length + 1
                                    };
                                    setHiringStages([...hiringStages, newStage]);
                                    setNewStageInput('');
                                  }
                                }}
                                placeholder="Enter custom stage name..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              />
                              <button
                                onClick={() => {
                                  if (newStageInput.trim()) {
                                    const newStage = {
                                      id: `stage_${Date.now()}`,
                                      name: newStageInput.trim(),
                                      type: 'custom',
                                      isMandatory: false,
                                      remarksRequired: true,
                                      order: hiringStages.length + 1
                                    };
                                    setHiringStages([...hiringStages, newStage]);
                                    setNewStageInput('');
                                  }
                                }}
                                disabled={!newStageInput.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add
                              </button>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 mb-2">Quick add common stages:</p>
                              <div className="flex flex-wrap gap-2">
                                {predefinedStages
                                  .filter(stage => !hiringStages.some(s => s.name === stage))
                                  .slice(0, 6)
                                  .map(stage => (
                                    <button
                                      key={stage}
                                      onClick={() => {
                                        const newStage = {
                                          id: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                                          name: stage,
                                          type: 'standard',
                                          isMandatory: false,
                                          remarksRequired: true,
                                          order: hiringStages.length + 1
                                        };
                                        setHiringStages([...hiringStages, newStage]);
                                      }}
                                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all"
                                    >
                                      + {stage}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">Customize your hiring process</p>
                              <ul className="text-xs space-y-1 text-blue-700">
                                <li>• Click on stage names to edit them</li>
                                <li>• Use ↑↓ arrows to reorder stages</li>
                                <li>• Add custom stages or use quick-add buttons</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          Create Job Opening
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center relative">
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

      <SuccessModal
        isOpen={showPdfSuccessModal}
        onClose={() => setShowPdfSuccessModal(false)}
        title="Success!"
        message="✅ Job description generated from PDF successfully!"
      />

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

            {loadingImages && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading images...</span>
              </div>
            )}

            {imageError && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">{imageError}</p>
              </div>
            )}

            {!loadingImages && (
              <>
                {/* Technology & Development Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Technology & Development
                    {minioImages.tech.length > 8 && (
                      <span className="ml-2 text-sm text-gray-500">({minioImages.tech.length} images)</span>
                    )}
                  </h3>
                  {minioImages.tech.length > 0 ? (
                    <>
                      <div className="grid grid-cols-4 gap-4">
                        {(showAllTech ? minioImages.tech : minioImages.tech.slice(0, 8)).map((image, index) => (
                          <div
                            key={`tech-${index}`}
                            onClick={() => {
                              setSelectedImage(image.url);
                              setErrors(prev => ({ ...prev, selectedImage: '' }));
                              setShowImageModal(false);
                            }}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedImage === image.url
                              ? 'border-indigo-600 ring-2 ring-indigo-200'
                              : 'border-gray-200 hover:border-indigo-300'
                              }`}
                          >
                            <img
                              src={image.url}
                              alt={image.name}
                              loading="lazy"
                              className="w-full h-32 object-cover bg-gray-100"
                              style={{ contentVisibility: 'auto' }}
                              onError={(e) => {
                                console.log('Image failed to load:', image.name);
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            {selectedImage === image.url && (
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
                      {!showAllTech && minioImages.tech.length > 8 && (
                        <button
                          onClick={() => setShowAllTech(true)}
                          className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Show {minioImages.tech.length - 8} more images</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                      {showAllTech && minioImages.tech.length > 8 && (
                        <button
                          onClick={() => setShowAllTech(false)}
                          className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Show less</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No technology images available</p>
                    </div>
                  )}
                </div>

                {/* Management & Business Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Management & Business
                    {minioImages.management.length > 8 && (
                      <span className="ml-2 text-sm text-gray-500">({minioImages.management.length} images)</span>
                    )}
                  </h3>
                  {minioImages.management.length > 0 ? (
                    <>
                      <div className="grid grid-cols-4 gap-4">
                        {(showAllManagement ? minioImages.management : minioImages.management.slice(0, 8)).map((image, index) => (
                          <div
                            key={`mgmt-${index}`}
                            onClick={() => {
                              setSelectedImage(image.url);
                              setErrors(prev => ({ ...prev, selectedImage: '' }));
                              setShowImageModal(false);
                            }}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedImage === image.url
                              ? 'border-indigo-600 ring-2 ring-indigo-200'
                              : 'border-gray-200 hover:border-indigo-300'
                              }`}
                          >
                            <img
                              src={image.url}
                              alt={image.name}
                              loading="lazy"
                              className="w-full h-32 object-cover bg-gray-100"
                              style={{ contentVisibility: 'auto' }}
                              onError={(e) => {
                                console.log('Image failed to load:', image.name);
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            {selectedImage === image.url && (
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
                      {!showAllManagement && minioImages.management.length > 8 && (
                        <button
                          onClick={() => setShowAllManagement(true)}
                          className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Show {minioImages.management.length - 8} more images</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                      {showAllManagement && minioImages.management.length > 8 && (
                        <button
                          onClick={() => setShowAllManagement(false)}
                          className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Show less</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No management images available</p>
                    </div>
                  )}
                </div>

                {/* General Professional Section (Unsplash fallback) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">General Professional</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {jobImages.map((image, index) => (
                      <div
                        key={`original-${index}`}
                        onClick={() => {
                          setSelectedImage(image);
                          setErrors(prev => ({ ...prev, selectedImage: '' }));
                          setShowImageModal(false);
                        }}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedImage === image
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCreationForm;
