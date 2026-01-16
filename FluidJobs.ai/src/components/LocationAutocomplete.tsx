import React from 'react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  themeState?: string;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ value, onChange, style, className }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder="Enter location"
      style={style}
      className={className}
    />
  );
};

export default LocationAutocomplete;