import React from 'react';

interface HeroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const HeroButton: React.FC<HeroButtonProps> = ({ children, onClick }) => {
  return (
    <button className="hero-button" onClick={onClick}>
      <span className="hero-button-text">{children}</span>
    </button>
  );
};

export default HeroButton;
