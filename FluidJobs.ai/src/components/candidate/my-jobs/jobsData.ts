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
  matchScore?: number;
  // Additional fields from job creation form
  modeOfJob?: string; // Work From Home/Hybrid/On-site
  noOfOpenings?: number;
  minExperience?: string;
  maxExperience?: string;
  experienceRange?: string;
  selectedImage?: string;
  showSalaryToCandidate?: boolean;
  registrationOpeningDate?: string;
  registrationClosingDate?: string;
  minSalary?: number;
  maxSalary?: number;
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
    skills: ['Python', 'C/C++', 'Java', 'Selenium'],
    modeOfJob: 'Hybrid',
    noOfOpenings: 3,
    minExperience: '2',
    maxExperience: '5',
    experienceRange: '2-5 years',
    showSalaryToCandidate: true,
    registrationOpeningDate: '2025-10-25',
    registrationClosingDate: '2025-11-25',
    selectedImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
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
    skills: ['Python', 'Java 8', 'AWS', 'Spring Boot'],
    modeOfJob: 'On-site',
    noOfOpenings: 2,
    minExperience: '2',
    maxExperience: '4',
    experienceRange: '2-4 years',
    showSalaryToCandidate: true,
    registrationOpeningDate: '2025-09-25',
    registrationClosingDate: '2025-10-25',
    selectedImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop'
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
    skills: ['Python', 'Django', 'FastAPI', 'React'],
    modeOfJob: 'Work From Home',
    noOfOpenings: 1,
    minExperience: '5',
    maxExperience: '8',
    experienceRange: '5-8 years',
    showSalaryToCandidate: true,
    registrationOpeningDate: '2025-09-20',
    registrationClosingDate: '2025-10-20',
    selectedImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop'
  }
];
