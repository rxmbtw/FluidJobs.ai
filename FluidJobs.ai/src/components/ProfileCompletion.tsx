import React from 'react';
import { Check, Plus } from 'lucide-react';
import { useProfileCompletion, ProfileCompletionItem } from '../hooks/useProfileCompletion';

interface ProfileCompletionProps {
  themeState: 'light' | 'dark';
  onNavigateToEdit: () => void;
  onNavigateToResume: () => void;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ 
  themeState, 
  onNavigateToEdit, 
  onNavigateToResume 
}) => {
  const { profileCompletion, loading, refreshProfileCompletion } = useProfileCompletion();

  const handleItemClick = (item: ProfileCompletionItem) => {
    if (item.completed) return;
    onNavigateToEdit();
  };

  const textColor = themeState === 'light' ? '#000000' : '#FFFFFF';

  if (loading) {
    return (
      <div className="lg:col-span-1 p-6 rounded-[25px] shadow-lg min-h-[500px] flex items-center justify-center" 
           style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1 p-6 rounded-[25px] shadow-lg min-h-[500px]" 
         style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
      <h2 className="text-2xl font-extrabold mb-2" style={{ color: textColor }}>
        Complete your profile
      </h2>
      <p className="text-sm font-semibold text-gray-600 mb-6">
        By completing your profile you can start applying to job openings in one click...
      </p>
      
      <div className="mb-6">
        <span className="text-lg font-bold" style={{ color: textColor }}>
          {profileCompletion.completionPercentage}%
        </span>
        <div className="relative w-full h-3 bg-gray-200 rounded-full mt-2">
          <div 
            className="absolute top-0 left-0 h-3 bg-blue-500 rounded-full transition-all duration-500" 
            style={{ width: `${profileCompletion.completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {profileCompletion.completedCount} of {profileCompletion.totalCount} completed
        </p>
      </div>
      
      <div className="border-t border-gray-200 pt-6 space-y-3 max-h-80 overflow-y-auto">
        {profileCompletion.items.map((item) => (
          <div 
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`flex items-center p-3 border rounded-xl transition-all hover:shadow-md ${
              item.completed 
                ? 'border-green-300 bg-green-50 cursor-default' 
                : 'border-gray-300 cursor-pointer hover:border-blue-400'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
              item.completed ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {item.completed ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <span className={`ml-4 text-sm font-semibold flex-grow ${
              item.completed ? 'text-green-700' : 'text-gray-600'
            }`}>
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {item.completed && (
              <span className="text-xs text-green-600 font-medium">✓ Done</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletion;