import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Building, X, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../contexts/JobsProvider';
import JobSpecificDashboard from '../components/JobSpecificDashboard';

interface JobData {
  jobId: string;
  title: string;
  experience: string;
  location: string;
  workplace: string;
  tags: string[];
  image: string;
  description: {
    overview: string;
    responsibilities: string[];
    qualifications: string[];
  };
}

const jobsData: JobData[] = [
  {
    "jobId": "BA_MOTOR_01",
    "title": "Business Analyst | Motor Insurance",
    "experience": "4+ Years",
    "location": "Mumbai",
    "workplace": "Work from Office",
    "tags": ["Insurance", "Business Analysis", "IRDAI"],
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are seeking a skilled Business Analyst with strong domain expertise in Motor Insurance to join our team. This role involves analyzing business requirements, bridging the gap between business users and technology teams, and driving digital transformation within motor insurance processes.",
      "responsibilities": [
        "Gather, analyze, and document business requirements specific to motor insurance products.",
        "Work with product, operations, and IT teams to design and enhance motor insurance workflows.",
        "Translate business needs into functional and technical specifications.",
        "Support product design for new insurance offerings.",
        "Identify process gaps and support automation initiatives.",
        "Conduct impact analysis for system and regulatory changes.",
        "Collaborate with QA/testing teams to define test cases.",
        "Provide support during UAT and ensure timely issue resolution.",
        "Act as a subject matter expert (SME) in Motor Insurance.",
        "Prepare business process documents, user manuals, and training materials."
      ],
      "qualifications": [
        "BE / BTech / MCA",
        "4+ years' experience as a Business Analyst, with at least 2+ years in Motor/General Insurance domain.",
        "Strong knowledge of Motor Insurance Domain (underwriting, claims, policy issuance, renewals, etc.).",
        "Experience in requirement gathering and business process mapping.",
        "Familiarity with Insurance Systems (Policy Administration Systems, CRM, etc.).",
        "Knowledge of Insurance Regulations and IRDAI Guidelines is a plus."
      ]
    }
  },
  {
    "jobId": "CA_NEWS_02",
    "title": "Content Analyst",
    "experience": "0 - 3 Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["Content", "Analysis", "Supply Chain", "Journalism"],
    "image": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop",
    "description": {
      "overview": "Analyzing incoming data streams and monitoring for events such as industrial fires, explosions, and natural disasters that can impact supply chain resiliency. You will be reporting time-sensitive risk alerts based on information from open source media.",
      "responsibilities": [
        "Monitoring for events that can impact supply chain resiliency.",
        "Reporting time-sensitive risk alerts based on information from open source media.",
        "Writing, editing and updating shorter real-time reports.",
        "Applying supply chain understanding and risk analysis to critical events."
      ],
      "qualifications": [
        "Graduate/Post Graduate (Journalism/Mass Comm/Media Comm/BBA/MBA or equivalent).",
        "0 – 3 Years Relevant and Focussed experience.",
        "Excellent verbal and written communication skills in English.",
        "Ability to work in a fast-paced environment with short turnaround times.",
        "Proficient with MS Office Suite."
      ]
    }
  },
  {
    "jobId": "QA_AUTO_03",
    "title": "QA Automation Selenium",
    "experience": "2+ Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["QA", "Automation", "Selenium", "Java"],
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are looking for a QA Automation Engineer to independently write, design, and execute automated test scripts for our products. You will be responsible for maintaining our automated regression suites and ensuring product quality.",
      "responsibilities": [
        "Independently write automated test scripts.",
        "Plan, design and execute automated test cases.",
        "Test the product manually to identify automation opportunities.",
        "Execute and schedule automated test runs and analyze logs.",
        "Record test results and report/verify software bug fixes.",
        "Maintain automated regression suites."
      ],
      "qualifications": [
        "BE / BTech / MCA",
        "2-4 Years of experience.",
        "Strong hands-on experience on Selenium.",
        "Strong Core Java fundamentals and Object Oriented concepts.",
        "Good knowledge on database queries.",
        "Experience in the Insurance Domain is a plus."
      ]
    }
  },
  {
    "jobId": "QA_INSURE_04",
    "title": "QA Engineer | Insurance",
    "experience": "2+ Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["QA", "Manual Testing", "Insurance"],
    "image": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are seeking a meticulous QA Engineer with a strong background in the insurance domain to join our team. You will be responsible for developing test scenarios, executing test cases, and ensuring the quality of our software solutions.",
      "responsibilities": [
        "Developing Test scenarios / cases.",
        "Execution of test cases.",
        "Creation of defect & Maintaining defect lists.",
        "Planning of testing tasks.",
        "Documentation of test results and reports."
      ],
      "qualifications": [
        "Bachelor's Degree in computer science or related field.",
        "2-4 years' Software Testing Experience.",
        "Minimum 2 years experience in the Insurance Domain (India).",
        "Good communication skills are a must."
      ]
    }
  },
  {
    "jobId": "AS_L2_PY_05",
    "title": "Application Support Engineer | L2 | Python",
    "experience": "2+ Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["Support", "Python", "SaaS", "AWS"],
    "image": "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are seeking a skilled Support Engineer to serve as a critical link between our customers and engineering teams. You will provide high-quality technical assistance, troubleshoot complex issues, and ensure timely resolution of problems for our American and European customer base.",
      "responsibilities": [
        "Provide first- and second-line technical support.",
        "Diagnose, troubleshoot, and provide solutions for software and network-related issues.",
        "Act as a liaison between customers and internal teams.",
        "Document customer interactions and technical issues in the ticketing system.",
        "Reproduce customer-reported issues and escalate bugs.",
        "Prioritize tasks effectively to meet SLAs."
      ],
      "qualifications": [
        "Bachelor's degree in computer science, IT, Engineering, or equivalent.",
        "2+ years of experience in a technical support or IT role.",
        "Strong understanding of operating systems and networking concepts.",
        "Experience with ticketing systems (Zendesk, Jira).",
        "Familiarity with scripting languages (Javascript, Python) and SaaS platforms (AWS) is desirable."
      ]
    }
  },
  {
    "jobId": "BA_PROP_06",
    "title": "Business Analyst | Property Insurance",
    "experience": "2+ Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["Insurance", "Business Analysis", "Project Management"],
    "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
    "description": {
      "overview": "Join our team as a Business Analyst specializing in Property Insurance. You will be responsible for engaging with stakeholders, managing projects end-to-end, and working on the development and deployment of our insurance products.",
      "responsibilities": [
        "Engaging with stakeholders and understanding business requirements.",
        "End-to-end project management/product development & deployments.",
        "Work on scoping, preparing wireframes, use cases, and BRDs.",
        "Working with partners for the launch of new products.",
        "Work on UAT testing and review QA / UAT functional test cases.",
        "Investigating and working on production issues."
      ],
      "qualifications": [
        "Bachelor's Degree in computer science or related field.",
        "2+ years' experience as a Business Analyst in Property Insurance.",
        "Solid understanding of the insurance industry, including regulations, products, and processes.",
        "Strong analytical and communication skills."
      ]
    }
  },
  {
    "jobId": "CSM_SCM_07",
    "title": "Customer Success Manager | Supply Chain",
    "experience": "5+ Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["Customer Success", "Supply Chain", "SaaS"],
    "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop",
    "description": {
      "overview": "As a Customer Success Manager, you will drive customer outcomes, deepen product adoption, and build lasting strategic relationships with our Enterprise accounts in the supply chain domain. You will lead clients through their value realization journey.",
      "responsibilities": [
        "Drive strategic planning, onboarding, adoption, and renewal for Enterprise accounts.",
        "Act as the primary point of contact for customer business outcomes.",
        "Build and maintain executive-level relationships.",
        "Conduct focused supply chain analyses for and with customers.",
        "Partner closely with Sales, Account Management, and Implementation teams.",
        "Gather customer feedback to influence the product roadmap."
      ],
      "qualifications": [
        "BBA/MBA (Supply Chain Management, Logistics, Operations or a related field).",
        "5+ Years of relevant and focussed experience.",
        "Experience working with Enterprise-level customers, ideally in B2B SaaS or supply chain solutions.",
        "Depth in problem solving, supply chain analysis, and strategic planning."
      ]
    }
  },
  {
    "jobId": "CSS_SCM_08",
    "title": "Customer Success Specialist | Supply Chain",
    "experience": "2+ Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["Customer Success", "Supply Chain", "Analysis"],
    "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    "description": {
      "overview": "As a Customer Success Specialist, you will play a critical role in driving customer insight analyses and deepening product adoption. You will work hands-on with some of our largest and most strategic accounts in the supply chain domain.",
      "responsibilities": [
        "Support strategic planning, onboarding, adoption, and renewal efforts.",
        "Conduct focused supply chain analyses using client data and tools.",
        "Drive supplier research and build up industry vertical knowledge.",
        "Prepare client-ready PowerPoint presentations.",
        "Support partnering with Sales, Account Management, and Implementation teams."
      ],
      "qualifications": [
        "BBA/MBA (Supply Chain Management, Logistics, Operations or a related field).",
        "Minimum 2 years' experience in management consulting or customer success.",
        "Experience in B2B SaaS or supply chain solutions is preferred.",
        "Basic to Intermediate Excel and PowerPoint skills."
      ]
    }
  },
  {
    "jobId": "NA_SCM_09",
    "title": "News Analyst | Supply Chain",
    "experience": "1 - 3 Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["Analysis", "Supply Chain", "Media", "Research"],
    "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop",
    "description": {
      "overview": "As a News Analyst, you will monitor incoming data streams for global events that can impact supply chain resiliency. You will be responsible for reporting time-sensitive risk alerts based on information obtained from open source media.",
      "responsibilities": [
        "Analyzing data streams for events like natural disasters, labor strikes, etc.",
        "Reporting time-sensitive risk alerts.",
        "Writing, editing, and updating shorter real-time reports.",
        "Applying supply chain understanding and risk analysis to critical events."
      ],
      "qualifications": [
        "Graduate/Post Graduate (Journalism/Mass Com/Media Comm).",
        "1 – 3 Years of relevant and focussed experience.",
        "Proficiency in the English language is a must.",
        "Ability to analyze news articles and extract important information."
      ]
    }
  },
  {
    "jobId": "FD_REACT_10",
    "title": "Frontend Developer",
    "experience": "4+ Years",
    "location": "Pune",
    "workplace": "Work from Office",
    "tags": ["React", "AngularJS", "JavaScript", "HTML/CSS"],
    "image": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are looking for an experienced Frontend Developer to design, develop, and deploy complex applications. You will be responsible for understanding our existing product, coming up with UI design improvements, and implementing them.",
      "responsibilities": [
        "Designing, developing, deploying and supporting complex computing applications.",
        "Tracking records of technical achievements, delivering to tight schedules.",
        "Understand existing product and propose UI design improvements.",
        "Implement improvements through projects & programs."
      ],
      "qualifications": [
        "BE/B Tech/BCA/MCA.",
        "Min 4 Years of Experience.",
        "Experience with React, AngularJS, HTML, CSS, JavaScript, Bootstrap.",
        "Responsive design experience across tablets and smartphones.",
        "Background in User Experience and creating mockups/wireframes is a strong plus."
      ]
    }
  }
];

interface JobOpeningsProps {
  onJobSelect?: (jobTitle: string) => void;
}

const JobOpenings: React.FC<JobOpeningsProps> = ({ onJobSelect }) => {
  const { jobs } = useJobs();
  const navigate = useNavigate();
  
  // Convert context jobs to JobData format
  const contextJobs: JobData[] = jobs.map(job => ({
    jobId: job.jobId || `JOB_${Date.now()}`,
    title: job.title,
    experience: job.experience || '0-2 Years',
    location: job.location || 'Mumbai',
    workplace: job.workplace || job.mode || 'Work from Office',
    tags: job.tags || [job.domain || 'Technology'],
    image: job.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
    description: {
      overview: job.description || 'Join our team and contribute to exciting projects.',
      responsibilities: [
        'Work on innovative projects',
        'Collaborate with cross-functional teams',
        'Drive technical excellence',
        'Contribute to product development'
      ],
      qualifications: [
        job.experience || 'Relevant experience required',
        ...(job.skills || []).map(skill => `Experience with ${skill}`),
        'Strong communication skills',
        'Team collaboration abilities'
      ]
    }
  }));
  
  // Combine static jobs with context jobs
  const allJobs = [...jobsData, ...contextJobs];
  
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>(allJobs);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [showATSDashboard, setShowATSDashboard] = useState(false);
  const [selectedJobForATS, setSelectedJobForATS] = useState<JobData | null>(null);
  
  // Mock user role - in real app, get from auth context
  const userRole = 'Candidate'; // 'Admin' or 'Candidate'

  const locations = ['All', ...Array.from(new Set(allJobs.map(job => job.location)))];
  const departments = ['All', 'Technology', 'Insurance', 'Supply Chain', 'Customer Success'];

  useEffect(() => {
    let filtered = allJobs;
    
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }
    
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(job => {
        const jobTags = job.tags.join(' ').toLowerCase();
        const dept = selectedDepartment.toLowerCase();
        return jobTags.includes(dept) || job.title.toLowerCase().includes(dept);
      });
    }
    
    setFilteredJobs(filtered);
  }, [selectedLocation, selectedDepartment, jobs]);

  const getDepartmentFromTags = (tags: string[]) => {
    if (tags.some(tag => ['QA', 'React', 'Python', 'Selenium', 'JavaScript'].includes(tag))) return 'Technology';
    if (tags.includes('Insurance')) return 'Insurance';
    if (tags.includes('Supply Chain')) return 'Supply Chain';
    if (tags.includes('Customer Success')) return 'Customer Success';
    return 'Other';
  };

  // Show Job Specific Dashboard if admin clicked on a job
  if (showATSDashboard && selectedJobForATS) {
    return (
      <JobSpecificDashboard 
        jobTitle={selectedJobForATS.title}
        onBack={() => {
          setShowATSDashboard(false);
          setSelectedJobForATS(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header - Dark & Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 text-white py-8 mb-8 rounded-xl relative"
        >
          <button
            onClick={() => navigate('/')}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Join Our Team</h1>
            <p className="text-slate-300 text-sm">Discover exciting opportunities at FluidJobs.ai</p>
          </div>
        </motion.div>

        {/* Filters - Modern & Clean */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8"
        >
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          >
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </motion.div>

        {/* Job Grid - Compact & Refined */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.jobId}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
              onClick={() => {
                // Always navigate to job detail page for candidates
                // Admin functionality should be separate
                navigate(`/careers/${job.jobId}`);
              }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:border-indigo-200"
            >
              <div className="relative h-32 overflow-hidden">
                <motion.img
                  src={job.image}
                  alt={job.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 shadow-sm">
                    {getDepartmentFromTags(job.tags)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 h-10">{job.title}</h3>
                
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                    <span>{job.experience}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="w-3 h-3 mr-1.5 text-gray-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Building className="w-3 h-3 mr-1.5 text-gray-400" />
                    <span>{job.workplace}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {job.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-md font-medium border border-indigo-100"
                    >
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-md">+{job.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedJob(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{selectedJob.location}</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{selectedJob.experience}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedJob.description.overview}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Responsibilities</h3>
                      <ul className="space-y-2">
                        {selectedJob.description.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications</h3>
                      <ul className="space-y-2">
                        {selectedJob.description.qualifications.map((qual, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                  <button className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center">
                    Apply Now
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JobOpenings;