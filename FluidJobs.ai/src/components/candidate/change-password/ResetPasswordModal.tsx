import React, { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Password reset submitted');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl shadow-2xl p-6 sm:p-8 relative transform transition duration-300"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition duration-150"
          style={{ color: colors.textSecondary }}
        >
          <X className="w-6 h-6" />
        </button>

        <header className="flex flex-col items-center pb-5 mb-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <div className="p-3 rounded-full mb-3" style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}>
            <Pencil className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: colors.textPrimary }}>
            Reset Password
          </h1>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password" className="block text-base font-bold mb-2" style={{ color: colors.textPrimary }}>New Password*</label>
            <input 
              type="password" 
              id="new-password" 
              placeholder="Enter your new password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl focus:ring-2 transition duration-200"
              style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-base font-bold mb-2" style={{ color: colors.textPrimary }}>Confirm New Password*</label>
            <input 
              type="password" 
              id="confirm-password" 
              placeholder="Type the new password again"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-xl focus:ring-2 transition duration-200"
              style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }}
            />
          </div>

          <button 
            type="submit"
            className="w-full text-white font-semibold text-lg py-3 rounded-xl hover:bg-[#7245d9] active:bg-[#6236c7] transition duration-200 shadow-md focus:outline-none focus:ring-4 mt-8"
            style={{ backgroundColor: colors.accent }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
