import React from 'react';

const Tag: React.FC<{ label: string; color?: string }> = ({ label, color = 'bg-neutral-dark text-white' }) => (
  <span className={`px-2 py-1 rounded ${color}`}>{label}</span>
);

export default Tag;
