import React from 'react';
import { useTheme, getThemeColors } from '../../ThemeContext';

const EligibleSkillsCard: React.FC = () => {
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
        ELIGIBLE SKILLS
      </h4>
      
      <div className="text-sm font-medium leading-relaxed space-y-2 text-left" style={{ color: colors.textSecondary }}>
        <p>The ideal candidate should possess expertise in the following key areas:</p>
        
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>
            Proficiency in <strong style={{ color: colors.textPrimary }}>Test Automation Frameworks</strong> (e.g., Selenium, Cypress, Playwright).
          </li>
          <li>
            Strong knowledge of <strong style={{ color: colors.textPrimary }}>Software Development Life Cycle (SDLC)</strong> and QA methodologies.
          </li>
          <li>
            Experience with <strong style={{ color: colors.textPrimary }}>JIRA</strong> or other bug tracking and project management tools.
          </li>
          <li>
            Familiarity with <strong style={{ color: colors.textPrimary }}>API testing</strong> tools like Postman or REST Assured.
          </li>
          <li>
            Solid understanding of <strong style={{ color: colors.textPrimary }}>SQL</strong> for database validation.
          </li>
          <li>
            Knowledge of <strong style={{ color: colors.textPrimary }}>Cloud platforms</strong> (AWS/Azure/GCP) is a plus.
          </li>
        </ul>
        
        <p className="mt-4">
          Candidates must have a minimum of 3 years of professional experience in Quality Assurance.
        </p>
      </div>
    </div>
  );
};

export default EligibleSkillsCard;
