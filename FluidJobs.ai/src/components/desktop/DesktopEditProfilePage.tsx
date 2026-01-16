import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, MapPin, User as UserIcon, Edit, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import ImageCropperModal from '../ImageCropperModal';
import LocationAutocomplete from '../LocationAutocomplete';
import PhoneInput from '../../new-landing/candidate-dashboard/PhoneInput';
import CollegeAutocomplete from '../CollegeAutocomplete';
import Loader from '../Loader';
import Notification from '../Notification';
import { useProfileCompletionContext } from '../../contexts/ProfileCompletionContext';

interface EditProfilePageProps {
  themeState: 'light' | 'dark';
  onTabChange?: (hasChanges: boolean) => void;
  saveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({ themeState, onTabChange, saveRef }) => {
  const { triggerRefresh } = useProfileCompletionContext();
  const [workStatus, setWorkStatus] = useState<'yes' | 'no' | 'fresher'>('yes');
  const [initialWorkStatus, setInitialWorkStatus] = useState<'yes' | 'no' | 'fresher'>('yes');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    maritalStatus: '',
    currentCity: '',
    currentCompany: '',
    noticePeriod: '',
    workMode: '',
    currentCTC: '',
    lastCompany: '',
    previousCTC: '',
    college: '',
    joiningDate: '',
    leavingDate: ''
  });
  const [initialFormData, setInitialFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    maritalStatus: '',
    currentCity: '',
    currentCompany: '',
    noticePeriod: '',
    workMode: '',
    currentCTC: '',
    lastCompany: '',
    previousCTC: '',
    college: '',
    joiningDate: '',
    leavingDate: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.get('http://localhost:8000/api/profile/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile: any = response.data;
      console.log('Loaded profile from database:', profile);
      
      // Handle NULL values and convert to empty strings
      const profileData = {
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: (profile.phone || profile.phone_number || '').trim(),
        gender: (profile.gender || '').trim(),
        maritalStatus: (profile.marital_status || '').trim(),
        currentCity: (profile.city || profile.location || '').trim(),
        currentCompany: (profile.current_company || '').trim(),
        noticePeriod: (profile.notice_period || '').trim(),
        workMode: (profile.work_mode || '').trim(),
        currentCTC: profile.current_ctc ? String(profile.current_ctc) : '',
        lastCompany: (profile.last_company || '').trim(),
        previousCTC: profile.previous_ctc ? String(profile.previous_ctc) : '',
        college: (profile.college || '').trim(),
        joiningDate: (profile.joining_date || '').trim(),
        leavingDate: (profile.leaving_date || '').trim()
      };
      
      setFormData(profileData);
      setInitialFormData(profileData);
      
      const imageUrl = profile.profile_image_url;
      if (imageUrl && imageUrl.trim()) {
        const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
        setProfileImage(fullUrl);
      }
      
      // Handle work status - default to 'yes' if empty
      const status = (profile.work_status || '').trim();
      const workStatusValue = status === 'no' || status === 'fresher' ? status : 'yes';
      setWorkStatus(workStatusValue);
      setInitialWorkStatus(workStatusValue);
      
      console.log('Profile data loaded into form');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData) || workStatus !== initialWorkStatus;
  };

  useEffect(() => {
    if (onTabChange) {
      onTabChange(hasChanges());
    }
  }, [formData, workStatus, initialFormData, initialWorkStatus]);

  useEffect(() => {
    if (saveRef) {
      saveRef.current = handleSaveProfile;
    }
  }, [formData, workStatus]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDropdown = (field: string) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  const selectOption = (field: string, value: string) => {
    handleInputChange(field, value);
    setOpenDropdown(null);
  };

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const formData = new FormData();
    formData.append('profileImage', croppedBlob, 'profile.jpg');
    
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.post('http://localhost:8000/api/profile/upload-profile-image', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      console.log('Upload response:', response.data);
      const fileUrl = (response.data as any).fileUrl;
      console.log('File URL from backend:', fileUrl);
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8000${fileUrl}`;
      console.log('Full URL to display:', fullUrl);
      setProfileImage(fullUrl);
      setMessage('Profile picture uploaded!');
      setShowNotification(true);
      triggerRefresh(); // Trigger profile completion refresh
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setMessage('Failed to upload image');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      console.log('Uploading resume:', file.name);
      const response = await axios.post('http://localhost:8000/api/profile/upload-resume', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      console.log('Resume upload response:', response.data);
      setMessage('Resume uploaded successfully!');
      setShowNotification(true);
      triggerRefresh(); // Trigger profile completion refresh
      fetchProfile(); // Refresh profile to show new resume
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      console.error('Error response:', error.response?.data);
      setMessage(error.response?.data?.error || 'Failed to upload resume');
    }
    e.target.value = '';
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      console.log('Saving profile with data:', {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        workStatus: workStatus,
        currentCompany: formData.currentCompany,
        noticePeriod: formData.noticePeriod,
        currentCTC: formData.currentCTC,
        lastCompany: formData.lastCompany,
        previousCTC: formData.previousCTC,
        city: formData.currentCity,
        workMode: formData.workMode
      });
      const response = await axios.put('http://localhost:8000/api/profile/profile', {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        workStatus: workStatus,
        currentCompany: formData.currentCompany,
        noticePeriod: formData.noticePeriod,
        currentCTC: formData.currentCTC,
        lastCompany: formData.lastCompany,
        previousCTC: formData.previousCTC,
        city: formData.currentCity,
        workMode: formData.workMode,
        college: formData.college,
        joiningDate: formData.joiningDate,
        leavingDate: formData.leavingDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Profile save response:', response.data);
      setMessage('Profile saved successfully!');
      setShowNotification(true);
      await fetchProfile(); // Reload immediately to confirm save
      triggerRefresh(); // Trigger profile completion refresh after data is loaded
    } catch (error: any) {
      console.error('Error saving profile:', error);
      console.error('Error response:', error.response?.data);
      setMessage(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151', color: themeState === 'light' ? '#000000' : '#E5E7EB' };
  const labelStyle = { color: themeState === 'light' ? '#000000' : '#FFFFFF' };

  return (
    <div className="w-full rounded-t-[50px] p-4 overflow-hidden" style={{ backgroundColor: themeState === 'light' ? '#F1F1F1' : '#1a1a1a', height: 'calc(100vh - 116px)' }}>
      <h1 className="text-[18px] font-bold font-['Poppins'] mb-3" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Edit Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ height: 'calc(100% - 40px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <div className="rounded-[25px] p-[8px] relative" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', height: 'calc(50% - 6px)' }}>
            <div className="w-full h-[118px] bg-gradient-to-r from-[#0060FF] to-[#4285F4] rounded-[12px]"></div>
            
            <div className="absolute top-[78px] left-1/2 transform -translate-x-1/2 z-10">
              <div className="w-[100px] h-[100px] rounded-full bg-[rgba(66,133,244,0.16)] flex items-center justify-center relative">
                <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: profileImage ? 'transparent' : '#4285F4' }}>
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full" 
                      onLoad={() => console.log('Image loaded successfully:', profileImage)}
                      onError={(e) => { 
                        console.error('Image load error. URL:', profileImage); 
                        console.error('Image element:', e.currentTarget);
                      }} 
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-white" />
                  )}
                </div>
                <label htmlFor="profile-upload" className="absolute bottom-0 right-0 w-[25px] h-[25px] bg-[#0060FF] rounded-full flex items-center justify-center cursor-pointer z-20 shadow-lg">
                  <Edit className="w-3 h-3 text-white" />
                </label>
                <input id="profile-upload" type="file" accept="image/*" onChange={handleProfileImageSelect} className="hidden" />
              </div>
            </div>

            <button onClick={handleSaveProfile} disabled={loading} className="absolute bottom-[10px] left-[10px] right-[10px] h-[44px] bg-[rgba(0,131,17,0.7)] rounded-[12px] text-[13px] font-semibold font-['Poppins'] text-white hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader themeState={themeState} /> : <><Edit className="w-4 h-4" />Save Changes</>}
            </button>
          </div>

          <div className="rounded-[25px] p-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', height: 'calc(50% - 6px)', overflow: 'hidden' }}>
            <h3 className="text-[16px] font-bold font-['Poppins'] mb-2" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Information</h3>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <UserIcon className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Full Name*</span>
                </div>
                <input value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']" style={inputStyle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <Mail className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Email Address*</span>
                </div>
                <input value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']" style={inputStyle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <Phone className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Phone Number*</span>
                </div>
                <div style={{ width: '211px', height: '28px' }}>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    style={inputStyle}
                    themeState={themeState}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between" style={{ position: 'relative' }}>
                <div className="flex items-center gap-3 w-[140px]">
                  <UserIcon className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Gender</span>
                </div>
                <div style={{ width: '211px', position: 'relative' }}>
                  <div
                    onClick={() => toggleDropdown('gender')}
                    style={{
                      width: '100%',
                      height: '28px',
                      padding: '0 8px',
                      border: `1px solid ${openDropdown === 'gender' ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
                      borderRadius: '5px',
                      fontFamily: 'Poppins',
                      fontSize: '12px',
                      color: formData.gender ? (themeState === 'light' ? '#000000' : '#E5E7EB') : '#6E6E6E',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151'
                    }}
                  >
                    <span>{formData.gender || 'Select Gender'}</span>
                    {openDropdown === 'gender' ? 
                      <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                      <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                    }
                  </div>
                  {openDropdown === 'gender' && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      right: 0,
                      background: themeState === 'light' ? '#FFFFFF' : '#374151',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {['Male', 'Female', 'Others'].map((option, index) => (
                        <div
                          key={index}
                          onClick={() => selectOption('gender', option)}
                          style={{
                            padding: '8px 12px',
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB',
                            cursor: 'pointer',
                            background: formData.gender === option ? '#DBEAFE' : (themeState === 'light' ? '#FFFFFF' : '#374151'),
                            borderBottom: index < 2 ? '1px solid #F3F4F6' : 'none'
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between" style={{ position: 'relative' }}>
                <div className="flex items-center gap-3 w-[140px]">
                  <UserIcon className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Marital Status</span>
                </div>
                <div style={{ width: '211px', position: 'relative' }}>
                  <div
                    onClick={() => toggleDropdown('maritalStatus')}
                    style={{
                      width: '100%',
                      height: '28px',
                      padding: '0 8px',
                      border: `1px solid ${openDropdown === 'maritalStatus' ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
                      borderRadius: '5px',
                      fontFamily: 'Poppins',
                      fontSize: '12px',
                      color: formData.maritalStatus ? (themeState === 'light' ? '#000000' : '#E5E7EB') : '#6E6E6E',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151'
                    }}
                  >
                    <span>{formData.maritalStatus || 'Select Status'}</span>
                    {openDropdown === 'maritalStatus' ? 
                      <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                      <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                    }
                  </div>
                  {openDropdown === 'maritalStatus' && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      right: 0,
                      background: themeState === 'light' ? '#FFFFFF' : '#374151',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      {['Unmarried', 'Married'].map((option, index) => (
                        <div
                          key={index}
                          onClick={() => selectOption('maritalStatus', option)}
                          style={{
                            padding: '8px 12px',
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB',
                            cursor: 'pointer',
                            background: formData.maritalStatus === option ? '#DBEAFE' : (themeState === 'light' ? '#FFFFFF' : '#374151'),
                            borderBottom: index < 1 ? '1px solid #F3F4F6' : 'none'
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <MapPin className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Current City</span>
                </div>
                <LocationAutocomplete
                  value={formData.currentCity}
                  onChange={(value) => handleInputChange('currentCity', value)}
                  className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']"
                  style={inputStyle}
                  themeState={themeState}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <div className="rounded-[25px] p-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', height: 'calc(50% - 6px)', overflow: 'auto' }}>
            <h3 className="text-[20px] font-bold font-['Poppins'] mb-4" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Work Experience</h3>

            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Are you currently working anywhere?*</p>
                <div className="flex gap-2">
                  <button onClick={() => setWorkStatus('yes')} className={`w-[85px] h-[31px] rounded-[5px] text-[12px] font-medium font-['Poppins'] ${workStatus === 'yes' ? 'bg-[rgba(66,133,244,0.16)] border border-[#4285F4] text-black' : 'bg-[rgba(217,217,217,0.5)] border border-[rgba(0,0,0,0.5)] text-black'}`}>Yes</button>
                  <button onClick={() => setWorkStatus('no')} className={`w-[85px] h-[31px] rounded-[5px] text-[12px] font-medium font-['Poppins'] ${workStatus === 'no' ? 'bg-[rgba(66,133,244,0.16)] border border-[#4285F4] text-black' : 'bg-[rgba(217,217,217,0.5)] border border-[rgba(0,0,0,0.5)] text-black'}`}>No</button>
                  <button onClick={() => setWorkStatus('fresher')} className={`w-[85px] h-[31px] rounded-[5px] text-[12px] font-medium font-['Poppins'] ${workStatus === 'fresher' ? 'bg-[rgba(66,133,244,0.16)] border border-[#4285F4] text-black' : 'bg-[rgba(217,217,217,0.5)] border border-[rgba(0,0,0,0.5)] text-black'}`}>Fresher</button>
                </div>
              </div>

              {workStatus === 'yes' && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Current Company*</label>
                    <input value={formData.currentCompany} onChange={(e) => handleInputChange('currentCompany', e.target.value)} placeholder="e.g., FluidLive Solutions" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Joining Date*</label>
                    <input value={formData.joiningDate} onChange={(e) => handleInputChange('joiningDate', e.target.value)} placeholder="dd-mm-yyyy" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Notice Period*</label>
                    <input value={formData.noticePeriod} onChange={(e) => handleInputChange('noticePeriod', e.target.value)} placeholder="e.g., 30 days" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between" style={{ position: 'relative' }}>
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Work Mode*</label>
                    <div style={{ width: '263px', position: 'relative' }}>
                      <div
                        onClick={() => toggleDropdown('workModeYes')}
                        style={{
                          width: '100%',
                          height: '28px',
                          padding: '0 8px',
                          border: `1px solid ${openDropdown === 'workModeYes' ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
                          borderRadius: '5px',
                          fontFamily: 'Poppins',
                          fontSize: '12px',
                          color: formData.workMode ? (themeState === 'light' ? '#000000' : '#E5E7EB') : '#6E6E6E',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151'
                        }}
                      >
                        <span>{formData.workMode || 'Select Work Mode'}</span>
                        {openDropdown === 'workModeYes' ? 
                          <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                          <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                        }
                      </div>
                      {openDropdown === 'workModeYes' && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          right: 0,
                          background: themeState === 'light' ? '#FFFFFF' : '#374151',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          marginBottom: '4px',
                          zIndex: 1000,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                          {['on-site', 'Work-from-home', 'hybrid'].map((option, index) => (
                            <div
                              key={index}
                              onClick={() => selectOption('workMode', option)}
                              style={{
                                padding: '8px 12px',
                                fontFamily: 'Poppins',
                                fontSize: '12px',
                                color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB',
                                cursor: 'pointer',
                                background: formData.workMode === option ? '#DBEAFE' : (themeState === 'light' ? '#FFFFFF' : '#374151'),
                                borderBottom: index < 2 ? '1px solid #F3F4F6' : 'none'
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Current Annual CTC*</label>
                    <input value={formData.currentCTC} onChange={(e) => handleInputChange('currentCTC', e.target.value)} placeholder="e.g., 15,00,000" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>
                </div>
              )}

              {workStatus === 'no' && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Last Company*</label>
                    <input value={formData.lastCompany} onChange={(e) => handleInputChange('lastCompany', e.target.value)} placeholder="e.g., FluidLive Solutions" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Joining Date*</label>
                    <input value={formData.joiningDate} onChange={(e) => handleInputChange('joiningDate', e.target.value)} placeholder="dd-mm-yyyy" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Leaving Date*</label>
                    <input value={formData.leavingDate} onChange={(e) => handleInputChange('leavingDate', e.target.value)} placeholder="dd-mm-yyyy" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between" style={{ position: 'relative' }}>
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Work Mode*</label>
                    <div style={{ width: '263px', position: 'relative' }}>
                      <div
                        onClick={() => toggleDropdown('workModeNo')}
                        style={{
                          width: '100%',
                          height: '28px',
                          padding: '0 8px',
                          border: `1px solid ${openDropdown === 'workModeNo' ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
                          borderRadius: '5px',
                          fontFamily: 'Poppins',
                          fontSize: '12px',
                          color: formData.workMode ? (themeState === 'light' ? '#000000' : '#E5E7EB') : '#6E6E6E',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151'
                        }}
                      >
                        <span>{formData.workMode || 'Select Work Mode'}</span>
                        {openDropdown === 'workModeNo' ? 
                          <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                          <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                        }
                      </div>
                      {openDropdown === 'workModeNo' && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          right: 0,
                          background: themeState === 'light' ? '#FFFFFF' : '#374151',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          marginBottom: '4px',
                          zIndex: 1000,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                          {['on-site', 'Work-from-home', 'hybrid'].map((option, index) => (
                            <div
                              key={index}
                              onClick={() => selectOption('workMode', option)}
                              style={{
                                padding: '8px 12px',
                                fontFamily: 'Poppins',
                                fontSize: '12px',
                                color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB',
                                cursor: 'pointer',
                                background: formData.workMode === option ? '#DBEAFE' : (themeState === 'light' ? '#FFFFFF' : '#374151'),
                                borderBottom: index < 2 ? '1px solid #F3F4F6' : 'none'
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Last Annual CTC*</label>
                    <input value={formData.previousCTC} onChange={(e) => handleInputChange('previousCTC', e.target.value)} placeholder="e.g., 15,00,000" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>
                </div>
              )}

              {workStatus === 'fresher' && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>College/University*</label>
                    <CollegeAutocomplete
                      value={formData.college}
                      onChange={(value) => handleInputChange('college', value)}
                      placeholder="e.g., MICA, MIT, BVPUD & etc..."
                      className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]"
                      style={inputStyle}
                      themeState={themeState}
                    />
                  </div>

                  <div className="flex items-center justify-between" style={{ position: 'relative' }}>
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Preferred Work Mode*</label>
                    <div style={{ width: '263px', position: 'relative' }}>
                      <div
                        onClick={() => toggleDropdown('workModeFresher')}
                        style={{
                          width: '100%',
                          height: '28px',
                          padding: '0 8px',
                          border: `1px solid ${openDropdown === 'workModeFresher' ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
                          borderRadius: '5px',
                          fontFamily: 'Poppins',
                          fontSize: '12px',
                          color: formData.workMode ? (themeState === 'light' ? '#000000' : '#E5E7EB') : '#6E6E6E',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151'
                        }}
                      >
                        <span>{formData.workMode || 'Select Work Mode'}</span>
                        {openDropdown === 'workModeFresher' ? 
                          <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                          <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                        }
                      </div>
                      {openDropdown === 'workModeFresher' && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          right: 0,
                          background: themeState === 'light' ? '#FFFFFF' : '#374151',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          marginBottom: '4px',
                          zIndex: 1000,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                          {['on-site', 'Work-from-home', 'hybrid'].map((option, index) => (
                            <div
                              key={index}
                              onClick={() => selectOption('workMode', option)}
                              style={{
                                padding: '8px 12px',
                                fontFamily: 'Poppins',
                                fontSize: '12px',
                                color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB',
                                cursor: 'pointer',
                                background: formData.workMode === option ? '#DBEAFE' : (themeState === 'light' ? '#FFFFFF' : '#374151'),
                                borderBottom: index < 2 ? '1px solid #F3F4F6' : 'none'
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[25px] p-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', height: 'calc(50% - 6px)' }}>
            <h3 className="text-[20px] font-bold font-['Poppins'] mb-4" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Upload Your Resume</h3>

            <label htmlFor="resume-upload" className="border border-[#4285F4] rounded-[10px] h-[152px] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition">
              <Upload className="w-10 h-10 text-[#6B6B6B] mb-2" />
              <p className="text-[13px] font-medium font-['Poppins'] text-[#4285F4] text-center">Click to upload or drag and drop</p>
              <p className="text-[10px] font-medium font-['Poppins'] text-[#717171] text-center mt-1">PDF, DOC (Max 5MB)</p>
              <span className="mt-2 w-[133px] h-[24px] bg-[#4285F4] rounded-[5px] text-[10px] font-medium font-['Poppins'] text-white hover:opacity-90 flex items-center justify-center">Choose File</span>
            </label>
            <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
          </div>
        </div>
      </div>

      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={imageToCrop}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        themeState={themeState}
      />
      
      <Notification
        message={message}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
        themeState={themeState}
      />
    </div>
  );
};

export default EditProfilePage;
