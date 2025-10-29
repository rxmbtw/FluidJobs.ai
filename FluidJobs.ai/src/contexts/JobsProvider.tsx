import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import jobsEnhancedService from '../services/jobsEnhancedService';

interface JobOpening {
  jobId: string;
  title: string;
  description: string;
  status: 'Published' | 'Draft' | 'Closed';
  publishedDate: string;
  stageCount: number;
  candidatesCount: number;
  location: string;
  employmentType: string;
  experience: string;
  salaryRange: string;
  domain: string;
  skills: string[];
  mode: string;
  workplace?: string;
  tags?: string[];
  image?: string;
  closingDate: string;
}

interface JobsContextType {
  jobs: JobOpening[];
  loading: boolean;
  addJob: (job: any) => void;
  refreshJobs: () => Promise<void>;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const result = await jobsEnhancedService.getJobs();
        if (result.success && result.jobs) {
          const formattedJobs = result.jobs.map(job => ({
            jobId: job.job_id?.toString() || `JOB_${Date.now()}`,
            title: job.job_title,
            description: job.job_description,
            status: job.status as 'Published' | 'Draft' | 'Closed',
            publishedDate: job.published_date,
            stageCount: 3,
            candidatesCount: 0,
            location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations || '',
            employmentType: job.job_type,
            experience: `${job.min_experience}-${job.max_experience} years`,
            salaryRange: job.min_salary && job.max_salary ? `₹${parseInt(job.min_salary)/100000}-${parseInt(job.max_salary)/100000} LPA` : 'Competitive',
            domain: job.job_domain,
            skills: Array.isArray(job.skills) ? job.skills : [],
            mode: job.mode_of_job,
            workplace: job.mode_of_job,
            tags: [job.job_domain, ...(Array.isArray(job.skills) ? job.skills.slice(0, 3) : [])],
            image: job.selected_image,
            closingDate: job.closing_date
          }));
          setJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const addJob = (jobData: any) => {
    const newJob: JobOpening = {
      ...jobData,
      jobId: jobData.jobId || `JOB${String(jobs.length + 1).padStart(3, '0')}`,
      publishedDate: new Date().toISOString().split('T')[0],
      stageCount: 3,
      candidatesCount: 0,
      status: 'Published'
    };
    
    setJobs(prev => [newJob, ...prev]);
  };

  const refreshJobs = async () => {
    try {
      const result = await jobsEnhancedService.getJobs();
      if (result.success && result.jobs) {
        const formattedJobs = result.jobs.map(job => ({
          jobId: job.job_id?.toString() || `JOB_${Date.now()}`,
          title: job.job_title,
          description: job.job_description,
          status: job.status as 'Published' | 'Draft' | 'Closed',
          publishedDate: job.published_date,
          stageCount: 3,
          candidatesCount: 0,
          location: Array.isArray(job.locations) ? job.locations.join(', ') : job.locations || '',
          employmentType: job.job_type,
          experience: `${job.min_experience}-${job.max_experience} years`,
          salaryRange: job.min_salary && job.max_salary ? `₹${parseInt(job.min_salary)/100000}-${parseInt(job.max_salary)/100000} LPA` : 'Competitive',
          domain: job.job_domain,
          skills: Array.isArray(job.skills) ? job.skills : [],
          mode: job.mode_of_job,
          workplace: job.mode_of_job,
          tags: [job.job_domain, ...(Array.isArray(job.skills) ? job.skills.slice(0, 3) : [])],
          image: job.selected_image,
          closingDate: job.closing_date
        }));
        setJobs(formattedJobs);
      }
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  };

  return (
    <JobsContext.Provider value={{ jobs, loading, addJob, refreshJobs }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) throw new Error('useJobs must be used within JobsProvider');
  return context;
};