import React, { useEffect } from 'react';
import ManageCandidates from './ManageCandidates';

const ManageCandidatesWrapper: React.FC<{ isSuperAdmin?: boolean }> = ({ isSuperAdmin = false }) => {
  useEffect(() => {
    const handleOpenCandidateProfile = (event: CustomEvent) => {
      const { candidateId, candidateName } = event.detail;
      console.log('ManageCandidatesWrapper received event:', { candidateId, candidateName });
      
      // Store both candidate ID and name in sessionStorage
      if (candidateId) {
        sessionStorage.setItem('openCandidateId', candidateId.toString());
      }
      
      // Also try to get candidate name from the event if available
      if (candidateName) {
        sessionStorage.setItem('openCandidateName', candidateName);
      }
    };

    window.addEventListener('openCandidateProfile', handleOpenCandidateProfile as EventListener);
    return () => {
      window.removeEventListener('openCandidateProfile', handleOpenCandidateProfile as EventListener);
    };
  }, []);

  return (
    <div className="h-full overflow-hidden">
      <ManageCandidates isSuperAdmin={isSuperAdmin} />
    </div>
  );
};

export default ManageCandidatesWrapper;