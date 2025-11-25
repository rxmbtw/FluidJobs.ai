import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({ value, onChange, placeholder, required }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    if (!window.google?.maps?.places) {
      console.warn('Google Maps Places API not loaded');
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: 'in' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    } catch (error) {
      console.warn('Failed to initialize Places Autocomplete:', error);
    }
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-300 bg-white text-black rounded-xl focus:ring-[#4285F4] focus:border-[#4285F4] outline-none text-sm font-medium placeholder:text-gray-400"
      required={required}
    />
  );
};

export default PlacesAutocomplete;
