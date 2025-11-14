import React, { useState } from 'react';
import { Edit, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [showResetForm, setShowResetForm] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Handle password change/reset logic
    console.log('Form submitted:', formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {!showResetForm ? (
        // Change Password Form
        <div className="relative w-[630px] h-[570px] bg-white rounded-[25px]">
          <button onClick={onClose} className="absolute top-[35px] right-[25px] w-6 h-6 flex items-center justify-center z-10">
            <X className="w-5 h-5 text-black opacity-56" />
          </button>

          <div className="flex items-center justify-center gap-3 pt-[27px] mb-[38px]">
            <Edit className="w-[38px] h-[38px] text-black" />
            <h2 className="font-['Poppins'] font-bold text-[25px] leading-[38px] text-black">Change Password</h2>
          </div>

          <div className="px-[37px]">
            <div className="mb-[40px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-black text-center mb-[14px]">
                Current Password*
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                className="w-full h-[45px] px-4 bg-white border border-[rgba(0,0,0,0.5)] rounded-[10px] font-['Poppins'] font-medium text-[15px] text-[#6E6E6E] placeholder:text-[#6E6E6E]"
              />
            </div>

            <div className="mb-[40px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-black text-center mb-[14px]">
                New Password*
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter your new password"
                className="w-full h-[45px] px-4 bg-white border border-[rgba(0,0,0,0.5)] rounded-[10px] font-['Poppins'] font-medium text-[15px] text-[#6E6E6E] placeholder:text-[#6E6E6E]"
              />
            </div>

            <div className="mb-[35px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-black text-center mb-[14px]">
                Confirm New Password*
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Type the new password again"
                className="w-full h-[45px] px-4 bg-white border border-[rgba(0,0,0,0.5)] rounded-[10px] font-['Poppins'] font-medium text-[15px] text-[#6E6E6E] placeholder:text-[#6E6E6E]"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full h-[44px] bg-[#4285F4] rounded-[10px] font-['Poppins'] font-semibold text-[15px] text-white hover:opacity-90 mb-[12px]"
            >
              Submit
            </button>

            <div className="pb-[32px]">
              <button
                onClick={() => setShowResetForm(true)}
                className="w-full font-['Poppins'] font-medium text-[12px] leading-[18px] text-[#4285F4] text-center hover:underline"
              >
                Forgot Your Password?
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Reset Password Form
        <div className="relative w-[630px] h-[440px] bg-white rounded-[25px]">
          <button onClick={onClose} className="absolute top-[35px] right-[25px] w-6 h-6 flex items-center justify-center z-10">
            <X className="w-5 h-5 text-black opacity-56" />
          </button>

          <div className="flex items-center justify-center gap-3 pt-[28px] mb-[46px]">
            <Edit className="w-[38px] h-[38px] text-black" />
            <h2 className="font-['Poppins'] font-bold text-[25px] leading-[38px] text-black">Reset Password</h2>
          </div>

          <div className="px-[37px]">
            <div className="mb-[44px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-black text-center mb-[14px]">
                New Password*
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter your new password"
                className="w-full h-[45px] px-4 bg-white border border-[rgba(0,0,0,0.5)] rounded-[10px] font-['Poppins'] font-medium text-[15px] text-[#6E6E6E] placeholder:text-[#6E6E6E]"
              />
            </div>

            <div className="mb-[37px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-black text-center mb-[14px]">
                Confirm New Password*
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Type the new password again"
                className="w-full h-[45px] px-4 bg-white border border-[rgba(0,0,0,0.5)] rounded-[10px] font-['Poppins'] font-medium text-[15px] text-[#6E6E6E] placeholder:text-[#6E6E6E]"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full h-[44px] bg-[#4285F4] rounded-[10px] font-['Poppins'] font-semibold text-[15px] text-white hover:opacity-90 mb-[37px]"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordModal;
