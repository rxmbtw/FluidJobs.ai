import React from 'react';
import { User, SquarePen } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

interface ProfileCardProps {
  onNavigateToEdit?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onNavigateToEdit }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div className="rounded-xl shadow-lg relative overflow-hidden h-[312px]" style={{ backgroundColor: colors.bgCard }}>
      <div className="absolute w-[calc(100%-20px)] h-[118px] left-[10px] top-[10px] rounded-lg" style={{ background: 'linear-gradient(135deg, #0400FF, #8800FF, #D100FF)' }}></div>
      
      <div className="absolute w-[100px] h-[100px] left-1/2 -translate-x-1/2 top-[78px] rounded-full bg-violet-900/40 flex items-center justify-center">
        <div className="w-[84px] h-[84px] rounded-full bg-[#8B5CF6] flex items-center justify-center shadow-md">
          <User className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center absolute w-full top-[190px]">
        <p className="font-bold text-[15px]" style={{ color: colors.textPrimary }}>Shriram Surse</p>
        <p className="text-[13px] mt-0.5" style={{ color: colors.accent }}>Pune, Maharashtra | Joined Oct 2025</p>
      </div>

      <button onClick={onNavigateToEdit} className="absolute w-[calc(100%-20px)] h-[44px] left-[10px] bottom-[13px] rounded-lg flex items-center justify-center space-x-2 hover:bg-violet-900 transition" style={{ border: `1px solid ${colors.accent}`, backgroundColor: colors.bgCard }}>
        <SquarePen className="w-5 h-5" style={{ color: colors.accent }} />
        <span className="font-semibold text-[13px]" style={{ color: colors.accent }}>Edit Profile</span>
      </button>
    </div>
  );
};

export default ProfileCard;
