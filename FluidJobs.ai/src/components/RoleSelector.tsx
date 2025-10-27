import React, { useState } from 'react';
import { User, Shield } from 'lucide-react';

const RoleSelector: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleRoleSelect = async (role: string) => {
    setSelectedRole(role);
    
    // Update existing user role if logged in
    const token = sessionStorage.getItem('fluidjobs_token');
    const user = JSON.parse(sessionStorage.getItem('fluidjobs_user') || '{}');
    
    if (token && user.id) {
      try {
        const response = await fetch('http://localhost:8000/api/user/update-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role })
        });
        
        if (response.ok) {
          const updatedUser = await response.json();
          sessionStorage.setItem('fluidjobs_user', JSON.stringify(updatedUser));
          
          // Redirect based on role
          if (role === 'Admin') {
            window.location.href = '/main-unified-dashboard';
          } else {
            window.location.href = '/dashboard';
          }
        }
      } catch (error) {
        console.error('Role update failed:', error);
      }
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Switch Role:</h3>
      <div className="flex gap-2">
        <button
          onClick={() => handleRoleSelect('Candidate')}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
        >
          <User className="w-4 h-4 mr-1" />
          Candidate
        </button>
        <button
          onClick={() => handleRoleSelect('Admin')}
          className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
        >
          <Shield className="w-4 h-4 mr-1" />
          Admin
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;