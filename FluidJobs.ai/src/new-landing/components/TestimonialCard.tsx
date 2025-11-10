import React from 'react';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, role, avatarUrl }) => {
  return (
    <div className="glass-card p-6 h-full flex flex-col" style={{'--glow-color': 'rgba(139, 92, 246, 0.3)'} as React.CSSProperties}>
      <blockquote className="text-gray-300 italic mb-4 flex-grow">"{quote}"</blockquote>
      <div className="flex items-center mt-auto">
        <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full mr-4 border-2 border-violet-500/50" />
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
