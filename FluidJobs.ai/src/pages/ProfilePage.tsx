import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, Edit, Lock, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useProfile } from '../contexts/ProfileContext';
import DashboardLayout from '../components/DashboardLayout';
import CoverImageCropperModal from '../components/CoverImageCropperModal';
import { profileService } from '../services/profileService';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profileData, updateProfile } = useProfile();
  
  // Debug logging
  console.log('📋 ProfilePage - user:', user);
  console.log('📋 ProfilePage - profileData:', profileData);
  console.log('📋 ProfilePage - sessionStorage profile:', sessionStorage.getItem('fluidjobs_profile'));
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('career');
  const [coverCropperImage, setCoverCropperImage] = useState<string | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverCropperImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverCropComplete = async (croppedBlob: Blob) => {
    try {
      const file = new File([croppedBlob], 'cover-image.jpg', { type: 'image/jpeg' });
      const result = await profileService.uploadCoverImage(file);
      
      if (result.success) {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const fullImageUrl = `${backendUrl}${result.fileUrl}`;
        updateProfile({ ...profileData, coverImage: fullImageUrl });
      }
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      alert('Failed to upload cover image. Please try again.');
    }
    setCoverCropperImage(null);
  };



  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content Column */}
      <div className="lg:col-span-3">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-32 bg-gradient-to-r from-purple-500 to-indigo-600 overflow-hidden z-[1]">
            {profileData.coverImage && (
              <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover" />
            )}

          </div>
          
          {/* Profile Details */}
          <div className="flex items-end px-6 -mt-12 relative z-[2]">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center overflow-hidden relative z-[4]">
              {profileData.profileImage ? (
                <img 
                  src={profileData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    console.log('Profile image failed to load:', profileData.profileImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white text-3xl font-bold">{profileData.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            
            <div className="flex justify-between items-center w-full ml-4 pb-2">
              <div>
                <h1 className="text-xl font-semibold text-white">{profileData.fullName || user?.name || 'User'}</h1>
                <p className="text-xs text-white/90 mt-1">{profileData.workStatus || 'Student'} | {profileData.city || 'Location'}</p>
                <p className="text-xs text-white/90">{profileData.currentCompany || profileData.lastCompany || 'Company'}</p>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-medium">{profileData.currentCompany || 'Company'}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 px-6 mt-4">
            <button
              onClick={() => setActiveTab('career')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'career'
                  ? 'border-[#673AB7] text-[#673AB7]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Career Journey
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contact'
                  ? 'border-[#673AB7] text-[#673AB7]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Contact
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-[#673AB7] text-[#673AB7]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Career Journey Section */}
        {activeTab === 'career' && (
          <div className="space-y-5 mt-5">
            {/* Work Experience */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Work Experience</h2>
              <div className="space-y-4">
                {profileData.workStatus === 'Yes' && profileData.currentCompany ? (
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-medium text-gray-900">{profileData.currentCompany}</h3>
                    <p className="text-sm text-gray-600">Current Position</p>
                    <p className="text-xs text-gray-500">Notice Period: {profileData.noticePeriod || 'Not specified'}</p>
                    {profileData.currentCTC && (
                      <p className="text-xs text-gray-500">CTC: ₹{profileData.currentCTC}</p>
                    )}
                  </div>
                ) : profileData.workStatus === 'No' && profileData.lastCompany ? (
                  <div className="border-l-4 border-gray-400 pl-4">
                    <h3 className="font-medium text-gray-900">{profileData.lastCompany}</h3>
                    <p className="text-sm text-gray-600">Previous Position</p>
                    {profileData.previousCTC && (
                      <p className="text-xs text-gray-500">Previous CTC: ₹{profileData.previousCTC}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No work experience added yet.</p>
                )}
              </div>
            </div>
            
            {/* Resume Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Resume & Documents</h2>
              <div className="space-y-3">
                {profileData.resumes && profileData.resumes.length > 0 ? (
                  profileData.resumes.map((resume: any, index: number) => (
                    <div key={resume.id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-red-600 text-xs font-bold">PDF</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resume.name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))
                ) : profileData.cvUrl ? (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">PDF</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Resume</p>
                        <p className="text-xs text-gray-500">Uploaded resume</p>
                      </div>
                    </div>
                    <a
                      href={profileData.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No resume uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Information Section */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-gray-600 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900">{profileData.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{profileData.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">City</p>
                <p className="text-sm font-medium text-gray-900">{profileData.city || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Work Mode</p>
                <p className="text-sm font-medium text-gray-900">{profileData.workMode || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Activity Section */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Activity</h2>
            <p className="text-xs text-gray-400 text-center py-6">There are no posts.</p>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 sticky top-8">
          <button
            onClick={() => navigate('/edit-profile')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#673AB7] border border-[#673AB7] rounded-lg text-xs font-semibold hover:bg-[#F3E5F5] transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/change-password')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        </div>
      </div>
    </div>


    {coverCropperImage && (
      <CoverImageCropperModal
        imageSrc={coverCropperImage}
        onCropComplete={handleCoverCropComplete}
        onCancel={() => setCoverCropperImage(null)}
      />
    )}
    </DashboardLayout>
  );
};

export default ProfilePage;
