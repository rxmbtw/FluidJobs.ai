export const mockCandidates = [
  {
    id: 1,
    name: 'Harper Taylor',
    avatarUrl: 'https://placehold.co/32x32',
    address: '3343 Chapel Hills Pkwy, Fultondale, AL 35068',
    jobPosition: '3D Animator',
    university: 'Hofstra University',
    status: 'Interviewing'
  },
  {
    id: 2,
    name: 'Priya Patel',
    avatarUrl: 'https://placehold.co/32x32',
    address: '1234 Tech Street, San Francisco, CA 94105',
    jobPosition: 'Senior Frontend Developer',
    university: 'Stanford University',
    status: 'Hired'
  },
  {
    id: 3,
    name: 'Marcus Johnson',
    avatarUrl: 'https://placehold.co/32x32',
    address: '5678 Innovation Ave, Austin, TX 78701',
    jobPosition: 'Product Manager',
    university: 'University of Texas',
    status: 'Rejected'
  },
  {
    id: 4,
    name: 'Sarah Chen',
    avatarUrl: 'https://placehold.co/32x32',
    address: '9012 Design Blvd, New York, NY 10001',
    jobPosition: 'UX Designer',
    university: 'NYU',
    status: 'Interviewing'
  },
  {
    id: 5,
    name: 'David Rodriguez',
    avatarUrl: 'https://placehold.co/32x32',
    address: '3456 Code Lane, Seattle, WA 98101',
    jobPosition: 'Backend Developer',
    university: 'University of Washington',
    status: 'Hired'
  }
];

export const mockActivities = [
  {
    id: 1,
    type: 'application' as const,
    primaryText: 'Priya Patel applied for',
    secondaryText: 'Senior Frontend Developer',
    time: '2 hours ago'
  },
  {
    id: 2,
    type: 'interview' as const,
    primaryText: 'Harper Taylor scheduled interview for',
    secondaryText: '3D Animator position',
    time: '4 hours ago'
  },
  {
    id: 3,
    type: 'hire' as const,
    primaryText: 'Sarah Chen was hired as',
    secondaryText: 'UX Designer',
    time: '1 day ago'
  },
  {
    id: 4,
    type: 'application' as const,
    primaryText: 'Marcus Johnson applied for',
    secondaryText: 'Product Manager',
    time: '2 days ago'
  },
  {
    id: 5,
    type: 'interview' as const,
    primaryText: 'David Rodriguez completed interview for',
    secondaryText: 'Backend Developer',
    time: '3 days ago'
  }
];