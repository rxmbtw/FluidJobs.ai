import React from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  themeState?: string;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, style, className }) => {
  return (
    <input
      type="tel"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder="Enter phone number"
      style={style}
      className={className}
    />
  );
};

export default PhoneInput;