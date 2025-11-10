import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
      <h2 className="text-xl sm:text-2xl font-bold text-center text-[#f9fafb]">Work Experience</h2>
      <p className="text-sm font-semibold text-center text-[#9ca3af] mb-6">Tell us about your professional background</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="work-status" className="block text-sm font-semibold text-[#f9fafb] mb-2">Are you currently working?*</label>
          <div className="relative">
            <select 
              id="work-status"
              value={currentlyWorking}
              onChange={(e) => setCurrentlyWorking(e.target.value)}
              className="w-full p-3 appearance-none border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium"
              required
            >
              <option value="" disabled>Select status</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="fresher">Fresher</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9ca3af]">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {currentlyWorking === 'yes' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-semibold text-[#f9fafb] mb-2">Current Company*</label>
                <input 
                  type="text" 
                  id="company-name" 
                  placeholder="e.g., FluidLive Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                  required
                />
              </div>

              <div>
                <label htmlFor="joining-date" className="block text-sm font-semibold text-[#f9fafb] mb-2">Joining Date*</label>
                <input 
                  type="text" 
                  id="joining-date" 
                  placeholder="dd-mm-yyyy"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="notice-period" className="block text-sm font-semibold text-[#f9fafb] mb-2">Notice period*</label>
                <input 
                  type="text" 
                  id="notice-period" 
                  placeholder="e.g., 30 days"
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                  required
                />
              </div>

              <div>
                <label htmlFor="current-ctc" className="block text-sm font-semibold text-[#f9fafb] mb-2">Current Annual CTC*</label>
                <input 
                  type="text" 
                  id="current-ctc" 
                  placeholder="e.g., 15,00,000"
                  value={currentCTC}
                  onChange={(e) => setCurrentCTC(e.target.value)}
                  className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
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
                <label htmlFor="company-name" className="block text-sm font-semibold text-[#f9fafb] mb-2">Previous Company*</label>
                <input 
                  type="text" 
                  id="company-name" 
                  placeholder="e.g., Previous Company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                  required
                />
              </div>

              <div>
                <label htmlFor="previous-ctc" className="block text-sm font-semibold text-[#f9fafb] mb-2">Previous Annual CTC*</label>
                <input 
                  type="text" 
                  id="previous-ctc" 
                  placeholder="e.g., 12,00,000"
                  value={previousCTC}
                  onChange={(e) => setPreviousCTC(e.target.value)}
                  className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="joining-date" className="block text-sm font-semibold text-[#f9fafb] mb-2">Joining Date*</label>
                <input 
                  type="text" 
                  id="joining-date" 
                  placeholder="dd-mm-yyyy"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                  required
                />
              </div>

              <div>
                <label htmlFor="leaving-date" className="block text-sm font-semibold text-[#f9fafb] mb-2">Leaving Date*</label>
                <input 
                  type="text" 
                  id="leaving-date" 
                  placeholder="dd-mm-yyyy"
                  value={leavingDate}
                  onChange={(e) => setLeavingDate(e.target.value)}
                  className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className={`grid grid-cols-1 ${currentlyWorking !== 'fresher' && currentlyWorking !== '' ? 'sm:grid-cols-2' : ''} gap-4`}>
          <div>
            <label htmlFor="current-city" className="block text-sm font-semibold text-[#f9fafb] mb-2">Current City*</label>
            <input 
              type="text" 
              id="current-city" 
              placeholder="e.g., Pune, Maharashtra"
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="w-full p-3 border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium placeholder:text-[#9ca3af]"
              required
            />
          </div>

          {currentlyWorking !== 'fresher' && currentlyWorking !== '' && (
            <div>
              <label htmlFor="work-mode" className="block text-sm font-semibold text-[#f9fafb] mb-2">Work Mode*</label>
              <div className="relative">
                <select 
                  id="work-mode"
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full p-3 appearance-none border border-[#374151] bg-[#1a1a1a] text-[#f9fafb] rounded-xl focus:ring-[#8B5CF6] focus:border-[#8B5CF6] outline-none text-sm font-medium"
                  required
                >
                  <option value="" disabled>select status</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9ca3af]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 h-12 border border-[#374151] text-[#9ca3af] font-semibold text-lg rounded-xl hover:bg-[#374151] transition"
          >
            Back
          </button>
          <button 
            type="submit"
            className="flex-1 h-12 bg-[#8B5CF6] text-[#f9fafb] font-semibold text-lg rounded-xl shadow-lg hover:opacity-90 transition"
          >
            Next
          </button>
        </div>
      </form>
    </>
  );
};

export default ExperienceStep;
