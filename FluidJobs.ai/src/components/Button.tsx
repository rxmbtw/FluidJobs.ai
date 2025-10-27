import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'neutral';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => (
  <button
    className={`px-4 py-2 rounded font-medium focus:outline-none ${
      variant === 'primary' ? 'bg-primary text-white' :
      variant === 'accent' ? 'bg-accent text-white' :
      'bg-neutral text-gray-700'
    } ${className}`}
    {...props}
  />
);

export default Button;
