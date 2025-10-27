/**
 * CandidateRow component
 * Props: candidate (object with candidate details), onClick (optional handler)
 * Responsibilities: Renders a table row for a candidate, triggers detail modal on click
 * Role-based behavior: Can be extended to show different status chips or actions based on user role
 */
import React from 'react';

interface CandidateRowProps {
  candidate: {
    id: number;
    name: string;
    email: string;
    status: string;
    role: string;
  };
  onClick?: () => void;
}

const CandidateRow: React.FC<CandidateRowProps> = ({ candidate, onClick }) => (
  <tr className="hover:bg-neutral cursor-pointer" onClick={onClick}>
    <td className="py-2 px-4 font-medium">{candidate.name}</td>
    <td className="py-2 px-4">{candidate.email}</td>
    <td className="py-2 px-4">{candidate.role}</td>
    <td className="py-2 px-4">
      <span className={`px-2 py-1 rounded ${candidate.status === 'Active' ? 'bg-status-success text-white' : 'bg-status-error text-white'}`}>{candidate.status}</span>
    </td>
  </tr>
);

export default CandidateRow;
