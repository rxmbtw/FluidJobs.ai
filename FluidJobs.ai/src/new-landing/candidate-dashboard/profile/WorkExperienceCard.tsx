import React from 'react';
import { useTheme, getThemeColors } from '../ThemeContext';

const WorkExperienceCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div className="rounded-xl shadow-lg p-6 relative h-[312px]" style={{ backgroundColor: colors.bgCard }}>
      <h3 className="text-[20px] font-bold mb-4" style={{ color: colors.textPrimary }}>Work Experience</h3>
      
      <div className="relative pt-2">
        <div className="flex justify-between items-start">
          <h4 className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>FluidLive Solutions Pvt Ltd</h4>
          <span className="text-[13px] font-medium text-right" style={{ color: colors.textPrimary }}>Aug 2025 - Present</span>
        </div>
        <div className="flex justify-between items-end mt-1">
          <p className="text-[10px] font-medium" style={{ color: colors.accent }}>Pune, Maharashtra</p>
          <p className="text-[10px] font-medium" style={{ color: colors.textSecondary }}>Current CTC: 3LPA</p>
        </div>
        
        <div className="absolute w-[calc(100%-58px)] h-px top-[78px] left-[29px]" style={{ backgroundColor: colors.border }}></div>
      </div>
    </div>
  );
};

export default WorkExperienceCard;
