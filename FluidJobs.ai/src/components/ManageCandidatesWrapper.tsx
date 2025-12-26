import React from 'react';
import ManageCandidates from './ManageCandidates';

const ManageCandidatesWrapper: React.FC<{ isSuperAdmin?: boolean }> = ({ isSuperAdmin = false }) => {
  return (
    <div className="h-full overflow-hidden">
      <ManageCandidates isSuperAdmin={isSuperAdmin} />
    </div>
  );
};

export default ManageCandidatesWrapper;