import React from 'react';
import { useTheme, getThemeColors } from '../../ThemeContext';

const DescriptionCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div 
      className="p-6 rounded-xl shadow-lg"
      style={{ 
        backgroundColor: colors.bgCard, 
        border: `1px solid ${colors.border}`
      }}
    >
      <h4 className="text-base font-bold uppercase mb-4 text-left" style={{ color: colors.textPrimary }}>
        DESCRIPTION
      </h4>
      
      <p className="text-sm font-medium leading-relaxed text-left" style={{ color: colors.textSecondary }}>
        FluidLive is a Technology Solutions company with a modern techno-creative fluid blend as its principle. Developing economically feasible, artistically adaptable, and highly performant solutions is our core mission. We are looking for a dedicated QA Engineer to ensure the highest quality standards for our insurance vertical software products. The role involves designing and implementing automated tests, identifying and reporting bugs, and working closely with development teams to iterate on features. A strong understanding of software development life cycles and quality assurance methodologies is essential.
      </p>
      
      <p className="text-sm font-medium leading-relaxed mt-4 text-left" style={{ color: colors.textSecondary }}>
        The ideal candidate will have 3+ years of experience in manual and automated testing, proficiency with testing frameworks, and knowledge of the insurance domain is a plus.
      </p>
    </div>
  );
};

export default DescriptionCard;
