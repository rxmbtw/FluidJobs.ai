import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Country {
  code: string;
  dialCode: string;
}

const countries: Country[] = [
  { code: 'Afghanistan', dialCode: '+93' },
  { code: 'Albania', dialCode: '+355' },
  { code: 'Algeria', dialCode: '+213' },
  { code: 'American Samoa', dialCode: '+1684' },
  { code: 'Andorra', dialCode: '+376' },
  { code: 'Angola', dialCode: '+244' },
  { code: 'Argentina', dialCode: '+54' },
  { code: 'Armenia', dialCode: '+374' },
  { code: 'Australia', dialCode: '+61' },
  { code: 'Austria', dialCode: '+43' },
  { code: 'Azerbaijan', dialCode: '+994' },
  { code: 'Bahrain', dialCode: '+973' },
  { code: 'Bangladesh', dialCode: '+880' },
  { code: 'Belarus', dialCode: '+375' },
  { code: 'Belgium', dialCode: '+32' },
  { code: 'Belize', dialCode: '+501' },
  { code: 'Benin', dialCode: '+229' },
  { code: 'Bhutan', dialCode: '+975' },
  { code: 'Bolivia', dialCode: '+591' },
  { code: 'Bosnia and Herzegovina', dialCode: '+387' },
  { code: 'Botswana', dialCode: '+267' },
  { code: 'Brazil', dialCode: '+55' },
  { code: 'Brunei', dialCode: '+673' },
  { code: 'Bulgaria', dialCode: '+359' },
  { code: 'Burkina Faso', dialCode: '+226' },
  { code: 'Burundi', dialCode: '+257' },
  { code: 'Cambodia', dialCode: '+855' },
  { code: 'Cameroon', dialCode: '+237' },
  { code: 'Canada', dialCode: '+1' },
  { code: 'Cape Verde', dialCode: '+238' },
  { code: 'Central African Republic', dialCode: '+236' },
  { code: 'Chad', dialCode: '+235' },
  { code: 'Chile', dialCode: '+56' },
  { code: 'China', dialCode: '+86' },
  { code: 'Colombia', dialCode: '+57' },
  { code: 'Comoros', dialCode: '+269' },
  { code: 'Congo', dialCode: '+242' },
  { code: 'Costa Rica', dialCode: '+506' },
  { code: 'Croatia', dialCode: '+385' },
  { code: 'Cuba', dialCode: '+53' },
  { code: 'Cyprus', dialCode: '+357' },
  { code: 'Czech Republic', dialCode: '+420' },
  { code: 'Denmark', dialCode: '+45' },
  { code: 'Djibouti', dialCode: '+253' },
  { code: 'Dominica', dialCode: '+1767' },
  { code: 'Ecuador', dialCode: '+593' },
  { code: 'Egypt', dialCode: '+20' },
  { code: 'El Salvador', dialCode: '+503' },
  { code: 'Equatorial Guinea', dialCode: '+240' },
  { code: 'Eritrea', dialCode: '+291' },
  { code: 'Estonia', dialCode: '+372' },
  { code: 'Ethiopia', dialCode: '+251' },
  { code: 'Fiji', dialCode: '+679' },
  { code: 'Finland', dialCode: '+358' },
  { code: 'France', dialCode: '+33' },
  { code: 'Gabon', dialCode: '+241' },
  { code: 'Gambia', dialCode: '+220' },
  { code: 'Georgia', dialCode: '+995' },
  { code: 'Germany', dialCode: '+49' },
  { code: 'Ghana', dialCode: '+233' },
  { code: 'Greece', dialCode: '+30' },
  { code: 'Greenland', dialCode: '+299' },
  { code: 'Guatemala', dialCode: '+502' },
  { code: 'Guinea', dialCode: '+224' },
  { code: 'Guyana', dialCode: '+592' },
  { code: 'Haiti', dialCode: '+509' },
  { code: 'Honduras', dialCode: '+504' },
  { code: 'Hong Kong', dialCode: '+852' },
  { code: 'Hungary', dialCode: '+36' },
  { code: 'Iceland', dialCode: '+354' },
  { code: 'India', dialCode: '+91' },
  { code: 'Indonesia', dialCode: '+62' },
  { code: 'Iran', dialCode: '+98' },
  { code: 'Iraq', dialCode: '+964' },
  { code: 'Ireland', dialCode: '+353' },
  { code: 'Israel', dialCode: '+972' },
  { code: 'Italy', dialCode: '+39' },
  { code: 'Jamaica', dialCode: '+1876' },
  { code: 'Japan', dialCode: '+81' },
  { code: 'Jordan', dialCode: '+962' },
  { code: 'Kazakhstan', dialCode: '+7' },
  { code: 'Kenya', dialCode: '+254' },
  { code: 'Kuwait', dialCode: '+965' },
  { code: 'Kyrgyzstan', dialCode: '+996' },
  { code: 'Laos', dialCode: '+856' },
  { code: 'Latvia', dialCode: '+371' },
  { code: 'Lebanon', dialCode: '+961' },
  { code: 'Lesotho', dialCode: '+266' },
  { code: 'Liberia', dialCode: '+231' },
  { code: 'Libya', dialCode: '+218' },
  { code: 'Liechtenstein', dialCode: '+423' },
  { code: 'Lithuania', dialCode: '+370' },
  { code: 'Luxembourg', dialCode: '+352' },
  { code: 'Macau', dialCode: '+853' },
  { code: 'Macedonia', dialCode: '+389' },
  { code: 'Madagascar', dialCode: '+261' },
  { code: 'Malawi', dialCode: '+265' },
  { code: 'Malaysia', dialCode: '+60' },
  { code: 'Maldives', dialCode: '+960' },
  { code: 'Mali', dialCode: '+223' },
  { code: 'Malta', dialCode: '+356' },
  { code: 'Mexico', dialCode: '+52' },
  { code: 'Moldova', dialCode: '+373' },
  { code: 'Monaco', dialCode: '+377' },
  { code: 'Mongolia', dialCode: '+976' },
  { code: 'Montenegro', dialCode: '+382' },
  { code: 'Morocco', dialCode: '+212' },
  { code: 'Mozambique', dialCode: '+258' },
  { code: 'Myanmar', dialCode: '+95' },
  { code: 'Namibia', dialCode: '+264' },
  { code: 'Nepal', dialCode: '+977' },
  { code: 'Netherlands', dialCode: '+31' },
  { code: 'New Zealand', dialCode: '+64' },
  { code: 'Nicaragua', dialCode: '+505' },
  { code: 'Niger', dialCode: '+227' },
  { code: 'Nigeria', dialCode: '+234' },
  { code: 'Norway', dialCode: '+47' },
  { code: 'Oman', dialCode: '+968' },
  { code: 'Pakistan', dialCode: '+92' },
  { code: 'Panama', dialCode: '+507' },
  { code: 'Papua New Guinea', dialCode: '+675' },
  { code: 'Paraguay', dialCode: '+595' },
  { code: 'Peru', dialCode: '+51' },
  { code: 'Philippines', dialCode: '+63' },
  { code: 'Poland', dialCode: '+48' },
  { code: 'Portugal', dialCode: '+351' },
  { code: 'Qatar', dialCode: '+974' },
  { code: 'Romania', dialCode: '+40' },
  { code: 'Russia', dialCode: '+7' },
  { code: 'Rwanda', dialCode: '+250' },
  { code: 'Saudi Arabia', dialCode: '+966' },
  { code: 'Senegal', dialCode: '+221' },
  { code: 'Serbia', dialCode: '+381' },
  { code: 'Seychelles', dialCode: '+248' },
  { code: 'Singapore', dialCode: '+65' },
  { code: 'Slovakia', dialCode: '+421' },
  { code: 'Slovenia', dialCode: '+386' },
  { code: 'South Africa', dialCode: '+27' },
  { code: 'South Korea', dialCode: '+82' },
  { code: 'Spain', dialCode: '+34' },
  { code: 'Sri Lanka', dialCode: '+94' },
  { code: 'Sudan', dialCode: '+249' },
  { code: 'Suriname', dialCode: '+597' },
  { code: 'Swaziland', dialCode: '+268' },
  { code: 'Sweden', dialCode: '+46' },
  { code: 'Switzerland', dialCode: '+41' },
  { code: 'Syria', dialCode: '+963' },
  { code: 'Taiwan', dialCode: '+886' },
  { code: 'Tajikistan', dialCode: '+992' },
  { code: 'Tanzania', dialCode: '+255' },
  { code: 'Thailand', dialCode: '+66' },
  { code: 'Togo', dialCode: '+228' },
  { code: 'Tonga', dialCode: '+676' },
  { code: 'Tunisia', dialCode: '+216' },
  { code: 'Turkey', dialCode: '+90' },
  { code: 'Turkmenistan', dialCode: '+993' },
  { code: 'Uganda', dialCode: '+256' },
  { code: 'Ukraine', dialCode: '+380' },
  { code: 'United Arab Emirates', dialCode: '+971' },
  { code: 'United Kingdom', dialCode: '+44' },
  { code: 'United States', dialCode: '+1' },
  { code: 'Uruguay', dialCode: '+598' },
  { code: 'Uzbekistan', dialCode: '+998' },
  { code: 'Venezuela', dialCode: '+58' },
  { code: 'Vietnam', dialCode: '+84' },
  { code: 'Yemen', dialCode: '+967' },
  { code: 'Zambia', dialCode: '+260' },
  { code: 'Zimbabwe', dialCode: '+263' }
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  themeState?: 'light' | 'dark';
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, className, style, themeState = 'light' }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter(country => 
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  useEffect(() => {
    if (value) {
      const country = countries.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.replace(country.dialCode, ''));
      } else {
        setPhoneNumber(value);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    onChange(`${country.dialCode}${phoneNumber}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/\D/g, '');
    setPhoneNumber(num);
    if (selectedCountry) {
      onChange(`${selectedCountry.dialCode}${num}`);
    } else {
      onChange(num);
    }
  };

  return (
    <div className="relative flex" style={{ width: '100%' }}>
      <div ref={dropdownRef} style={{ position: 'relative', width: '80px', flexShrink: 0 }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            height: '28px',
            padding: '0 6px',
            border: `1px solid ${isOpen ? '#4285F4' : 'rgba(0, 0, 0, 0.5)'}`,
            borderRight: 'none',
            borderRadius: '5px 0 0 5px',
            fontFamily: 'Poppins',
            fontSize: '12px',
            color: selectedCountry ? (themeState === 'light' ? '#000000' : '#E5E7EB') : '#6E6E6E',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151'
          }}
        >
          <span style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedCountry ? selectedCountry.dialCode : 'Code'}
          </span>
          {isOpen ? 
            <ChevronUp style={{ width: '14px', height: '14px', color: '#6E6E6E', flexShrink: 0 }} /> :
            <ChevronDown style={{ width: '14px', height: '14px', color: '#6E6E6E', flexShrink: 0 }} />
          }
        </div>
        
        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            width: '320px',
            background: themeState === 'light' ? '#FFFFFF' : '#374151',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            marginBottom: '4px',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              position: 'sticky',
              top: 0,
              background: themeState === 'light' ? '#FFFFFF' : '#374151',
              padding: '8px',
              borderBottom: '1px solid #E5E7EB',
              zIndex: 1
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: themeState === 'light' ? '#000000' : '#E5E7EB',
                  backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151',
                  outline: 'none'
                }}
              />
            </div>
            {filteredCountries.map((country, index) => (
              <div
                key={country.code}
                onClick={() => handleCountrySelect(country)}
                style={{
                  padding: '8px 12px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: themeState === 'light' ? '#6E6E6E' : '#E5E7EB',
                  cursor: 'pointer',
                  background: selectedCountry?.code === country.code ? '#DBEAFE' : (themeState === 'light' ? '#FFFFFF' : '#374151'),
                  borderBottom: index < filteredCountries.length - 1 ? '1px solid #F3F4F6' : 'none'
                }}
              >
                <span>{country.dialCode} - {country.code}</span>
              </div>
            ))}
            {filteredCountries.length === 0 && (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                fontFamily: 'Poppins',
                fontSize: '12px',
                color: '#6E6E6E'
              }}>
                No countries found
              </div>
            )}
          </div>
        )}
      </div>
      
      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder="9284710996"
        className="h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-r-[5px] text-[12px] font-medium font-['Poppins']"
        style={{ ...style, borderRadius: '0 5px 5px 0', backgroundColor: style?.backgroundColor, color: style?.color, flex: 1, minWidth: 0 }}
      />
    </div>
  );
};

export default PhoneInput;
