import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Edit, X, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeState?: 'light' | 'dark';
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, themeState = 'light' }) => {
  const bgColor = themeState === 'light' ? '#FFFFFF' : '#1F2937';
  const textColor = themeState === 'light' ? '#000000' : '#f9fafb';
  const borderColor = themeState === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)';
  const inputBg = themeState === 'light' ? '#FFFFFF' : '#374151';
  const [showResetForm, setShowResetForm] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '', email: '', code: '' });
    setError('');
    setShowResetForm(false);
    setCodeSent(false);
    setCodeVerified(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!showResetForm && !formData.currentPassword) {
      setError('Please enter your current password');
      return false;
    }
    if (showResetForm && !formData.email) {
      setError('Please enter your email');
      return false;
    }
    if (showResetForm && !formData.code) {
      setError('Please enter verification code');
      return false;
    }
    if (!formData.newPassword) {
      setError('Please enter a new password');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    setError('');
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }

    try {
      setIsSendingCode(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send code');

      setCodeSent(true);
      alert('Verification code sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    if (!formData.code) {
      setError('Please enter verification code');
      return;
    }

    try {
      setIsVerifyingCode(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.code })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid verification code');

      setCodeVerified(true);
      alert('Code verified successfully! You can now set your new password.');
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (showResetForm) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            code: formData.code,
            newPassword: formData.newPassword
          })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to reset password');
        
        alert('Password reset successfully!');
        handleClose();
      } else {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to change password');
        
        alert('Password changed successfully!');
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center" style={{ zIndex: 999999 }}>
      {!showResetForm ? (
        // Change Password Form
        <div className="relative w-[630px] h-[570px] rounded-[25px]" style={{ backgroundColor: bgColor }}>
          <button onClick={handleClose} className="absolute top-[35px] right-[25px] w-6 h-6 flex items-center justify-center z-10">
            <X className="w-5 h-5 opacity-56" style={{ color: textColor }} />
          </button>

          <div className="flex items-center justify-center gap-3 pt-[27px] mb-[38px]">
            <Edit className="w-[38px] h-[38px]" style={{ color: textColor }} />
            <h2 className="font-['Poppins'] font-bold text-[25px] leading-[38px]" style={{ color: textColor }}>Change Password</h2>
          </div>

          <div className="px-[37px]">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="mb-[40px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-center mb-[14px]" style={{ color: textColor }}>
                Current Password*
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                  className="w-full h-[45px] px-4 pr-12 rounded-[10px] font-['Poppins'] font-medium text-[15px]"
                  style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: textColor, opacity: 0.6 }}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-[40px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-center mb-[14px]" style={{ color: textColor }}>
                New Password*
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter your new password"
                  className="w-full h-[45px] px-4 pr-12 rounded-[10px] font-['Poppins'] font-medium text-[15px]"
                  style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: textColor, opacity: 0.6 }}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-[35px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-center mb-[14px]" style={{ color: textColor }}>
                Confirm New Password*
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Type the new password again"
                  className="w-full h-[45px] px-4 pr-12 rounded-[10px] font-['Poppins'] font-medium text-[15px]"
                  style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: textColor, opacity: 0.6 }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-[44px] bg-[#4285F4] rounded-[10px] font-['Poppins'] font-semibold text-[15px] text-white hover:opacity-90 mb-[12px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : 'Submit'}
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
        <div className="relative w-[630px] rounded-[25px]" style={{ backgroundColor: bgColor, minHeight: '500px' }}>
          <button onClick={handleClose} className="absolute top-[35px] right-[25px] w-6 h-6 flex items-center justify-center z-10">
            <X className="w-5 h-5 opacity-56" style={{ color: textColor }} />
          </button>

          <div className="flex items-center justify-center gap-3 pt-[28px] mb-[46px]">
            <Edit className="w-[38px] h-[38px]" style={{ color: textColor }} />
            <h2 className="font-['Poppins'] font-bold text-[25px] leading-[38px]" style={{ color: textColor }}>Reset Password</h2>
          </div>

          <div className="px-[37px]">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <button
              onClick={() => setShowResetForm(false)}
              className="mb-4 text-sm hover:underline flex items-center"
              style={{ color: textColor, opacity: 0.7 }}
            >
              ← Back to Change Password
            </button>
            
            <div className="mb-[30px]">
              <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-center mb-[14px]" style={{ color: textColor }}>
                Email*
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                disabled={codeSent}
                className="w-full h-[45px] px-4 rounded-[10px] font-['Poppins'] font-medium text-[15px] disabled:opacity-50"
                style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
              />
            </div>

            <button
              onClick={handleSendCode}
              disabled={isSendingCode || codeSent || !formData.email}
              className="w-full h-[44px] bg-green-600 rounded-[10px] font-['Poppins'] font-semibold text-[15px] text-white hover:bg-green-700 mb-[30px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSendingCode ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : codeSent ? 'Code Sent ✓' : 'Send Verification Code'}
            </button>

            {codeSent && (
              <>
                <div className="mb-[30px]">
                  <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-center mb-[14px]" style={{ color: textColor }}>
                    Verification Code*
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    disabled={codeVerified}
                    className="w-full h-[45px] px-4 rounded-[10px] font-['Poppins'] font-medium text-[15px] text-center tracking-widest disabled:opacity-50"
                    style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                  />
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || codeVerified || !formData.code}
                  className="w-full h-[44px] bg-blue-600 rounded-[10px] font-['Poppins'] font-semibold text-[15px] text-white hover:bg-blue-700 mb-[30px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isVerifyingCode ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : codeVerified ? 'Code Verified ✓' : 'Verify Code'}
                </button>
              </>
            )}
            
            {codeVerified && (
              <>
                <div className="mb-[30px]">
                  <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-center mb-[14px]" style={{ color: textColor }}>
                    New Password*
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                      className="w-full h-[45px] px-4 pr-12 rounded-[10px] font-['Poppins'] font-medium text-[15px]"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: textColor, opacity: 0.6 }}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="mb-[30px]">
                  <label className="block font-['Poppins'] font-bold text-[15px] leading-[22px] text-center mb-[14px]" style={{ color: textColor }}>
                    Confirm New Password*
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Type the new password again"
                      className="w-full h-[45px] px-4 pr-12 rounded-[10px] font-['Poppins'] font-medium text-[15px]"
                      style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: textColor, opacity: 0.6 }}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {codeVerified && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-[44px] bg-[#4285F4] rounded-[10px] font-['Poppins'] font-semibold text-[15px] text-white hover:opacity-90 mb-[30px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : 'Submit'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default ChangePasswordModal;
