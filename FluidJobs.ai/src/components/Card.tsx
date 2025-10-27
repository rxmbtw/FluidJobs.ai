import React from 'react';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded shadow p-4 ${className}`}>{children}</div>
);

export default Card;
