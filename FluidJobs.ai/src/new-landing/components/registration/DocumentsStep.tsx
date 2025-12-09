import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface DocumentsStepProps {
  onBack: () => void;
  onComplete: () => void;
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({ onBack, onComplete }) => {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    console.log('Documents:', { profilePicture, resume });
    onComplete();
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold text-center text-black">Upload Your Documents</h2>
      <p className="text-sm font-semibold text-center text-gray-600 mb-6">Upload a profile picture and your latest resume to complete registration.</p>

      <div className="space-y-4">
        <div className="p-4 border border-gray-300 rounded-xl hover:border-[#4285F4] transition flex flex-col items-center justify-center space-y-2">
          <p className="text-sm font-semibold text-gray-600">Upload Profile Picture (optional)</p>
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="text-[#4285F4] font-medium text-sm">Click to upload or drag and drop</p>
          <p className="text-gray-600 text-xs">For best results, upload a square image that is at least 500x500 px</p>
          <label htmlFor="profile-picture" className="px-5 py-1 text-xs font-medium text-white bg-[#4285F4] rounded-lg shadow-md hover:opacity-90 transition cursor-pointer">
            {profilePicture ? 'File Selected' : 'Choose File'}
          </label>
          <input 
            type="file" 
            id="profile-picture" 
            className="hidden" 
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
        </div>

        <div className="p-4 border border-gray-300 rounded-xl hover:border-[#4285F4] transition flex flex-col items-center justify-center space-y-2">
          <p className="text-sm font-semibold text-gray-600">Upload Resume</p>
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="text-[#4285F4] font-medium text-sm">Click to upload or drag and drop</p>
          <p className="text-gray-600 text-xs">PDF, DOC (Max 5MB)</p>
          <label htmlFor="resume" className="px-5 py-1 text-xs font-medium text-white bg-[#4285F4] rounded-lg shadow-md hover:opacity-90 transition cursor-pointer">
            {resume ? 'File Selected' : 'Choose File'}
          </label>
          <input 
            type="file" 
            id="resume" 
            className="hidden" 
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
          />
        </div>
      </div>

      <div className="flex space-x-4 pt-6">
        <button 
          type="button"
          onClick={onBack}
          className="flex-1 h-12 border border-gray-300 bg-gray-200 text-black font-semibold text-lg rounded-xl hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          className="flex-1 h-12 bg-[#4285F4] text-white font-semibold text-lg rounded-xl shadow-lg hover:opacity-90 transition"
        >
          Create Account
        </button>
      </div>
    </>
  );
};

export default DocumentsStep;
