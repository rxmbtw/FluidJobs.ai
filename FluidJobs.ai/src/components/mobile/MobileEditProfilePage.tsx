import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Users as UsersIcon, MapPin, Upload, Edit, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProfileCompletionContext } from '../../contexts/ProfileCompletionContext';
import LocationAutocomplete from '../../new-landing/candidate-dashboard/LocationAutocomplete';
import PhoneInput from '../../new-landing/candidate-dashboard/PhoneInput';
import CollegeAutocomplete from '../../new-landing/candidate-dashboard/CollegeAutocomplete';
import Notification from '../Notification';

const MobileEditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { triggerRefresh } = useProfileCompletionContext();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workStatus, setWorkStatus] = useState<'yes' | 'no' | 'fresher'>('yes');
  const [initialWorkStatus, setInitialWorkStatus] = useState<'yes' | 'no' | 'fresher'>('yes');
  const [showDiscardModal, setShowDiscardModal] = useState(false);
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
      
      const status = (profile.work_status || '').trim();
      const workStatusValue = status === 'no' || status === 'fresher' ? status : 'yes';
      setWorkStatus(workStatusValue);
      setInitialWorkStatus(workStatusValue);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData) || workStatus !== initialWorkStatus;
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowDiscardModal(true);
    } else {
      navigate('/mobile-profile');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      await axios.put('http://localhost:8000/api/profile/profile', {
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
      
      setShowSuccess(true);
      await fetchProfile();
      triggerRefresh();
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFromModal = async () => {
    setShowDiscardModal(false);
    await handleSave();
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    navigate('/mobile-profile');
  };

  return (
    <div style={{ background: '#F1F1F1', height: '100vh', overflow: 'auto', paddingBottom: '120px', position: 'fixed', width: '100%', top: 0, left: 0 }}>
      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '10px 10px 20px 10px',
          position: 'relative'
        }}>
          {/* Back Arrow Button */}
          <button
            onClick={handleBackClick}
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              width: '40px',
              height: '40px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#4285F4', strokeWidth: 2.5 }} />
          </button>
          {/* Blue Gradient Background */}
          <div style={{
            background: 'linear-gradient(90deg, #0060FF 0%, #4285F4 100%)',
            borderRadius: '16px',
            height: '118px',
            width: '100%'
          }}></div>

          {/* Profile Picture */}
          <div style={{
            position: 'absolute',
            top: '78px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '100px',
            background: 'rgba(66, 133, 244, 0.16)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '84px',
              height: '84px',
              background: '#4285F4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Name */}
          <h2 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '15px',
            lineHeight: '22px',
            color: '#000000',
            textAlign: 'center',
            marginTop: '90px'
          }}>
            {formData.fullName}
          </h2>

          {/* Location & Joined */}
          <p style={{
            fontFamily: 'Poppins',
            fontWeight: 400,
            fontSize: '13px',
            lineHeight: '20px',
            color: '#4285F4',
            textAlign: 'center',
            marginTop: '4px',
            marginBottom: '16px'
          }}>
            Pune, Maharashtra | Joined Oct 2025
          </p>

          {/* Save Button */}
          <button type="button" onClick={handleSave} style={{
            width: '307px',
            height: '44px',
            background: '#008311',
            border: '1px solid #008311',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '0 auto',
            cursor: 'pointer'
          }}>
            <Edit className="w-4 h-4 text-white" />
            <span style={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '13px',
              color: '#FFFFFF'
            }}>
              Save Changes
            </span>
          </button>
        </div>
      </div>

      {/* Information Section */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '23px 29px',
          minHeight: '502px'
        }}>
          <h3 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '30px',
            color: '#000000',
            marginBottom: '20px'
          }}>
            Information
          </h3>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5" style={{ color: '#6E6E6E' }} />
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Full Name*
                </label>
              </div>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                style={{
                  width: '100%',
                  height: '28px',
                  border: '1px solid rgba(0, 0, 0, 0.5)',
                  borderRadius: '5px',
                  padding: '0 12px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#080808'
                }}
              />
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5" style={{ color: '#6E6E6E' }} />
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Email Address*
                </label>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{
                  width: '100%',
                  height: '28px',
                  border: '1px solid rgba(0, 0, 0, 0.5)',
                  borderRadius: '5px',
                  padding: '0 12px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#080808'
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5" style={{ color: '#6E6E6E' }} />
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Phone Number*
                </label>
              </div>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => setFormData({...formData, phone: value})}
                style={{
                  width: '100%',
                  height: '28px',
                  border: '1px solid rgba(0, 0, 0, 0.5)',
                  borderRadius: '5px',
                  padding: '0 12px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#080808',
                  backgroundColor: '#FFFFFF'
                }}
                themeState="light"
              />
            </div>

            {/* Gender */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5" style={{ color: '#6E6E6E' }} />
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Gender
                </label>
              </div>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                style={{
                  width: '100%',
                  height: '32px',
                  border: '1px solid rgba(0, 0, 0, 0.5)',
                  borderRadius: '5px',
                  padding: '0 8px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#080808'
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="w-5 h-5" style={{ color: '#6E6E6E' }} />
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Marital Status
                </label>
              </div>
              <select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                style={{
                  width: '100%',
                  height: '32px',
                  border: '1px solid rgba(0, 0, 0, 0.5)',
                  borderRadius: '5px',
                  padding: '0 8px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#080808'
                }}
              >
                <option value="">Select Status</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Married">Married</option>
              </select>
            </div>

            {/* Current City */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5" style={{ color: '#6E6E6E' }} />
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Current City
                </label>
              </div>
              <LocationAutocomplete
                value={formData.currentCity}
                onChange={(value) => setFormData({...formData, currentCity: value})}
                className="w-full"
                style={{
                  width: '100%',
                  height: '28px',
                  border: '1px solid rgba(0, 0, 0, 0.5)',
                  borderRadius: '5px',
                  padding: '0 12px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#080808'
                }}
                themeState="light"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Work Experience Section */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '23px 29px',
          minHeight: '420px'
        }}>
          <h3 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '30px',
            color: '#000000',
            marginBottom: '20px'
          }}>
            Work Experience
          </h3>

          {/* Currently Working */}
          <div className="mb-4">
            <label style={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '13px',
              color: '#6E6E6E',
              display: 'block',
              marginBottom: '8px'
            }}>
              Are you currently working anywhere?*
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWorkStatus('yes')}
                style={{
                  width: '85px',
                  height: '31px',
                  background: workStatus === 'yes' ? 'rgba(66, 133, 244, 0.16)' : 'rgba(217, 217, 217, 0.5)',
                  border: `1px solid ${workStatus === 'yes' ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
                  borderRadius: '5px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#000000'
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWorkStatus('no')}
                style={{
                  width: '85px',
                  height: '31px',
                  background: workStatus === 'no' ? 'rgba(66, 133, 244, 0.16)' : 'rgba(217, 217, 217, 0.5)',
                  border: `1px solid ${workStatus === 'no' ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
                  borderRadius: '5px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#000000'
                }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setWorkStatus('fresher')}
                style={{
                  width: '85px',
                  height: '31px',
                  background: workStatus === 'fresher' ? 'rgba(66, 133, 244, 0.16)' : 'rgba(217, 217, 217, 0.5)',
                  border: `1px solid ${workStatus === 'fresher' ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
                  borderRadius: '5px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#000000'
                }}
              >
                Fresher
              </button>
            </div>
          </div>

          {workStatus === 'yes' && (
            <>
              {/* Current Company */}
              <div className="mb-4">
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Current Company*
                </label>
                <input
                  type="text"
                  placeholder="e.g., FluidLive Solutions"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({...formData, currentCompany: e.target.value})}
                  style={{
                    width: '100%',
                    height: '28px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 12px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: '#6E6E6E'
                  }}
                />
              </div>

              {/* Joining Date */}
              <div className="mb-4">
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Joining Date*
                </label>
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                  style={{
                    width: '100%',
                    height: '28px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 12px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: '#6E6E6E'
                  }}
                />
              </div>

              {/* Work Mode */}
              <div className="mb-4">
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Work Mode*
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({...formData, workMode: e.target.value})}
                  style={{
                    width: '100%',
                    height: '32px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 8px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: formData.workMode ? '#000000' : '#6E6E6E',
                    background: '#FFFFFF',
                    appearance: 'auto',
                    WebkitAppearance: 'menulist',
                    MozAppearance: 'menulist'
                  }}
                >
                  <option value="" disabled>Select Work Mode</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Current CTC */}
              <div>
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Current Annual CTC*
                </label>
                <input
                  type="text"
                  placeholder="e.g., 15,00,000"
                  value={formData.currentCTC}
                  onChange={(e) => setFormData({...formData, currentCTC: e.target.value})}
                  style={{
                    width: '100%',
                    height: '28px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 12px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: '#6E6E6E'
                  }}
                />
              </div>
            </>
          )}

          {workStatus === 'no' && (
            <>
              {/* Last Company */}
              <div className="mb-4">
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Last Company*
                </label>
                <input
                  type="text"
                  placeholder="e.g., InnovateCorp"
                  value={formData.lastCompany}
                  onChange={(e) => setFormData({...formData, lastCompany: e.target.value})}
                  style={{
                    width: '100%',
                    height: '28px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 12px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: '#6E6E6E'
                  }}
                />
              </div>

              {/* Previous CTC */}
              <div className="mb-4">
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Previous Annual CTC*
                </label>
                <input
                  type="text"
                  placeholder="e.g., 6,00,000"
                  value={formData.previousCTC}
                  onChange={(e) => setFormData({...formData, previousCTC: e.target.value})}
                  style={{
                    width: '100%',
                    height: '28px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 12px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: '#6E6E6E'
                  }}
                />
              </div>

              {/* Joining Date */}
              <div className="mb-4">
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Joining Date*
                </label>
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                  style={{
                    width: '100%',
                    height: '28px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 12px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: '#6E6E6E'
                  }}
                />
              </div>

              {/* Leaving Date */}
              <div className="mb-4">
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Leaving Date*
                </label>
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  value={formData.leavingDate}
                  onChange={(e) => setFormData({...formData, leavingDate: e.target.value})}
                  style={{
                    width: '100%',
                    height: '28px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 12px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: '#6E6E6E'
                  }}
                />
              </div>

              {/* Work Mode */}
              <div>
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Work Mode*
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({...formData, workMode: e.target.value})}
                  style={{
                    width: '100%',
                    height: '32px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 8px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: formData.workMode ? '#000000' : '#6E6E6E',
                    background: '#FFFFFF'
                  }}
                >
                  <option value="" disabled>Select Work Mode</option>
                  <option value="on-site">On-site</option>
                  <option value="Work-from-home">Work-from-home</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </>
          )}

          {workStatus === 'fresher' && (
            <>
              {/* College/University */}
              <div className="mb-4">
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  College/University*
                </label>
                <CollegeAutocomplete
                  value={formData.college}
                  onChange={(value) => setFormData({...formData, college: value})}
                  placeholder="e.g., MICA, MIT, BVPUD & etc..."
                  className="w-full"
                  style={{
                    width: '100%',
                    height: '28px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 12px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: '#6E6E6E',
                    backgroundColor: '#FFFFFF'
                  }}
                  themeState="light"
                />
              </div>

              {/* Preferred Work Mode */}
              <div>
                <label style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Preferred Work Mode*
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({...formData, workMode: e.target.value})}
                  style={{
                    width: '100%',
                    height: '32px',
                    border: '1px solid rgba(0, 0, 0, 0.5)',
                    borderRadius: '5px',
                    padding: '0 8px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: formData.workMode ? '#000000' : '#6E6E6E',
                    background: '#FFFFFF'
                  }}
                >
                  <option value="" disabled>Select Work Mode</option>
                  <option value="on-site">On-site</option>
                  <option value="Work-from-home">Work-from-home</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Resume Section */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '21px 18px',
          minHeight: '288px'
        }}>
          <h3 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '30px',
            color: '#000000',
            marginBottom: '24px'
          }}>
            Upload Your Resume
          </h3>

          <div style={{
            border: '1px solid #4285F4',
            borderRadius: '10px',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <Upload className="w-8 h-8" style={{ color: '#6B6B6B' }} />
            <p style={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '13px',
              color: '#4285F4',
              textAlign: 'center'
            }}>
              Click to upload or drag and drop
            </p>
            <p style={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '10px',
              color: '#717171',
              textAlign: 'center'
            }}>
              PDF, DOC (Max 5MB)
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append('resume', file);
                
                try {
                  const token = sessionStorage.getItem('fluidjobs_token');
                  await axios.post('http://localhost:8000/api/profile/upload-resume', formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                  });
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 2000);
                  triggerRefresh();
                  await fetchProfile();
                } catch (error) {
                  console.error('Error uploading resume:', error);
                }
                e.target.value = '';
              }}
              style={{ display: 'none' }}
              id="resume-upload"
            />
            <label htmlFor="resume-upload" style={{
              width: '133px',
              height: '24px',
              background: '#4285F4',
              borderRadius: '5px',
              border: 'none',
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '10px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Choose File
            </label>
          </div>
        </div>
      </div>

      {/* Discard Modal */}
      {showDiscardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowDiscardModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              width: '320px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: '18px',
              color: '#000000',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              Unsaved Changes
            </h3>
            <p style={{
              fontFamily: 'Poppins',
              fontWeight: 400,
              fontSize: '14px',
              color: '#6E6E6E',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              You have unsaved changes. Do you want to save them before leaving?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDiscard}
                style={{
                  flex: 1,
                  height: '44px',
                  background: '#FFFFFF',
                  border: '1px solid #EF4444',
                  borderRadius: '10px',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#EF4444',
                  cursor: 'pointer'
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSaveFromModal}
                disabled={loading}
                style={{
                  flex: 1,
                  height: '44px',
                  background: '#4285F4',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      <Notification
        message="Profile saved successfully!"
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
        themeState="light"
      />
    </div>
  );
};

export default MobileEditProfilePage;
