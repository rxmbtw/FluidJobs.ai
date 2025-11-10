import React from 'react';

interface GradientCardProps {
  step: string;
  title: string;
  description: string;
}

const GradientCard: React.FC<GradientCardProps> = ({ step, title, description }) => {
  return (
    <div className="gradient-card">
      <div className="gradient-card-inner">
        <div className="brand-gradient-text text-3xl font-bold mb-4">{step}</div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default GradientCard;
