import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, User, Phone, Mail, MapPin, Building, FileText, Camera, ArrowRight, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  maritalStatus: string;
  workStatus: string;
  currentCompany: string;
  noticePeriod: string;
  currentCTC: string;
  lastCompany: string;
  previousCTC: string;
  city: string;
  workMode: string;
  cv: File | null;
  profilePicture: File | null;
}

interface CandidateRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const CandidateRegistrationForm: React.FC<CandidateRegistrationFormProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('registrationStep');
    return saved ? parseInt(saved) : 1;
  });
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('registrationFormData');
    return saved ? JSON.parse(saved) : {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      email: '',
      gender: '',
      maritalStatus: '',
      workStatus: '',
      currentCompany: '',
      noticePeriod: '',
      currentCTC: '',
      lastCompany: '',
      previousCTC: '',
      city: '',
      workMode: '',
      cv: null,
      profilePicture: null
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
      }
    };
  }, [usernameCheckTimeout]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.username) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUsernameExists = async (username: string) => {
    if (!username.trim()) return false;
    
    try {
      setIsCheckingUsername(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const newData = { ...formData, username: value };
    setFormData(newData);
    localStorage.setItem('registrationFormData', JSON.stringify(newData));
    
    // Clear existing timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }
    
    // Clear username error when user starts typing
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
    
    // Set new timeout for checking username
    if (value.trim()) {
      const timeout = setTimeout(async () => {
        const exists = await checkUsernameExists(value);
        if (exists) {
          setErrors(prev => ({ 
            ...prev, 
            username: 'This email/phone is already registered. Please use a different one or sign in.' 
          }));
        }
      }, 800); // 800ms delay
      
      setUsernameCheckTimeout(timeout);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (validateStep(1)) {
        // Check if there's already a username error from real-time validation
        if (errors.username) {
          return;
        }
        
        // Final check before proceeding
        const exists = await checkUsernameExists(formData.username);
        if (exists) {
          setErrors({ username: 'This email/phone is already registered. Please use a different one or sign in.' });
          return;
        }
        
        const newStep = 2;
        setCurrentStep(newStep);
        localStorage.setItem('registrationStep', newStep.toString());
      }
    } else if (currentStep < 4) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      localStorage.setItem('registrationStep', newStep.toString());
    }
  };

  const handleSubmit = () => {
    localStorage.removeItem('registrationFormData');
    localStorage.removeItem('registrationStep');
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col"
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-end items-center mb-3">
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold mb-3 text-center">Create Your Professional Profile</h2>
            
            {/* Dynamic Progress Bar */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step <= currentStep ? 'bg-white text-indigo-600' : 'bg-white/30 text-white/70'
                    }`}>
                      {step}
                    </div>
                    <span className="text-xs mt-1 text-white/80">
                      {step === 1 ? 'Account' : step === 2 ? 'Personal' : step === 3 ? 'Experience' : 'Documents'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-screen flex flex-col justify-center"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-black p-8 space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h3>
                    <p className="text-gray-600">Set up your username and password</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Username (Email or Phone) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="Enter your email or phone number"
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.username ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {isCheckingUsername && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                        </div>
                      )}
                    </div>
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => {
                          const newData = { ...formData, password: e.target.value };
                          setFormData(newData);
                          localStorage.setItem('registrationFormData', JSON.stringify(newData));
                        }}
                        placeholder="Create a strong password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          const newData = { ...formData, confirmPassword: e.target.value };
                          setFormData(newData);
                          localStorage.setItem('registrationFormData', JSON.stringify(newData));
                        }}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={handleNextStep}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-semibold shadow-lg flex items-center mx-auto"
                    >
                      Next
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-screen flex flex-col justify-center"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-black p-8 space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                    <p className="text-gray-600">Tell us about yourself</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        const newData = { ...formData, fullName: e.target.value };
                        setFormData(newData);
                        localStorage.setItem('registrationFormData', JSON.stringify(newData));
                      }}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const newData = { ...formData, phone: e.target.value };
                          setFormData(newData);
                          localStorage.setItem('registrationFormData', JSON.stringify(newData));
                        }}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          const newData = { ...formData, email: e.target.value };
                          setFormData(newData);
                          localStorage.setItem('registrationFormData', JSON.stringify(newData));
                        }}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => {
                          const newData = { ...formData, gender: e.target.value };
                          setFormData(newData);
                          localStorage.setItem('registrationFormData', JSON.stringify(newData));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status *</label>
                      <select
                        value={formData.maritalStatus}
                        onChange={(e) => {
                          const newData = { ...formData, maritalStatus: e.target.value };
                          setFormData(newData);
                          localStorage.setItem('registrationFormData', JSON.stringify(newData));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => {
                        setCurrentStep(1);
                        localStorage.setItem('registrationStep', '1');
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold shadow-lg flex items-center"
                    >
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-semibold shadow-lg flex items-center"
                    >
                      Next
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-screen flex flex-col justify-center"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-black p-8 space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Work Experience</h3>
                    <p className="text-gray-600">Tell us about your professional background</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Are you currently working? *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Yes', 'No', 'Fresher'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            const newData = { ...formData, workStatus: option };
                            setFormData(newData);
                            localStorage.setItem('registrationFormData', JSON.stringify(newData));
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium text-center cursor-pointer transition-all ${
                            formData.workStatus === option 
                              ? 'bg-indigo-500 text-white shadow-md' 
                              : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Current City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => {
                        const newData = { ...formData, city: e.target.value };
                        setFormData(newData);
                        localStorage.setItem('registrationFormData', JSON.stringify(newData));
                      }}
                      placeholder="e.g., New York, NY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode *</label>
                    <select
                      value={formData.workMode}
                      onChange={(e) => {
                        const newData = { ...formData, workMode: e.target.value };
                        setFormData(newData);
                        localStorage.setItem('registrationFormData', JSON.stringify(newData));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select Work Mode</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => {
                        setCurrentStep(2);
                        localStorage.setItem('registrationStep', '2');
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold shadow-lg flex items-center"
                    >
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-semibold shadow-lg flex items-center"
                    >
                      Next
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-screen flex flex-col justify-center"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-black p-8 space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Registration</h3>
                    <p className="text-gray-600">Finalize your profile</p>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => {
                        setCurrentStep(3);
                        localStorage.setItem('registrationStep', '3');
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold shadow-lg flex items-center"
                    >
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 font-semibold shadow-lg flex items-center"
                    >
                      Create Account
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateRegistrationForm;