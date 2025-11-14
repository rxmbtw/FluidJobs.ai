import React from 'react';
import { Mail, Phone, Calendar, MapPin, Info, Edit } from 'lucide-react';

interface ViewProfilePageProps {
  themeState: 'light' | 'dark';
  onChangePassword: () => void;
  onEditProfile: () => void;
}

const ViewProfilePage: React.FC<ViewProfilePageProps> = ({ themeState, onChangePassword, onEditProfile }) => {
  return (
    <div className="w-full min-h-[716px] rounded-t-[50px] p-8 pt-6" style={{ backgroundColor: themeState === 'light' ? '#F1F1F1' : '#1a1a1a' }}>
      <h1 className="text-[23px] font-bold font-['Poppins'] mb-6" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
        Candidate Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-6">
          <div className="rounded-[25px] p-[10px] relative h-[280px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <div className="w-full h-[110px] bg-gradient-to-r from-[#0060FF] to-[#4285F4] rounded-[16px]"></div>
            
            <div className="absolute top-[70px] left-1/2 transform -translate-x-1/2">
              <div className="w-[80px] h-[80px] rounded-full bg-[rgba(66,133,244,0.16)] flex items-center justify-center">
                <div className="w-[68px] h-[68px] rounded-full bg-[#4285F4] flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-[15px] font-bold font-['Poppins'] text-center mt-[50px]" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Shriram Surse
            </h2>

            <p className="text-[13px] font-normal font-['Poppins'] text-[#4285F4] text-center mt-1">
              Pune, Maharashtra | Joined Oct 2025
            </p>

            <div className="flex gap-3 mt-2 px-[10px]">
              <button
                onClick={onChangePassword}
                className="flex-1 h-[38px] border rounded-[6px] text-[13px] font-semibold font-['Poppins'] transition"
                style={{ 
                  backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151',
                  borderColor: themeState === 'light' ? '#000000' : '#6B7280',
                  color: themeState === 'light' ? '#000000' : '#E5E7EB'
                }}
              >
                Change Password
              </button>
              <button onClick={onEditProfile} className="flex-1 h-[38px] border border-[#4285F4] rounded-[6px] text-[13px] font-semibold font-['Poppins'] text-[#4285F4] transition flex items-center justify-center gap-2" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151' }}>
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="rounded-[25px] p-5 h-[280px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <h3 className="text-[20px] font-bold font-['Poppins'] mb-6" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    Email Address
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#080808' : '#E5E7EB' }}>
                  ram@fluid.live
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    Phone Number
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#080808' : '#E5E7EB' }}>
                  +91 98765 XXXXX
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    DOB (Date of Birth)
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#080808' : '#E5E7EB' }}>
                  01/01/2004
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
                  Pune, Maharashtra
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }} />
                  <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                    Joined
                  </span>
                </div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#080808' : '#E5E7EB' }}>
                  5 Oct 2025
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[25px] p-5 h-[280px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <h3 className="text-[20px] font-bold font-['Poppins'] mb-6" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Work Experience
            </h3>

            <div>
              <div className="flex justify-between items-center gap-4 mb-1">
                <h4 className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                  FluidLive Solutions Pvt Ltd
                </h4>
                <div className="flex-1 h-[1px]" style={{ backgroundColor: themeState === 'light' ? '#000000' : '#6B7280' }}></div>
                <span className="text-[13px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#050505' : '#E5E7EB' }}>
                  Aug 2025 - Present
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-medium font-['Poppins'] text-[#4285F4]">
                  Pune, Maharashtra
                </span>
                <span className="text-[10px] font-medium font-['Poppins']" style={{ color: themeState === 'light' ? '#6E6E6E' : '#9CA3AF' }}>
                  Current CTC: 3LPA
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[25px] p-5 h-[280px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <h3 className="text-[20px] font-bold font-['Poppins'] mb-4" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Resume
            </h3>

            <div className="h-[50px]"></div>

            <div className="w-full h-[1px] my-6" style={{ backgroundColor: themeState === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)' }}></div>

            <h3 className="text-[20px] font-bold font-['Poppins'] mb-4" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>
              Skills
            </h3>

            <div className="flex gap-3 flex-wrap">
              <div className="px-4 py-1 border border-[#4285F4] rounded-[5px]">
                <span className="text-[13px] font-medium font-['Poppins'] text-[#4285F4]">
                  Python
                </span>
              </div>
              <div className="px-4 py-1 border border-[#4285F4] rounded-[5px]">
                <span className="text-[13px] font-medium font-['Poppins'] text-[#4285F4]">
                  C/C++
                </span>
              </div>
              <div className="px-4 py-1 border border-[#4285F4] rounded-[5px]">
                <span className="text-[13px] font-medium font-['Poppins'] text-[#4285F4]">
                  Java
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfilePage;
