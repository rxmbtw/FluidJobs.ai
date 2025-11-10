import React from 'react';
import { UserPlus, Calendar } from 'lucide-react';
import { useTheme, getThemeColors } from '../../ThemeContext';

interface ApplyScheduleCardProps {
  opensDate: string;
  closesDate: string;
}

const ApplyScheduleCard: React.FC<ApplyScheduleCardProps> = ({ opensDate, closesDate }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div 
      className="p-6 rounded-xl shadow-lg w-full sm:w-[235px] flex-shrink-0 h-full"
      style={{ 
        backgroundColor: colors.bgCard, 
        border: `1px solid ${colors.border}`
      }}
    >
      <button 
        className="w-full font-semibold py-2 px-4 rounded-lg shadow-xl transition flex items-center justify-center space-x-2 mb-4"
        style={{ backgroundColor: colors.accent, color: '#ffffff' }}
      >
        <UserPlus className="w-5 h-5" />
        <span>Apply Now</span>
      </button>

      <hr className="mb-4" style={{ borderTop: `1px solid ${colors.border}` }} />

      <h4 className="text-base font-bold uppercase mb-3 text-left" style={{ color: colors.textPrimary }}>
        REGISTRATION SCHEDULE
      </h4>

      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <div className="pt-1">
            <Calendar className="w-5 h-5" style={{ color: '#10B981' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            <span className="font-semibold" style={{ color: '#10B981' }}>Opens:</span> {opensDate}
          </p>
        </div>

        <div className="flex items-start space-x-2">
          <div className="pt-1">
            <Calendar className="w-5 h-5" style={{ color: '#EF4444' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            <span className="font-semibold" style={{ color: '#EF4444' }}>Closes:</span> {closesDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplyScheduleCard;
