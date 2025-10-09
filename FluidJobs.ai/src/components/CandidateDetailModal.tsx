/**
 * CandidateDetailModal component
 * Props: candidate (object with candidate details), onClose (handler)
 * Responsibilities: Shows expanded candidate info in a modal
 * Role-based behavior: Can be extended to show different actions based on user role
 */
import React from 'react';

interface CandidateDetailModalProps {
  candidate: {
    id: number;
    name: string;
    email: string;
    status: string;
    role: string;
    bio: string;
  };
  onClose: () => void;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ candidate, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded p-6 w-full max-w-lg relative">
      <button className="absolute top-2 right-2" onClick={onClose}>✕</button>
      <h2 className="text-xl font-bold mb-2">{candidate.name}</h2>
      <p className="mb-1">Email: {candidate.email}</p>
      <p className="mb-1">Role: {candidate.role}</p>
      <p className="mb-1">Status: {candidate.status}</p>
      <p className="mb-4">{candidate.bio}</p>
    </div>
  </div>
);

export default CandidateDetailModal;
