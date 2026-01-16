import React, { useState } from 'react';
import { Edit, X } from 'lucide-react';
import axios from 'axios';

interface MobileChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForgotPassword?: () => void;
  themeState?: 'light' | 'dark';
}

const MobileChangePasswordModal: React.FC<MobileChangePasswordModalProps> = ({ isOpen, onClose, onForgotPassword, themeState = 'light' }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      await axios.post('http://localhost:8000/api/user/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      <div 
        className="relative"
        style={{
          width: '355px',
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '32px 14px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <Edit className="w-8 h-8 mr-3" style={{ color: '#000000' }} />
          <h2 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '25px',
            lineHeight: '38px',
            color: '#000000'
          }}>
            Change Password
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="mb-6">
            <label 
              className="block text-center mb-3"
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '15px',
                lineHeight: '22px',
                color: '#000000'
              }}
            >
              Current Password*
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              style={{
                width: '327px',
                height: '45px',
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.5)',
                borderRadius: '10px',
                padding: '0 16px',
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '15px',
                color: '#6E6E6E'
              }}
            />
          </div>

          {/* New Password */}
          <div className="mb-6">
            <label 
              className="block text-center mb-3"
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '15px',
                lineHeight: '22px',
                color: '#000000'
              }}
            >
              New Password*
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              style={{
                width: '327px',
                height: '45px',
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.5)',
                borderRadius: '10px',
                padding: '0 16px',
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '15px',
                color: '#6E6E6E'
              }}
            />
          </div>

          {/* Confirm New Password */}
          <div className="mb-8">
            <label 
              className="block text-center mb-3"
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '15px',
                lineHeight: '22px',
                color: '#000000'
              }}
            >
              Confirm New Password*
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Type the new password again"
              required
              style={{
                width: '327px',
                height: '45px',
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.5)',
                borderRadius: '10px',
                padding: '0 16px',
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '15px',
                color: '#6E6E6E'
              }}
            />
          </div>

          {/* Error/Success Message */}
          {error && (
            <p style={{ color: '#EF4444', fontSize: '13px', fontFamily: 'Poppins', textAlign: 'center', marginBottom: '16px' }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ color: '#10B981', fontSize: '13px', fontFamily: 'Poppins', textAlign: 'center', marginBottom: '16px' }}>
              Password changed successfully!
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '205px',
              height: '44px',
              background: '#4285F4',
              borderRadius: '10px',
              border: 'none',
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '15px',
              color: '#FFFFFF',
              display: 'block',
              margin: '0 auto 16px',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>

          {/* Forgot Password Link */}
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="block mx-auto"
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '12px',
                lineHeight: '18px',
                color: '#4285F4',
                cursor: 'pointer'
              }}
            >
              Forgot Your Password?
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default MobileChangePasswordModal;
