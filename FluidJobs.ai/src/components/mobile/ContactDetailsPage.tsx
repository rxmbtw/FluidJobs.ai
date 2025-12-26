import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import axios from 'axios';

interface ContactDetailsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactDetailsPage: React.FC<ContactDetailsPageProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    primaryPhoneCode: 'Select',
    primaryPhone: '',
    primaryEmail: '',
    currentAddress: '',
    addressLine2: '',
    country: 'Select',
    state: '',
    city: '',
    postalCode: '',
    sameAsCurrent: false
  });

  const [otherPhones, setOtherPhones] = useState<Array<{code: string, number: string}>>([]);
  const [otherEmails, setOtherEmails] = useState<string[]>([]);
  const [webLinks, setWebLinks] = useState<Array<{type: string, url: string}>>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [webLinkError, setWebLinkError] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      fetchContactDetails();
    }
  }, [isOpen]);

  const fetchContactDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/profile/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile: any = response.data;
      // Populate form with existing data if available
      if (profile) {
        setFormData({
          primaryPhoneCode: profile.primary_phone_code || 'Select',
          primaryPhone: profile.primary_phone || '',
          primaryEmail: profile.primary_email || profile.email || '',
          currentAddress: profile.current_address || '',
          addressLine2: profile.address_line2 || '',
          country: profile.country || 'Select',
          state: profile.state || '',
          city: profile.city || '',
          postalCode: profile.postal_code || '',
          sameAsCurrent: profile.same_as_current || false
        });
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  const countryCodes = [
    'Select',
    '+93 - Afghanistan',
    '+355 - Albania',
    '+213 - Algeria',
    '+1684 - American Samoa',
    '+376 - Andorra',
    '+244 - Angola',
    '+54 - Argentina',
    '+374 - Armenia',
    '+61 - Australia',
    '+43 - Austria',
    '+994 - Azerbaijan',
    '+973 - Bahrain',
    '+880 - Bangladesh',
    '+375 - Belarus',
    '+32 - Belgium',
    '+501 - Belize',
    '+229 - Benin',
    '+975 - Bhutan',
    '+591 - Bolivia',
    '+387 - Bosnia and Herzegovina',
    '+267 - Botswana',
    '+55 - Brazil',
    '+673 - Brunei',
    '+359 - Bulgaria',
    '+226 - Burkina Faso',
    '+257 - Burundi',
    '+855 - Cambodia',
    '+237 - Cameroon',
    '+1 - Canada',
    '+238 - Cape Verde',
    '+236 - Central African Republic',
    '+235 - Chad',
    '+56 - Chile',
    '+86 - China',
    '+57 - Colombia',
    '+269 - Comoros',
    '+242 - Congo',
    '+506 - Costa Rica',
    '+385 - Croatia',
    '+53 - Cuba',
    '+357 - Cyprus',
    '+420 - Czech Republic',
    '+45 - Denmark',
    '+253 - Djibouti',
    '+1767 - Dominica',
    '+593 - Ecuador',
    '+20 - Egypt',
    '+503 - El Salvador',
    '+240 - Equatorial Guinea',
    '+291 - Eritrea',
    '+372 - Estonia',
    '+251 - Ethiopia',
    '+679 - Fiji',
    '+358 - Finland',
    '+33 - France',
    '+241 - Gabon',
    '+220 - Gambia',
    '+995 - Georgia',
    '+49 - Germany',
    '+233 - Ghana',
    '+30 - Greece',
    '+299 - Greenland',
    '+502 - Guatemala',
    '+224 - Guinea',
    '+592 - Guyana',
    '+509 - Haiti',
    '+504 - Honduras',
    '+852 - Hong Kong',
    '+36 - Hungary',
    '+354 - Iceland',
    '+91 - India',
    '+62 - Indonesia',
    '+98 - Iran',
    '+964 - Iraq',
    '+353 - Ireland',
    '+972 - Israel',
    '+39 - Italy',
    '+1876 - Jamaica',
    '+81 - Japan',
    '+962 - Jordan',
    '+7 - Kazakhstan',
    '+254 - Kenya',
    '+965 - Kuwait',
    '+996 - Kyrgyzstan',
    '+856 - Laos',
    '+371 - Latvia',
    '+961 - Lebanon',
    '+266 - Lesotho',
    '+231 - Liberia',
    '+218 - Libya',
    '+423 - Liechtenstein',
    '+370 - Lithuania',
    '+352 - Luxembourg',
    '+853 - Macau',
    '+389 - Macedonia',
    '+261 - Madagascar',
    '+265 - Malawi',
    '+60 - Malaysia',
    '+960 - Maldives',
    '+223 - Mali',
    '+356 - Malta',
    '+52 - Mexico',
    '+373 - Moldova',
    '+377 - Monaco',
    '+976 - Mongolia',
    '+382 - Montenegro',
    '+212 - Morocco',
    '+258 - Mozambique',
    '+95 - Myanmar',
    '+264 - Namibia',
    '+977 - Nepal',
    '+31 - Netherlands',
    '+64 - New Zealand',
    '+505 - Nicaragua',
    '+227 - Niger',
    '+234 - Nigeria',
    '+47 - Norway',
    '+968 - Oman',
    '+92 - Pakistan',
    '+507 - Panama',
    '+675 - Papua New Guinea',
    '+595 - Paraguay',
    '+51 - Peru',
    '+63 - Philippines',
    '+48 - Poland',
    '+351 - Portugal',
    '+974 - Qatar',
    '+40 - Romania',
    '+7 - Russia',
    '+250 - Rwanda',
    '+966 - Saudi Arabia',
    '+221 - Senegal',
    '+381 - Serbia',
    '+248 - Seychelles',
    '+65 - Singapore',
    '+421 - Slovakia',
    '+386 - Slovenia',
    '+27 - South Africa',
    '+82 - South Korea',
    '+34 - Spain',
    '+94 - Sri Lanka',
    '+249 - Sudan',
    '+597 - Suriname',
    '+268 - Swaziland',
    '+46 - Sweden',
    '+41 - Switzerland',
    '+963 - Syria',
    '+886 - Taiwan',
    '+992 - Tajikistan',
    '+255 - Tanzania',
    '+66 - Thailand',
    '+228 - Togo',
    '+676 - Tonga',
    '+216 - Tunisia',
    '+90 - Turkey',
    '+993 - Turkmenistan',
    '+256 - Uganda',
    '+380 - Ukraine',
    '+971 - United Arab Emirates',
    '+44 - United Kingdom',
    '+1 - United States',
    '+598 - Uruguay',
    '+998 - Uzbekistan',
    '+58 - Venezuela',
    '+84 - Vietnam',
    '+967 - Yemen',
    '+260 - Zambia',
    '+263 - Zimbabwe'
  ];

  const countries = ['Select', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Greenland', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
  const webLinkTypes = ['Select', 'Skype', 'Hangouts', 'LINE', 'Lync', 'WhatsApp', 'Behance', 'Other'];

  const indianStates = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
  
  const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Pune City', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota'];

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/resume-form/contact-details`,
        {
          primaryPhoneCode: formData.primaryPhoneCode,
          primaryPhone: formData.primaryPhone,
          primaryEmail: formData.primaryEmail,
          otherPhones: otherPhones,
          otherEmails: otherEmails,
          webLinks: webLinks,
          currentAddress: formData.currentAddress,
          addressLine2: formData.addressLine2,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          postalCode: formData.postalCode,
          sameAsCurrent: formData.sameAsCurrent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setHasChanges(false);
      alert('Contact details saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving contact details:', error);
      alert('Failed to save contact details. Please try again.');
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

  const addOtherPhone = () => {
    if (otherPhones.length > 0) {
      const lastPhone = otherPhones[otherPhones.length - 1];
      if (!lastPhone.code || lastPhone.code === 'Select' || !lastPhone.number.trim()) {
        setPhoneError(true);
        return;
      }
    }
    setPhoneError(false);
    setOtherPhones([...otherPhones, {code: 'Select', number: ''}]);
    setHasChanges(true);
  };

  const addOtherEmail = () => {
    if (otherEmails.length > 0) {
      const lastEmail = otherEmails[otherEmails.length - 1];
      if (!lastEmail.trim()) {
        setEmailError(true);
        return;
      }
    }
    setEmailError(false);
    setOtherEmails([...otherEmails, '']);
    setHasChanges(true);
  };

  const addWebLink = () => {
    if (webLinks.length > 0) {
      const lastLink = webLinks[webLinks.length - 1];
      if (!lastLink.type || lastLink.type === 'Select' || !lastLink.url.trim()) {
        setWebLinkError(true);
        return;
      }
    }
    setWebLinkError(false);
    setWebLinks([...webLinks, {type: 'Select', url: ''}]);
    setHasChanges(true);
  };

  const handleStateChange = (value: string) => {
    handleInputChange('state', value);
    if (value.length > 0) {
      const filtered = indianStates.filter(state => 
        state.toLowerCase().includes(value.toLowerCase())
      );
      setStateSuggestions(filtered);
      setShowStateSuggestions(true);
    } else {
      setShowStateSuggestions(false);
    }
  };

  const handleCityChange = (value: string) => {
    handleInputChange('city', value);
    if (value.length > 0) {
      const filtered = indianCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setCitySuggestions(filtered);
      setShowCitySuggestions(true);
    } else {
      setShowCitySuggestions(false);
    }
  };

  const selectState = (state: string) => {
    handleInputChange('state', state);
    setShowStateSuggestions(false);
  };

  const selectCity = (city: string) => {
    handleInputChange('city', city);
    setShowCitySuggestions(false);
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
          Contact Details
        </h2>
      </div>

      <div style={{
        height: 'calc(100vh - 72px - 76px)',
        overflowY: 'auto',
        padding: '16px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Primary Phone Number
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '120px', position: 'relative' }}>
              <div
                onClick={() => toggleDropdown('primaryPhoneCode')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${openDropdown === 'primaryPhoneCode' ? '#4285F4' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#FFFFFF'
                }}
              >
                <span>{formData.primaryPhoneCode === 'Select' ? 'Code' : formData.primaryPhoneCode}</span>
                {openDropdown === 'primaryPhoneCode' ? 
                  <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                  <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                }
              </div>
              {openDropdown === 'primaryPhoneCode' && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '280px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  marginTop: '4px',
                  zIndex: 1000,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    background: '#F3F4F6',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#6C5CE7',
                    borderBottom: '1px solid #E5E7EB',
                    position: 'sticky',
                    top: 0
                  }}>
                    Country Code
                  </div>
                  {countryCodes.map((code, index) => (
                    <div
                      key={index}
                      onClick={() => selectOption('primaryPhoneCode', code)}
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        color: '#6E6E6E',
                        cursor: 'pointer',
                        background: formData.primaryPhoneCode === code ? '#E8EAFF' : '#FFFFFF',
                        borderBottom: index < countryCodes.length - 1 ? '1px solid #F3F4F6' : 'none'
                      }}
                    >
                      {code}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel"
              value={formData.primaryPhone}
              onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
              placeholder="Primary Phone Number"
              style={{
                flex: 1,
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

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000'
          }}>
            Other Phone Number(s)
          </label>
        </div>

        {otherPhones.map((phone, index) => (
          <div key={index}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '120px', position: 'relative' }}>
                <div
                  onClick={() => toggleDropdown(`phoneCode${index}`)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${phoneError && index === otherPhones.length - 1 ? '#EF4444' : openDropdown === `phoneCode${index}` ? '#4285F4' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#FFFFFF'
                  }}
                >
                  <span>{phone.code === 'Select' ? 'Code' : phone.code}</span>
                  {openDropdown === `phoneCode${index}` ? 
                    <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                    <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                  }
                </div>
                {openDropdown === `phoneCode${index}` && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '280px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    marginTop: '4px',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      background: '#F3F4F6',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6C5CE7',
                      borderBottom: '1px solid #E5E7EB',
                      position: 'sticky',
                      top: 0
                    }}>
                      Country Code
                    </div>
                    {countryCodes.map((code, codeIndex) => (
                      <div
                        key={codeIndex}
                        onClick={() => {
                          const updated = [...otherPhones];
                          updated[index].code = code;
                          setOtherPhones(updated);
                          setPhoneError(false);
                          setOpenDropdown(null);
                        }}
                        style={{
                          padding: '12px 16px',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          color: '#6E6E6E',
                          cursor: 'pointer',
                          background: phone.code === code ? '#E8EAFF' : '#FFFFFF',
                          borderBottom: codeIndex < countryCodes.length - 1 ? '1px solid #F3F4F6' : 'none'
                        }}
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                value={phone.number}
                onChange={(e) => {
                  const updated = [...otherPhones];
                  updated[index].number = e.target.value;
                  setOtherPhones(updated);
                  setPhoneError(false);
                }}
                placeholder="Enter other phone number"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `1px solid ${phoneError && index === otherPhones.length - 1 ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            {phoneError && index === otherPhones.length - 1 && (
              <div style={{
                fontFamily: 'Poppins',
                fontSize: '12px',
                color: '#EF4444',
                textAlign: 'right',
                marginBottom: '8px'
              }}>
                Please fill this detail.
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addOtherPhone}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4285F4',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '20px',
            marginLeft: 'auto'
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Add new
        </button>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Primary Email
          </label>
          <input
            type="email"
            value={formData.primaryEmail}
            onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
            placeholder="Primary Email"
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

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000'
          }}>
            Other Email(s)
          </label>
        </div>

        {otherEmails.map((email, index) => (
          <div key={index}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const updated = [...otherEmails];
                updated[index] = e.target.value;
                setOtherEmails(updated);
                setEmailError(false);
              }}
              placeholder="Please enter other email"
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${emailError && index === otherEmails.length - 1 ? '#EF4444' : '#E5E7EB'}`,
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                marginBottom: '4px'
              }}
            />
            {emailError && index === otherEmails.length - 1 && (
              <div style={{
                fontFamily: 'Poppins',
                fontSize: '12px',
                color: '#EF4444',
                textAlign: 'right',
                marginBottom: '8px'
              }}>
                Please fill this detail.
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addOtherEmail}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4285F4',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '20px',
            marginLeft: 'auto'
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Add new
        </button>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000'
          }}>
            Web Links / IMs
          </label>
        </div>

        {webLinks.length === 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '120px', position: 'relative' }}>
              <div
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: '#9CA3AF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  opacity: 0.6
                }}
              >
                <span>Select</span>
                <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
              </div>
            </div>
            <input
              type="text"
              disabled
              placeholder="Web Links / IMs"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: '#9CA3AF',
                background: '#FFFFFF',
                outline: 'none',
                opacity: 0.6
              }}
            />
          </div>
        )}

        {webLinks.map((link, index) => (
          <div key={index}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '120px', position: 'relative' }}>
                <div
                  onClick={() => toggleDropdown(`webLinkType${index}`)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${webLinkError && index === webLinks.length - 1 ? '#EF4444' : openDropdown === `webLinkType${index}` ? '#4285F4' : '#E5E7EB'}`,
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
                  <span>{link.type}</span>
                  {openDropdown === `webLinkType${index}` ? 
                    <ChevronUp style={{ width: '16px', height: '16px', color: '#6E6E6E' }} /> :
                    <ChevronDown style={{ width: '16px', height: '16px', color: '#6E6E6E' }} />
                  }
                </div>
                {openDropdown === `webLinkType${index}` && (
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
                    {webLinkTypes.map((type, typeIndex) => (
                      <div
                        key={typeIndex}
                        onClick={() => {
                          const updated = [...webLinks];
                          updated[index].type = type;
                          setWebLinks(updated);
                          setWebLinkError(false);
                          setOpenDropdown(null);
                        }}
                        style={{
                          padding: '12px 16px',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          color: '#6E6E6E',
                          cursor: 'pointer',
                          background: link.type === type ? '#E8EAFF' : '#FFFFFF',
                          borderBottom: typeIndex < webLinkTypes.length - 1 ? '1px solid #F3F4F6' : 'none'
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={link.url}
                onChange={(e) => {
                  const updated = [...webLinks];
                  updated[index].url = e.target.value;
                  setWebLinks(updated);
                  setWebLinkError(false);
                }}
                placeholder="Web Links / IMs"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `1px solid ${webLinkError && index === webLinks.length - 1 ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            {webLinkError && index === webLinks.length - 1 && (
              <div style={{
                fontFamily: 'Poppins',
                fontSize: '12px',
                color: '#EF4444',
                textAlign: 'right',
                marginBottom: '8px'
              }}>
                Please fill this detail.
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addWebLink}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4285F4',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '20px',
            marginLeft: 'auto'
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Add new
        </button>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Current Address <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.currentAddress}
            onChange={(e) => handleInputChange('currentAddress', e.target.value)}
            placeholder="Current Address"
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

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            placeholder="Address Line 2"
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

        <CustomDropdown
          label="Country"
          field="country"
          value={formData.country}
          options={countries}
          required={true}
        />

        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            State <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleStateChange(e.target.value)}
            onFocus={() => formData.state && setShowStateSuggestions(true)}
            placeholder="State"
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
          {showStateSuggestions && stateSuggestions.length > 0 && (
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
              {stateSuggestions.map((state, index) => (
                <div
                  key={index}
                  onClick={() => selectState(state)}
                  style={{
                    padding: '12px 16px',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: '#6E6E6E',
                    cursor: 'pointer',
                    background: '#FFFFFF',
                    borderBottom: index < stateSuggestions.length - 1 ? '1px solid #F3F4F6' : 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#E8EAFF'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                  {state}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            City <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleCityChange(e.target.value)}
            onFocus={() => formData.city && setShowCitySuggestions(true)}
            placeholder="City"
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
          {showCitySuggestions && citySuggestions.length > 0 && (
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
              {citySuggestions.map((city, index) => (
                <div
                  key={index}
                  onClick={() => selectCity(city)}
                  style={{
                    padding: '12px 16px',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: '#6E6E6E',
                    cursor: 'pointer',
                    background: '#FFFFFF',
                    borderBottom: index < citySuggestions.length - 1 ? '1px solid #F3F4F6' : 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#E8EAFF'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Postal Code
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="Postal Code"
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

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 500,
            color: '#000000',
            display: 'block',
            marginBottom: '8px'
          }}>
            Permanent Address
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.sameAsCurrent}
              onChange={(e) => handleInputChange('sameAsCurrent', e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: '#6C5CE7'
              }}
            />
            <span style={{
              fontFamily: 'Poppins',
              fontSize: '14px',
              color: '#6E6E6E'
            }}>
              Same as Current Address
            </span>
          </label>
        </div>
      </div>

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
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

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

export default ContactDetailsPage;
