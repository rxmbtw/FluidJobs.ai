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

interface JobCreationFormProps {
  onBack: () => void;
}

const JobCreationForm: React.FC<JobCreationFormProps> = ({ onBack }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [formData, setFormData] = useState({
    job_title: '',
    job_domain: '',
    min_experience: '',
    max_experience: '',
    job_type: '',
    min_salary: '',
    max_salary: '',
    show_salary_to_candidate: true,
    job_close_days: '15',
    locations: '',
    mode_of_job: '',
    skills: '',
    job_description: ''
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);
  const [showMinExpSuggestions, setShowMinExpSuggestions] = useState(false);
  const [showMaxExpSuggestions, setShowMaxExpSuggestions] = useState(false);
  const [showJobTypeSuggestions, setShowJobTypeSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showModeSuggestions, setShowModeSuggestions] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Paragraph');
  const [selectedFont, setSelectedFont] = useState('Arial');

  const fonts = [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Impact',
    'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype', 'Tahoma', 'Times New Roman',
    'Trebuchet MS', 'Verdana', 'Calibri', 'Cambria', 'Candara', 'Consolas', 'Constantia', 'Corbel',
    'Garamond', 'Geneva', 'Monaco', 'Optima', 'Segoe UI', 'System', 'Roboto', 'Open Sans',
    'Lato', 'Montserrat', 'Oswald', 'Raleway', 'PT Sans', 'Source Sans Pro', 'Merriweather',
    'Noto Sans', 'Poppins', 'Ubuntu', 'Playfair Display', 'Nunito'
  ];

  const filteredFonts = fonts.filter(font => font.toLowerCase().includes(fontSearch.toLowerCase()));

  const experienceOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const modeOptions = ['Work From Home', 'Hybrid', 'On-site'];
  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi',
    'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
    'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad',
    'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Warangal',
    'Mira-Bhayandar', 'Thiruvananthapuram', 'Bhiwandi', 'Saharanpur', 'Guntur', 'Amravati', 'Bikaner', 'Noida', 'Jamshedpur', 'Bhilai',
    'Cuttack', 'Firozabad', 'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded',
    'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar',
    'Jammu', 'Sangli-Miraj', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon',
    'Udaipur', 'Maheshtala', 'Davanagere', 'Kozhikode', 'Kurnool', 'Rajpur Sonarpur', 'Rajahmundry', 'Bokaro', 'South Dumdum', 'Bellary',
    'Patiala', 'Gopalpur', 'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Bhatpara', 'Panihati', 'Latur', 'Dhule', 'Tirupati',
    'Rohtak', 'Korba', 'Bhilwara', 'Berhampur', 'Muzaffarpur', 'Ahmednagar', 'Mathura', 'Kollam', 'Avadi', 'Kadapa',
    'Kamarhati', 'Sambalpur', 'Bilaspur', 'Shahjahanpur', 'Satara', 'Bijapur', 'Rampur', 'Shivamogga', 'Chandrapur', 'Junagadh',
    'Thrissur', 'Alwar', 'Bardhaman', 'Kulti', 'Kakinada', 'Nizamabad', 'Parbhani', 'Tumkur', 'Khammam', 'Ozhukarai',
    'Bihar Sharif', 'Panipat', 'Darbhanga', 'Bally', 'Aizawl', 'Dewas', 'Ichalkaranji', 'Karnal', 'Bathinda', 'Jalna',
    'Eluru', 'Kirari Suleman Nagar', 'Barasat', 'Purnia', 'Satna', 'Mau', 'Sonipat', 'Farrukhabad', 'Sagar', 'Rourkela',
    'Durg', 'Imphal', 'Ratlam', 'Hapur', 'Arrah', 'Karimnagar', 'Anantapur', 'Etawah', 'Ambernath', 'North Dumdum',
    'Bharatpur', 'Begusarai', 'New Delhi', 'Gandhidham', 'Baranagar', 'Tiruvottiyur', 'Puducherry', 'Sikar', 'Thoothukudi'
  ];
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
  }, [formData, currentStep]);

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
        setShowFormatDropdown(false);
        setShowFontDropdown(false);
        setShowListDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
      if (!formData.job_domain.trim()) newErrors.job_domain = 'Job domain is required';
      if (!formData.min_experience.trim()) newErrors.min_experience = 'Min experience is required';
      if (!formData.max_experience.trim()) newErrors.max_experience = 'Max experience is required';
      if (!formData.job_type.trim()) newErrors.job_type = 'Job type is required';
    } else if (step === 2) {
      if (!formData.min_salary.trim()) newErrors.min_salary = 'Min salary is required';
      if (!formData.max_salary.trim()) newErrors.max_salary = 'Max salary is required';
    } else if (step === 3) {
      if (!formData.locations.trim()) newErrors.locations = 'At least one location is required';
      if (!formData.mode_of_job.trim()) newErrors.mode_of_job = 'Mode of job is required';
    } else if (step === 4) {
      if (!formData.skills.trim()) newErrors.skills = 'At least one skill is required';
      if (!formData.job_description.trim()) newErrors.job_description = 'Job description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = (step: number): boolean => {
    if (step === 1) {
      return formData.job_title.trim().length > 0 && 
             formData.job_domain.trim().length > 0 && 
             formData.min_experience.trim().length > 0 && 
             formData.max_experience.trim().length > 0 && 
             formData.job_type.trim().length > 0;
    } else if (step === 2) {
      return formData.min_salary.trim().length > 0 && 
             formData.max_salary.trim().length > 0;
    } else if (step === 3) {
      return formData.locations.trim().length > 0 && 
             formData.mode_of_job.trim().length > 0;
    } else if (step === 4) {
      return formData.skills.trim().length > 0 && 
             formData.job_description.trim().length > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      console.log('Job Creation Data:', formData);
      alert('Job created successfully!');
      onBack();
    }
  };

  const generateDescription = () => {
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

    setFormData(prev => ({ ...prev, job_description: description }));
  };

  const applyFormat = (format: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selectedText = value.substring(start, end) || 'Sample text';
    
    let insert = '';
    if (format === 'Heading 1') insert = `# ${selectedText}`;
    else if (format === 'Heading 2') insert = `## ${selectedText}`;
    else if (format === 'Heading 3') insert = `### ${selectedText}`;
    else insert = selectedText;
    
    const newValue = value.substring(0, start) + insert + value.substring(end);
    textarea.value = newValue;
    setFormData(prev => ({ ...prev, job_description: newValue }));
    textarea.setSelectionRange(start + insert.length, start + insert.length);
    textarea.focus();
    setSelectedFormat(format);
    setShowFormatDropdown(false);
  };

  const applyList = (listType: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selectedText = value.substring(start, end);
    
    let insert = '';
    let cursorPos = start;
    
    if (listType === 'bullet') {
      if (selectedText) {
        const lines = selectedText.split('\n');
        insert = lines.map(line => line.trim() ? `• ${line.trim()}` : '').filter(l => l).join('\n');
        cursorPos = start + insert.length;
      } else {
        insert = '• ';
        cursorPos = start + 2;
      }
    } else if (listType === 'numbered') {
      if (selectedText) {
        const lines = selectedText.split('\n');
        let num = 1;
        insert = lines.map(line => line.trim() ? `${num++}. ${line.trim()}` : '').filter(l => l).join('\n');
        cursorPos = start + insert.length;
      } else {
        insert = '1. ';
        cursorPos = start + 3;
      }
    }
    
    const newValue = value.substring(0, start) + insert + value.substring(end);
    textarea.value = newValue;
    setFormData(prev => ({ ...prev, job_description: newValue }));
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();
    setShowListDropdown(false);
  };

  const execCommand = (command: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selectedText = value.substring(start, end);
    
    let insert = '';
    let cursorPos = start;
    
    if (command === 'bold') {
      insert = `**${selectedText || 'bold text'}**`;
      cursorPos = selectedText ? start + insert.length : start + 2;
    } else if (command === 'italic') {
      insert = `*${selectedText || 'italic text'}*`;
      cursorPos = selectedText ? start + insert.length : start + 1;
    } else if (command === 'underline') {
      insert = `<u>${selectedText || 'underlined text'}</u>`;
      cursorPos = selectedText ? start + insert.length : start + 3;
    } else if (command === 'strikethrough') {
      insert = `~~${selectedText || 'strikethrough text'}~~`;
      cursorPos = selectedText ? start + insert.length : start + 2;
    }
    
    const newValue = value.substring(0, start) + insert + value.substring(end);
    textarea.value = newValue;
    setFormData(prev => ({ ...prev, job_description: newValue }));
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const value = textarea.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const currentLine = value.substring(lineStart, start);
    
    const bulletMatch = currentLine.match(/^•\s/);
    const numberedMatch = currentLine.match(/^(\d+)\.\s/);
    
    if (bulletMatch) {
      e.preventDefault();
      const newValue = value.substring(0, start) + '\n• ' + value.substring(start);
      textarea.value = newValue;
      setFormData(prev => ({ ...prev, job_description: newValue }));
      textarea.setSelectionRange(start + 3, start + 3);
    } else if (numberedMatch) {
      e.preventDefault();
      const nextNum = parseInt(numberedMatch[1]) + 1;
      const newValue = value.substring(0, start) + `\n${nextNum}. ` + value.substring(start);
      textarea.value = newValue;
      setFormData(prev => ({ ...prev, job_description: newValue }));
      const newPos = start + `\n${nextNum}. `.length;
      textarea.setSelectionRange(newPos, newPos);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <img 
              src="/images/FLuid Live Icon.png" 
              alt="FluidJobs.ai Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-white">FluidJobs.ai</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <div className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-5 h-5" />
              <span>Create Job</span>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
              HR
            </div>
            <span className="font-medium">HR Manager</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div ref={formRef} className="bg-white rounded-lg p-8 shadow-md">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/images/FLuid Live Icon.png" 
                  alt="FluidJobs.ai Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-2xl font-bold text-indigo-600">Fluid Live</span>
              </div>
              <h1 className="text-xl font-bold mb-2">Job Creation Form - Step {currentStep} of 4</h1>
              <p className="text-gray-600">
                {currentStep === 1 && 'Basic job information'}
                {currentStep === 2 && 'Salary and timeline details'}
                {currentStep === 3 && 'Location and work mode'}
                {currentStep === 4 && 'Skills and job description'}
              </p>
              
              {/* Progress Bar */}
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
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-7">
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
                </>
              )}

              {/* Step 2: Salary and Timeline */}
              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Salary (in INR) <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            name="min_salary"
                            value={formData.min_salary}
                            onChange={handleInputChange}
                            placeholder="Min Salary"
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.min_salary ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          <input
                            type="number"
                            name="max_salary"
                            value={formData.max_salary}
                            onChange={handleInputChange}
                            placeholder="Max Salary"
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.max_salary ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Close In (Days) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="job_close_days"
                        value={formData.job_close_days}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
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
                        Locations <span className="text-red-500">*</span>
                      </label>
                      
                      {/* Selected Locations */}
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
                                  setFormData(prev => ({ ...prev, locations: updated.join(', ') }));
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.locations ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.locations && <p className="text-red-500 text-sm mt-1">{errors.locations}</p>}
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
                                    setFormData(prev => ({ ...prev, locations: updated.join(', ') }));
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
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={generateDescription}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generate Description
                        </button>
                      </div>
                  
                  {/* Rich Text Editor Toolbar */}
                  <div className="border border-gray-300 rounded-lg">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-300 rounded-t-lg flex-wrap">
                      {/* Format Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                          className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          {selectedFormat}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {showFormatDropdown && (
                          <div className="absolute z-20 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg">
                            {['Paragraph', 'Heading 1', 'Heading 2', 'Heading 3'].map(format => (
                              <button
                                key={format}
                                type="button"
                                onClick={() => applyFormat(format)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                              >
                                {format}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Font Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowFontDropdown(!showFontDropdown)}
                          className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          {selectedFont}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {showFontDropdown && (
                          <div className="absolute z-20 mt-1 w-56 bg-white border border-gray-300 rounded-md shadow-lg">
                            <input
                              type="text"
                              placeholder="Search fonts..."
                              value={fontSearch}
                              onChange={(e) => setFontSearch(e.target.value)}
                              className="w-full px-3 py-2 border-b border-gray-300 text-sm focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="max-h-60 overflow-y-auto">
                              {filteredFonts.map(font => (
                                <button
                                  key={font}
                                  type="button"
                                  onClick={() => {
                                    setSelectedFont(font);
                                    setShowFontDropdown(false);
                                    setFontSearch('');
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                                  style={{ fontFamily: font }}
                                >
                                  {font}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-px h-6 bg-gray-300"></div>
                      
                      {/* Formatting Buttons */}
                      <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded" title="Bold">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded" title="Italic">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded" title="Underline">
                        <Underline className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execCommand('strikethrough')} className="p-2 hover:bg-gray-200 rounded" title="Strikethrough">
                        <Strikethrough className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300"></div>
                      
                      {/* Lists Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowListDropdown(!showListDropdown)}
                          className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          Lists
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {showListDropdown && (
                          <div className="absolute z-20 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg">
                            <button
                              type="button"
                              onClick={() => applyList('bullet')}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                              • Bullet List
                            </button>
                            <button
                              type="button"
                              onClick={() => applyList('numbered')}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                              1. Numbered List
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-px h-6 bg-gray-300"></div>
                      
                      <button type="button" className="px-3 py-1 hover:bg-gray-200 rounded text-sm">Link</button>
                      <button
                        type="button"
                        onClick={() => {
                          if (textareaRef.current) {
                            textareaRef.current.value = '';
                            setFormData(prev => ({ ...prev, job_description: '' }));
                          }
                        }}
                        className="px-3 py-1 hover:bg-gray-200 rounded text-sm text-red-600"
                      >
                        Clear
                      </button>
                    </div>
                    
                    <textarea
                      ref={textareaRef}
                      name="job_description"
                      value={formData.job_description}
                      onChange={handleInputChange}
                      onKeyDown={handleDescriptionKeyDown}
                      onPaste={(e) => {
                        // Allow default paste behavior
                        setTimeout(() => {
                          if (textareaRef.current) {
                            setFormData(prev => ({ ...prev, job_description: textareaRef.current!.value }));
                          }
                        }, 0);
                      }}
                      placeholder="Enter job description here..."
                      rows={8}
                      className={`w-full px-3 py-2 border-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                        errors.job_description ? 'border-red-500' : ''
                      }`}
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                      }}
                    />
                    {errors.job_description && <p className="text-red-500 text-sm mt-1">{errors.job_description}</p>}
                  </div>
                </div>
              </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-md font-medium ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Previous
                </button>
                
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
    </div>
  );
};

export default JobCreationForm;