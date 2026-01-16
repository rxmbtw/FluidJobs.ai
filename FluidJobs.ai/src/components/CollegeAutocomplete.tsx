import React from 'react';

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  themeState?: string;
  className?: string;
  placeholder?: string;
}

const CollegeAutocomplete: React.FC<CollegeAutocompleteProps> = ({ value, onChange, style, className, placeholder }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder || "Enter college name"}
      style={style}
      className={className}
    />
  );
};

export default CollegeAutocomplete;