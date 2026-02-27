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
