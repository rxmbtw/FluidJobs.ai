import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';

const DashboardHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: colors.bgCard, borderBottom: `1px solid ${colors.border}` }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <img 
            src={theme === 'dark' ? "/images/Fluid Live Icon.png" : "/images/FLuid Live Icon light theme.png"} 
            alt="FluidJobs.ai Logo" 
            className="object-contain" 
            style={{ width: theme === 'dark' ? '3.5rem' : '3rem', height: theme === 'dark' ? '3.5rem' : '3rem' }}
          />
          <h1 className="text-xl md:text-3xl font-extrabold" style={{ color: colors.accent, marginLeft: theme === 'dark' ? '-0.5rem' : '0rem' }}>FluidJobs.ai</h1>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full transition-all duration-200 hover:scale-110"
          style={{ backgroundColor: colors.activeItemBg }}
        >
          {theme === 'dark' ? (
            <Sun className="w-6 h-6" style={{ color: colors.accent }} />
          ) : (
            <Moon className="w-6 h-6" style={{ color: colors.accent }} />
          )}
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
