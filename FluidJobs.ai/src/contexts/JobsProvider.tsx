import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addJob: (job: Omit<JobOpening, 'jobId' | 'publishedDate' | 'stageCount' | 'candidatesCount' | 'status'>) => void;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<JobOpening[]>([
    {
      jobId: 'JOB001',
      title: 'Senior Python Developer',
      description: 'We are looking for an experienced Python developer to join our dynamic team.',
      status: 'Published',
      publishedDate: '2024-01-15',
      stageCount: 4,
      candidatesCount: 12,
      location: 'Pune, India',
      employmentType: 'Full-time',
      experience: '4-6 years',
      salaryRange: '₹8-12 LPA',
      domain: 'Software Development',
      skills: ['Python', 'Django', 'Flask'],
      mode: 'Hybrid',
      closingDate: '2024-02-15'
    }
  ]);

  const addJob = (jobData: Omit<JobOpening, 'jobId' | 'publishedDate' | 'stageCount' | 'candidatesCount' | 'status'>) => {
    const newJob: JobOpening = {
      ...jobData,
      jobId: `JOB${String(jobs.length + 1).padStart(3, '0')}`,
      publishedDate: new Date().toISOString().split('T')[0],
      stageCount: 3,
      candidatesCount: 0,
      status: 'Published'
    };
    
    setJobs(prev => [newJob, ...prev]);
  };

  return (
    <JobsContext.Provider value={{ jobs, addJob }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) throw new Error('useJobs must be used within JobsProvider');
  return context;
};