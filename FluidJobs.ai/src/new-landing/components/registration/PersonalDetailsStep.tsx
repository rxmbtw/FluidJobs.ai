import React, { useState } from 'react';
import CustomSelect from './CustomSelect';

interface PersonalDetailsStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialEmail?: string;
}

const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({ onNext, onBack, initialEmail = '' }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(initialEmail);
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
      <h2 className="text-xl sm:text-2xl font-bold text-center text-black">Personal Information</h2>
      <p className="text-sm font-semibold text-center text-gray-600 mb-6">Tell us about yourself</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full-name" className="block text-xs font-semibold mb-1 text-black">Full Name*</label>
          <input 
            type="text" 
            id="full-name" 
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl placeholder:text-gray-400 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition duration-150"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/2">
            <label htmlFor="phone-number" className="block text-xs font-semibold mb-1 text-black">Phone Number*</label>
            <input 
              type="tel" 
              id="phone-number" 
              placeholder="+91 98765 XXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl placeholder:text-gray-400 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition duration-150"
              required
            />
          </div>
          <div className="sm:w-1/2">
            <label htmlFor="email" className="block text-xs font-semibold mb-1 text-black">Email Address*</label>
            <input 
              type="email" 
              id="email" 
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl placeholder:text-gray-400 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition duration-150"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/2">
            <label className="block text-xs font-semibold mb-1 text-black">Gender*</label>
            <CustomSelect
              value={gender}
              onChange={setGender}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
              placeholder="select gender"
              required
            />
          </div>
          <div className="sm:w-1/2">
            <label className="block text-xs font-semibold mb-1 text-black">Marital Status*</label>
            <CustomSelect
              value={maritalStatus}
              onChange={setMaritalStatus}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' }
              ]}
              placeholder="select status"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex justify-between gap-4">
          <button 
            type="button"
            onClick={onBack}
            className="w-full sm:w-1/2 bg-gray-200 hover:bg-gray-300 text-black font-semibold py-3 rounded-xl transition duration-200"
          >
            Back
          </button>
          <button 
            type="submit"
            className="w-full sm:w-1/2 bg-[#4285F4] hover:bg-[#3367d6] text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200"
          >
            Next
          </button>
        </div>
      </form>
    </>
  );
};

export default PersonalDetailsStep;
