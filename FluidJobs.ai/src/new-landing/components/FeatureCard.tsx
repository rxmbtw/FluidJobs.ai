import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="feature-card">
      <div className="lines-bg">
        <span className="line" style={{top: '20%'}}></span>
        <span className="line" style={{top: '30%'}}></span>
        <span className="line" style={{top: '70%'}}></span>
        <span className="line" style={{top: '80%'}}></span>
      </div>
      <div className="feature-card-inner">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
