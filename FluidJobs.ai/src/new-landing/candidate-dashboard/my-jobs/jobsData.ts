export interface Job {
  id: string;
  title: string;
  postedDate: string;
  jobType: string;
  ctc: string;
  industry: string;
  location: string;
  description: string;
  skills: string[];
  companyLogo?: string;
}

export const jobsData: Job[] = [
  {
    id: 'job-1',
    title: 'QA Engineer - Insurance',
    postedDate: '30/10/2025',
    jobType: 'Full-Time',
    ctc: 'Rs.6.0L - Rs.15.0L',
    industry: 'Technology',
    location: 'Pune, Mumbai',
    description: 'FluidLive is a Technology Solutions company with modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable solutions. We are looking for an experienced QA Engineer to join our growing Insurance technology division.',
    skills: ['Python', 'C/C++', 'Java', 'Selenium']
  },
  {
    id: 'job-2',
    title: 'Software Developer Engineer (SDE)',
    postedDate: '29/09/2025',
    jobType: 'Full-Time',
    ctc: 'Rs.8.0L - Rs.9.0L',
    industry: 'Technology',
    location: 'Pune',
    description: 'We are hiring for a Software Developer Engineer (SDE) role requiring a minimum of 2 years of experience. The position highlights key skills such as Python, Java 8, AWS with the mode of work being Work From Office.',
    skills: ['Python', 'Java 8', 'AWS', 'Spring Boot']
  },
  {
    id: 'job-3',
    title: 'Python Fullstack Developer',
    postedDate: '27/09/2025',
    jobType: 'Full-Time',
    ctc: 'Rs.18.0L - Rs.18.0L',
    industry: 'Technology',
    location: 'Pune',
    description: 'We are hiring for a Python Fullstack Developer role requiring a minimum of 5 years of experience. The position highlights key skills such as Python, Django, FastAPI with the mode of work being Work From Office.',
    skills: ['Python', 'Django', 'FastAPI', 'React']
  }
];
