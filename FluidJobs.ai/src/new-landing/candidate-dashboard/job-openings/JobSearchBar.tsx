import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

const JobSearchBar: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <input 
          type="text" 
          placeholder="Search job openings..."
          className="w-full p-3 pl-10 rounded-xl shadow-sm transition"
          style={{ 
            border: `1px solid ${colors.border}`, 
            backgroundColor: colors.bgCard, 
            color: colors.textPrimary 
          }}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: colors.textSecondary }}>
          <Search className="w-5 h-5" />
        </div>
      </div>

      <button 
        className="flex items-center justify-center p-3 rounded-xl shadow-sm w-full md:w-auto transition duration-150"
        style={{ 
          backgroundColor: colors.bgCard, 
          border: `1px solid ${colors.border}`, 
          color: colors.textPrimary 
        }}
      >
        <Filter className="w-6 h-6" />
        <span className="ml-2 font-semibold">Filter</span>
      </button>
    </div>
  );
};

export default JobSearchBar;
