import React from 'react';
import { Filter, Bookmark, Briefcase, Sparkles, Star, CheckCircle } from 'lucide-react';

interface JobFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  themeState?: 'light' | 'dark';
}

const JobFilters: React.FC<JobFiltersProps> = ({ activeFilter, onFilterChange, themeState = 'light' }) => {
  const textColor = themeState === 'light' ? '#000000' : '#f9fafb';
  const inactiveText = themeState === 'light' ? '#4B5563' : '#9ca3af';
  const filterIconBg = themeState === 'light' ? '#E5E7EB' : '#374151';
  const filters = [
    { name: 'Saved Jobs', icon: Bookmark },
    { name: 'All Jobs', icon: Briefcase },
    { name: 'New Jobs', icon: Sparkles },
    { name: 'Perfect Match', icon: Star },
    { name: 'Applied Jobs', icon: CheckCircle }
  ];

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-2 sm:gap-3 mb-0 px-2 sm:px-0 py-3 justify-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <button
            key={filter.name}
            onClick={() => onFilterChange(filter.name)}
            className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
            style={{
              backgroundColor: activeFilter === filter.name ? '#2563EB' : (themeState === 'light' ? '#E5E7EB' : '#374151'),
              color: activeFilter === filter.name ? '#FFFFFF' : (themeState === 'light' ? '#4B5563' : '#9ca3af'),
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              marginRight: filter.name === 'Saved Jobs' ? '12px' : '0'
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== filter.name) {
                e.currentTarget.style.color = '#2563EB';
                e.currentTarget.style.backgroundColor = themeState === 'light' ? '#D1D5DB' : '#4B5563';
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== filter.name) {
                e.currentTarget.style.color = themeState === 'light' ? '#4B5563' : '#9ca3af';
                e.currentTarget.style.backgroundColor = themeState === 'light' ? '#E5E7EB' : '#374151';
              }
            }}
          >
            <Icon className="w-4 h-4" />
            {filter.name}
          </button>
        );
      })}
      <button
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition shrink-0"
        style={{ backgroundColor: filterIconBg, color: inactiveText }}
        title="Filter Jobs"
      >
        <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default JobFilters;
