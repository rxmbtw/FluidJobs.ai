import React, { useState } from 'react';
import { Edit } from 'lucide-react';

interface MobileResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileResetPasswordModal: React.FC<MobileResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Handle password reset logic
    console.log('Reset password submitted');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
      <div className="bg-white rounded-[25px] w-[355px] h-[397px] relative">
        {/* Header */}
        <div className="absolute left-[25px] top-[30px] flex items-center gap-4">
          <Edit size={38} color="#000000" />
          <h2 className="font-poppins font-bold text-[25px] leading-[38px] text-black">
            Reset Password
          </h2>
        </div>

        {/* New Password Field */}
        <label className="absolute left-[25px] top-[102px] font-poppins font-bold text-[15px] leading-[22px] text-black">
          New Password*
        </label>
        <input
          type="password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="absolute left-[25px] top-[139px] w-[306px] h-[45px] bg-white border border-black/50 rounded-[10px] px-4 font-poppins font-medium text-[15px] text-[#6E6E6E] placeholder:text-[#6E6E6E]"
        />

        {/* Confirm Password Field */}
        <label className="absolute left-[25px] top-[209px] font-poppins font-bold text-[15px] leading-[22px] text-black">
          Confirm New Password*
        </label>
        <input
          type="password"
          placeholder="Type the new password again"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="absolute left-[25px] top-[246px] w-[306px] h-[45px] bg-white border border-black/50 rounded-[10px] px-4 font-poppins font-medium text-[15px] text-[#6E6E6E] placeholder:text-[#6E6E6E]"
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="absolute left-[75px] top-[323px] w-[205px] h-[44px] bg-[#4285F4] rounded-[10px] font-poppins font-semibold text-[15px] leading-[22px] text-white"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default MobileResetPasswordModal;
