import React from 'react';
import { User, KeyRound, LogOut } from 'lucide-react';
import { useTheme, getThemeColors } from './ThemeContext';

interface AccountSettingsDropdownProps {
  isOpen: boolean;
  onNavigate?: (view: string) => void;
  onChangePassword?: () => void;
}

const AccountSettingsDropdown: React.FC<AccountSettingsDropdownProps> = ({ isOpen, onNavigate, onChangePassword }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 w-full mb-1 rounded-xl shadow-2xl overflow-hidden z-20" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
      <nav className="p-2 space-y-1">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('profile'); }} className="flex items-center space-x-3 p-3 rounded-lg transition duration-150" style={{ color: colors.textPrimary }}>
          <User className="w-5 h-5" style={{ color: colors.accent }} />
          <span className="font-semibold text-base">View Profile</span>
        </a>
        
        <a href="#" onClick={(e) => { e.preventDefault(); onChangePassword?.(); }} className="flex items-center space-x-3 p-3 rounded-lg transition duration-150" style={{ color: colors.textPrimary }}>
          <KeyRound className="w-5 h-5" style={{ color: colors.accent }} />
          <span className="font-semibold text-base">Change Password</span>
        </a>
      </nav>
    </div>
  );
};

export default AccountSettingsDropdown;
