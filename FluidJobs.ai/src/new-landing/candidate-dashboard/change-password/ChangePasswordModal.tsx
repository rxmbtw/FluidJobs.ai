import React, { useState } from 'react';
import { LockKeyhole, X } from 'lucide-react';
import ResetPasswordModal from './ResetPasswordModal';
import { useTheme, getThemeColors } from '../ThemeContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password change submitted');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl shadow-2xl w-full max-w-lg md:max-w-xl lg:max-w-[630px] p-8 space-y-6 transform transition-all duration-300"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-center items-center relative">
          <div className="flex items-center space-x-3" style={{ color: colors.textPrimary }}>
            <LockKeyhole className="w-7 h-7" style={{ color: colors.accent }} />
            <h1 className="text-2xl font-bold">Change Password</h1>
          </div>
          
          <button 
            onClick={onClose}
            aria-label="Close" 
            className="absolute right-0 transition-colors p-2 rounded-full"
            style={{ color: colors.textSecondary }}
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <hr style={{ borderTop: `1px solid ${colors.border}` }} />

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="current-password" className="block text-base font-semibold mb-2" style={{ color: colors.textPrimary }}>Current Password*</label>
            <input
              type="password"
              id="current-password"
              placeholder="Enter your current password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-11 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
              style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }}
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-base font-semibold mb-2" style={{ color: colors.textPrimary }}>New Password*</label>
            <input
              type="password"
              id="new-password"
              placeholder="Enter your new password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
              style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-base font-semibold mb-2" style={{ color: colors.textPrimary }}>Confirm New Password*</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Type the new password again"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-shadow"
              style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }}
            />
          </div>

          <button 
            type="submit" 
            className="w-full h-11 text-white font-semibold text-base rounded-lg hover:bg-[#7245d9] transition-colors shadow-md hover:shadow-lg"
            style={{ backgroundColor: colors.accent }}
          >
            Submit
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="#" onClick={(e) => { e.preventDefault(); setIsResetPasswordOpen(true); }} className="text-sm font-medium hover:underline" style={{ color: colors.accent }}>Forgot Your Password?</a>
        </div>
      </div>
      <ResetPasswordModal isOpen={isResetPasswordOpen} onClose={() => setIsResetPasswordOpen(false)} />
    </div>
  );
};

export default ChangePasswordModal;
