import React, { useState } from 'react';
import { X, Mail, Key, Check, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface MobileForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'verification' | 'reset' | 'success';

const MobileForgotPasswordModal: React.FC<MobileForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/forgot-password/send-code', { email });
      setStep('verification');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/api/forgot-password/verify-code', { email, code });
      setStep('reset');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
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
      await axios.post('http://localhost:8000/api/forgot-password/reset-password', {
        email,
        code,
        newPassword
      });
      setStep('success');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      onClick={resetModal}
    >
      <div 
        className="relative"
        style={{
          width: '355px',
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '32px 24px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={resetModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        {step === 'email' && (
          <>
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '22px', color: '#000000' }}>
                Forgot Password?
              </h2>
              <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: '#6E6E6E', marginTop: '8px' }}>
                Enter your email to receive a verification code
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '45px',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontFamily: 'Poppins',
                  fontSize: '14px'
                }}
              />
              
              {error && <p style={{ color: '#EF4444', fontSize: '13px', fontFamily: 'Poppins' }}>{error}</p>}
              
              <button
                onClick={handleSendCode}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#4285F4',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          </>
        )}

        {step === 'verification' && (
          <>
            <div className="text-center mb-6">
              <Key className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '22px', color: '#000000' }}>
                Enter Verification Code
              </h2>
              <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: '#6E6E6E', marginTop: '8px' }}>
                We sent a 6-digit code to {email}
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{
                  width: '100%',
                  height: '45px',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontFamily: 'Poppins',
                  fontSize: '20px',
                  textAlign: 'center',
                  letterSpacing: '8px'
                }}
              />
              
              {error && <p style={{ color: '#EF4444', fontSize: '13px', fontFamily: 'Poppins' }}>{error}</p>}
              
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#4285F4',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <button
                onClick={() => setStep('email')}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#4285F4',
                  fontFamily: 'Poppins',
                  fontSize: '13px',
                  padding: '8px'
                }}
              >
                Back to Email
              </button>
            </div>
          </>
        )}

        {step === 'reset' && (
          <>
            <div className="text-center mb-6">
              <Key className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '22px', color: '#000000' }}>
                Reset Password
              </h2>
              <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: '#6E6E6E', marginTop: '8px' }}>
                Enter your new password
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '45px',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '0 40px 0 16px',
                    fontFamily: 'Poppins',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6E6E6E' }}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '45px',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '0 40px 0 16px',
                    fontFamily: 'Poppins',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6E6E6E' }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {error && <p style={{ color: '#EF4444', fontSize: '13px', fontFamily: 'Poppins' }}>{error}</p>}
              
              <button
                onClick={handleResetPassword}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#4285F4',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '22px', color: '#000000' }}>
                Password Reset Successfully!
              </h2>
              <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: '#6E6E6E', margin: '8px 0 24px' }}>
                You can now login with your new password
              </p>
              
              <button
                onClick={resetModal}
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#10B981',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '15px'
                }}
              >
                Continue to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileForgotPasswordModal;
