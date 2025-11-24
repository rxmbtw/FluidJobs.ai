import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import CustomSelect from './CustomSelect';
import LocationAutocomplete from '../../candidate-dashboard/LocationAutocomplete';

interface ExperienceStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const ExperienceStep: React.FC<ExperienceStepProps> = ({ onNext, onBack }) => {
  const [currentlyWorking, setCurrentlyWorking] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [leavingDate, setLeavingDate] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [currentCTC, setCurrentCTC] = useState('');
  const [previousCTC, setPreviousCTC] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [workMode, setWorkMode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCity) {
      alert('Please fill in your current city.');
      return;
    }
    if (currentlyWorking === 'yes' && (!companyName || !joiningDate || !noticePeriod || !currentCTC || !workMode)) {
      alert('Please fill in all required fields.');
      return;
    }
    if (currentlyWorking === 'no' && (!companyName || !previousCTC || !joiningDate || !leavingDate || !workMode)) {
      alert('Please fill in all required fields.');
      return;
    }
    const data = {
      workStatus: currentlyWorking,
      currentCompany: currentlyWorking === 'yes' ? companyName : '',
      lastCompany: currentlyWorking === 'no' ? companyName : '',
      noticePeriod,
      currentCTC,
      previousCTC,
      city: currentCity,
      workMode
    };
    console.log('Experience Data:', data);
    onNext(data);
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold text-center text-black">Work Experience</h2>
      <p className="text-sm font-semibold text-center text-gray-600 mb-6">Tell us about your professional background</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-black mb-2">Are you currently working?*</label>
          <CustomSelect
            value={currentlyWorking}
            onChange={setCurrentlyWorking}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'fresher', label: 'Fresher' }
            ]}
            placeholder="Select status"
            required
          />
        </div>

        {currentlyWorking === 'yes' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-semibold text-black mb-2">Current Company*</label>
                <input 
                  type="text" 
                  id="company-name" 
                  placeholder="e.g., FluidLive Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="joining-date" className="block text-sm font-semibold text-black mb-2">Joining Date*</label>
                <input 
                  type="text" 
                  id="joining-date" 
                  placeholder="dd-mm-yyyy"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="notice-period" className="block text-sm font-semibold text-black mb-2">Notice period*</label>
                <input 
                  type="text" 
                  id="notice-period" 
                  placeholder="e.g., 30 days"
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="current-ctc" className="block text-sm font-semibold text-black mb-2">Current Annual CTC*</label>
                <input 
                  type="text" 
                  id="current-ctc" 
                  placeholder="e.g., 15,00,000"
                  value={currentCTC}
                  onChange={(e) => setCurrentCTC(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
          </>
        )}

        {currentlyWorking === 'no' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-semibold text-black mb-2">Previous Company*</label>
                <input 
                  type="text" 
                  id="company-name" 
                  placeholder="e.g., Previous Company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="previous-ctc" className="block text-sm font-semibold text-black mb-2">Previous Annual CTC*</label>
                <input 
                  type="text" 
                  id="previous-ctc" 
                  placeholder="e.g., 12,00,000"
                  value={previousCTC}
                  onChange={(e) => setPreviousCTC(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="joining-date" className="block text-sm font-semibold text-black mb-2">Joining Date*</label>
                <input 
                  type="text" 
                  id="joining-date" 
                  placeholder="dd-mm-yyyy"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="leaving-date" className="block text-sm font-semibold text-black mb-2">Leaving Date*</label>
                <input 
                  type="text" 
                  id="leaving-date" 
                  placeholder="dd-mm-yyyy"
                  value={leavingDate}
                  onChange={(e) => setLeavingDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
          </>
        )}

        {currentlyWorking === 'fresher' && (
          <>
            <div>
              <label htmlFor="college" className="block text-sm font-semibold text-black mb-2">College/University*</label>
              <input 
                type="text" 
                id="college" 
                placeholder="e.g., MICA, MIT, BVPUD & etc..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Current City*</label>
                <LocationAutocomplete
                  value={currentCity}
                  onChange={setCurrentCity}
                  placeholder="e.g., Pune, Maharashtra"
                  className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                  themeState="light"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Preferred Work Mode*</label>
                <CustomSelect
                  value={workMode}
                  onChange={setWorkMode}
                  options={[
                    { value: 'remote', label: 'Remote' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'onsite', label: 'On-site' }
                  ]}
                  placeholder="select status"
                  required
                />
              </div>
            </div>
          </>
        )}

        {currentlyWorking !== 'fresher' && currentlyWorking !== '' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Current City*</label>
              <LocationAutocomplete
                value={currentCity}
                onChange={setCurrentCity}
                placeholder="e.g., Pune, Maharashtra"
                className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
                themeState="light"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Work Mode*</label>
              <CustomSelect
                value={workMode}
                onChange={setWorkMode}
                options={[
                  { value: 'remote', label: 'Remote' },
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'onsite', label: 'On-site' }
                ]}
                placeholder="select status"
                required
              />
            </div>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 h-12 border border-gray-300 bg-gray-200 text-black font-semibold text-lg rounded-xl hover:bg-gray-300 transition"
          >
            Back
          </button>
          <button 
            type="submit"
            className="flex-1 h-12 bg-[#4285F4] text-white font-semibold text-lg rounded-xl shadow-lg hover:opacity-90 transition"
          >
            Next
          </button>
        </div>
      </form>
    </>
  );
};

export default ExperienceStep;
