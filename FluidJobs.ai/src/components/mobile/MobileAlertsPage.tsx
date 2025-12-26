import React, { useEffect, useState } from 'react';
import { Bell, Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProfileCompletionContext } from '../../contexts/ProfileCompletionContext';

interface ProfileCompletionItem {
  id: string;
  label: string;
  completed: boolean;
}

const MobileAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshTrigger } = useProfileCompletionContext();
  const [items, setItems] = useState<ProfileCompletionItem[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileCompletion();
  }, [refreshTrigger]);

  const fetchProfileCompletion = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/api/profile/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile: any = response.data;

      const completionItems: ProfileCompletionItem[] = [
        {
          id: 'fullName',
          label: 'Full Name',
          completed: !!(profile.full_name?.trim())
        },
        {
          id: 'email',
          label: 'Email Address',
          completed: !!(profile.email?.trim())
        },
        {
          id: 'phone',
          label: 'Phone Number',
          completed: (() => {
            const phone = profile.phone?.trim() || profile.phone_number?.trim() || '';
            return !!(phone && phone.includes('+') && phone.length > 4 && /\d{7,}/.test(phone));
          })()
        },
        {
          id: 'profileImage',
          label: 'Upload profile picture',
          completed: !!(profile.profile_image_url?.trim())
        },
        {
          id: 'resume',
          label: 'Upload resume',
          completed: !!(profile.resume_files && Array.isArray(profile.resume_files) && profile.resume_files.length > 0)
        },
        {
          id: 'address',
          label: 'Add your address',
          completed: !!(profile.city?.trim() || profile.location?.trim())
        },
        {
          id: 'gender',
          label: 'Gender',
          completed: !!(profile.gender?.trim() && profile.gender !== 'Select Gender')
        },
        {
          id: 'maritalStatus',
          label: 'Marital Status',
          completed: !!(profile.marital_status?.trim() && profile.marital_status !== 'Select Status')
        },
        {
          id: 'workStatus',
          label: 'Work Experience',
          completed: !!(profile.work_status?.trim())
        },
        ...(profile.work_status?.trim() === 'fresher' ? [
          {
            id: 'college',
            label: 'College/University',
            completed: !!(profile.college?.trim())
          }
        ] : [
          {
            id: 'currentCompany',
            label: 'Current/Last Company',
            completed: !!(profile.current_company?.trim() || profile.last_company?.trim())
          }
        ]),
        {
          id: 'workMode',
          label: 'Work Mode Preference',
          completed: !!(profile.work_mode?.trim() && profile.work_mode !== 'Select Work Mode')
        }
      ];

      const sortedItems = completionItems.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });

      const completedCount = sortedItems.filter(item => item.completed).length;
      const completionPercentage = Math.round((completedCount / sortedItems.length) * 100);

      setItems(sortedItems);
      setPercentage(completionPercentage);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        sessionStorage.removeItem('fluidjobs_token');
        sessionStorage.removeItem('fluidjobs_user');
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = () => {
    console.log('Profile item clicked, navigating to edit profile');
    navigate('/edit-profile');
  };

  if (loading) {
    return (
      <div className="mobile-view" style={{ background: '#F1F1F1', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#6E6E6E' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="mobile-view" style={{ background: '#F1F1F1', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'fixed', width: '100%', top: 0, left: 0 }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{ flexShrink: 0, position: 'sticky', top: 0, background: '#F1F1F1', zIndex: 10 }}>
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6" style={{ color: '#130F26', strokeWidth: 2 }} />
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: '25px',
            lineHeight: '29px',
            color: '#000000'
          }}>
            Alerts
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        {/* Complete Your Profile Card */}
        <div className="px-7 mb-6">
          <div style={{
            background: '#FFFFFF',
            borderRadius: '25px',
            padding: '24px 20px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
          }}>
            {/* Title */}
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              fontSize: '25px',
              lineHeight: '29px',
              color: '#000000',
              marginBottom: '16px'
            }}>
              Complete your profile
            </h2>

            {/* Description */}
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#6E6E6E',
              marginBottom: '24px'
            }}>
              By completing your profile you can start applying to job openings in one click...
            </p>

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  lineHeight: '23px',
                  color: '#000000',
                  marginRight: '16px'
                }}>
                  {percentage}%
                </span>
              </div>
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '12px',
                background: '#D9D9D9',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4285F4 0%, #0060FF 100%)',
                  borderRadius: '6px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              width: '100%',
              height: '1px',
              background: 'rgba(0, 0, 0, 0.29)',
              marginBottom: '18px'
            }}></div>

            {/* Profile Tasks */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }} className="space-y-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={handleItemClick}
                  type="button"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left'}}>
                  <div
                  style={{
                    border: item.completed ? '1px solid #10B981' : '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '10px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-center">
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: item.completed ? '#10B981' : '#4285F4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      {item.completed ? (
                        <Check className="w-4 h-4" style={{ color: '#FFFFFF', strokeWidth: 3 }} />
                      ) : (
                        <Plus className="w-4 h-4" style={{ color: '#FFFFFF', strokeWidth: 3 }} />
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: item.completed ? '#10B981' : '#6E6E6E'
                    }}>
                      {item.label}
                    </span>
                  </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Empty State */}
        <div className="px-4">
          <div style={{
            background: '#FFFFFF',
            borderRadius: '25px',
            padding: '40px 20px',
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#6E6E6E',
              maxWidth: '276px'
            }}>
              Complete your profile to start getting announcements of the latest job openings!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAlertsPage;
