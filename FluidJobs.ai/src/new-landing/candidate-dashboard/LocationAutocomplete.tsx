import React, { useState, useRef, useEffect } from 'react';
import { indianCities } from '../../data/indianCities';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  themeState?: 'light' | 'dark';
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  className,
  style,
  themeState = 'light'
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
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
    const searchTerm = e.target.value;
    onChange(searchTerm);

    if (searchTerm.trim()) {
      const filtered = indianCities
        .filter(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 10);
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCitySelect = (city: string) => {
    onChange(city);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={handleInputChange}
        onFocus={() => value && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
        style={style}
      />
      {showSuggestions && filteredCities.length > 0 && (
        <div 
          className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            backgroundColor: themeState === 'light' ? '#FFFFFF' : '#2d2d2d',
            border: `1px solid ${themeState === 'light' ? '#e5e7eb' : '#374151'}`
          }}
        >
          {filteredCities.map((city, index) => (
            <div
              key={index}
              onClick={() => handleCitySelect(city)}
              className="px-4 py-2 cursor-pointer transition-colors"
              style={{
                color: themeState === 'light' ? '#000000' : '#FFFFFF',
                backgroundColor: themeState === 'light' ? '#FFFFFF' : '#2d2d2d'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeState === 'light' ? '#f3f4f6' : '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = themeState === 'light' ? '#FFFFFF' : '#2d2d2d';
              }}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
