import React, { useState, useRef, useEffect } from 'react';

const indianColleges = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati',
  'IIT Hyderabad', 'IIT Indore', 'IIT BHU Varanasi', 'IIT Jodhpur', 'IIT Patna', 'IIT Gandhinagar', 'IIT Bhubaneswar',
  'IIT Mandi', 'IIT Tirupati', 'IIT Palakkad', 'IIT Jammu', 'IIT Dharwad', 'IIT Bhilai', 'IIT Goa',
  'BITS Pilani', 'BITS Goa', 'BITS Hyderabad', 'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Calicut',
  'NIT Rourkela', 'NIT Jaipur', 'NIT Kurukshetra', 'NIT Durgapur', 'NIT Allahabad', 'NIT Bhopal', 'NIT Nagpur',
  'IIIT Hyderabad', 'IIIT Bangalore', 'IIIT Delhi', 'IIIT Allahabad', 'IIIT Gwalior', 'IIIT Kota',
  'Delhi University', 'Mumbai University', 'Pune University', 'Anna University', 'Madras University',
  'VIT Vellore', 'VIT Chennai', 'VIT Bhopal', 'VIT Amaravati', 'Manipal Institute of Technology',
  'SRM University', 'SRM Chennai', 'Amity University Noida', 'Amity University Mumbai', 'Lovely Professional University',
  'Jadavpur University', 'Jamia Millia Islamia', 'Aligarh Muslim University', 'Banaras Hindu University',
  'Calcutta University', 'Osmania University', 'Andhra University', 'Bangalore University', 'Christ University',
  'Symbiosis International University', 'Symbiosis Pune', 'NMIMS Mumbai', 'NMIMS Bangalore', 'Thapar Institute of Engineering',
  'PES University', 'RV College of Engineering', 'BMS College of Engineering', 'MS Ramaiah Institute of Technology',
  'PSG College of Technology', 'Coimbatore Institute of Technology', 'SSN College of Engineering',
  'Madras Institute of Technology', 'College of Engineering Pune', 'Vishwakarma Institute of Technology',
  'MICA Ahmedabad', 'IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'IIM Lucknow', 'IIM Indore', 'IIM Kozhikode',
  'XLRI Jamshedpur', 'FMS Delhi', 'SPJIMR Mumbai', 'ISB Hyderabad', 'MDI Gurgaon', 'NITIE Mumbai',
  'Shiv Nadar University', 'Ashoka University', 'OP Jindal Global University', 'Azim Premji University',
  'KIIT University', 'Kalinga Institute', 'Chandigarh University', 'Chitkara University', 'Bennett University',
  'Jain University', 'Dayananda Sagar University', 'CMR University', 'Alliance University', 'REVA University',
  'MIT Manipal', 'MIT Pune', 'COEP Pune', 'VJTI Mumbai', 'ICT Mumbai', 'DJ Sanghvi', 'KJ Somaiya',
  'Nirma University', 'DA-IICT Gandhinagar', 'LNMIIT Jaipur', 'MNIT Jaipur', 'DTU Delhi', 'NSUT Delhi',
  'IIIT Pune', 'IIIT Nagpur', 'IIIT Vadodara', 'IIIT Surat', 'IIIT Lucknow', 'IIIT Kottayam',
  'Birla Institute of Technology Mesra', 'BIT Ranchi', 'Birla Institute Pilani', 'BVPUD Pune', 'BVPCOE Pune'
];

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  themeState?: 'light' | 'dark';
}

const CollegeAutocomplete: React.FC<CollegeAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  className,
  style,
  themeState = 'light'
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 0) {
      const filtered = indianColleges.filter(college =>
        college.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (college: string) => {
    onChange(college);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        style={style}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-[200px] overflow-y-auto border rounded-[10px] shadow-lg z-50" style={{ backgroundColor: themeState === 'light' ? '#FFFFFF' : '#374151', borderColor: 'rgba(0,0,0,0.5)' }}>
          {suggestions.map((college, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(college)}
              className="w-full px-3 py-2 text-left text-[12px] font-medium hover:bg-blue-50"
              style={{ color: themeState === 'light' ? '#000000' : '#E5E7EB' }}
            >
              {college}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollegeAutocomplete;
