import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Building, Calendar, ExternalLink, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useJobs } from '../contexts/JobsProvider';
import { jobService, Job } from '../services/jobService';

interface JobApplicationData {
  jobId: string;
  title: string;
  company: string;
  logo: string;
  experience: string;
  location: string;
  employmentType: string;
  costToCompany: string;
  postedTime: string;
  status: string;
  eligibility: string;
  registrationSchedule: {
    opens: string;
    closes: string;
  };
  description: {
    overview: string;
    aboutRole: string;
    responsibilities: string[];
    qualifications: string[];
  };
  aboutOrganization: string;
  eligibleCourses: string[];
  eligibilityCriteria: string[];
  selectionProcess: string[];
  otherDetails: string;
  attachment?: {
    name: string;
    url: string;
  };
}

const jobApplicationData: JobApplicationData = {
  jobId: "FLUIDJOBS_SE_001",
  title: "Software Engineer",
  company: "FluidJobs.ai",
  logo: "/images/fluidjobs-logo.png",
  experience: "Full Time",
  location: "Pune",
  employmentType: "Full Time",
  costToCompany: "CTC: INR 25,54,000",
  postedTime: "2 hours ago",
  status: "On Campus",
  eligibility: "Eligible",
  registrationSchedule: {
    opens: "01:00 PM, 28-Oct-2025",
    closes: "10:00 AM, 29-Oct-2025"
  },
  description: {
    overview: "Employment Type: Full-time",
    aboutRole: "As a Software Engineer at FluidJobs.ai, you'll be part of a high-impact team that builds tools, systems, and processes to improve the customer experience and make our products easier to support.",
    responsibilities: [
      "Automate troubleshooting and monitoring.",
      "Build dashboards and diagnostic tools.",
      "Simplify customer workflows and product usability, and",
      "Drive innovation in product support through data and automation."
    ],
    qualifications: [
      "This is a hands-on technical role designed for someone with a love for data analysis and problem solving.",
      "You'll work closely with our Engineering and Support teams to:",
      "Automate troubleshooting and monitoring.",
      "Build dashboards and diagnostic tools.",
      "Simplify customer workflows and product usability, and",
      "Drive innovation in product support through data and automation."
    ]
  },
  aboutOrganization: "FluidJobs.ai is an innovative technology company that develops AI-powered recruitment solutions. We help organizations streamline their hiring process and connect with top talent efficiently.",
  eligibleCourses: [
    "B.Tech. - CSE - Blockchain Technology",
    "B.Tech. - CSE - Big Data and Cloud Engineering",
    "B.Tech. - CSE - Artificial Intelligence & Edge Computing",
    "B.Tech. - CSE - Cloud Computing",
    "B.Tech. - Computer Science & Engineering",
    "B.Tech. - Information Technology",
    "B.Tech. - CSE - Artificial Intelligence & Analytics",
    "B.Tech. - CSE - Cyber Security and Forensic"
  ],
  eligibilityCriteria: [
    "Batch 2026 : CSE/IT",
    "Minimum 70% aggregate throughout the academic curriculum",
    "No live backlogs"
  ],
  selectionProcess: [
    "Pre-Placement Talk",
    "Assessment Test",
    "Technical Interview",
    "HR Interview"
  ],
  otherDetails: "Dear Students, Read complete job description carefully and prepare accordingly for the drive.",
  attachment: {
    name: "JD- Software Engineer...",
    url: "/attachments/software-engineer-jd.pdf"
  }
};

const JobApplicationPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const [serviceJob, setServiceJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (jobId) {
        try {
          const job = await jobService.getJobById(jobId);
          setServiceJob(job);
        } catch (error) {
          console.error('Error fetching job:', error);
        }
      }
      setLoading(false);
    };
    fetchJob();
  }, [jobId]);

  // Find the job from context or service
  const contextJob = jobs.find(job => job.jobId === jobId);
  const foundJob = serviceJob || contextJob;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!foundJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <button
            onClick={() => navigate('/careers')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Careers
          </button>
        </div>
      </div>
    );
  }
  
  // Use found job data, merging with static template
  const currentJobData = {
    ...jobApplicationData,
    jobId: ('id' in foundJob ? foundJob.id : foundJob.jobId) || jobId || '',
    title: foundJob.title,
    company: ('company' in foundJob ? foundJob.company : jobApplicationData.company),
    location: foundJob.location || 'Pune',
    employmentType: ('type' in foundJob ? foundJob.type : foundJob.employmentType) || 'Full Time',
    costToCompany: ('salary' in foundJob ? foundJob.salary : foundJob.salaryRange) || jobApplicationData.costToCompany,
    description: {
      ...jobApplicationData.description,
      overview: `Employment Type: ${('type' in foundJob ? foundJob.type : foundJob.employmentType) || 'Full-time'}`,
      aboutRole: foundJob.description || jobApplicationData.description.aboutRole
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleApplyNow = () => {
    // Handle application submission
    alert(`Application submitted for ${currentJobData.title}!`);
    // In a real app, this would submit to backend
    console.log('Applying for job:', jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute top-4 left-6">
          <button
            onClick={handleBackClick}
            className="flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Opportunity List</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 mb-8">
            {/* Job Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 border border-gray-200">
                      <img src="/images/FluidHire_logo.png" alt="FluidJobs.ai" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 mb-1">{currentJobData.title}</h1>
                      <p className="text-gray-600">{currentJobData.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-2">{currentJobData.postedTime}</p>
                    <div className="flex gap-2 justify-end">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {currentJobData.status}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {currentJobData.eligibility}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">Employment Type</h3>
                    <p className="text-gray-600">{currentJobData.employmentType}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">Location</h3>
                    <p className="text-gray-600">{currentJobData.location}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">Cost to Company</h3>
                    <p className="text-gray-600">{currentJobData.costToCompany} ›</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Description</h2>
              <div className="text-left">
                <p className="text-sm text-gray-700 mb-4 text-left">{currentJobData.description.overview}</p>
                
                <h3 className="font-semibold text-gray-900 mb-2 text-sm text-left">About the Role</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 text-left">{currentJobData.description.aboutRole}</p>
                
                <p className="text-sm text-gray-700 mb-2 text-left">You'll work closely with our Engineering and Support teams to:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {currentJobData.description.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start text-left">
                      <span className="text-gray-400 mr-2 mt-0.5">•</span>
                      <span className="text-left">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Attachment */}
            {currentJobData.attachment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">1 Attachment</h2>
                <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <FileText className="w-6 h-6 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-700">{currentJobData.attachment.name}</span>
                </div>
              </motion.div>
            )}

            {/* Eligible Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Eligible Courses</h2>
              <div className="flex flex-wrap gap-2">
                {currentJobData.eligibleCourses.map((course, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Eligibility Criteria */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Eligibility Criteria</h2>
              <div className="space-y-2 text-left">
                {currentJobData.eligibilityCriteria.map((criteria, index) => (
                  <p key={index} className="text-sm text-gray-700 text-left">{criteria}</p>
                ))}
              </div>
            </motion.div>

            {/* Selection Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Selection Process Details</h2>
              <div className="space-y-2 text-left">
                {currentJobData.selectionProcess.map((step, index) => (
                  <p key={index} className="text-sm text-gray-700 text-left">{step}</p>
                ))}
              </div>
            </motion.div>

            {/* Other Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-sm border p-6 mb-8"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-left">Other Details</h2>
              <div className="text-left">
                <p className="text-sm text-gray-700 text-left leading-relaxed">{currentJobData.otherDetails}</p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Now Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border p-4"
            >
              <button
                onClick={handleApplyNow}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Apply Now
              </button>
            </motion.div>

            {/* Registration Schedule */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-4"
            >
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide text-left">REGISTRATION SCHEDULE</h3>
              <div className="flex items-start">
                <Calendar className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs text-gray-700">Opens: {currentJobData.registrationSchedule.opens}</p>
                  <p className="text-xs text-gray-700">Closes: {currentJobData.registrationSchedule.closes}</p>
                </div>
              </div>
            </motion.div>

            {/* About Organization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-4"
            >
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide text-left">ABOUT THE ORGANISATION</h3>
              <p className="text-xs text-gray-700 leading-relaxed mb-2">
                {currentJobData.aboutOrganization}
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                ...more
              </button>
              <div className="mt-3 pt-2 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-900">Website</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationPage;