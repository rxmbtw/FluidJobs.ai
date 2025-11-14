import React from 'react';
import { Plus, Check } from 'lucide-react';

interface ProfileStepProps {
  label: string;
  isCompleted: boolean;
  onClick: () => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ label, isCompleted, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
        isCompleted ? 'border-green-400' : 'border-gray-300'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
        isCompleted ? 'bg-green-500' : 'bg-blue-500'
      }`}>
        {isCompleted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </div>
      <span className={`ml-4 text-sm font-semibold flex-grow ${
        isCompleted ? 'text-green-600' : 'text-gray-600'
      }`}>
        {label}
      </span>
    </div>
  );
};

export default ProfileStep;
