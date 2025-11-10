import React from 'react';
import { Mail, PhoneCall, MapPin } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

interface ContactInfoCardProps {
  type: 'email' | 'phone' | 'address';
  title: string;
  value?: string;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ type, title, value }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const icons = {
    email: Mail,
    phone: PhoneCall,
    address: MapPin
  };

  const Icon = icons[type];

  return (
    <div className="p-4 rounded-xl shadow-md flex items-center justify-between" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6" style={{ color: colors.accent, opacity: 0.7 }} />
        <div>
          <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{title}</p>
          {value && <p className="text-xs font-semibold" style={{ color: colors.textSecondary }}>{value}</p>}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoCard;
