import React from 'react';
import JobCreationForm from '../../components/JobCreationForm';

interface ThemedJobPublishingProps {
  onBack: () => void;
}

const ThemedJobPublishing: React.FC<ThemedJobPublishingProps> = ({ onBack }) => {
  return <JobCreationForm onBack={onBack} />;
};

export default ThemedJobPublishing;
