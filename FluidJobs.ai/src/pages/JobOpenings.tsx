import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Building, X, ExternalLink, ArrowLeft } from 'lucide-react';

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
    "jobId": "15",
    "title": "Business Analyst | Motor Insurance",
    "experience": "4+ Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["Insurance", "Business Analysis", "Technology"],
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are seeking a skilled Business Analyst with strong domain expertise in Motor Insurance to join our team. View full job description in the attached PDF file.",
      "responsibilities": [
        "Gather, analyze, and document business requirements specific to motor insurance products.",
        "Work with product, operations, and IT teams to design and enhance motor insurance workflows.",
        "Translate business needs into functional and technical specifications.",
        "Support product design for new insurance offerings."
      ],
      "qualifications": [
        "4+ years' experience as a Business Analyst in Motor/General Insurance domain.",
        "Strong knowledge of Motor Insurance Domain.",
        "Experience in requirement gathering and business process mapping."
      ]
    }
  },
  {
    "jobId": "16",
    "title": "Content Analyst",
    "experience": "0-3 Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["Content", "Analysis", "Technology"],
    "image": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop",
    "description": {
      "overview": "Analyzing incoming data streams and monitoring for events. View full job description in the attached PDF file.",
      "responsibilities": [
        "Monitoring for events that can impact business operations.",
        "Reporting time-sensitive alerts based on information from open source media.",
        "Writing, editing and updating real-time reports."
      ],
      "qualifications": [
        "0-3 Years relevant experience.",
        "Excellent verbal and written communication skills in English.",
        "Ability to work in a fast-paced environment."
      ]
    }
  },
  {
    "jobId": "17",
    "title": "Data Research Analyst",
    "experience": "2+ Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["Data Analysis", "Research", "Technology"],
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are looking for a Data Research Analyst to analyze and interpret complex data. View full job description in the attached PDF file.",
      "responsibilities": [
        "Conduct data research and analysis.",
        "Prepare detailed reports and presentations.",
        "Collaborate with cross-functional teams."
      ],
      "qualifications": [
        "2+ years of experience in data analysis.",
        "Strong analytical and problem-solving skills.",
        "Proficiency in data analysis tools."
      ]
    }
  },
  {
    "jobId": "18",
    "title": "Frontend Developer",
    "experience": "4+ Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["React", "JavaScript", "Technology"],
    "image": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are looking for an experienced Frontend Developer to design and develop web applications. View full job description in the attached PDF file.",
      "responsibilities": [
        "Designing and developing web applications.",
        "Implementing UI design improvements.",
        "Collaborating with backend developers."
      ],
      "qualifications": [
        "4+ years of experience in frontend development.",
        "Experience with React, HTML, CSS, JavaScript.",
        "Strong understanding of responsive design."
      ]
    }
  },
  {
    "jobId": "19",
    "title": "Frontend Developer | Forex CFD Domain",
    "experience": "3+ Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["React", "Forex", "Technology"],
    "image": "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are seeking a Frontend Developer with Forex CFD domain expertise. View full job description in the attached PDF file.",
      "responsibilities": [
        "Develop trading platforms and financial applications.",
        "Implement real-time data visualization.",
        "Work with financial APIs and data feeds."
      ],
      "qualifications": [
        "3+ years of experience in frontend development.",
        "Knowledge of Forex/CFD trading platforms.",
        "Experience with real-time data handling."
      ]
    }
  },
  {
    "jobId": "20",
    "title": "Data Analyst - Fresher",
    "experience": "0-1 Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["Data Analysis", "Fresher", "Technology"],
    "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are looking for a fresher Data Analyst to join our team. View full job description in the attached PDF file.",
      "responsibilities": [
        "Analyze data and generate insights.",
        "Create reports and dashboards.",
        "Support data-driven decision making."
      ],
      "qualifications": [
        "Bachelor's degree in relevant field.",
        "Basic knowledge of data analysis tools.",
        "Strong analytical skills."
      ]
    }
  },
  {
    "jobId": "21",
    "title": "Manager Talent Acquisition",
    "experience": "6+ Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["HR", "Recruitment", "Technology"],
    "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are seeking an experienced Manager for Talent Acquisition. View full job description in the attached PDF file.",
      "responsibilities": [
        "Lead talent acquisition strategy.",
        "Manage recruitment team.",
        "Build strong candidate pipelines."
      ],
      "qualifications": [
        "6+ years of experience in talent acquisition.",
        "Strong leadership and management skills.",
        "Experience in tech recruitment."
      ]
    }
  },
  {
    "jobId": "22",
    "title": "Python Fullstack Developer",
    "experience": "5+ Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["Python", "Fullstack", "Technology"],
    "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are looking for a Python Fullstack Developer with strong backend and frontend skills. View full job description in the attached PDF file.",
      "responsibilities": [
        "Develop and maintain fullstack applications.",
        "Work with Python frameworks like Django/Flask.",
        "Implement RESTful APIs and frontend interfaces."
      ],
      "qualifications": [
        "5+ years of experience in fullstack development.",
        "Strong Python programming skills.",
        "Experience with modern frontend frameworks."
      ]
    }
  },
  {
    "jobId": "23",
    "title": "QA Automation Selenium",
    "experience": "2+ Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["QA", "Automation", "Selenium"],
    "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are looking for a QA Automation Engineer with Selenium expertise. View full job description in the attached PDF file.",
      "responsibilities": [
        "Write and execute automated test scripts.",
        "Maintain automated regression suites.",
        "Collaborate with development teams."
      ],
      "qualifications": [
        "2+ years of experience in QA automation.",
        "Strong hands-on experience with Selenium.",
        "Knowledge of Java and testing frameworks."
      ]
    }
  },
  {
    "jobId": "24",
    "title": "QA Engineer | Insurance",
    "experience": "2+ Years",
    "location": "Remote, Hybrid",
    "workplace": "Remote/Hybrid",
    "tags": ["QA", "Insurance", "Technology"],
    "image": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    "description": {
      "overview": "We are seeking a QA Engineer with insurance domain knowledge. View full job description in the attached PDF file.",
      "responsibilities": [
        "Develop and execute test scenarios.",
        "Ensure quality of insurance software solutions.",
        "Document test results and defects."
      ],
      "qualifications": [
        "2+ years of software testing experience.",
        "Experience in Insurance Domain.",
        "Strong communication skills."
      ]
    }
  }
];

interface JobOpeningsProps {
  onJobSelect?: (jobTitle: string) => void;
}

const JobOpenings: React.FC<JobOpeningsProps> = ({ onJobSelect }) => {
  const { jobs } = useJobs();
  
  const [dbJobs, setDbJobs] = useState<JobData[]>([]);

  // Fetch jobs from database
  useEffect(() => {
    const fetchDbJobs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/jobs-enhanced/list');
        const data = await response.json();
        
        if (data.success) {
          const formattedJobs: JobData[] = data.jobs.map((job: any) => ({
            jobId: job.job_id.toString(),
            title: job.job_title,
            experience: `${job.min_experience}-${job.max_experience} years`,
            location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations,
            workplace: job.mode_of_job,
            tags: Array.isArray(job.skills) ? job.skills.split(', ').slice(0, 3) : [job.job_domain],
            image: job.selected_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
            description: {
              overview: job.job_description || 'Join our team and contribute to exciting projects.',
              responsibilities: [
                'Work on innovative projects',
                'Collaborate with cross-functional teams',
                'Drive technical excellence',
                'Contribute to product development'
              ],
              qualifications: [
                `${job.min_experience}-${job.max_experience} years of experience`,
                'Strong communication skills',
                'Team collaboration abilities'
              ]
            }
          }));
          setDbJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs from database:', error);
      }
    };

    fetchDbJobs();
  }, []);
  
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
  
  // Combine database jobs, context jobs, and static jobs (database jobs first)
  const allJobs = [...dbJobs, ...contextJobs, ...jobsData];
  
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

  // Listen for new job creation events
  useEffect(() => {
    const handleJobCreated = async () => {
      // Refetch jobs from database
      try {
        const response = await fetch('http://localhost:8000/api/jobs-enhanced/list');
        const data = await response.json();
        
        if (data.success) {
          const formattedJobs: JobData[] = data.jobs.map((job: any) => ({
            jobId: job.job_id.toString(),
            title: job.job_title,
            experience: `${job.min_experience}-${job.max_experience} years`,
            location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations,
            workplace: job.mode_of_job,
            tags: Array.isArray(job.skills) ? job.skills.split(', ').slice(0, 3) : [job.job_domain],
            image: job.selected_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
            description: {
              overview: job.job_description || 'Join our team and contribute to exciting projects.',
              responsibilities: [
                'Work on innovative projects',
                'Collaborate with cross-functional teams',
                'Drive technical excellence',
                'Contribute to product development'
              ],
              qualifications: [
                `${job.min_experience}-${job.max_experience} years of experience`,
                'Strong communication skills',
                'Team collaboration abilities'
              ]
            }
          }));
          setDbJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Error refetching jobs:', error);
      }
    };
    
    window.addEventListener('jobCreated', handleJobCreated);
    return () => window.removeEventListener('jobCreated', handleJobCreated);
  }, []);

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
                if (onJobSelect) {
                  onJobSelect(job.title);
                } else {
                  setSelectedJob(job);
                }
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