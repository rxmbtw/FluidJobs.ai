import React from 'react';
import { useTheme, getThemeColors } from '../ThemeContext';

const SkillsResumeCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const skills = ['Python', 'C/C++', 'Java', 'SQL', 'Tailwind CSS', 'Cloud Services'];

  return (
    <div className="rounded-xl shadow-lg p-6 relative h-[288px]" style={{ backgroundColor: colors.bgCard }}>
      <h3 className="text-[20px] font-bold" style={{ color: colors.textPrimary }}>Resume</h3>
      <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
        View/Download the latest version of your candidate resume.
      </p>

      <div className="w-full h-px my-6" style={{ backgroundColor: colors.border }}></div>

      <h3 className="text-[20px] font-bold mb-3" style={{ color: colors.textPrimary }}>Skills</h3>

      <div className="flex flex-wrap gap-3">
        {skills.map((skill, index) => (
          <span key={index} className="px-4 py-1.5 rounded-md text-[13px] font-medium" style={{ border: `1px solid ${colors.accent}`, color: colors.accent, backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(66, 133, 244, 0.1)' }}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillsResumeCard;
