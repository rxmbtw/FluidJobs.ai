import React, { useState, useRef, useEffect } from 'react';

interface StatusOption {
  id: string;
  label: string;
  enabled: boolean;
}

interface StatusDropdownProps {
  options: StatusOption[];
  onToggle: (id: string, enabled: boolean) => void;
  buttonText?: string;
  className?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  options,
  onToggle,
  buttonText = "Dropdown button",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center text-white bg-blue-600 box-border border border-transparent hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-sm font-medium leading-5 rounded-lg text-sm px-4 py-2.5 focus:outline-none"
      >
        {buttonText}
        <svg 
          className={`w-4 h-4 ms-1.5 -me-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          aria-hidden="true" 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg w-72">
          <ul className="p-2 space-y-1 text-sm text-gray-700 font-medium">
            {options.map((option) => (
              <li key={option.id}>
                <div className="inline-flex items-center w-full p-2 hover:bg-gray-100 hover:text-gray-900 rounded">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={option.enabled}
                      onChange={(e) => onToggle(option.id, e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900">{option.label}</span>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;