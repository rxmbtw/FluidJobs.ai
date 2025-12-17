import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Building, X, ExternalLink, ArrowLeft } from 'lucide-react';


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



interface JobOpeningsProps {
  onJobSelect?: (jobTitle: string) => void;
}

const JobOpenings: React.FC<JobOpeningsProps> = ({ onJobSelect }) => {
  
  const [dbJobs, setDbJobs] = useState<JobData[]>([]);

  // Fetch jobs from database
  useEffect(() => {
    const fetchDbJobs = async () => {
      try {
        console.log('Fetching jobs from API...');
        const response = await fetch('http://localhost:8000/api/jobs-enhanced/');
        const data = await response.json();
        console.log('API Response:', data);
        
        if (Array.isArray(data)) {
          console.log('Data is array, mapping jobs...');
          const formattedJobs: JobData[] = data.map((job: any) => ({
            jobId: job.id,
            title: job.title,
            experience: '2-5 years',
            location: job.location,
            workplace: job.type,
            tags: ['Technology'],
            image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
            description: {
              overview: 'Join our team and contribute to exciting projects.',
              responsibilities: [
                'Work on innovative projects',
                'Collaborate with cross-functional teams',
                'Drive technical excellence',
                'Contribute to product development'
              ],
              qualifications: [
                '2-5 years of experience',
                'Strong communication skills',
                'Team collaboration abilities'
              ]
            }
          }));
          setDbJobs(formattedJobs);
          console.log('Formatted jobs:', formattedJobs);
          console.log('Available job IDs:', formattedJobs.map(job => job.jobId));
        } else {
          console.log('Data is not an array:', typeof data);
        }
      } catch (error) {
        console.error('Error fetching jobs from database:', error);
      }
    };

    fetchDbJobs();
  }, []);
  
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [showATSDashboard, setShowATSDashboard] = useState(false);
  const [selectedJobForATS, setSelectedJobForATS] = useState<JobData | null>(null);
  
  // Mock user role - in real app, get from auth context
  const userRole = 'Candidate'; // 'Admin' or 'Candidate'

  const locations = ['All', ...Array.from(new Set(dbJobs.map(job => job.location)))];
  const departments = ['All', 'Technology', 'Insurance', 'Supply Chain', 'Customer Success'];

  useEffect(() => {
    let filtered = dbJobs;
    
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
  }, [selectedLocation, selectedDepartment, dbJobs]);

  // Listen for new job creation events
  useEffect(() => {
    const handleJobCreated = async () => {
      // Refetch jobs from database
      try {
        const response = await fetch('http://localhost:8000/api/jobs-enhanced/');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const formattedJobs: JobData[] = data.map((job: any) => ({
            jobId: job.id,
            title: job.title,
            experience: '2-5 years',
            location: job.location,
            workplace: job.type,
            tags: ['Technology'],
            image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop',
            description: {
              overview: 'Join our team and contribute to exciting projects.',
              responsibilities: [
                'Work on innovative projects',
                'Collaborate with cross-functional teams',
                'Drive technical excellence',
                'Contribute to product development'
              ],
              qualifications: [
                '2-5 years of experience',
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

  // Handle job updates from dashboard
  const handleJobUpdate = (updatedJob: any) => {
    // Create updated job object with all fields
    const createUpdatedJob = (job: JobData) => ({
      ...job,
      title: updatedJob.title || job.title,
      workplace: updatedJob.jobType || job.workplace,
      location: updatedJob.location || job.location,
      tags: updatedJob.skills ? [updatedJob.industry, ...updatedJob.skills.slice(0, 2)] : [updatedJob.industry || job.tags[0], ...job.tags.slice(1)],
      description: {
        ...job.description,
        overview: updatedJob.description || job.description.overview
      }
    });
    
    // Update database jobs
    if (selectedJobForATS) {
      setDbJobs(prev => prev.map(job => 
        job.jobId === selectedJobForATS.jobId ? createUpdatedJob(job) : job
      ));
    }
    
    // Update selected job for ATS
    if (selectedJobForATS) {
      setSelectedJobForATS(prev => prev ? createUpdatedJob(prev) : null);
    }
  };

  // Show Job Specific Dashboard if admin clicked on a job
  if (showATSDashboard && selectedJobForATS) {
    console.log('Opening JobSpecificDashboard with jobId:', selectedJobForATS.jobId);
    
    return (
      <JobSpecificDashboard 
        jobTitle={selectedJobForATS.title}
        jobId={selectedJobForATS.jobId}
        onBack={() => {
          setShowATSDashboard(false);
          setSelectedJobForATS(null);
        }}
        onJobUpdate={handleJobUpdate}
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
                console.log('Clicked job:', job.jobId, job.title);
                console.log('Full job object:', job);
                console.log('Job jobId exists?', !!job.jobId);
                if (onJobSelect) {
                  onJobSelect(job.title);
                } else {
                  // For admin users, open ATS dashboard instead of modal
                  console.log('Setting selectedJobForATS with jobId:', job.jobId);
                  setSelectedJobForATS(job);
                  setShowATSDashboard(true);
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