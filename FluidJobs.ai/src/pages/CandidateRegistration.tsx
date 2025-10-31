import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CandidateRegistrationForm from '../components/CandidateRegistrationForm';
import RegistrationSuccess from '../components/RegistrationSuccess';

const CandidateRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  if (showSuccess) {
    return (
      <RegistrationSuccess 
        onContinue={() => navigate('/login', { replace: true })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateRegistrationForm
        isOpen={true}
        onClose={() => navigate('/login')}
        onSubmit={async (data) => {
          try {
            console.log('Submitting registration data:', data);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);
            
            if (response.ok) {
              setShowSuccess(true);
            } else {
              alert(result.error || 'Registration failed');
            }
          } catch (error) {
            console.error('Registration error:', error);
            alert('Network error. Please check if the backend is running.');
          }
        }}
      />
    </div>
  );
};

export default CandidateRegistration;