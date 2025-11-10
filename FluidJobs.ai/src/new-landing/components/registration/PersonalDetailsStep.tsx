import React, { useState } from 'react';

interface PersonalDetailsStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({ onNext, onBack }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { fullName, phone: phoneNumber, email, gender, maritalStatus };
    console.log('Personal Details:', data);
    onNext(data);
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold text-center text-[#f9fafb]">Personal Information</h2>
      <p className="text-sm font-semibold text-center text-[#9ca3af] mb-6">Tell us about yourself</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full-name" className="block text-xs font-semibold mb-1 text-[#f9fafb]">Full Name*</label>
          <input 
            type="text" 
            id="full-name" 
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a1a1a] text-[#f9fafb] border border-[#374151] rounded-xl placeholder:text-[#9ca3af] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition duration-150"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/2">
            <label htmlFor="phone-number" className="block text-xs font-semibold mb-1 text-[#f9fafb]">Phone Number*</label>
            <input 
              type="tel" 
              id="phone-number" 
              placeholder="+91 98765 XXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] text-[#f9fafb] border border-[#374151] rounded-xl placeholder:text-[#9ca3af] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition duration-150"
              required
            />
          </div>
          <div className="sm:w-1/2">
            <label htmlFor="email" className="block text-xs font-semibold mb-1 text-[#f9fafb]">Email Address*</label>
            <input 
              type="email" 
              id="email" 
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] text-[#f9fafb] border border-[#374151] rounded-xl placeholder:text-[#9ca3af] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition duration-150"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/2">
            <label htmlFor="gender" className="block text-xs font-semibold mb-1 text-[#f9fafb]">Gender*</label>
            <select 
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#374151] rounded-xl text-[#9ca3af] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition duration-150 appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em', paddingRight: '3rem' }}
              required
            >
              <option value="" disabled>select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="sm:w-1/2">
            <label htmlFor="marital-status" className="block text-xs font-semibold mb-1 text-[#f9fafb]">Marital Status*</label>
            <select 
              id="marital-status"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#374151] rounded-xl text-[#9ca3af] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition duration-150 appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em', paddingRight: '3rem' }}
              required
            >
              <option value="" disabled>select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-between gap-4">
          <button 
            type="button"
            onClick={onBack}
            className="w-full sm:w-1/2 bg-gray-700/50 hover:bg-gray-700 text-[#f9fafb] font-semibold py-3 rounded-xl transition duration-200"
          >
            Back
          </button>
          <button 
            type="submit"
            className="w-full sm:w-1/2 bg-[#8B5CF6] hover:bg-[#7c4ce4] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#8B5CF6]/50 transition duration-200"
          >
            Next
          </button>
        </div>
      </form>
    </>
  );
};

export default PersonalDetailsStep;
