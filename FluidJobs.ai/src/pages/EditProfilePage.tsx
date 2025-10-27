import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Phone, Mail, Building, FileText, Camera, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useProfile } from '../contexts/ProfileContext';
import DashboardLayout from '../components/DashboardLayout';
import ImageCropperModal from '../components/ImageCropperModal';
import { generateImageSizes } from '../utils/imageUtils';
import { profileService } from '../services/profileService';

const EditProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profileData, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
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
    cv: null as File | null,
    profilePicture: null as File | null
  });

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showMaritalDropdown, setShowMaritalDropdown] = useState(false);
  const [showNoticeDropdown, setShowNoticeDropdown] = useState(false);
  const [showWorkModeDropdown, setShowWorkModeDropdown] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [profileImageSizes, setProfileImageSizes] = useState<{ full: string; medium: string; thumbnail: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProfilePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropperImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (field: 'cv', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const sizes = await generateImageSizes(croppedBlob);
    setProfileImageSizes(sizes);
    setFormData(prev => ({ ...prev, profilePicture: new File([croppedBlob], 'profile.jpg') }));
    setCropperImage(null);
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Load fresh data from database
        const profile = await profileService.getProfile();
        if (profile) {
          setFormData({
            fullName: profile.full_name || '',
            phone: profile.phone || profile.phone_number || '',
            email: profile.email || '',
            gender: profile.gender || '',
            maritalStatus: profile.marital_status || '',
            workStatus: profile.work_status || '',
            currentCompany: profile.current_company || '',
            noticePeriod: profile.notice_period || '',
            currentCTC: profile.current_ctc || '',
            lastCompany: profile.last_company || '',
            previousCTC: profile.previous_ctc || '',
            city: profile.city || profile.location || '',
            workMode: profile.work_mode || '',
            cv: null,
            profilePicture: null
          });
        } else {
          // Fallback to context data
          setFormData({
            fullName: profileData.fullName,
            phone: profileData.phone,
            email: profileData.email,
            gender: profileData.gender,
            maritalStatus: profileData.maritalStatus,
            workStatus: profileData.workStatus,
            currentCompany: profileData.currentCompany,
            noticePeriod: profileData.noticePeriod,
            currentCTC: profileData.currentCTC,
            lastCompany: profileData.lastCompany,
            previousCTC: profileData.previousCTC,
            city: profileData.city,
            workMode: profileData.workMode,
            cv: null,
            profilePicture: null
          });
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
        // Fallback to context data on error
        setFormData({
          fullName: profileData.fullName,
          phone: profileData.phone,
          email: profileData.email,
          gender: profileData.gender,
          maritalStatus: profileData.maritalStatus,
          workStatus: profileData.workStatus,
          currentCompany: profileData.currentCompany,
          noticePeriod: profileData.noticePeriod,
          currentCTC: profileData.currentCTC,
          lastCompany: profileData.lastCompany,
          previousCTC: profileData.previousCTC,
          city: profileData.city,
          workMode: profileData.workMode,
          cv: null,
          profilePicture: null
        });
      }
    };

    loadProfileData();
  }, [profileData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upload files if changed
      if (formData.profilePicture) {
        try {
          await profileService.uploadProfileImage(formData.profilePicture);
          console.log('Profile image uploaded successfully');
        } catch (uploadError) {
          console.warn('Profile image upload failed:', uploadError);
        }
      }
      
      if (formData.cv) {
        try {
          await profileService.uploadResume(formData.cv);
          console.log('Resume uploaded successfully');
        } catch (uploadError) {
          console.warn('Resume upload failed:', uploadError);
        }
      }
      
      // Save profile data to database
      const result = await profileService.saveProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        workStatus: formData.workStatus,
        currentCompany: formData.currentCompany,
        noticePeriod: formData.noticePeriod,
        currentCTC: formData.currentCTC,
        lastCompany: formData.lastCompany,
        previousCTC: formData.previousCTC,
        city: formData.city,
        workMode: formData.workMode
      });

      if (result.success) {
        // Fetch fresh profile data from database to get updated file URLs
        const freshProfile = await profileService.getProfile();
        
        if (freshProfile) {
          // Update profile context with fresh data from database
          updateProfile({
            ...profileData,
            fullName: freshProfile.full_name || formData.fullName,
            phone: freshProfile.phone || freshProfile.phone_number || formData.phone,
            email: freshProfile.email || formData.email,
            gender: freshProfile.gender || formData.gender,
            maritalStatus: freshProfile.marital_status || formData.maritalStatus,
            workStatus: freshProfile.work_status || formData.workStatus,
            currentCompany: freshProfile.current_company || formData.currentCompany,
            noticePeriod: freshProfile.notice_period || formData.noticePeriod,
            currentCTC: freshProfile.current_ctc || formData.currentCTC,
            lastCompany: freshProfile.last_company || formData.lastCompany,
            previousCTC: freshProfile.previous_ctc || formData.previousCTC,
            city: freshProfile.city || freshProfile.location || formData.city,
            workMode: freshProfile.work_mode || formData.workMode,
            profileImage: freshProfile.profile_image_url || profileData.profileImage,
            cvUrl: freshProfile.resume_files?.[freshProfile.resume_files.length - 1]?.url || profileData.cvUrl,
            resumes: freshProfile.resume_files || profileData.resumes
          });
        } else {
          // Fallback to form data if fresh profile fetch fails
          updateProfile({
            ...profileData,
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            gender: formData.gender,
            maritalStatus: formData.maritalStatus,
            workStatus: formData.workStatus,
            currentCompany: formData.currentCompany,
            noticePeriod: formData.noticePeriod,
            currentCTC: formData.currentCTC,
            lastCompany: formData.lastCompany,
            previousCTC: formData.previousCTC,
            city: formData.city,
            workMode: formData.workMode
          });
        }

        // Show success message
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      
      // Try to get more specific error message
      let errorMessage = 'Failed to save profile. Please try again.';
      if (error instanceof Error && error.message) {
        errorMessage = `Failed to save profile: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
        {/* Personal Information Section */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h3>
          <p className="text-gray-600">Update your professional information</p>
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
            {showMaritalDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3">
                <div className="grid grid-cols-2 gap-2">
                  {['Single', 'Married', 'Divorced', 'Widowed'].map((option) => (
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
          </div>
        </div>

        {/* Work Experience Section */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h4>
          
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
          </div>

          {formData.workStatus === 'Yes' && (
            <div className="space-y-4 mt-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period *</label>
                  <button
                    type="button"
                    onClick={() => setShowNoticeDropdown(!showNoticeDropdown)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-left"
                  >
                    {formData.noticePeriod || 'Select Notice Period'}
                  </button>
                  {showNoticeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {['Immediate', '15 Days', '1 Month', '2 Months', '3 Months'].map((option) => (
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Annual CTC *</label>
                  <input
                    type="number"
                    value={formData.currentCTC}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentCTC: e.target.value }))}
                    placeholder="e.g., 800000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.workStatus === 'No' && (
            <div className="space-y-4 mt-4">
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
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="e.g., Bangalore, India"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode *</label>
              <button
                type="button"
                onClick={() => setShowWorkModeDropdown(!showWorkModeDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-left"
              >
                {formData.workMode || 'Select Work Mode'}
              </button>
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
          </div>
        </div>

        {/* Documents Section */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Documents & Profile</h4>
          
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
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-2" />
              Profile Picture (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">For best results, upload a square image that is at least 500x500 pixels.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-4">
                  {profileImageSizes?.full ? (
                    <img src={profileImageSizes.full} alt="Profile" className="w-full h-full object-cover" />
                  ) : profileData.profileImage ? (
                    <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureSelect}
                  className="hidden"
                  id="profile-upload"
                />
                <label htmlFor="profile-upload" className="bg-indigo-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-600">
                  {formData.profilePicture ? 'Change Photo' : 'Choose File'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {cropperImage && (
        <ImageCropperModal
          imageSrc={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperImage(null)}
        />
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" />
          Profile saved successfully!
        </div>
      )}
    </DashboardLayout>
  );
};

export default EditProfilePage;
