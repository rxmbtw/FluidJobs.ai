import React, { useState } from 'react';
import { X, User, Lock, Eye, EyeOff } from 'lucide-react';
import PersonalDetailsStep from './PersonalDetailsStep';
import ExperienceStep from './ExperienceStep';
import DocumentsStep from './DocumentsStep';
import { useAuth } from '../../../contexts/AuthContext';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>({});
  const { signup } = useAuth();

  if (!isOpen) return null;

  const showMessage = (message: string, error: boolean) => {
    setStatusMessage(message);
    setIsError(error);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      showMessage('Please fill in all fields.', true);
      return;
    }

    if (password.length < 8) {
      showMessage('Password must be at least 8 characters long.', true);
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match.', true);
      return;
    }

    setRegistrationData({ username, password });
    showMessage('Proceeding to the next step.', false);
    setTimeout(() => setCurrentStep(2), 500);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div 
        className="bg-[#1a1a1a] w-full max-w-md sm:max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 relative border border-[#374151] max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#f9fafb] p-2 rounded-full transition hover:bg-[#374151]"
        >
          <X className="w-6 h-6" />
        </button>

        <header className="flex justify-center mb-6">
          <img src="/images/Fluid Live Icon.png" alt="FluidJobs.ai Logo" className="w-20 h-20" />
        </header>

        <main>
          {currentStep === 1 ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-center text-[#f9fafb]">Create Your Account</h2>
              <p className="text-sm font-semibold text-center text-[#9ca3af] mb-6">Set up your username and password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-[#f9fafb] mb-2">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="username" 
                  placeholder="enter email address or phone no."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 pl-12 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af]">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#f9fafb] mb-2">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  placeholder="create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-12 pr-12 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af]">
                  <Lock className="w-5 h-5" />
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af] p-1 rounded-full hover:bg-[#050505] transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#f9fafb] mb-2">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password" 
                  placeholder="confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 pl-12 pr-12 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af]">
                  <Lock className="w-5 h-5" />
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af] p-1 rounded-full hover:bg-[#050505] transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-12 bg-[#8B5CF6] text-[#f9fafb] font-semibold text-lg rounded-xl shadow-lg hover:opacity-90 transition mt-6"
            >
              Next
            </button>
          </form>
            </>
          ) : currentStep === 2 ? (
            <PersonalDetailsStep 
              onNext={(data) => {
                setRegistrationData({ ...registrationData, ...data });
                setCurrentStep(3);
              }} 
              onBack={() => setCurrentStep(1)} 
            />
          ) : currentStep === 3 ? (
            <ExperienceStep 
              onNext={(data) => {
                setRegistrationData({ ...registrationData, ...data });
                setCurrentStep(4);
              }} 
              onBack={() => setCurrentStep(2)} 
            />
          ) : (
            <DocumentsStep 
              onBack={() => setCurrentStep(3)} 
              onComplete={async () => {
                try {
                  const signupPayload = {
                    username: registrationData.username,
                    password: registrationData.password,
                    fullName: registrationData.fullName,
                    phone: registrationData.phone,
                    email: registrationData.email,
                    gender: registrationData.gender,
                    maritalStatus: registrationData.maritalStatus,
                    workStatus: registrationData.workStatus,
                    currentCompany: registrationData.currentCompany,
                    noticePeriod: registrationData.noticePeriod,
                    currentCTC: registrationData.currentCTC,
                    lastCompany: registrationData.lastCompany,
                    previousCTC: registrationData.previousCTC,
                    city: registrationData.city,
                    workMode: registrationData.workMode
                  };
                  await signup(signupPayload);
                  showMessage('Account created successfully!', false);
                  setTimeout(() => onClose(), 1500);
                } catch (error: any) {
                  showMessage(error.message, true);
                }
              }} 
            />
          )}

          {statusMessage && currentStep === 1 && (
            <div className={`mt-3 p-2 text-center rounded-xl text-sm ${isError ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#10B981]/20 text-[#10B981]'}`}>
              {statusMessage}
            </div>
          )}

          <div className="mt-8 pt-4 flex items-start justify-between relative w-full max-w-lg mx-auto">
            <div className="absolute top-[24px] left-[10%] right-[10%] h-[2px] bg-[#374151]"></div>

            <div className="flex flex-col items-center w-1/4 z-10 cursor-pointer" onClick={() => setCurrentStep(1)}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 ${currentStep >= 1 ? 'bg-[#8B5CF6] text-[#f9fafb] shadow-md' : 'bg-[#374151] text-[#9ca3af]'}`}>1</div>
              <span className={`text-xs font-medium ${currentStep >= 1 ? 'text-[#f9fafb]' : 'text-[#9ca3af]'}`}>Account</span>
            </div>

            <div className="flex flex-col items-center w-1/4 z-10 cursor-pointer" onClick={() => currentStep >= 2 && setCurrentStep(2)}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 ${currentStep >= 2 ? 'bg-[#8B5CF6] text-[#f9fafb] shadow-md' : 'bg-[#374151] text-[#9ca3af]'}`}>2</div>
              <span className={`text-xs font-medium ${currentStep >= 2 ? 'text-[#f9fafb]' : 'text-[#9ca3af]'}`}>Personal</span>
            </div>

            <div className="flex flex-col items-center w-1/4 z-10 cursor-pointer" onClick={() => currentStep >= 3 && setCurrentStep(3)}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 ${currentStep >= 3 ? 'bg-[#8B5CF6] text-[#f9fafb] shadow-md' : 'bg-[#374151] text-[#9ca3af]'}`}>3</div>
              <span className={`text-xs font-medium ${currentStep >= 3 ? 'text-[#f9fafb]' : 'text-[#9ca3af]'}`}>Experience</span>
            </div>

            <div className="flex flex-col items-center w-1/4 z-10 cursor-pointer" onClick={() => currentStep >= 4 && setCurrentStep(4)}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 ${currentStep >= 4 ? 'bg-[#8B5CF6] text-[#f9fafb] shadow-md' : 'bg-[#374151] text-[#9ca3af]'}`}>4</div>
              <span className={`text-xs font-medium ${currentStep >= 4 ? 'text-[#f9fafb]' : 'text-[#9ca3af]'}`}>Documents</span>
            </div>
          </div>
        </main>

        <footer className="mt-6 pt-4 text-center">
          <p className="text-xs font-medium text-[#9ca3af]">
            All Rights Reserved. 2025 FluidLive Solutions Pvt Ltd.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default RegistrationModal;
