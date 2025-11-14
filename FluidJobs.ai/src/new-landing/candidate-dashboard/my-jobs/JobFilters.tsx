import React from 'react';
import { Filter } from 'lucide-react';

interface JobFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  themeState?: 'light' | 'dark';
}

const JobFilters: React.FC<JobFiltersProps> = ({ activeFilter, onFilterChange, themeState = 'light' }) => {
  const textColor = themeState === 'light' ? '#000000' : '#f9fafb';
  const inactiveBg = themeState === 'light' ? '#E5E7EB' : '#374151';
  const inactiveText = themeState === 'light' ? '#4B5563' : '#9ca3af';
  const filterIconBg = themeState === 'light' ? '#E5E7EB' : '#374151';
  const filters = [
    'All Jobs',
    'New Jobs',
    'Perfect Match',
    'Applied Jobs',
    'Saved Jobs'
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6 justify-center">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className="px-5 py-2 rounded-full font-semibold text-sm transition-all"
          style={{
            backgroundColor: activeFilter === filter ? (themeState === 'light' ? '#DBEAFE' : 'rgba(37, 99, 235, 0.2)') : 'transparent',
            color: activeFilter === filter ? '#2563EB' : inactiveText
          }}
          onMouseEnter={(e) => {
            if (activeFilter !== filter) {
              e.currentTarget.style.color = '#2563EB';
              e.currentTarget.style.backgroundColor = themeState === 'light' ? 'rgba(219, 234, 254, 0.5)' : 'rgba(37, 99, 235, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeFilter !== filter) {
              e.currentTarget.style.color = inactiveText;
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {filter}
        </button>
      ))}
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center transition shrink-0"
        style={{ backgroundColor: filterIconBg, color: inactiveText }}
        title="Filter Jobs"
      >
        <Filter className="w-5 h-5" />
      </button>
    </div>
  );
};

export default JobFilters;
