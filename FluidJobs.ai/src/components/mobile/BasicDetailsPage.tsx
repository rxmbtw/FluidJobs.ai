import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Upload, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import ResizeImagePage from './ResizeImagePage';
import axios from 'axios';

interface BasicDetailsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const BasicDetailsPage: React.FC<BasicDetailsPageProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    rollNo: '',
    firstName: '',
    middleName: '',
    lastName: '',
    course: '',
    primarySpecialization: '',
    gender: 'Select',
    dateOfBirth: '',
    bloodGroup: 'Select',
    maritalStatus: 'Select',
    medicalHistory: '',
    disability: 'Select',
    knownLanguages: '',
    dreamCompany: ''
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showResizeImage, setShowResizeImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('/api/placeholder/140/140');
  const [selectedDate, setSelectedDate] = useState({ year: 2004, month: 1, day: 23 });
  const [datePickerDropdown, setDatePickerDropdown] = useState<'month' | 'year' | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      fetchBasicDetails();
    }
  }, [isOpen]);

  const fetchBasicDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile: any = response.data;
      setFormData({
        rollNo: profile.roll_no || '',
        firstName: profile.first_name || '',
        middleName: profile.middle_name || '',
        lastName: profile.last_name || '',
        course: profile.course || '',
        primarySpecialization: profile.primary_specialization || '',
        gender: profile.gender || 'Select',
        dateOfBirth: profile.date_of_birth || '',
        bloodGroup: profile.blood_group || 'Select',
        maritalStatus: profile.marital_status || 'Select',
        medicalHistory: profile.medical_history || '',
        disability: profile.disability || 'Select',
        knownLanguages: profile.known_languages || '',
        dreamCompany: profile.dream_company || ''
      });
      
      if (profile.profile_image_url) {
        setProfileImage(`${API_URL}${profile.profile_image_url}`);
      }
    } catch (error) {
      console.error('Error fetching basic details:', error);
    }
  };

  const genderOptions = ['Select', 'Female', 'Male', 'Other'];
  const bloodGroupOptions = ['Select', 'A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'];
  const maritalStatusOptions = ['Select', 'Married', 'Single'];
  const disabilityOptions = ['Yes', 'No'];
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const daysInMonth = new Date(selectedDate.year, selectedDate.month + 1, 0).getDate();

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/profile/basic-details`,
        {
          rollNo: formData.rollNo,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          course: formData.course,
          primarySpecialization: formData.primarySpecialization,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          bloodGroup: formData.bloodGroup,
          maritalStatus: formData.maritalStatus,
          medicalHistory: formData.medicalHistory,
          disability: formData.disability,
          knownLanguages: formData.knownLanguages,
          dreamCompany: formData.dreamCompany
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setHasChanges(false);
      alert('Basic details saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving basic details:', error);
      alert('Failed to save basic details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (hasChanges) {
      setShowLeaveConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmLeave = () => {
    setShowLeaveConfirm(false);
    setHasChanges(false);
    onClose();
  };

  const toggleDropdown = (field: string) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  const selectOption = (field: string, value: string) => {
    handleInputChange(field, value);
    setOpenDropdown(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setShowResizeImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (image: string) => {
    try {
      const token = localStorage.getItem('token');
      const blob = await fetch(image).then(r => r.blob());
      const formData = new FormData();
      formData.append('profileImage', blob, 'profile.jpg');
      
      const response = await axios.post(
        `${API_URL}/api/profile/upload-profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const data: any = response.data;
      setProfileImage(`${API_URL}${data.fileUrl}`);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setProfileImage('/api/placeholder/140/140');
    setShowDeleteConfirm(false);
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate({ ...selectedDate, day });
  };

  const handleMonthChange = (monthIndex: number) => {
    setSelectedDate({ ...selectedDate, month: monthIndex });
  };

  const handleYearChange = (year: number) => {
    setSelectedDate({ ...selectedDate, year });
  };

  const prevMonth = () => {
    if (selectedDate.month === 0) {
      setSelectedDate({ ...selectedDate, month: 11, year: selectedDate.year - 1 });
    } else {
      setSelectedDate({ ...selectedDate, month: selectedDate.month - 1 });
    }
  };

  const nextMonth = () => {
    if (selectedDate.month === 11) {
      setSelectedDate({ ...selectedDate, month: 0, year: selectedDate.year + 1 });
    } else {
      setSelectedDate({ ...selectedDate, month: selectedDate.month + 1 });
    }
  };

  const applyDate = () => {
    const monthName = months[selectedDate.month].substring(0, 3);
    handleInputChange('dateOfBirth', `${selectedDate.day} ${monthName}, ${selectedDate.year}`);
    setShowDatePicker(false);
  };

  const CustomDropdown = ({ label, field, value, options, required = false }: any) => (
    <div style={{ marginBottom: '20px', position: 'relative' }}>
      <label style={{
        fontFamily: 'Poppins',
        fontSize: '14px',
        fontWeight: 500,
        color: '#000000',
        display: 'block',
        marginBottom: '8px'
      }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <div
        onClick={() => toggleDropdown(field)}
        style={{
          width: '100%',
          padding: '12px',
          border: `1px solid ${openDropdown === field ? '#4285F4' : '#E5E7EB'}`,
          borderRadius: '8px',
          fontFamily: 'Poppins',
          fontSize: '14px',
          color: '#6E6E6E',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF'
        }}
      >
        <span>{value}</span>
        {openDropdown === field ? 
          <ChevronUp style={{ width: '20px', height: '20px', color: '#6E6E6E' }} /> :
          <ChevronDown style={{ width: '20px', height: '20px', color: '#6E6E6E' }} />
        }
      </div>
      {openDropdown === field && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          marginTop: '4px',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {options.map((option: string, index: number) => (
            <div
              key={index}
              onClick={() => selectOption(field, option)}
              style={{
                padding: '12px 16px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: '#6E6E6E',
                cursor: 'pointer',
                background: value === option ? '#E8EAFF' : '#FFFFFF',
                borderBottom: index < options.length - 1 ? '1px solid #F3F4F6' : 'none'
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#FFFFFF',
      zIndex: 10001,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        background: '#FFFFFF'
      }}>
        <button
          onClick={handleBackClick}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft style={{ width: '24px', height: '24px', color: '#000000' }} />
        </button>
        <h2 style={{
          fontFamily: 'Poppins',
          fontSize: '18px',
          fontWeight: 600,
          color: '#000000',
          marginLeft: '12px'
        }}>
          Basic Details
        </h2>
      </div>

      {/* Scrollable Content */}
      <div style={{
        height: 'calc(100vh - 72px - 76px)',
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* Profile Photo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '8px',
              background: '#F3F4F6',
              overflow: 'hidden'
            }}>
              <img
                src={profileImage}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '-40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <button
                onClick={handleUploadClick}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Upload style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
              </button>
              <button
                onClick={handleEditClick}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Edit2 style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
              </button>
              <button
                onClick={handleDeleteClick}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Roll No */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Roll No <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.rollNo}
            onChange={(e) => handleInputChange('rollNo', e.target.value)}
            placeholder="Roll No"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#000000',
              outline: 'none'
            }}
          />
        </div>

        {/* First Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            First Name
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="First Name"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#000000',
              outline: 'none'
            }}
          />
        </div>

        {/* Middle Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Middle Name
          </label>
          <input
            type="text"
            value={formData.middleName}
            onChange={(e) => handleInputChange('middleName', e.target.value)}
            placeholder="Middle Name"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#000000',
              outline: 'none'
            }}
          />
        </div>

        {/* Last Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Last Name"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#000000',
              outline: 'none'
            }}
          />
        </div>

        {/* Course */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Course
          </label>
          <input
            type="text"
            value={formData.course}
            placeholder="Course"
            readOnly
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: formData.course ? '#000000' : '#9CA3AF',
              outline: 'none',
              background: '#F9FAFB'
            }}
          />
        </div>

        {/* Primary Specialization */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Primary Specialization
          </label>
          <input
            type="text"
            value={formData.primarySpecialization}
            placeholder="Primary Specialization"
            readOnly
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: formData.primarySpecialization ? '#000000' : '#9CA3AF',
              outline: 'none',
              background: '#F9FAFB'
            }}
          />
        </div>

        <CustomDropdown
          label="Gender"
          field="gender"
          value={formData.gender}
          options={genderOptions}
          required={true}
        />

        {/* Date of Birth */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Date of Birth <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <div
            onClick={() => setShowDatePicker(true)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: formData.dateOfBirth ? '#000000' : '#9CA3AF',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FFFFFF'
            }}
          >
            <span>{formData.dateOfBirth || 'Date of Birth'}</span>
            <ChevronDown style={{ width: '20px', height: '20px', color: '#6E6E6E' }} />
          </div>
        </div>

        <CustomDropdown
          label="Blood Group"
          field="bloodGroup"
          value={formData.bloodGroup}
          options={bloodGroupOptions}
        />

        <CustomDropdown
          label="Marital Status"
          field="maritalStatus"
          value={formData.maritalStatus}
          options={maritalStatusOptions}
        />

        {/* Medical History */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Medical History
          </label>
          <textarea
            value={formData.medicalHistory}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            maxLength={6000}
            placeholder="Medical History"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#6E6E6E',
              outline: 'none',
              minHeight: '120px',
              resize: 'vertical'
            }}
          />
          <div style={{
            fontFamily: 'Poppins',
            fontSize: '12px',
            color: '#9CA3AF',
            marginTop: '4px',
            textAlign: 'right'
          }}>
            {formData.medicalHistory.length} / 6000
          </div>
        </div>

        <CustomDropdown
          label="Disability"
          field="disability"
          value={formData.disability}
          options={disabilityOptions}
        />

        {/* Known Languages */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Known Languages
          </label>
          <input
            type="text"
            value={formData.knownLanguages}
            onChange={(e) => handleInputChange('knownLanguages', e.target.value)}
            placeholder="Known Languages"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#000000',
              outline: 'none'
            }}
          />
        </div>

        {/* Dream Company */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Dream Company
          </label>
          <input
            type="text"
            value={formData.dreamCompany}
            onChange={(e) => handleInputChange('dreamCompany', e.target.value)}
            placeholder="Dream Company"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#000000',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Bottom Save Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '16px'
      }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#9CA3AF' : '#4285F4',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'Poppins',
            fontSize: '15px',
            fontWeight: 600,
            color: '#FFFFFF',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Resize Image Page */}
      <ResizeImagePage
        isOpen={showResizeImage}
        onClose={() => setShowResizeImage(false)}
        imageUrl={selectedImage}
        onUpload={handleImageUpload}
      />

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10003,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '16px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <h3 style={{
              fontFamily: 'Poppins',
              fontSize: '18px',
              fontWeight: 600,
              color: '#000000',
              marginBottom: '8px'
            }}>
              Leave this page
            </h3>
            <p style={{
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#6E6E6E',
              marginBottom: '24px'
            }}>
              There might be unsaved changes. Are you sure want to leave this page?
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#FFFFFF',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontFamily: 'Poppins',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#6E6E6E',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLeave}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#6C5CE7',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: 'Poppins',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10002,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '16px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <h3 style={{
              fontFamily: 'Poppins',
              fontSize: '18px',
              fontWeight: 600,
              color: '#000000',
              marginBottom: '8px'
            }}>
              Confirmation needed
            </h3>
            <p style={{
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#6E6E6E',
              marginBottom: '24px'
            }}>
              Are you sure you want to delete this?
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#FFFFFF',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontFamily: 'Poppins',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#6E6E6E',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#6C5CE7',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: 'Poppins',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 10002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '340px'
          }}>
            <div style={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              color: '#9CA3AF',
              marginBottom: '8px'
            }}>
              SELECT DATE
            </div>
            <div style={{
              fontFamily: 'Poppins',
              fontSize: '24px',
              fontWeight: 600,
              color: '#000000',
              marginBottom: '20px'
            }}>
              Mon, Feb 23
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              gap: '12px'
            }}>
              {/* Month Dropdown */}
              <div style={{ position: 'relative', flex: 1 }}>
                <div
                  onClick={() => setDatePickerDropdown(datePickerDropdown === 'month' ? null : 'month')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${datePickerDropdown === 'month' ? '#4285F4' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: '#000000',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#FFFFFF'
                  }}
                >
                  <span>{months[selectedDate.month]}</span>
                  {datePickerDropdown === 'month' ? 
                    <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                    <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                  }
                </div>
                {datePickerDropdown === 'month' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    marginTop: '4px',
                    zIndex: 1001,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {months.map((month, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleMonthChange(index);
                          setDatePickerDropdown(null);
                        }}
                        style={{
                          padding: '10px 12px',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          color: '#6E6E6E',
                          cursor: 'pointer',
                          background: selectedDate.month === index ? '#E8EAFF' : '#FFFFFF',
                          borderBottom: index < months.length - 1 ? '1px solid #F3F4F6' : 'none'
                        }}
                      >
                        {month}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown */}
              <div style={{ position: 'relative', flex: 1 }}>
                <div
                  onClick={() => setDatePickerDropdown(datePickerDropdown === 'year' ? null : 'year')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${datePickerDropdown === 'year' ? '#4285F4' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: '#000000',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#FFFFFF'
                  }}
                >
                  <span>{selectedDate.year}</span>
                  {datePickerDropdown === 'year' ? 
                    <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                    <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                  }
                </div>
                {datePickerDropdown === 'year' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    marginTop: '4px',
                    zIndex: 1001,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {years.map((year) => (
                      <div
                        key={year}
                        onClick={() => {
                          handleYearChange(year);
                          setDatePickerDropdown(null);
                        }}
                        style={{
                          padding: '10px 12px',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          color: '#6E6E6E',
                          cursor: 'pointer',
                          background: selectedDate.year === year ? '#E8EAFF' : '#FFFFFF',
                          borderBottom: year !== years[years.length - 1] ? '1px solid #F3F4F6' : 'none'
                        }}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={prevMonth}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <ChevronLeft style={{ width: '20px', height: '20px', color: '#6E6E6E' }} />
                </button>
                <button
                  onClick={nextMonth}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <ChevronLeft style={{ width: '20px', height: '20px', color: '#6E6E6E', transform: 'rotate(180deg)' }} />
                </button>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} style={{
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#6E6E6E',
                  textAlign: 'center',
                  padding: '8px 0'
                }}>
                  {day}
                </div>
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: date === selectedDate.day ? '#FFFFFF' : '#000000',
                    background: date === selectedDate.day ? '#6C5CE7' : 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {date}
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#6E6E6E',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#6E6E6E',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={applyDate}
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: '#6C5CE7',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BasicDetailsPage;
