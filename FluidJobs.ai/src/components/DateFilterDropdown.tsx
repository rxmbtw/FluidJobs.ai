import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface DateFilterDropdownProps {
  onDateRangeChange: (start: string, end: string) => void;
}

export const DateFilterDropdown: React.FC<DateFilterDropdownProps> = ({ onDateRangeChange }) => {
  const [selectedMonth, setSelectedMonth] = useState('All Time');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate current month + last 3 months
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      options.push(monthName);
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setShowCustomCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setIsDropdownOpen(false);
    setShowCustomCalendar(false);
    
    const [monthName, year] = month.split(' ');
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const monthNum = monthMap[monthName];
    const start = new Date(parseInt(year), monthNum, 1).toISOString().split('T')[0];
    const end = new Date(parseInt(year), monthNum + 1, 0).toISOString().split('T')[0];
    
    onDateRangeChange(start, end);
  };

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
      setSelectedMonth(`${startDate} to ${endDate}`);
      setShowCustomCalendar(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors"
      >
        <Calendar size={18} className="text-gray-600" />
        <span className="text-sm text-gray-700">{selectedMonth}</span>
        {isDropdownOpen ? (
          <ChevronUp size={16} className="text-gray-600" />
        ) : (
          <ChevronDown size={16} className="text-gray-600" />
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {!showCustomCalendar ? (
            <>
              <button
                onClick={() => {
                  setSelectedMonth('All Time');
                  onDateRangeChange('', '');
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-center text-sm hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                All Time
              </button>
              <button
                onClick={() => setShowCustomCalendar(true)}
                className="w-full px-4 py-2 text-center text-sm hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                Custom Dates
              </button>
              {monthOptions.map((month) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(month)}
                  className="w-full px-4 py-2 text-center text-sm hover:bg-gray-50 transition-colors"
                >
                  {month}
                </button>
              ))}
            </>
          ) : (
            <div className="p-4">
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  max={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  max={today}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomCalendar(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomDateApply}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};