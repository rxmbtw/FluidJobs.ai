import React from 'react';
import { Bookmark, FilePlus2, Menu, Sun, Moon } from 'lucide-react';
import { useTheme, getThemeColors } from './ThemeContext';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onSavedJobsClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick, onSavedJobsClick }) => {
  const { theme, toggleTheme } = useTheme();
  const colors = getThemeColors(theme);
  const isDark = theme === 'dark';
  
  return (
    <header className="sticky top-0 z-30 h-16 md:h-24 flex items-center justify-between px-4 md:px-8 shadow-md" style={{ backgroundColor: colors.bgCard, borderBottom: `1px solid ${colors.border}` }}>
      <div className="flex items-center">
        <img 
          src={isDark ? "/images/Fluid Live Icon.png" : "/images/FLuid Live Icon light theme.png"} 
          alt="FluidJobs.ai Logo" 
          className="object-contain" 
          style={{ width: isDark ? '3.5rem' : '3rem', height: isDark ? '3.5rem' : '3rem' }}
        />
        <h1 className="text-xl md:text-3xl font-extrabold" style={{ color: colors.accent, marginLeft: isDark ? '-0.5rem' : '0rem' }}>FluidJobs.ai</h1>
      </div>

      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition shadow-sm hover:opacity-80"
          style={{ backgroundColor: isDark ? '#374151' : '#FFFFFF', border: isDark ? 'none' : `1px solid ${colors.border}` }}
        >
          {isDark ? <Sun className="w-5 h-5" style={{ color: colors.textPrimary }} /> : <Moon className="w-5 h-5" style={{ color: colors.textPrimary }} />}
        </button>

        <button 
          onClick={onSavedJobsClick}
          title="Saved Jobs" 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition shadow-sm hover:opacity-80"
          style={{ backgroundColor: isDark ? '#374151' : '#FFFFFF', border: isDark ? 'none' : `1px solid ${colors.border}` }}
        >
          <Bookmark className="w-5 h-5" style={{ color: colors.textPrimary }} />
        </button>

        <button className="h-10 px-4 rounded-xl flex items-center justify-center space-x-2 font-semibold text-sm transition shadow-lg hover:opacity-90" style={{ backgroundColor: colors.accent, color: '#FFFFFF' }}>
          <FilePlus2 className="w-4 h-4 opacity-90" style={{ color: '#FFFFFF' }} />
          <span className="hidden sm:inline">Generate Resume</span>
        </button>

        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg"
          style={{ color: colors.accent }}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
