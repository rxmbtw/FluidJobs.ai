import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Building, ExternalLink, Briefcase } from 'lucide-react';
import { useJobs } from '../contexts/JobsProvider';

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

const staticJobsData: JobData[] = [
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

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs } = useJobs();

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
  const allJobs = [...staticJobsData, ...contextJobs];
  
  const job = allJobs.find(j => j.jobId === jobId);

  if (!job) {
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

  const handleApplyNow = () => {
    // Redirect to login/signup with job context
    navigate(`/login?jobId=${job.jobId}&returnTo=${encodeURIComponent(`/careers/${job.jobId}`)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Job Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-8">
          <div className="relative h-64 overflow-hidden rounded-2xl mb-8">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${job.image})` }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            
            <div className="relative z-10 h-full flex items-center px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white"
              >
                <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
                <div className="flex flex-wrap gap-6 text-white/90 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    {job.experience}
                  </div>
                  <div className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    {job.workplace}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium border border-white/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Content */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-3">
            <Briefcase className="w-5 h-5 mr-3 text-indigo-600" />
            Job Description
          </h2>
          <p className="text-gray-700 leading-relaxed text-base mb-6">{job.description.overview}</p>
          
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-5 bg-indigo-500 rounded-full mr-3"></div>
            Key Responsibilities
          </h3>
          <ul className="space-y-3 text-gray-700 text-sm mb-6">
            {job.description.responsibilities.map((responsibility, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                <span className="leading-relaxed">{responsibility}</span>
              </li>
            ))}
          </ul>
          
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-5 bg-green-500 rounded-full mr-3"></div>
            Qualifications & Requirements
          </h3>
          <ul className="space-y-3 text-gray-700 text-sm">
            {job.description.qualifications.map((qualification, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                <span className="leading-relaxed">{qualification}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Apply Now Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-4 mt-3 text-center text-white shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Join Our Team?</h3>
          <p className="text-indigo-100 mb-6 text-lg">
            Take the next step in your career and apply for this exciting opportunity.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApplyNow}
            className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center mx-auto shadow-lg"
          >
            Apply Now
            <ExternalLink className="w-5 h-5 ml-2" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetailPage;