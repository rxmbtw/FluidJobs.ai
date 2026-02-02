
import React from 'react';

export const THEME_COLORS = {
  primary: 'blue-600',
  secondary: 'slate-600',
  accent: 'indigo-500',
  success: 'emerald-500',
  danger: 'rose-500',
  warning: 'amber-500',
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Summary', icon: <i className="fa-solid fa-chart-line"></i> },
  { id: 'pipeline', label: 'Pipeline Board', icon: <i className="fa-solid fa-kanban"></i> },
  { id: 'candidates', label: 'Candidates', icon: <i className="fa-solid fa-users"></i> },
  { id: 'stage_analytics', label: 'Interview Analytics', icon: <i className="fa-solid fa-layer-group"></i> },
  { id: 'job_settings', label: 'Job Settings', icon: <i className="fa-solid fa-cog"></i> },
];

export const STATUS_COLORS: Record<string, string> = {
  'Screening': 'bg-blue-100 text-blue-700',
  'CV Shortlisted': 'bg-blue-100 text-blue-700',
  'Assignment': 'bg-blue-100 text-blue-700',
  'Level 1 Technical': 'bg-blue-100 text-blue-700',
  'Level 2 Technical': 'bg-blue-100 text-blue-700',
  'Level 3 Technical': 'bg-blue-100 text-blue-700',
  'Level 4 Technical': 'bg-blue-100 text-blue-700',
  'HR Round': 'bg-yellow-100 text-yellow-700',
  'Management Round': 'bg-yellow-100 text-yellow-700',
  'Offer Extended': 'bg-green-100 text-green-700',
  'Joined': 'bg-green-600 text-white',
  'Rejected': 'bg-red-100 text-red-700',
  'On Hold': 'bg-gray-200 text-gray-700',
};

export const METADATA = {
  roles: ['Software Engineer', 'Product Manager', 'UX Designer', 'DevOps', 'QA Engineer'],
  locations: ['Remote', 'Hybrid', 'Austin, TX', 'New York, NY', 'San Francisco, CA'],
  departments: ['Engineering', 'Product', 'Design', 'Operations', 'HR'],
  recruiters: ['Alex Thompson', 'Sarah Parker', 'James Wilson', 'Elena Gilbert'],
  hiringManagers: ['Mark Chen', 'David Blake', 'Alice Wong', 'Jason Bourne'],
  sources: ['LinkedIn', 'Referral', 'Indeed', 'Career Page', 'Agency'],
};
