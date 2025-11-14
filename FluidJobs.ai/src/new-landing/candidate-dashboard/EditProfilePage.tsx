import React, { useState } from 'react';
import { Mail, Phone, Calendar, MapPin, User as UserIcon, Edit, Upload } from 'lucide-react';

interface EditProfilePageProps {
  themeState: 'light' | 'dark';
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({ themeState }) => {
  const [workStatus, setWorkStatus] = useState<'yes' | 'no' | 'fresher'>('yes');
  const [formData, setFormData] = useState({
    fullName: 'Shriram Surse',
    email: 'ram@fluid.live',
    phone: '+91 98765 XXXXX',
    dob: '01/01/2004',
    maritalStatus: 'Single',
    currentCity: 'Pune, Maharashtra',
    currentCompany: '',
    joiningDate: '',
    workMode: '',
    currentCTC: ''
  });

  const inputStyle = { backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151', color: themeState === 'light' ? '#000000' : '#E5E7EB' };
  const labelStyle = { color: themeState === 'light' ? '#000000' : '#FFFFFF' };

  return (
    <div className="w-full min-h-[716px] rounded-t-[50px] p-8 pt-6" style={{ backgroundColor: themeState === 'light' ? '#F1F1F1' : '#1a1a1a' }}>
      <h1 className="text-[23px] font-bold font-['Poppins'] mb-6" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Edit Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div className="rounded-[25px] p-[10px] relative h-[251px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <div className="w-full h-[118px] bg-gradient-to-r from-[#0060FF] to-[#4285F4] rounded-[12px]"></div>
            
            <div className="absolute top-[78px] left-1/2 transform -translate-x-1/2">
              <div className="w-[100px] h-[100px] rounded-full bg-[rgba(66,133,244,0.16)] flex items-center justify-center">
                <div className="w-[84px] h-[84px] rounded-full bg-[#4285F4] flex items-center justify-center relative">
                  <UserIcon className="w-10 h-10 text-white" />
                  <div className="absolute bottom-0 right-0 w-[25px] h-[25px] bg-[#0060FF] rounded-full flex items-center justify-center cursor-pointer">
                    <Edit className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <button className="absolute bottom-[10px] left-[10px] right-[10px] h-[44px] bg-[rgba(0,131,17,0.7)] rounded-[12px] text-[13px] font-semibold font-['Poppins'] text-white hover:opacity-90 transition flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" />
              Save Changes
            </button>
          </div>

          <div className="rounded-[25px] p-5 h-[310px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <h3 className="text-[20px] font-bold font-['Poppins'] mb-3" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Information</h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <UserIcon className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Full Name*</span>
                </div>
                <input value={formData.fullName} className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']" style={inputStyle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <Mail className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Email Address*</span>
                </div>
                <input value={formData.email} className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']" style={inputStyle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <Phone className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Phone Number*</span>
                </div>
                <input value={formData.phone} className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']" style={inputStyle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <Calendar className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">DOB (Date of Birth)</span>
                </div>
                <input value={formData.dob} className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']" style={inputStyle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <UserIcon className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Marital Status</span>
                </div>
                <input value={formData.maritalStatus} className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']" style={inputStyle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-[140px]">
                  <MapPin className="w-5 h-5 text-[#6E6E6E]" />
                  <span className="text-[13px] font-medium font-['Poppins'] text-[#6E6E6E]">Current City</span>
                </div>
                <input value={formData.currentCity} className="w-[211px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins']" style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-[25px] p-5 min-h-[293px] mb-5" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
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
                    <input placeholder="e.g., FluidLive Solutions" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Joining Date*</label>
                    <input placeholder="dd-mm-yyyy" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Work Mode*</label>
                    <input placeholder="e.g., on-site/work-from-home/hybrid" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Current Annual CTC*</label>
                    <input placeholder="e.g., 15,00,000" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>
                </div>
              )}

              {workStatus === 'no' && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Last Company*</label>
                    <input placeholder="e.g., FluidLive Solutions" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Joining Date & Leaving Date*</label>
                    <div className="flex items-center gap-2">
                      <input placeholder="dd-mm-yyyy" className="w-[120px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                      <span className="text-[13px]" style={labelStyle}>—</span>
                      <input placeholder="dd-mm-yyyy" className="w-[120px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Work Mode*</label>
                    <input placeholder="e.g., on-site/work-from-home/hybrid" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Last Annual CTC*</label>
                    <input placeholder="e.g., 15,00,000" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>
                </div>
              )}

              {workStatus === 'fresher' && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>College/University*</label>
                    <input placeholder="e.g., MICA, MIT, BVPUD & etc..." className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Joining Date & Passing Date*</label>
                    <div className="flex items-center gap-2">
                      <input placeholder="dd-mm-yyyy" className="w-[120px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                      <span className="text-[13px]" style={labelStyle}>—</span>
                      <input placeholder="dd-mm-yyyy" className="w-[120px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-medium font-['Poppins']" style={labelStyle}>Preferred Work Mode*</label>
                    <input placeholder="e.g., on-site/work-from-home/hybrid" className="w-[263px] h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-[5px] text-[12px] font-medium font-['Poppins'] placeholder:text-[#6E6E6E]" style={inputStyle} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[25px] p-5 h-[268px]" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#1F2937' }}>
            <h3 className="text-[20px] font-bold font-['Poppins'] mb-4" style={{ color: themeState === 'light' ? '#000000' : '#FFFFFF' }}>Upload Your Resume</h3>

            <div className="border border-[#4285F4] rounded-[10px] h-[152px] flex flex-col items-center justify-center">
              <Upload className="w-10 h-10 text-[#6B6B6B] mb-2" />
              <p className="text-[13px] font-medium font-['Poppins'] text-[#4285F4] text-center">Click to upload or drag and drop</p>
              <p className="text-[10px] font-medium font-['Poppins'] text-[#717171] text-center mt-1">PDF, DOC (Max 5MB)</p>
              <button className="mt-2 w-[133px] h-[24px] bg-[#4285F4] rounded-[5px] text-[10px] font-medium font-['Poppins'] text-white hover:opacity-90">Choose File</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
