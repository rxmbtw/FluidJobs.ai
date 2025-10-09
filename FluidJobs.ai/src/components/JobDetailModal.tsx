/**
 * JobDetailModal component
 * Props: job (object with job details), onClose (handler)
 * Responsibilities: Shows detailed job info in a modal, allows candidate to apply
 * Role-based behavior: Shows Apply button only if user role is Candidate
 */
import React from 'react';
import { useAuth } from '../contexts/AuthProvider';

interface JobDetailModalProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    status: string;
    description: string;
  };
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose }) => {
  const { user } = useAuth();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-2">{job.title}</h2>
        <p className="mb-1">Company: {job.company}</p>
        <p className="mb-1">Location: {job.location}</p>
        <p className="mb-1">Type: {job.type}</p>
        <p className="mb-1">Status: {job.status}</p>
        <p className="mb-4">{job.description}</p>
        {user?.role === 'Candidate' && (
          <button className="bg-primary text-white px-4 py-2 rounded">Apply</button>
        )}
      </div>
    </div>
  );
};

export default JobDetailModal;
