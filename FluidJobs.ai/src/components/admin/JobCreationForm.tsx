import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Check
} from 'lucide-react';
import { indianCities } from '../../data/indianCities';
import './JobCreationForm.css';
import SuccessModal from '../../components/SuccessModal';
import ImagePickerModal from '../common/ImagePickerModal';
import { safeClosest } from '../../utils/domHelpers';
import { formatJobTitle, getDuplicateTitleError } from '../../utils/jobTitleUtils';

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
  const [apiDomainSuggestions, setApiDomainSuggestions] = useState<string[]>([]);
  const [showMinExpSuggestions, setShowMinExpSuggestions] = useState(false);
  const [showMaxExpSuggestions, setShowMaxExpSuggestions] = useState(false);
  const [showJobTypeSuggestions, setShowJobTypeSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showModeSuggestions, setShowModeSuggestions] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<number | undefined>(undefined);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [isGeneratingFromPdf, setIsGeneratingFromPdf] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [showPdfSuccessModal, setShowPdfSuccessModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usedImages, setUsedImages] = useState<string[]>([]); // images used by other jobs in the same account
  const [selectedHiringManager, setSelectedHiringManager] = useState('');
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([]);
  // Default 7 hiring stages (user can add/remove later)
  const DEFAULT_HIRING_STAGES = [
    { id: 'screening', name: 'Screening', type: 'standard', isMandatory: true, remarksRequired: false, order: 1 },
    { id: 'cv_shortlist', name: 'CV Shortlist', type: 'standard', isMandatory: false, remarksRequired: false, order: 2 },
    { id: 'hm_review', name: 'HM Review', type: 'standard', isMandatory: false, remarksRequired: false, order: 3 },
    { id: 'assignment', name: 'Assignment', type: 'standard', isMandatory: false, remarksRequired: true, order: 4 },
    { id: 'l1_tech', name: 'L1 Technical', type: 'standard', isMandatory: false, remarksRequired: true, order: 5 },
    { id: 'l2_tech', name: 'L2 Technical', type: 'standard', isMandatory: false, remarksRequired: true, order: 6 },
    { id: 'hr_round', name: 'HR Round', type: 'standard', isMandatory: false, remarksRequired: true, order: 7 },
  ];
  const [hiringStages, setHiringStages] = useState<any[]>(DEFAULT_HIRING_STAGES);
  const [newStageInput, setNewStageInput] = useState('');
  const [currentStageType, setCurrentStageType] = useState<'standard' | 'custom'>('standard');
  const [showNewStageInput, setShowNewStageInput] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [teamAssignments, setTeamAssignments] = useState<{ [userId: string]: string[] }>({});
  const [titleWarning, setTitleWarning] = useState('');
  const [isCheckingTitle, setIsCheckingTitle] = useState(false);
  const titleCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const experienceOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const openingsOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const modeOptions = ['Work From Home', 'Hybrid', 'On-site'];
  const domainSuggestions = [
    // Tech & Engineering
    'Software Engineering', 'Frontend Development', 'Backend Development', 'Full Stack Development',
    'Mobile Development', 'DevOps & SRE', 'Cloud Computing', 'Data Science', 'Machine Learning',
    'Artificial Intelligence', 'Data Engineering', 'Cybersecurity', 'IT & Systems',
    'Quality Assurance (QA)', 'Blockchain & Web3', 'Game Development', 'AR/VR/XR',
    'Embedded Systems', 'Network Engineering', 'Database Administration',

    // Product & Design
    'Product Management', 'Project Management', 'UI/UX Design', 'Product Design',
    'Graphic Design', 'Technical Writing', 'Scrum & Agile',

    // Business & Operations
    'Digital Marketing', 'Sales & Business Development', 'Human Resources (HR)',
    'Talent Acquisition', 'Finance & Accounting', 'Operations', 'Customer Success',
    'Legal & Compliance', 'Strategy & Consulting', 'Supply Chain & Logistics'
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
    { id: 'requirements', label: 'Requirements & Skills' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'description', label: 'Job Description' },
    { id: 'process', label: 'Hiring Process' },
    { id: 'team', label: 'Team & Recruiters' },
  ];

  // Stage name → responsibility key mapping (must mirror PipelineBoard STAGE_TO_RESPONSIBILITY)
  const STAGE_TO_RESPONSIBILITY: Record<string, { value: string; label: string }> = {
    'Screening': { value: 'screening_reviewer', label: 'Screening Reviewer' },
    'CV Shortlist': { value: 'cv_shortlist_reviewer', label: 'CV Shortlist Reviewer' },
    'HM Review': { value: 'hiring_manager', label: 'Hiring Manager' },
    'Assignment': { value: 'assignment_reviewer', label: 'Assignment Reviewer' },
    'L1 Technical': { value: 'l1_technical_interviewer', label: 'L1 Technical Interviewer' },
    'L2 Technical': { value: 'l2_technical_interviewer', label: 'L2 Technical Interviewer' },
    'L3 Technical': { value: 'l3_technical_interviewer', label: 'L3 Technical Interviewer' },
    'L4 Technical': { value: 'l4_technical_interviewer', label: 'L4 Technical Interviewer' },
    'HR Round': { value: 'hr_round', label: 'HR Round' },
    'Management Round': { value: 'management_round', label: 'Management Round' },
  };

  // Returns the dynamic responsibility list based on configured hiring stages
  const getResponsibilitiesForStages = (stages: any[]) => {
    const responsibilities: { value: string; label: string }[] = [];
    stages.forEach(stage => {
      const resp = STAGE_TO_RESPONSIBILITY[stage.name];
      if (resp && !responsibilities.find(r => r.value === resp.value)) {
        responsibilities.push(resp);
      }
    });
    return responsibilities;
  };

  const predefinedStages = [
    'CV Shortlist',
    'HM Review',
    'Assignment',
    'L1 Technical',
    'L2 Technical',
    'HR Round',
    'L3 Technical',
    'L4 Technical',
    'Management Round',
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

  // Filter local tech domains based on user input
  useEffect(() => {
    const term = formData.job_domain.trim().toLowerCase();
    if (!term) {
      setApiDomainSuggestions([]); // Remove default dropdown on empty click
      return;
    }

    const matched = domainSuggestions.filter(domain =>
      domain.toLowerCase().includes(term)
    );

    setApiDomainSuggestions(matched.slice(0, 8));
  }, [formData.job_domain]);

  // Debounced job title duplicate check (useRef timer — avoids stale closure / StrictMode issues)
  useEffect(() => {
    if (titleCheckTimerRef.current) clearTimeout(titleCheckTimerRef.current);

    if (!formData.job_title.trim()) {
      setTitleWarning('');
      setIsCheckingTitle(false);
      return;
    }

    setIsCheckingTitle(true);
    titleCheckTimerRef.current = setTimeout(async () => {
      try {
        const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        let url = `${baseUrl}/api/jobs-enhanced/check-title?title=${encodeURIComponent(formData.job_title.trim())}`;
        if (selectedAccount) url += `&account_id=${selectedAccount}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && data.exists) {
          setTitleWarning('⚠️ A job with this title already exists. Using a unique title is strongly recommended.');
        } else {
          setTitleWarning('');
        }
      } catch (err) {
        console.warn('[check-title] Failed:', err);
        setTitleWarning('');
      } finally {
        setIsCheckingTitle(false);
      }
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.job_title, selectedAccount]);

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
    } else if (name === 'job_title') {
      // Auto-format: title-case + preserve known abbreviations (AI, ML, UI, etc.)
      setFormData(prev => ({ ...prev, job_title: formatJobTitle(value) }));
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
        else if (titleWarning) newErrors.job_title = getDuplicateTitleError(titleWarning);
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
      case 'process':
        if (hiringStages.length === 0) newErrors.hiringStages = 'At least one hiring stage is required';
        break;
      case 'team': {
        // Every stage must have at least one assigned person
        const requiredResponsibilities = getResponsibilitiesForStages(hiringStages);
        const allAssigned = Object.values(teamAssignments).flat();
        const uncovered = requiredResponsibilities.filter(r => !allAssigned.includes(r.value));
        if (uncovered.length > 0) {
          newErrors.teamAssignments = `Assign someone for: ${uncovered.map(r => r.label).join(', ')}`;
        }
        if (!formData.primary_recruiter_id) newErrors.primary_recruiter_id = 'Primary recruiter is required';
        break;
      }
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
    // Allow going back to any completed section OR current section without validation
    if (completedSections.has(sectionId) || sectionId === activeSection) {
      setActiveSection(sectionId);
    } else if (validateSection(activeSection)) {
      setActiveSection(sectionId);
    }
  };

  const handleNextSection = () => {
    if (validateSection(activeSection)) {
      const currentIndex = sections.findIndex(s => s.id === activeSection);
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1].id);
      }
    }
  };

  const handlePrevSection = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
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
    // Block submission if a duplicate title exists
    if (titleWarning) {
      setErrors(prev => ({ ...prev, job_title: getDuplicateTitleError(titleWarning) }));
      return;
    }
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
          cover_image_id: selectedImageId,
          jd_attachment_name: uploadedPdfUrl,
          registration_opening_date: formData.registration_opening_date,
          registration_closing_date: closingDate,
          job_close_days: 30,
          no_of_openings: parseInt(formData.no_of_openings) || 1,
          account_id: parseInt(selectedAccount) || null,
          created_by_user_id: currentAdmin?.id || null,
          primary_recruiter_id: formData.primary_recruiter_id,
          interview_stages: hiringStages, // Add interview stages to payload
          team_assignments: teamAssignments // Add team assignments to payload
        };

        const endpoint = isSuperAdmin
          ? `${process.env.REACT_APP_BACKEND_URL}/api/superadmin/create-job`
          : `${process.env.REACT_APP_BACKEND_URL}/api/jobs-enhanced/create`;

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
                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                        <div />
                        <button
                          type="button"
                          onClick={handleNextSection}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          Next
                        </button>
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
                        {isCheckingTitle && (
                          <p className="text-gray-400 text-xs mt-1">Checking title availability...</p>
                        )}
                        {titleWarning && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-400 rounded-md flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <span className="text-red-600 text-sm font-medium">⚠️ This job title already exists. Please choose another name.</span>
                          </div>
                        )}
                        {!titleWarning && !isCheckingTitle && formData.job_title.trim() && !errors.job_title && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 text-sm font-medium">This job title is available!</span>
                          </div>
                        )}
                      </div>

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
                            onBlur={() => setTimeout(() => setShowDomainSuggestions(false), 200)}
                            placeholder="Ex. Software Development"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 ${errors.job_domain ? 'border-red-500' : 'border-gray-300'}`}
                            autoComplete="off"
                          />
                          {errors.job_domain && <p className="text-red-500 text-sm mt-1">{errors.job_domain}</p>}
                          {showDomainSuggestions && apiDomainSuggestions.length > 0 && (
                            <div className="dropdown-content absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 transition-all duration-300 ease-in-out">
                              <div className="p-2">
                                {apiDomainSuggestions.map((domain, index) => (
                                  <div
                                    key={index}
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
                          <input
                            type="number"
                            name="min_experience"
                            min="0"
                            max="50"
                            value={formData.min_experience}
                            onChange={handleInputChange}
                            placeholder="e.g. 2"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 ${errors.min_experience ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.min_experience && <p className="text-red-500 text-sm mt-1">{errors.min_experience}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Experience (in Yrs) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="max_experience"
                            min="0"
                            max="50"
                            value={formData.max_experience}
                            onChange={handleInputChange}
                            placeholder="e.g. 5"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 ${errors.max_experience ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors.max_experience && <p className="text-red-500 text-sm mt-1">{errors.max_experience}</p>}
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
                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handlePrevSection}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                        >
                          ← Previous
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSection}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          Next
                        </button>
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
                        {selectedImage ? (
                          <div className="relative rounded-lg overflow-hidden border-2 border-indigo-600 w-64 h-40">
                            <img
                              src={selectedImage}
                              alt="Selected Cover"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 p-2 flex justify-center">
                              <button
                                type="button"
                                onClick={() => setShowImageModal(true)}
                                className="text-white text-sm hover:underline font-medium"
                              >
                                Change Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setShowImageModal(true)}
                            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-colors"
                          >
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600">Click to Select Job Image</span>
                          </div>
                        )}
                        {errors.selectedImage && <p className="text-red-500 text-sm mt-1">{errors.selectedImage}</p>}
                      </div>
                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handlePrevSection}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                        >
                          ← Previous
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSection}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          Next
                        </button>
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
                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handlePrevSection}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                        >
                          ← Previous
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSection}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          Next
                        </button>
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
                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handlePrevSection}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                        >
                          ← Previous
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSection}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          Next
                        </button>
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
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Primary Sourcing Recruiter <span className="text-red-500">*</span></label>
                        <p className="text-xs text-gray-500 mb-3">The main recruiter responsible for sourcing and candidate pipeline.</p>
                        <select
                          value={formData.primary_recruiter_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, primary_recruiter_id: e.target.value }))}
                          className={`w-full md:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.primary_recruiter_id ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">-- Select Primary Recruiter --</option>
                          {users.filter(u => ['Recruiter', 'HR', 'Admin', 'Interviewer', 'Sales', 'SuperAdmin'].includes(u.role)).map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                          ))}
                        </select>
                        {errors.primary_recruiter_id && <p className="text-red-500 text-xs mt-1">{errors.primary_recruiter_id}</p>}
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

                                {/* Hidden Select for Form Compatibility — dynamic options */}
                                <select
                                  multiple
                                  value={userAssignments}
                                  onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    setTeamAssignments(prev => ({ ...prev, [user.id]: selected }));
                                  }}
                                  className="hidden"
                                  id={`responsibilities-${user.id}`}
                                >
                                  {getResponsibilitiesForStages(hiringStages).map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                  ))}
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
                                          // Dynamic: only show responsibilities for active hiring stages
                                          const allResponsibilities = getResponsibilitiesForStages(hiringStages);
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
                                                      setTeamAssignments(prev => ({
                                                        ...prev,
                                                        [user.id]: hasAllResponsibilities ? [] : allResponsibilityValues
                                                      }));
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2 ${hasAllResponsibilities ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                                  >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${hasAllResponsibilities ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
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
                                                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2 ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                                  >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
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

                      {/* Stage coverage checklist */}
                      {(() => {
                        const required = getResponsibilitiesForStages(hiringStages);
                        const allAssigned = Object.values(teamAssignments).flat();
                        const covered = required.filter(r => allAssigned.includes(r.value));
                        const uncovered = required.filter(r => !allAssigned.includes(r.value));
                        return (
                          <div className={`mt-4 p-4 rounded-lg border ${uncovered.length === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className={`text-sm font-semibold mb-2 ${uncovered.length === 0 ? 'text-green-800' : 'text-amber-800'}`}>
                              {uncovered.length === 0 ? '✅ All stages covered' : `⚠️ ${uncovered.length} stage(s) need an owner`}
                            </p>
                            <div className="space-y-1">
                              {required.map(r => {
                                const isCovered = allAssigned.includes(r.value);
                                return (
                                  <div key={r.value} className="flex items-center gap-2 text-xs">
                                    <span className={isCovered ? 'text-green-600' : 'text-amber-600'}>{isCovered ? '✓' : '✗'}</span>
                                    <span className={isCovered ? 'text-green-700' : 'text-amber-700 font-medium'}>{r.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {errors.teamAssignments && <p className="text-red-600 text-xs mt-2 font-medium">{errors.teamAssignments}</p>}
                          </div>
                        );
                      })()}

                      <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handlePrevSection}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                        >
                          ← Previous
                        </button>
                        <button
                          type="submit"
                          disabled={!!titleWarning || isCheckingTitle}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Create Job Opening
                        </button>
                      </div>
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

                      <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handlePrevSection}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                        >
                          ← Previous
                        </button>
                        <button
                          type="button"
                          onClick={handleNextSection}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}


                </div>
              </form>
            </div>
          </div>
        </div>

        {
          showSuccessModal && (
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
          )
        }

        <SuccessModal
          isOpen={showPdfSuccessModal}
          onClose={() => setShowPdfSuccessModal(false)}
          title="Success!"
          message="✅ Job description generated from PDF successfully!"
        />
        <ImagePickerModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          currentImageId={selectedImageId}
          onSelect={(imageUrl, imageId) => {
            setSelectedImage(imageUrl);
            setSelectedImageId(imageId);
            setErrors(prev => ({ ...prev, selectedImage: '' }));
            setShowImageModal(false);
            setCompletedSections(prev => { const s = new Set(prev); s.add('image'); return s; });
          }}
        />
      </div>
    </div>
  );
};

export default JobCreationForm;
