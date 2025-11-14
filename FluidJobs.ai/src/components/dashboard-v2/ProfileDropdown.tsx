import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Users, LogOut } from 'lucide-react';

interface ProfileDropdownProps {
  userName: string;
  userInitials: string;
  onLogout: () => void;
  onContactSupport?: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ userName, userInitials, onLogout, onContactSupport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 pr-6 bg-blue-100 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-blue-200"
      >
        <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {userInitials}
        </div>
        <span className="text-xl font-semibold text-blue-600">{userName}</span>
        <ChevronDown
          className={`w-5 h-5 text-blue-500 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-blue-50 rounded-2xl shadow-xl border border-blue-200 overflow-hidden z-50">
          <button
            onClick={() => { setIsOpen(false); }}
            className="w-full text-left p-3 text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
          >
            View Profile
          </button>
          <button
            onClick={() => { 
              console.log('Contact Support button clicked');
              if (onContactSupport) {
                onContactSupport();
              }
              setIsOpen(false); 
            }}
            className="w-full text-left p-3 text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
          >
            Contact Support
          </button>
          <div className="h-px bg-blue-200 mx-3"></div>
          <button
            onClick={() => { onLogout(); }}
            className="w-full text-left p-3 text-red-600 font-semibold hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
