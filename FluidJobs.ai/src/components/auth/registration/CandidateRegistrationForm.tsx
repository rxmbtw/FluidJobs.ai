import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, User, Phone, Mail, MapPin, Building, FileText, Camera, ArrowRight, ArrowLeft, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';

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
      // Run validation to show warnings (light validation)
      validateStep(1);

      // Optional: Check username but don't block
      if (formData.username) {
        const exists = await checkUsernameExists(formData.username);
        if (exists) {
          setErrors(prev => ({ ...prev, username: 'This email/phone is already registered. Please use a different one or sign in.' }));
        }
      }

      // Proceed regardless of errors
      const newStep = 2;
      setCurrentStep(newStep);
      localStorage.setItem('registrationStep', newStep.toString());
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

  const steps = [
    { id: 1, label: 'Account Details' },
    { id: 2, label: 'Personal Information' },
    { id: 3, label: 'Work Experience' },
    { id: 4, label: 'Documents & Review' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-gray-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Candidate Registration</h2>
            <p className="text-sm text-gray-500">Create your professional profile to get started</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white border-r border-gray-200 p-6 hidden lg:block overflow-y-auto">
            <nav className="space-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${currentStep === step.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : currentStep > step.id
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-500 hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }`}>
                    {currentStep > step.id ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="flex-1">{step.label}</span>
                </div>
              ))}
            </nav>

            {/* Mobile/Tablet Helper */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-800 font-medium mb-1">Need Help?</p>
              <p className="text-xs text-blue-600">Contact support if you face any issues during registration.</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 lg:p-10 relative">
            <div className="max-w-3xl mx-auto">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                      Account Details
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username (Email or Phone) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="Enter your email or phone number"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                              }`}
                          />
                          {isCheckingUsername && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                        </div>
                        {errors.username && <p className="text-red-500 text-sm mt-1 ml-1">{errors.username}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Lock className="w-5 h-5" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => {
                                const newData = { ...formData, password: e.target.value };
                                setFormData(newData);
                                localStorage.setItem('registrationFormData', JSON.stringify(newData));
                              }}
                              placeholder="Create password"
                              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-red-500 text-sm mt-1 ml-1">{errors.password}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Lock className="w-5 h-5" />
                            </div>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => {
                                const newData = { ...formData, confirmPassword: e.target.value };
                                setFormData(newData);
                                localStorage.setItem('registrationFormData', JSON.stringify(newData));
                              }}
                              placeholder="Confirm password"
                              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 ml-1">{errors.confirmPassword}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNextStep}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20 flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Next Step
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                      Personal Information
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <User className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => {
                              const newData = { ...formData, fullName: e.target.value };
                              setFormData(newData);
                              localStorage.setItem('registrationFormData', JSON.stringify(newData));
                            }}
                            placeholder="Enter your full name"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Phone className="w-5 h-5" />
                            </div>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => {
                                const newData = { ...formData, phone: e.target.value };
                                setFormData(newData);
                                localStorage.setItem('registrationFormData', JSON.stringify(newData));
                              }}
                              placeholder="+1 (555) 000-0000"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Mail className="w-5 h-5" />
                            </div>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => {
                                const newData = { ...formData, email: e.target.value };
                                setFormData(newData);
                                localStorage.setItem('registrationFormData', JSON.stringify(newData));
                              }}
                              placeholder="name@example.com"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select
                              value={formData.gender}
                              onChange={(e) => {
                                const newData = { ...formData, gender: e.target.value };
                                setFormData(newData);
                                localStorage.setItem('registrationFormData', JSON.stringify(newData));
                              }}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300 bg-white appearance-none cursor-pointer"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                              <ChevronDown className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select
                              value={formData.maritalStatus}
                              onChange={(e) => {
                                const newData = { ...formData, maritalStatus: e.target.value };
                                setFormData(newData);
                                localStorage.setItem('registrationFormData', JSON.stringify(newData));
                              }}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300 bg-white appearance-none cursor-pointer"
                            >
                              <option value="">Select Status</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                              <ChevronDown className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-gray-100 mt-6">
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          localStorage.setItem('registrationStep', '1');
                        }}
                        className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium flex items-center transition-colors hover:bg-gray-100 rounded-xl"
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20 flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Next Step
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                      Work Experience
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Are you currently working? <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          {['Yes', 'No', 'Fresher'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                const newData = { ...formData, workStatus: option };
                                setFormData(newData);
                                localStorage.setItem('registrationFormData', JSON.stringify(newData));
                              }}
                              className={`px-4 py-4 rounded-xl text-sm font-semibold text-center cursor-pointer transition-all border-2 ${formData.workStatus === option
                                ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-blue-50/50'
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => {
                              const newData = { ...formData, city: e.target.value };
                              setFormData(newData);
                              localStorage.setItem('registrationFormData', JSON.stringify(newData));
                            }}
                            placeholder="e.g., New York, NY"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <select
                            value={formData.workMode}
                            onChange={(e) => {
                              const newData = { ...formData, workMode: e.target.value };
                              setFormData(newData);
                              localStorage.setItem('registrationFormData', JSON.stringify(newData));
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-blue-300 bg-white appearance-none cursor-pointer"
                          >
                            <option value="">Select Work Mode</option>
                            <option value="Remote">Remote</option>
                            <option value="On-site">On-site</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                            <ChevronDown className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-gray-100 mt-6">
                      <button
                        onClick={() => {
                          setCurrentStep(2);
                          localStorage.setItem('registrationStep', '2');
                        }}
                        className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium flex items-center transition-colors hover:bg-gray-100 rounded-xl"
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20 flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Next Step
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                      Complete Registration
                    </h3>

                    <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Review your information</h4>
                          <p className="text-sm text-gray-600 mt-1">Please ensure all details provided are accurate. You can go back to edit any section.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setCurrentStep(3);
                          localStorage.setItem('registrationStep', '3');
                        }}
                        className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium flex items-center transition-colors hover:bg-gray-100 rounded-xl"
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20 flex items-center transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateRegistrationForm;