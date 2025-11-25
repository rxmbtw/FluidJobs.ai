import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: 'https://flagcdn.com/w20/in.png' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: 'https://flagcdn.com/w20/us.png' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: 'https://flagcdn.com/w20/gb.png' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: 'https://flagcdn.com/w20/ca.png' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: 'https://flagcdn.com/w20/au.png' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: 'https://flagcdn.com/w20/ae.png' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: 'https://flagcdn.com/w20/sg.png' },
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="relative flex" style={{ width: '211px', maxWidth: '211px' }}>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-[28px] px-2 border border-r-0 border-[rgba(0,0,0,0.5)] rounded-l-[5px] flex items-center gap-1 text-[12px] font-medium"
          style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151', color: themeState === 'light' ? '#000000' : '#E5E7EB', minWidth: '85px' }}
        >
          {selectedCountry ? (
            <>
              <img src={selectedCountry.flag} alt={selectedCountry.code} style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', display: 'block' }} />
              <span>{selectedCountry.dialCode}</span>
            </>
          ) : (
            <span style={{ color: '#6E6E6E' }}>Select</span>
          )}
          <ChevronDown className="w-3 h-3" />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-[250px] max-h-[200px] overflow-y-auto border rounded-[10px] shadow-lg z-50" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151', borderColor: 'rgba(0,0,0,0.5)' }}>
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className="w-full px-3 py-2 text-left text-[12px] font-medium hover:bg-blue-50 flex items-center gap-2"
                style={{ color: themeState === 'light' ? '#000000' : '#E5E7EB' }}
              >
                <img src={country.flag} alt={country.code} style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px', display: 'block' }} />
                <span>{country.dialCode}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder="9284710996"
        className="h-[28px] px-2 border border-[rgba(0,0,0,0.5)] rounded-r-[5px] text-[12px] font-medium font-['Poppins']"
        style={{ ...style, borderRadius: '0 5px 5px 0', backgroundColor: style?.backgroundColor, color: style?.color, width: '126px', flex: 'none' }}
      />
    </div>
  );
};

export default PhoneInput;
