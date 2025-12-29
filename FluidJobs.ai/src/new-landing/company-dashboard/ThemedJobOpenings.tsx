import React from 'react';
import JobOpenings from '../../pages/JobOpenings';

interface ThemedJobOpeningsProps {
  onJobSelect: (jobTitle: string) => void;
}

const ThemedJobOpenings: React.FC<ThemedJobOpeningsProps> = ({ onJobSelect }) => {
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <JobOpenings onJobSelect={onJobSelect} />
    </div>
  );
};

export default ThemedJobOpenings;
