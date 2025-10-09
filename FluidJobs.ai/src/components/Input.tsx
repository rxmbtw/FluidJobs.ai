import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input className={`border p-2 rounded w-full ${className}`} {...props} />
);

export default Input;
