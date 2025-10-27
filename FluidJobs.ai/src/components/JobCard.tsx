/**
 * JobCard component
 * Props: job (object with job details), onClick (optional handler)
 * Responsibilities: Displays job info as a card, triggers detail modal on click
 * Role-based behavior: Can be extended to show different actions or info based on user role
 */
import React from 'react';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    status: string;
  };
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => (
  <div className="bg-white rounded shadow p-4 mb-4 cursor-pointer" onClick={onClick}>
    <h3 className="text-lg font-bold">{job.title}</h3>
    <p className="text-sm text-gray-600">{job.company} &mdash; {job.location}</p>
    <div className="flex gap-2 mt-2">
      <span className="px-2 py-1 bg-primary text-white rounded">{job.type}</span>
      <span className="px-2 py-1 bg-status-success text-white rounded">{job.status}</span>
    </div>
  </div>
);

export default JobCard;
