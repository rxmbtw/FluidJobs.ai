import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Building, Check } from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthProvider';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUserRole } = useAuth();
  const navigate = useNavigate();

  const roleOptions: RoleOption[] = [
    {
      id: 'Candidate',
      title: "I'm looking for a job",
      description: 'Find opportunities and manage your applications',
      icon: Search
    },
    {
      id: 'Admin',
      title: "I'm hiring talent",
      description: 'Post jobs and manage recruitment processes',
      icon: Users
    },
    {
      id: 'Client',
      title: "I represent a company",
      description: 'Connect with talent for projects and roles',
      icon: Building
    }
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      if (user) {
        await updateUserRole(selectedRole);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to update role:', error);
      // Navigate anyway to avoid blocking user
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <img 
                src="/images/2024-04-04.webp" 
                alt="FluidJobs.ai Logo" 
                className="w-8 h-8 object-cover rounded-lg"
              />
            </div>
            <span className="font-bold text-indigo-600 text-2xl">FluidJobs.ai</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-xl text-gray-600">What brings you here?</p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-4 mb-8">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold transition-colors ${
                      isSelected ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {role.title}
                    </h3>
                    <p className={`text-sm transition-colors ${
                      isSelected ? 'text-indigo-700' : 'text-gray-600'
                    }`}>
                      {role.description}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
            selectedRole && !loading
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Setting up your dashboard...</span>
            </div>
          ) : (
            'Continue to Dashboard'
          )}
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;