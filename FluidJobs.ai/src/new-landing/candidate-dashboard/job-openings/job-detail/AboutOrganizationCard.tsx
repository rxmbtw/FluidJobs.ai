import React from 'react';
import { Send } from 'lucide-react';
import { useTheme, getThemeColors } from '../../ThemeContext';

const AboutOrganizationCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div 
      className="p-6 rounded-xl shadow-lg flex-1 h-full min-w-0"
      style={{ 
        backgroundColor: colors.bgCard, 
        border: `1px solid ${colors.border}`
      }}
    >
      <h4 className="text-base font-bold uppercase mb-4 text-left" style={{ color: colors.textPrimary }}>
        ABOUT THE ORGANIZATION
      </h4>
      
      <p className="text-sm font-medium leading-relaxed text-left" style={{ color: colors.textSecondary }}>
        FluidLive is a Technology Solutions company with a modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, and more. FluidLive is committed to fostering innovation and continuous learning, specializing in enterprise solutions across multiple sectors including insurance.
      </p>
      
      <a 
        href="#" 
        className="text-sm font-bold flex items-center mt-3 hover:underline"
        style={{ color: colors.accent }}
      >
        View Website
        <Send className="w-4 h-4 ml-1" style={{ color: colors.accent }} />
      </a>
    </div>
  );
};

export default AboutOrganizationCard;
