import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Info, Edit, FileText, ExternalLink, Trash2 } from 'lucide-react';
import axios from 'axios';
import Loader from '../../components/Loader';
import { useProfileCompletionContext } from '../../contexts/ProfileCompletionContext';

interface ViewProfilePageProps {
  themeState: 'light' | 'dark';
  onChangePassword: () => void;
  onEditProfile: () => void;
}

const ViewProfilePage: React.FC<ViewProfilePageProps> = ({ themeState, onChangePassword, onEditProfile }) => {
  const { triggerRefresh, refreshTrigger } = useProfileCompletionContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [refreshTrigger]);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await axios.get('http://localhost:8000/api/profile/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData: any = response.data;
      console.log('Profile data fetched:', profileData);
      
      // Handle profile image URL
      if (profileData.profile_image_url && !profileData.profile_image_url.startsWith('http')) {
        profileData.profile_image_url = `http://localhost:8000${profileData.profile_image_url}`;
      }
      
      // Ensure resume_files is an array
      if (!profileData.resume_files || !Array.isArray(profileData.resume_files)) {
        profileData.resume_files = [];
      }
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      await axios.delete(`http://localhost:8000/api/profile/delete-resume/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfile();
      triggerRefresh(); // Trigger profile completion refresh when resume is deleted
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[716px] rounded-t-[50px] p-8 pt-6 flex items-center justify-center" style={{ backgroundColor: themeState === 'light' ? '#F1F1F1' : '#1a1a1a' }}>
        <Loader themeState={themeState} />
      </div>
    );
  }

  return (
    <div className="w-full rounded-t-[50px] p-4 overflow-hidden" style={{ backgroundColor: themeState === 'light' ? '#F1F1F1' : '#1a1a1a', height: 'calc(100vh - 116px)' }}>
      <h1 className="text-[18px] font-bold font-['Poppins'] mb-3" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
        Candidate Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ height: 'calc(100% - 40px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <div className="rounded-[25px] p-[8px] relative" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', height: 'calc(50% - 6px)' }}>
            <div className="w-full h-[80px] bg-gradient-to-r from-[#0060FF] to-[#4285F4] rounded-[16px]"></div>
            
            <div className="absolute top-[50px] left-1/2 transform -translate-x-1/2">
              <div className="w-[60px] h-[60px] rounded-full bg-[rgba(66,133,244,0.16)] flex items-center justify-center">
                <div className="w-[50px] h-[50px] rounded-full bg-[#4285F4] flex items-center justify-center overflow-hidden">
                  {profile?.profile_image_url ? (
                    <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-[13px] font-bold font-['Poppins'] text-center mt-[35px]" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              {profile?.full_name || 'User'}
            </h2>

            <p className="text-[11px] font-normal font-['Poppins'] text-[#4285F4] text-center mt-1">
              {profile?.city || profile?.location || 'Location not set'}
              {profile?.created_at && ` | Joined ${new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
            </p>

            <div className="flex gap-2 mt-2 px-[8px]">
              <button
                onClick={onChangePassword}
                className="flex-1 h-[30px] border rounded-[6px] text-[11px] font-semibold font-['Poppins'] transition"
                style={{ 
                  backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151',
                  borderColor: themeState === 'light' ? '#000000' : '#6B7280',
                  color: themeState === 'light' ? '#000000' : '#E5E7EB'
                }}
              >
                Change Password
              </button>
              <button onClick={onEditProfile} className="flex-1 h-[30px] border border-[#4285F4] rounded-[6px] text-[11px] font-semibold font-['Poppins'] text-[#4285F4] transition flex items-center justify-center gap-1" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151' }}>
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="rounded-[25px] p-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', height: 'calc(50% - 6px)', overflow: 'auto' }}>
            <h3 className="text-[16px] font-bold font-['Poppins'] mb-3" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Information
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    Email Address
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#080808' : '#E5E7EB' }}>
                  {profile?.email || 'Not set'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    Phone Number
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#000000' : '#E5E7EB' }}>
                  {profile?.phone || profile?.phone_number || 'Not set'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    Gender
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#080808' : '#E5E7EB' }}>
                  {profile?.gender || 'Not set'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    Marital Status
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#080808' : '#E5E7EB' }}>
                  {profile?.marital_status || 'Not set'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    Current City
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#080808' : '#E5E7EB' }}>
                  {profile?.city || profile?.location || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <div className="rounded-[25px] p-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', height: 'calc(50% - 6px)' }}>
            <h3 className="text-[16px] font-bold font-['Poppins'] mb-3" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Work Experience
            </h3>

            {profile?.current_company ? (
              <div>
                <div className="flex justify-between items-center gap-4 mb-1">
                  <h4 className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    {profile.current_company}
                  </h4>
                  <div className="flex-1 h-[1px]" style={{ backgroundColor: themeState === 'light' ? '#000000' : '#6B7280' }}></div>
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#050505' : '#E5E7EB' }}>
                    Current
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium font-['Poppins'] text-[#4285F4]">
                    {profile.work_mode || 'Not specified'}
                  </span>
                  <span className="text-[10px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    {profile.current_ctc ? `CTC: ${profile.current_ctc}` : 'CTC not set'}
                  </span>
                </div>
              </div>
            ) : profile?.last_company ? (
              <div>
                <div className="flex justify-between items-center gap-4 mb-1">
                  <h4 className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    {profile.last_company}
                  </h4>
                  <div className="flex-1 h-[1px]" style={{ backgroundColor: themeState === 'light' ? '#000000' : '#6B7280' }}></div>
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#050505' : '#E5E7EB' }}>
                    Previous
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium font-['Poppins'] text-[#4285F4]">
                    {profile.work_mode || 'Not specified'}
                  </span>
                  <span className="text-[10px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    {profile.previous_ctc ? `Last CTC: ${profile.previous_ctc}` : 'CTC not set'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                No work experience added yet
              </p>
            )}
          </div>

          <div className="rounded-[25px] p-4" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937', height: 'calc(50% - 6px)', overflow: 'auto' }}>
            <h3 className="text-[16px] font-bold font-['Poppins'] mb-3" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Resume
            </h3>

            {profile?.resume_files && profile.resume_files.length > 0 ? (
              <div className="space-y-2">
                {profile.resume_files.map((resume: any, index: number) => {
                  const fullUrl = resume.url.startsWith('http') ? resume.url : `http://localhost:8000${resume.url}`;
                  return (
                    <div key={index} className="w-full flex items-center gap-2 p-3 border border-[#4285F4] rounded-[8px]">
                      <FileText className="w-5 h-5 text-[#4285F4]" />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium font-['Poppins'] text-[#4285F4]">
                          {resume.name}
                        </p>
                        <p className="text-[10px] font-['Poppins'] text-gray-500">
                          {new Date(resume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-blue-50 rounded transition">
                        <ExternalLink className="w-4 h-4 text-[#4285F4]" />
                      </a>
                      <button onClick={() => handleDeleteResume(resume.id)} className="p-2 hover:bg-red-50 rounded transition">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                No resume uploaded yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfilePage;
