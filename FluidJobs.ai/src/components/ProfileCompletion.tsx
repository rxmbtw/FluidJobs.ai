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
  const { profileCompletion, loading } = useProfileCompletion();

  const handleItemClick = (item: ProfileCompletionItem) => {
    if (item.completed) return;
    onNavigateToEdit();
  };

  const bgColor = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textPrimary = themeState === 'light' ? '#000000' : '#f9fafb';
  const textSecondary = themeState === 'light' ? '#6E6E6E' : '#9ca3af';
  const borderColor = themeState === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
  const dividerColor = themeState === 'light' ? 'rgba(0,0,0,0.29)' : 'rgba(255,255,255,0.2)';

  if (loading && profileCompletion.items.length === 0) {
    return (
      <div className="w-full max-w-[390px] mx-auto p-6 rounded-[25px] min-h-[395px] flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-5 py-5 rounded-[25px] relative flex flex-col overflow-hidden" style={{ backgroundColor: bgColor, height: '100%' }}>
      {/* Title */}
      <h2 className="text-[25px] font-extrabold leading-[29px] mb-4" style={{ fontFamily: 'Roboto, sans-serif', color: textPrimary }}>
        Complete your profile
      </h2>
      
      {/* Description */}
      <p className="text-[14px] font-semibold leading-[16px] mb-6" style={{ fontFamily: 'Roboto, sans-serif', color: textSecondary }}>
        By completing your profile you can start applying to job openings in one click...
      </p>
      
      {/* Progress */}
      <div className="mb-6">
        <span className="text-[20px] font-semibold leading-[23px]" style={{ fontFamily: 'Roboto, sans-serif', color: textPrimary }}>
          {profileCompletion.completionPercentage}%
        </span>
        <div className="relative w-full mt-3">
          <div className="w-full h-[6px] rounded-full" style={{ backgroundColor: themeState === 'light' ? '#D9D9D9' : '#374151' }}></div>
          <div 
            className="absolute top-0 left-0 h-[6px] bg-[#4285F4] rounded-full transition-all duration-500" 
            style={{ width: `${profileCompletion.completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Divider */}
      <div className="w-full h-[1px] mb-4 flex-shrink-0" style={{ backgroundColor: dividerColor }}></div>
      
      {/* Items - Scrollable */}
      <div className="space-y-[18px] overflow-y-auto flex-1 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4285F4 #E5E7EB' }}>
        <style>{`
          .space-y-\[18px\]::-webkit-scrollbar {
            width: 6px;
          }
          .space-y-\[18px\]::-webkit-scrollbar-track {
            background: #E5E7EB;
            border-radius: 10px;
          }
          .space-y-\[18px\]::-webkit-scrollbar-thumb {
            background: #4285F4;
            border-radius: 10px;
          }
        `}</style>
        {profileCompletion.items.map((item) => (
          <div 
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`relative flex items-center h-[50px] px-4 border rounded-[10px] transition-all ${
              item.completed ? 'cursor-default' : 'cursor-pointer hover:border-[#4285F4]'
            }`}
            style={{ borderColor: borderColor, backgroundColor: themeState === 'light' ? 'transparent' : '#374151' }}
          >
            {/* Checkbox Icon */}
            <div className="flex-shrink-0 mr-3">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                item.completed ? 'bg-[#10B981] border-[1.5px] border-[#10B981]' : 'border-[1.5px] border-[#6E6E6E]'
              }`}>
                {item.completed && (
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                )}
              </div>
            </div>
            
            {/* Label */}
            <span className="text-[14px] font-semibold leading-[16px] flex-grow" style={{ fontFamily: 'Roboto, sans-serif', color: item.completed ? '#10B981' : textSecondary }}>
              {item.label}
            </span>
            
            {/* Plus Icon */}
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-md bg-[#4285F4] flex items-center justify-center relative">
                <Plus className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletion;