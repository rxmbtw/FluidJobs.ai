export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  industry: string;
  postedDate: string;
  registrationDeadline?: string;
  isEligible: boolean;
  companyLogo?: string;
  description?: string;
  skills?: string[];
}

// Real job data from the careers page
export const mockJobs: Job[] = [
  {
    id: 'BA_MOTOR_01',
    title: 'Business Analyst | Motor Insurance',
    company: 'FluidJobs.ai',
    location: 'Mumbai',
    salary: 'INR 8,00,000 - 15,00,000',
    type: 'Full-time',
    industry: 'Insurance',
    postedDate: '2 days ago',
    registrationDeadline: '30 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['Insurance', 'Business Analysis', 'IRDAI']
  },
  {
    id: 'CA_NEWS_02',
    title: 'Content Analyst',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 4,00,000 - 7,00,000',
    type: 'Full-time',
    industry: 'Media & Communications',
    postedDate: '3 days ago',
    registrationDeadline: '25 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['Content', 'Analysis', 'Supply Chain', 'Journalism']
  },
  {
    id: 'QA_AUTO_03',
    title: 'QA Automation Selenium',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 6,00,000 - 12,00,000',
    type: 'Full-time',
    industry: 'IT / Computers - Software',
    postedDate: '1 day ago',
    registrationDeadline: '28 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['QA', 'Automation', 'Selenium', 'Java']
  },
  {
    id: 'QA_INSURE_04',
    title: 'QA Engineer | Insurance',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 5,00,000 - 10,00,000',
    type: 'Full-time',
    industry: 'Insurance',
    postedDate: '4 days ago',
    registrationDeadline: '20 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['QA', 'Manual Testing', 'Insurance']
  },
  {
    id: 'AS_L2_PY_05',
    title: 'Application Support Engineer | L2 | Python',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 6,00,000 - 11,00,000',
    type: 'Full-time',
    industry: 'IT Product & Services',
    postedDate: '5 days ago',
    isEligible: false,
    skills: ['Support', 'Python', 'SaaS', 'AWS']
  },
  {
    id: 'BA_PROP_06',
    title: 'Business Analyst | Property Insurance',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 7,00,000 - 13,00,000',
    type: 'Full-time',
    industry: 'Insurance',
    postedDate: '6 days ago',
    registrationDeadline: '15 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['Insurance', 'Business Analysis', 'Project Management']
  },
  {
    id: 'CSM_SCM_07',
    title: 'Customer Success Manager | Supply Chain',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 12,00,000 - 20,00,000',
    type: 'Full-time',
    industry: 'Supply Chain',
    postedDate: '3 days ago',
    registrationDeadline: '22 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['Customer Success', 'Supply Chain', 'SaaS']
  },
  {
    id: 'CSS_SCM_08',
    title: 'Customer Success Specialist | Supply Chain',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 8,00,000 - 14,00,000',
    type: 'Full-time',
    industry: 'Supply Chain',
    postedDate: '4 days ago',
    registrationDeadline: '18 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['Customer Success', 'Supply Chain', 'Analysis']
  },
  {
    id: 'NA_SCM_09',
    title: 'News Analyst | Supply Chain',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 5,00,000 - 9,00,000',
    type: 'Full-time',
    industry: 'Media & Communications',
    postedDate: '2 days ago',
    registrationDeadline: '25 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['Analysis', 'Supply Chain', 'Media', 'Research']
  },
  {
    id: 'FD_REACT_10',
    title: 'Frontend Developer',
    company: 'FluidJobs.ai',
    location: 'Pune',
    salary: 'INR 10,00,000 - 18,00,000',
    type: 'Full-time',
    industry: 'IT / Computers - Software',
    postedDate: '1 day ago',
    registrationDeadline: '30 Nov, 2025 - 11:59 PM',
    isEligible: true,
    skills: ['React', 'AngularJS', 'JavaScript', 'HTML/CSS']
  }
];

export const jobService = {
  async getAllJobs(): Promise<Job[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Try to fetch from backend first
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/jobs`);
      
      if (response.ok) {
        const jobs = await response.json();
        return jobs;
      }
    } catch (error) {
      console.log('Backend not available, using mock data');
    }
    
    // Fallback to mock data
    return mockJobs;
  },

  async getJobById(id: string): Promise<Job | null> {
    const jobs = await this.getAllJobs();
    return jobs.find(job => job.id === id) || null;
  },

  async getJobStats(): Promise<{ total: number; eligible: number; applied: number; offers: number }> {
    const jobs = await this.getAllJobs();
    return {
      total: jobs.length,
      eligible: jobs.filter(job => job.isEligible).length,
      applied: 0, // This would come from user application data
      offers: 0   // This would come from user offer data
    };
  },

  async getEligibleJobs(): Promise<Job[]> {
    const jobs = await this.getAllJobs();
    return jobs.filter(job => job.isEligible);
  },

  async searchJobs(query: string, filters?: {
    industry?: string[];
    location?: string[];
    type?: string[];
  }): Promise<Job[]> {
    const jobs = await this.getAllJobs();
    
    return jobs.filter(job => {
      const matchesQuery = !query || 
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query.toLowerCase()));
      
      const matchesIndustry = !filters?.industry?.length || 
        filters.industry.includes(job.industry);
      
      const matchesLocation = !filters?.location?.length || 
        filters.location.some(loc => job.location.includes(loc));
      
      const matchesType = !filters?.type?.length || 
        filters.type.includes(job.type);
      
      return matchesQuery && matchesIndustry && matchesLocation && matchesType;
    });
  }
};