import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, MapPin, Info, Edit, Users, LogOut } from 'lucide-react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProfileCompletionContext } from '../../contexts/ProfileCompletionContext';
import MobileChangePasswordModal from './MobileChangePasswordModal';
import MobileForgotPasswordModal from './MobileForgotPasswordModal';

const MobileProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshTrigger } = useProfileCompletionContext();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
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
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    console.log('Navigating to edit profile');
    navigate('/edit-profile');
  };

  return (
    <div className="mobile-view" style={{ background: '#F1F1F1', height: '100vh', overflow: 'auto', paddingBottom: '120px', position: 'fixed', width: '100%', top: 0, left: 0 }}>
      {/* Profile Header Card */}
      <div className="px-4 pt-6 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '10px 10px 20px 10px',
          position: 'relative'
        }}>
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
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            lineHeight: '22px',
            color: '#000000',
            textAlign: 'center',
            marginTop: '90px'
          }}>
            {profile?.full_name || 'User'}
          </h2>

          {/* Location & Joined */}
          <p style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            fontSize: '13px',
            lineHeight: '20px',
            color: '#4285F4',
            textAlign: 'center',
            marginTop: '4px',
            marginBottom: '8px'
          }}>
            {profile?.city || profile?.location || 'Location not set'} | Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 px-3 mb-2" style={{ position: 'relative', zIndex: 10 }}>
            <button 
              onClick={handleEditProfile}
              type="button"
              style={{
                flex: '1',
                maxWidth: '140px',
                height: '44px',
                background: '#FFFFFF',
                border: '1px solid #4285F4',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '0 8px',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}>
              <Edit className="w-4 h-4" style={{ color: '#4285F4', strokeWidth: 2 }} />
              <span style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                color: '#4285F4',
                whiteSpace: 'nowrap'
              }}>
                Edit Profile
              </span>
            </button>

            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsChangePasswordOpen(true);
              }}
              style={{
                flex: '1',
                maxWidth: '180px',
                height: '44px',
                background: '#FFFFFF',
                border: '1px solid #000000',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px',
                cursor: 'pointer'
              }}
            >
              <span style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                color: '#000000',
                whiteSpace: 'nowrap'
              }}>
                Change Password
              </span>
            </button>
          </div>

          {/* Status Button */}
          <div className="px-3">
            <div style={{
              padding: '10px 24px',
              borderRadius: '20px',
              background: '#4285F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}>
              <span style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                color: '#FFFFFF'
              }}>
                Applied
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Card */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '21px 24px',
          minHeight: '288px'
        }}>
          <h3 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '30px',
            color: '#000000',
            marginBottom: '30px'
          }}>
            Information
          </h3>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" style={{ color: '#6E6E6E' }} />
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Email Address
                </span>
              </div>
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#080808'
              }}>
                {profile?.email || 'Not set'}
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6" style={{ color: '#6E6E6E' }} />
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Phone Number
                </span>
              </div>
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#080808'
              }}>
                {profile?.phone || profile?.phone_number || 'Not set'}
              </span>
            </div>

            {/* DOB */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" style={{ color: '#6E6E6E' }} />
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  DOB (Date of Birth)
                </span>
              </div>
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#080808'
              }}>
                {profile?.dob || 'Not set'}
              </span>
            </div>

            {/* Current City */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6" style={{ color: '#6E6E6E' }} />
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Current City
                </span>
              </div>
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#080808'
              }}>
                {profile?.city || profile?.location || 'Not set'}
              </span>
            </div>

            {/* Gender */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6" style={{ color: '#6E6E6E' }} />
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Gender
                </span>
              </div>
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#080808'
              }}>
                {profile?.gender || 'Not set'}
              </span>
            </div>

            {/* Marital Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6" style={{ color: '#6E6E6E' }} />
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  Marital Status
                </span>
              </div>
              <span style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#080808'
              }}>
                {profile?.marital_status || 'Not set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Work Experience Card */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '21px 24px',
          minHeight: '288px'
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
          {profile?.current_company ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  {profile.current_company}
                </p>
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000'
                }}>
                  Current
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontSize: '10px',
                  color: '#4285F4'
                }}>
                  {profile.work_mode || 'Not specified'}
                </span>
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontSize: '10px',
                  color: '#6E6E6E'
                }}>
                  {profile.current_ctc ? `CTC: ${profile.current_ctc}` : ''}
                </span>
              </div>
            </div>
          ) : profile?.last_company ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#6E6E6E'
                }}>
                  {profile.last_company}
                </p>
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#000000'
                }}>
                  Previous
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontSize: '10px',
                  color: '#4285F4'
                }}>
                  {profile.work_mode || 'Not specified'}
                </span>
                <span style={{
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontSize: '10px',
                  color: '#6E6E6E'
                }}>
                  {profile.previous_ctc ? `Last CTC: ${profile.previous_ctc}` : ''}
                </span>
              </div>
            </div>
          ) : profile?.college ? (
            <div>
              <p style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '13px',
                color: '#6E6E6E'
              }}>
                {profile.college}
              </p>
              <p style={{
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontSize: '10px',
                color: '#4285F4',
                marginTop: '4px'
              }}>
                Fresher
              </p>
            </div>
          ) : (
            <p style={{
              fontFamily: 'Poppins',
              fontWeight: 400,
              fontSize: '13px',
              color: '#6E6E6E'
            }}>
              No work experience added yet
            </p>
          )}
        </div>
      </div>

      {/* Resume & Skills Card */}
      <div className="px-4 pb-4">
        <div style={{
          background: '#FFFFFF',
          borderRadius: '25px',
          padding: '21px 24px',
          minHeight: '288px'
        }}>
          <h3 style={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '30px',
            color: '#000000',
            marginBottom: '30px'
          }}>
            Resume
          </h3>

          {profile?.resume_files && profile.resume_files.length > 0 ? (
            <div>
              {profile.resume_files.map((resume: any, index: number) => (
                <p key={index} style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#4285F4',
                  marginBottom: '8px'
                }}>
                  {resume.name}
                </p>
              ))}
            </div>
          ) : (
            <p style={{
              fontFamily: 'Poppins',
              fontWeight: 400,
              fontSize: '13px',
              color: '#6E6E6E'
            }}>
              No resume uploaded yet
            </p>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-4 flex gap-3">
        <button 
          type="button"
          onClick={() => navigate('/mobile-contact-support')}
          style={{
          width: '207px',
          height: '44px',
          background: '#FFFFFF',
          border: '1px solid #080808',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <Users className="w-4 h-4" style={{ color: '#080808' }} />
          <span style={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '15px',
            color: '#080808'
          }}>
            Contact Support
          </span>
        </button>

        <button 
          type="button" 
          onClick={() => {
            sessionStorage.clear();
            window.location.href = '/';
          }}
          style={{
          width: '142px',
          height: '44px',
          background: '#FFFFFF',
          border: '1px solid #DD0004',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <LogOut className="w-4 h-4" style={{ color: '#DD0004' }} />
          <span style={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: '15px',
            color: '#DD0004'
          }}>
            Logout
          </span>
        </button>
      </div>

      {/* Change Password Modal */}
      <MobileChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)}
        onForgotPassword={() => {
          setIsChangePasswordOpen(false);
          setIsForgotPasswordOpen(true);
        }}
      />

      {/* Forgot Password Modal */}
      <MobileForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default MobileProfilePage;
