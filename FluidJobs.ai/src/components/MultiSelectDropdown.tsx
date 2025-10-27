import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Check, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  selectAll?: boolean;
  disabled?: boolean;
  maxDisplayItems?: number;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  label,
  searchable = false,
  selectAll = false,
  disabled = false,
  maxDisplayItems = 2
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = filteredOptions.length > 0 && filteredOptions.every(option => selectedValues.includes(option.value));
  const someSelected = filteredOptions.some(option => selectedValues.includes(option.value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const toggleOption = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const toggleAll = () => {
    if (allSelected) {
      const filteredValues = filteredOptions.map(option => option.value);
      onChange(selectedValues.filter(value => !filteredValues.includes(value)));
    } else {
      const newValues = [...selectedValues];
      filteredOptions.forEach(option => {
        if (!newValues.includes(option.value)) {
          newValues.push(option.value);
        }
      });
      onChange(newValues);
    }
  };

  const removeTag = (value: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleOption(value);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length <= maxDisplayItems) {
      return selectedValues.map(value => 
        options.find(opt => opt.value === value)?.label
      ).join(', ');
    }
    return `${selectedValues.length} items selected`;
  };

  const getSelectedTags = () => {
    if (selectedValues.length <= maxDisplayItems) {
      return selectedValues.map(value => {
        const option = options.find(opt => opt.value === value);
        return option ? { value, label: option.label } : null;
      }).filter(Boolean);
    }
    return [];
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          toggleOption(filteredOptions[focusedIndex].value);
        }
        break;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      
      <div ref={dropdownRef} className="relative">
        {/* Main Dropdown Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full min-h-[44px] px-4 py-2 text-left bg-white border rounded-xl
            transition-all duration-200 ease-in-out
            ${disabled 
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
              : isOpen
                ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-20 shadow-lg'
                : 'border-gray-300 hover:border-indigo-300 hover:shadow-md'
            }
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {selectedValues.length <= maxDisplayItems ? (
                <div className="flex flex-wrap gap-1">
                  {getSelectedTags().map((tag) => (
                    <span
                      key={tag!.value}
                      className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-lg"
                    >
                      {tag!.label}
                      {!disabled && (
                        <button
                          onClick={(e) => removeTag(tag!.value, e)}
                          className="ml-1 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {selectedValues.length === 0 && (
                    <span className="text-gray-500">{placeholder}</span>
                  )}
                </div>
              ) : (
                <span className="text-gray-900">
                  {selectedValues.length} items selected
                </span>
              )}
            </div>
            
            <div className="ml-2 flex-shrink-0">
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {/* Dropdown List */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden">
            {/* Search Bar */}
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            {/* Select All Option */}
            {selectAll && filteredOptions.length > 1 && (
              <div className="border-b border-gray-100">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors duration-150 flex items-center space-x-3"
                >
                  <div className={`
                    w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150
                    ${allSelected 
                      ? 'bg-indigo-500 border-indigo-500' 
                      : someSelected
                        ? 'bg-indigo-100 border-indigo-300'
                        : 'border-gray-300'
                    }
                  `}>
                    {allSelected && <Check className="w-3 h-3 text-white" />}
                    {someSelected && !allSelected && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-sm" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </span>
                </button>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isFocused = index === focusedIndex;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className={`
                        w-full px-4 py-3 text-left transition-all duration-150 flex items-center space-x-3
                        ${isFocused ? 'bg-indigo-100' : 'hover:bg-indigo-50'}
                        ${isSelected ? 'bg-indigo-50' : ''}
                      `}
                    >
                      <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150
                        ${isSelected 
                          ? 'bg-indigo-500 border-indigo-500' 
                          : 'border-gray-300 hover:border-indigo-300'
                        }
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${isSelected ? 'font-medium text-indigo-900' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;