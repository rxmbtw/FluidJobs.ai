import React from 'react';
import { useNavigate } from 'react-router-dom';
import CandidateRegistrationForm from '../components/CandidateRegistrationForm';

const CandidateRegistration: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateRegistrationForm
        isOpen={true}
        onClose={() => navigate('/login')}
        onSubmit={(data) => {
          console.log('Registration data:', data);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default CandidateRegistration;