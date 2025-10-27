import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, User, Phone, Mail, MapPin, Building, FileText, Camera, ArrowRight, ArrowLeft } from 'lucide-react';

interface FormData {
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showMaritalDropdown, setShowMaritalDropdown] = useState(false);
  const [showNoticeDropdown, setShowNoticeDropdown] = useState(false);
  const [showWorkModeDropdown, setShowWorkModeDropdown] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const totalSteps = 3;

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(progress);
        
        // Update current step based on scroll position
        const step1Top = step1Ref.current?.offsetTop || 0;
        const step2Top = step2Ref.current?.offsetTop || 0;
        const step3Top = step3Ref.current?.offsetTop || 0;
        
        if (scrollTop < step2Top - 200) {
          setCurrentStep(1);
        } else if (scrollTop < step3Top - 200) {
          setCurrentStep(2);
        } else {
          setCurrentStep(3);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    }

    if (step === 2) {
      if (!formData.workStatus) newErrors.workStatus = 'Work status is required';
      if (formData.workStatus === 'Yes') {
        if (!formData.currentCompany) newErrors.currentCompany = 'Current company is required';
        if (!formData.noticePeriod) newErrors.noticePeriod = 'Notice period is required';
        if (!formData.currentCTC) newErrors.currentCTC = 'Current CTC is required';
      }
      if (formData.workStatus === 'No') {
        if (!formData.lastCompany) newErrors.lastCompany = 'Last company is required';
        if (!formData.previousCTC) newErrors.previousCTC = 'Previous CTC is required';
      }
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.workMode) newErrors.workMode = 'Work mode is required';
    }

    if (step === 3) {
      if (!formData.cv) newErrors.cv = 'CV upload is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = () => {
    if (validateStep(3)) {
      onSubmit(formData);
    }
  };

  const handleFileUpload = (field: 'cv' | 'profilePicture', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
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
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step <= currentStep ? 'bg-white text-indigo-600' : 'bg-white/30 text-white/70'
                    }`}>
                      {step}
                    </div>
                    <span className="text-xs mt-1 text-white/80">
                      {step === 1 ? 'Personal' : step === 2 ? 'Experience' : 'Documents'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${(scrollProgress / 100) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {/* Step 1: Personal Information */}
            <motion.div
              ref={step1Ref}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-screen flex flex-col justify-center"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-black p-8 space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600">Let's start with your basic details</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <button
                      type="button"
                      onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-left"
                    >
                      {formData.gender || 'Select Gender'}
                    </button>
                    <div className="absolute right-3 top-11 transform -translate-y-1/2 pointer-events-none">
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${showGenderDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {showGenderDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3">
                        <div className="grid grid-cols-1 gap-2">
                          {['Male', 'Female', 'Prefer not to say'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, gender: option }));
                                setShowGenderDropdown(false);
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium text-center cursor-pointer transition-all ${
                                formData.gender === option 
                                  ? 'bg-indigo-500 text-white shadow-md' 
                                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status *</label>
                    <button
                      type="button"
                      onClick={() => setShowMaritalDropdown(!showMaritalDropdown)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-left"
                    >
                      {formData.maritalStatus || 'Select Status'}
                    </button>
                    <div className="absolute right-3 top-11 transform -translate-y-1/2 pointer-events-none">
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${showMaritalDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {showMaritalDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          {['Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, maritalStatus: option }));
                                setShowMaritalDropdown(false);
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium text-center cursor-pointer transition-all ${
                                formData.maritalStatus === option 
                                  ? 'bg-indigo-500 text-white shadow-md' 
                                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors.maritalStatus && <p className="text-red-500 text-sm mt-1">{errors.maritalStatus}</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Work Experience */}
            <motion.div
              ref={step2Ref}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="min-h-screen flex flex-col justify-center"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-black p-8 space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Work Experience</h3>
                  <p className="text-gray-600">Tell us about your professional background</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you currently working anywhere? *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Yes', 'No', 'Fresher'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, workStatus: option }))}
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
                  {errors.workStatus && <p className="text-red-500 text-sm mt-1">{errors.workStatus}</p>}
                </div>

                {/* Conditional Fields */}
                {formData.workStatus === 'Yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-2" />
                        Current Company *
                      </label>
                      <input
                        type="text"
                        value={formData.currentCompany}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                        placeholder="e.g., TechCorp Solutions"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {errors.currentCompany && <p className="text-red-500 text-sm mt-1">{errors.currentCompany}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period *</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowNoticeDropdown(!showNoticeDropdown)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-left"
                          >
                            {formData.noticePeriod || 'Select Notice Period'}
                          </button>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showNoticeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {showNoticeDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3">
                              <div className="grid grid-cols-2 gap-2">
                                {['Immediate', '15 Days', '1 Month', '2 Months', '3 Months', 'More than 3 Months'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, noticePeriod: option }));
                                      setShowNoticeDropdown(false);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium text-center cursor-pointer transition-all ${
                                      formData.noticePeriod === option 
                                        ? 'bg-indigo-500 text-white shadow-md' 
                                        : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {errors.noticePeriod && <p className="text-red-500 text-sm mt-1">{errors.noticePeriod}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Annual CTC *</label>
                        <input
                          type="number"
                          value={formData.currentCTC}
                          onChange={(e) => setFormData(prev => ({ ...prev, currentCTC: e.target.value }))}
                          placeholder="e.g., 800000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        {errors.currentCTC && <p className="text-red-500 text-sm mt-1">{errors.currentCTC}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {formData.workStatus === 'No' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-2" />
                        Last Company *
                      </label>
                      <input
                        type="text"
                        value={formData.lastCompany}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastCompany: e.target.value }))}
                        placeholder="e.g., InnovateCorp"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {errors.lastCompany && <p className="text-red-500 text-sm mt-1">{errors.lastCompany}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Previous Annual CTC *</label>
                      <input
                        type="number"
                        value={formData.previousCTC}
                        onChange={(e) => setFormData(prev => ({ ...prev, previousCTC: e.target.value }))}
                        placeholder="e.g., 600000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {errors.previousCTC && <p className="text-red-500 text-sm mt-1">{errors.previousCTC}</p>}
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Current City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g., Bangalore, India"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode *</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowWorkModeDropdown(!showWorkModeDropdown)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-left"
                      >
                        {formData.workMode || 'Select Work Mode'}
                      </button>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${showWorkModeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {showWorkModeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3">
                          <div className="grid grid-cols-3 gap-2">
                            {['Remote', 'On-site', 'Hybrid'].map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, workMode: option }));
                                  setShowWorkModeDropdown(false);
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium text-center cursor-pointer transition-all ${
                                  formData.workMode === option 
                                    ? 'bg-indigo-500 text-white shadow-md' 
                                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.workMode && <p className="text-red-500 text-sm mt-1">{errors.workMode}</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Documents & Profile */}
            <motion.div
              ref={step3Ref}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="min-h-screen flex flex-col justify-center"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-black p-8 space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Documents & Profile</h3>
                  <p className="text-gray-600">Upload your documents and complete your profile</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Upload CV *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('cv', e.target.files[0])}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload" className="mt-2 inline-block bg-indigo-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-600">
                      Choose File
                    </label>
                    {formData.cv && <p className="mt-2 text-sm text-green-600">✓ {formData.cv.name}</p>}
                  </div>
                  {errors.cv && <p className="text-red-500 text-sm mt-1">{errors.cv}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Profile Picture (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-4">
                        {formData.profilePicture ? (
                          <img src={URL.createObjectURL(formData.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 mb-2">JPG, PNG (Max 2MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('profilePicture', e.target.files[0])}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label htmlFor="profile-upload" className="bg-indigo-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-600">
                        {formData.profilePicture ? 'Change Photo' : 'Choose File'}
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-8">
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 text-lg font-semibold shadow-lg"
                  >
                    Create Profile
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Already have an account?{' '}
                    <button onClick={onClose} className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateRegistrationForm;