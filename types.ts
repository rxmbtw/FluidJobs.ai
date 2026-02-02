
export enum InterviewStage {
  SCREENING = 'Screening',
  CV_SHORTLISTED = 'CV Shortlisted',
  ASSIGNMENT = 'Assignment',
  L1 = 'Level 1 Technical',
  L2 = 'Level 2 Technical',
  L3 = 'Level 3 Technical',
  L4 = 'Final Technical',
  HR_ROUND = 'HR Round',
  MANAGEMENT_ROUND = 'Management Round',
  OFFER_EXTENDED = 'Offer Extended',
  JOINED = 'Joined',
  REJECTED = 'Rejected',
  ON_HOLD = 'On Hold'
}

export interface InterviewLevel {
  interviewer: string;
  date: string;
  feedbackDate: string;
  status: 'Pending' | 'Scheduled' | 'Cleared' | 'Rejected' | 'On Hold';
  score?: number;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  source: string;
  currentStage: InterviewStage;
  appliedDate: string;
  lastUpdateDate: string;
  experience: string;
  location: string;
  
  // CV Tracking
  cvStatusRecruiter: 'Pending' | 'Shortlisted' | 'Rejected';
  cvStatusHM: 'Pending' | 'Shortlisted' | 'Rejected';
  
  // Assignment
  assignmentDate?: string;
  assignmentStatus?: 'Pending' | 'Sent' | 'Submitted' | 'Evaluated';
  assignmentScore?: number;
  
  // Interview Levels
  interviews: {
    l1: InterviewLevel;
    l2: InterviewLevel;
    l3: InterviewLevel;
    l4: InterviewLevel;
    hr: InterviewLevel;
    management: InterviewLevel;
  };
  
  // Finance/Offer
  ctc: {
    current: number;
    expected: number;
    currency: string;
  };
  noticePeriod: string;
  offerReleaseDate?: string;
  offerAcceptDate?: string;
  offerDeclineDate?: string;
  
  // Joining
  joiningDate?: string;
  joiningAging?: number; // Days from offer to joining
  
  comments: string[];
  resumeUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Closed' | 'Draft';
  openings: number;
  filled: number;
  location: string;
}

export interface Stats {
  totalCandidates: number;
  activeApplications: number;
  hiresThisMonth: number;
  rejectedApplications: number;
  avgTimeToHire: number;
}
