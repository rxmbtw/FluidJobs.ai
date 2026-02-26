import React from 'react';
import { Filter, Bookmark, Briefcase, Sparkles, Star, CheckCircle } from 'lucide-react';

interface JobFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  themeState?: 'light' | 'dark';
}

const JobFilters: React.FC<JobFiltersProps> = ({ activeFilter, onFilterChange, themeState = 'light' }) => {
  const mobileFilters = [
    { name: 'All Jobs', label: 'All Jobs' },
    { name: 'New Jobs', label: 'Recently Posted Jobs' },
    { name: 'Perfect Match', label: 'Perfect Match' }
  ];

  const desktopFilters = [
    { name: 'Saved Jobs', icon: Bookmark },
    { name: 'All Jobs', icon: Briefcase },
    { name: 'New Jobs', icon: Sparkles },
    { name: 'Perfect Match', icon: Star },
    { name: 'Applied Jobs', icon: CheckCircle }
  ];

  return (
    <>
      {/* Mobile Filters */}
      <div className="md:hidden flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .md\:hidden::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {mobileFilters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => onFilterChange(filter.name)}
            className="px-4 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap flex-shrink-0"
            style={{
              backgroundColor: activeFilter === filter.name ? 'rgba(66, 133, 244, 0.16)' : '#D9D9D9',
              color: activeFilter === filter.name ? '#4285F4' : '#6E6E6E',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              lineHeight: '18px',
              height: '30px'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex overflow-x-auto scrollbar-hide gap-2 sm:gap-3 mb-0 px-2 sm:px-0 py-3 justify-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {desktopFilters.map((filter) => {
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
            >
              <Icon className="w-4 h-4" />
              {filter.name}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default JobFilters;
