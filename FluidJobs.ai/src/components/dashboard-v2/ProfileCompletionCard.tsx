import React from 'react';
import ProfileStep from './ProfileStep';

interface ProfileCompletionCardProps {
  resumeUploaded: boolean;
  pictureUploaded: boolean;
  addressAdded: boolean;
  onToggleStep: (step: 'resume' | 'picture' | 'address') => void;
}

const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  resumeUploaded,
  pictureUploaded,
  addressAdded,
  onToggleStep
}) => {
  const completedSteps = [resumeUploaded, pictureUploaded, addressAdded].filter(Boolean).length;
  const percentage = Math.round((completedSteps / 3) * 100);

  return (
    <div className="lg:col-span-1 bg-white p-6 rounded-[25px] shadow-lg min-h-[500px]">
      <h2 className="text-2xl font-extrabold mb-2 text-black">
        Complete your profile
      </h2>
      <p className="text-sm font-semibold text-gray-600 mb-6">
        By completing your profile you can start applying to job openings in one click...
      </p>

      <div className="mb-6">
        <span className="text-lg font-bold text-black">{percentage}%</span>
        <div className="relative w-full h-3 bg-gray-200 rounded-full mt-2">
          <div
            className="absolute top-0 left-0 h-3 bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-4">
        <ProfileStep
          label="Upload resume"
          isCompleted={resumeUploaded}
          onClick={() => onToggleStep('resume')}
        />
        <ProfileStep
          label="Upload profile picture"
          isCompleted={pictureUploaded}
          onClick={() => onToggleStep('picture')}
        />
        <ProfileStep
          label="Add your address"
          isCompleted={addressAdded}
          onClick={() => onToggleStep('address')}
        />
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
