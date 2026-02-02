
import React from 'react';

interface FilterProps {
  onFilterChange: (filters: any) => void;
  activeFilters: any;
}

const GlobalFilters: React.FC<FilterProps> = ({ onFilterChange, activeFilters }) => {
  const handleChange = (key: string, value: string) => {
    onFilterChange({ ...activeFilters, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200">
      <div className="flex items-center gap-3">
        {/* Search Field */}
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search Name, JD, or Email..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-normal focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            onChange={(e) => handleChange('query', e.target.value)}
            value={activeFilters.query || ''}
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-sm"></i>
        </div>

        {/* Filter Button */}
        <button 
          className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all"
          title="Filters"
        >
          <i className="fa-solid fa-sliders text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default GlobalFilters;
