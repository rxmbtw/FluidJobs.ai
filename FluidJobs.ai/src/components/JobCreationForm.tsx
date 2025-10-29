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
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);
  const [showMinExpSuggestions, setShowMinExpSuggestions] = useState(false);
  const [showMaxExpSuggestions, setShowMaxExpSuggestions] = useState(false);
  const [showJobTypeSuggestions, setShowJobTypeSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showModeSuggestions, setShowModeSuggestions] = useState(false);

  const experienceOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const modeOptions = ['Work From Home', 'Hybrid', 'On-site'];
  const locationOptions = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata'];
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
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Job Creation Data:', formData);
    // Handle form submission here
    alert('Job created successfully!');
    onBack();
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

  const execCommand = (command: string) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = textareaRef.current.value.substring(start, end);
      let newText = '';
      
      switch (command) {
        case 'bold':
          newText = `**${selectedText || 'bold text'}**`;
          break;
        case 'italic':
          newText = `*${selectedText || 'italic text'}*`;
          break;
        case 'underline':
          newText = `<u>${selectedText || 'underlined text'}</u>`;
          break;
        case 'strikethrough':
          newText = `~~${selectedText || 'strikethrough text'}~~`;
          break;
        case 'bulletList':
          newText = `\n• ${selectedText || 'List item'}`;
          break;
        case 'orderedList':
          newText = `\n1. ${selectedText || 'List item'}`;
          break;
        case 'code':
          newText = `\`${selectedText || 'code'}\``;
          break;
        case 'horizontalRule':
          newText = '\n---\n';
          break;
        default:
          return;
      }
      
      const newValue = textareaRef.current.value.substring(0, start) + newText + textareaRef.current.value.substring(end);
      setFormData(prev => ({ ...prev, job_description: newValue }));
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <img 
              src="/images/FuildJobs.ai logo.png" 
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
                  src="/images/FuildJobs.ai logo.png" 
                  alt="FluidJobs.ai Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-2xl font-bold text-indigo-600">Fluid Live</span>
              </div>
              <h1 className="text-xl font-bold mb-2">Job Creation Form</h1>
              <p className="text-gray-600">
                Fill in the role details below to publish your job opening.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-7">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
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

              {/* Salary and Job Close */}
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <input
                        type="number"
                        name="max_salary"
                        value={formData.max_salary}
                        onChange={handleInputChange}
                        placeholder="Max Salary"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
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
                    required
                  />
                </div>
              </div>

              {/* Location and Mode */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locations <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="locations"
                      value={formData.locations}
                      onChange={handleInputChange}
                      onFocus={() => setShowLocationSuggestions(true)}
                      placeholder="Locations"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    {showLocationSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {locationOptions.map(location => (
                          <label key={location} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.locations === location}
                              onChange={() => {
                                setFormData(prev => ({ ...prev, locations: location }));
                                setShowLocationSuggestions(false);
                              }}
                              className="mr-3 text-indigo-600"
                            />
                            <span className="text-sm">{location}</span>
                          </label>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
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
                
                <input type="hidden" name="skills" value={formData.skills} required />
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
                    <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-300 rounded-t-lg">
                      {/* History */}
                      <button type="button" onClick={() => document.execCommand('undo')} className="p-1 hover:bg-gray-200 rounded" title="Undo (Ctrl+Z)">
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => document.execCommand('redo')} className="p-1 hover:bg-gray-200 rounded" title="Redo (Ctrl+Y)">
                        <Redo2 className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* Block Type */}
                      <select className="text-sm border-0 bg-transparent">
                        <option>Paragraph</option>
                        <option>Heading 1</option>
                        <option>Heading 2</option>
                        <option>Heading 3</option>
                      </select>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* Formatting */}
                      <button type="button" onClick={() => execCommand('bold')} className="p-1 hover:bg-gray-200 rounded" title="Bold (Ctrl+B)">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execCommand('italic')} className="p-1 hover:bg-gray-200 rounded" title="Italic (Ctrl+I)">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execCommand('underline')} className="p-1 hover:bg-gray-200 rounded" title="Underline (Ctrl+U)">
                        <Underline className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execCommand('strikethrough')} className="p-1 hover:bg-gray-200 rounded" title="Strikethrough">
                        <Strikethrough className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* Lists */}
                      <button type="button" onClick={() => execCommand('bulletList')} className="px-2 py-1 hover:bg-gray-200 rounded text-sm" title="Bulleted List">
                        • List
                      </button>
                      <button type="button" onClick={() => execCommand('orderedList')} className="px-2 py-1 hover:bg-gray-200 rounded text-sm" title="Numbered List">
                        1. List
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* Code */}
                      <button type="button" onClick={() => execCommand('code')} className="p-1 hover:bg-gray-200 rounded" title="Code Block">
                        <Code className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* Insert */}
                      <button type="button" onClick={() => execCommand('horizontalRule')} className="p-1 hover:bg-gray-200 rounded" title="Insert Horizontal Line">
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <textarea
                      ref={textareaRef}
                      name="job_description"
                      value={formData.job_description}
                      onChange={handleInputChange}
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
                      className="w-full px-3 py-2 border-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium mt-6"
              >
                Create Opening
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCreationForm;