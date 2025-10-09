import React from 'react';

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const color =
    status === 'Active' ? 'bg-status-success text-white' :
    status === 'Inactive' ? 'bg-status-error text-white' :
    'bg-neutral-dark text-white';
  return <span className={`px-2 py-1 rounded chip ${color}`}>{status}</span>;
};

export default StatusChip;
