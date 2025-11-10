import React from 'react';
import { User, Mail, Phone, Calendar, Users, MapPin } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

const InformationEditCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <section className="rounded-xl shadow-xl p-6 min-h-[600px]" style={{ backgroundColor: colors.bgCard }}>
      <h3 className="text-xl font-bold mb-5" style={{ color: colors.textPrimary }}>Information</h3>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-2/5">
            <User className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.textSecondary }} />
            <label htmlFor="fullName" className="text-sm font-medium truncate" style={{ color: colors.textSecondary }}>Full Name*</label>
          </div>
          <input id="fullName" type="text" defaultValue="Shriram Surse" className="w-full sm:w-3/5 px-3 py-1.5 text-sm rounded-lg" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-2/5">
            <Mail className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.textSecondary }} />
            <label htmlFor="email" className="text-sm font-medium truncate" style={{ color: colors.textSecondary }}>Email Address*</label>
          </div>
          <input id="email" type="email" defaultValue="ram@fluid.live" readOnly className="w-full sm:w-3/5 px-3 py-1.5 text-sm rounded-lg cursor-not-allowed" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textSecondary }} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-2/5">
            <Phone className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.textSecondary }} />
            <label htmlFor="phone" className="text-sm font-medium truncate" style={{ color: colors.textSecondary }}>Phone Number*</label>
          </div>
          <input id="phone" type="tel" defaultValue="+91 98765 XXXXX" className="w-full sm:w-3/5 px-3 py-1.5 text-sm rounded-lg" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-2/5">
            <Calendar className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.textSecondary }} />
            <label htmlFor="dob" className="text-sm font-medium truncate" style={{ color: colors.textSecondary }}>DOB (Date of Birth)</label>
          </div>
          <input id="dob" type="date" defaultValue="2004-01-01" className="w-full sm:w-3/5 px-3 py-1.5 text-sm rounded-lg" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-2/5">
            <Users className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.textSecondary }} />
            <label htmlFor="maritalStatus" className="text-sm font-medium truncate" style={{ color: colors.textSecondary }}>Marital Status</label>
          </div>
          <select id="maritalStatus" className="w-full sm:w-3/5 px-3 py-1.5 text-sm rounded-lg appearance-none" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }}>
            <option>Single</option>
            <option>Married</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-2/5">
            <MapPin className="w-[18px] h-[18px] flex-shrink-0" style={{ color: colors.textSecondary }} />
            <label htmlFor="city" className="text-sm font-medium truncate" style={{ color: colors.textSecondary }}>Current City</label>
          </div>
          <input id="city" type="text" defaultValue="Pune, Maharashtra" className="w-full sm:w-3/5 px-3 py-1.5 text-sm rounded-lg" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }} />
        </div>
      </div>
    </section>
  );
};

export default InformationEditCard;
