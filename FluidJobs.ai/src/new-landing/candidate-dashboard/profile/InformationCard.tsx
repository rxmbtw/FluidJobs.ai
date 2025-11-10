import React from 'react';
import { Mail, PhoneCall, Calendar, MapPin, Info } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

const InformationCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div className="rounded-xl shadow-lg p-6 relative h-[288px]" style={{ backgroundColor: colors.bgCard }}>
      <h3 className="text-[20px] font-bold mb-4" style={{ color: colors.textPrimary }}>Information</h3>

      <div className="grid grid-cols-2 gap-y-4">
        <div className="flex items-center space-x-4">
          <Mail className="w-4 h-4" style={{ color: colors.textSecondary }} />
          <span className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>Email Address</span>
        </div>
        <span className="text-[13px] font-medium text-right" style={{ color: colors.textPrimary }}>ram@fluid.live</span>

        <div className="flex items-center space-x-4">
          <PhoneCall className="w-4 h-4" style={{ color: colors.textSecondary }} />
          <span className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>Phone Number</span>
        </div>
        <span className="text-[13px] font-medium text-right" style={{ color: colors.textPrimary }}>+91 98765 XXXXX</span>

        <div className="flex items-center space-x-4">
          <Calendar className="w-4 h-4" style={{ color: colors.textSecondary }} />
          <span className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>DOB (Date of Birth)</span>
        </div>
        <span className="text-[13px] font-medium text-right" style={{ color: colors.textPrimary }}>01/01/2004</span>

        <div className="flex items-center space-x-4">
          <MapPin className="w-4 h-4" style={{ color: colors.textSecondary }} />
          <span className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>Current City</span>
        </div>
        <span className="text-[13px] font-medium text-right" style={{ color: colors.textPrimary }}>Pune, Maharashtra</span>

        <div className="flex items-center space-x-4">
          <Info className="w-4 h-4" style={{ color: colors.textSecondary }} />
          <span className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>Joined</span>
        </div>
        <span className="text-[13px] font-medium text-right" style={{ color: colors.textPrimary }}>5 Oct 2025</span>
      </div>
    </div>
  );
};

export default InformationCard;
