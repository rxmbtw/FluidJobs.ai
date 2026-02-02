
import React, { useState } from 'react';
import { METADATA } from '../constants';

interface SmartFormProps {
  type: 'NEW_CANDIDATE' | 'FEEDBACK' | 'OFFER';
  onClose: () => void;
}

const SmartForms: React.FC<SmartFormProps> = ({ type, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1200);
  };

  const renderNewCandidateForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
          <input type="text" placeholder="John Doe" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
          <input type="email" placeholder="john@example.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Target Role</label>
          <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            {METADATA.roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Location Preference</label>
          <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            {METADATA.locations.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">Resume Upload (PDF/DOCX)</label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 gap-2 hover:border-blue-400 transition-colors cursor-pointer">
          <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
          <span className="text-xs font-medium">Click to upload or drag and drop</span>
        </div>
      </div>
    </div>
  );

  const renderFeedbackForm = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
        <i className="fa-solid fa-robot text-blue-500"></i>
        <p className="text-[11px] text-blue-700 font-medium leading-tight">
          <span className="font-bold">Pro-Tip:</span> Marking "Cleared" will automatically move this candidate to the next stage in the pipeline.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Overall Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button type="button" key={star} className="w-10 h-10 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                {star}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Hiring Recommendation</label>
          <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
            <option className="text-green-700 font-bold">CLEARED - Highly Recommended</option>
            <option className="text-green-600">CLEARED - Average</option>
            <option className="text-yellow-600">ON HOLD</option>
            <option className="text-red-600">REJECTED</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase">Qualitative Feedback</label>
        <textarea placeholder="Write detailed interview observations..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-xl h-full bg-white rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {type === 'NEW_CANDIDATE' ? 'New Candidate Entry' : type === 'FEEDBACK' ? 'Interview Feedback' : 'Update Offer Status'}
            </h2>
            <p className="text-xs text-gray-600 font-medium">Smart automation handles the pipeline updates.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white transition-all flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          {type === 'NEW_CANDIDATE' && renderNewCandidateForm()}
          {type === 'FEEDBACK' && renderFeedbackForm()}
          {type === 'OFFER' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 italic">Select the new offer state below. Systems will auto-update CTC variance.</p>
              <div className="grid grid-cols-1 gap-4">
                <button type="button" className="p-4 rounded-2xl border-2 border-green-100 bg-green-50 text-green-700 flex items-center justify-between group hover:border-green-500 transition-all">
                  <span className="font-bold">Mark as Accepted</span>
                  <i className="fa-solid fa-check-circle text-green-600"></i>
                </button>
                <button type="button" className="p-4 rounded-2xl border border-gray-200 bg-white text-gray-600 flex items-center justify-between hover:border-red-500 hover:text-red-600 transition-all">
                  <span className="font-bold">Declined by Candidate</span>
                  <i className="fa-solid fa-circle-xmark text-gray-300"></i>
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="p-8 border-t border-gray-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
          <button 
            onClick={handleSubmit}
            className={`flex-[2] py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
            {loading ? 'Processing...' : 'Sync & Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartForms;
