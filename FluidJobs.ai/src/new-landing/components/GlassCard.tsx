import React from 'react';

interface GlassCardProps {
  icon: React.ReactNode;
  name: string;
  glowColor: string;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ icon, name, glowColor, className }) => {
  const style = { '--glow-color': glowColor } as React.CSSProperties;

  return (
    <div className={`glass-card w-full md:w-64 h-64 flex flex-col items-center justify-center gap-4 ${className}`} style={style}>
      <div className="w-12 h-12 text-white">
        {icon}
      </div>
      <span className="text-xl font-semibold text-white">{name}</span>
    </div>
  );
};

export default GlassCard;
