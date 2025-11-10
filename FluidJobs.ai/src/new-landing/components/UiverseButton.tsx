import React from 'react';

interface UiverseButtonProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  as?: 'a' | 'button';
  type?: 'button' | 'submit' | 'reset';
  size?: 'large' | 'medium';
  disabled?: boolean;
}

const UiverseButton: React.FC<UiverseButtonProps> = ({
  children,
  href = "#",
  className = "",
  onClick,
  as = 'a',
  type = 'button',
  size = 'large',
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      if (as === 'a') {
        e.preventDefault();
      }
      onClick(e);
    }
  };

  const commonProps = {
    className: `uiverse-button ${size === 'medium' ? 'uiverse-button-medium' : ''} ${className}`.trim(),
    onClick: handleClick,
  };

  const innerContent = (
    <>
      <div className="blob1"></div>
      <div className="inner">{children}</div>
    </>
  );

  if (as === 'button') {
    return (
      <button {...commonProps} type={type} disabled={disabled}>
        {innerContent}
      </button>
    );
  }

  return (
    <a href={href} {...commonProps}>
      {innerContent}
    </a>
  );
};

export default UiverseButton;
