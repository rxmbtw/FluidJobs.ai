import React from 'react';
import { useTheme, getThemeColors } from '../ThemeContext';

const WorkExperienceEditCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <section className="rounded-xl shadow-xl p-6" style={{ backgroundColor: colors.bgCard }}>
      <h3 className="text-xl font-bold mb-5" style={{ color: colors.textPrimary }}>Work Experience</h3>
      <div className="space-y-4">
        
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Are you currently working anywhere?*</p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-1.5 text-sm font-medium rounded-lg shadow-sm transition" style={{ border: `1px solid ${colors.accent}`, backgroundColor: theme === 'dark' ? '#3e2e71' : 'rgba(66, 133, 244, 0.1)', color: colors.textPrimary }}>Yes</button>
            <button className="px-4 py-1.5 text-sm font-medium rounded-lg shadow-sm transition" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard, color: colors.textSecondary }}>No</button>
            <button className="px-4 py-1.5 text-sm font-medium rounded-lg shadow-sm transition" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard, color: colors.textSecondary }}>Fresher</button>
          </div>
        </div>

        <div>
          <label htmlFor="currentCompany" className="text-sm font-medium" style={{ color: colors.textSecondary }}>Current Company*</label>
          <input id="currentCompany" type="text" placeholder="e.g., FluidLive Solutions" className="w-full mt-1 px-3 py-2 text-sm rounded-lg" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }} />
        </div>

        <div>
          <label htmlFor="joiningDate" className="text-sm font-medium" style={{ color: colors.textSecondary }}>Joining Date*</label>
          <input id="joiningDate" type="date" className="w-full mt-1 px-3 py-2 text-sm rounded-lg" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }} />
        </div>

        <div>
          <label htmlFor="workMode" className="text-sm font-medium" style={{ color: colors.textSecondary }}>Work Mode*</label>
          <input id="workMode" type="text" placeholder="e.g., on-site/work-from-home/hybrid" className="w-full mt-1 px-3 py-2 text-sm rounded-lg" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }} />
        </div>

        <div>
          <label htmlFor="annualCTC" className="text-sm font-medium" style={{ color: colors.textSecondary }}>Current Annual CTC*</label>
          <input id="annualCTC" type="text" placeholder="e.g., 15,00,000" className="w-full mt-1 px-3 py-2 text-sm rounded-lg" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgMain, color: colors.textPrimary }} />
        </div>
      </div>
    </section>
  );
};

export default WorkExperienceEditCard;
