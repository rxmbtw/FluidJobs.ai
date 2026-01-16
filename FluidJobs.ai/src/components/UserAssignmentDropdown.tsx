import React, { useState, useRef, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

interface UserAssignmentDropdownProps {
  users: User[];
  selectedUsers: string[];
  onSelectionChange: (selectedUserIds: string[]) => void;
  onAddNewUser?: () => void;
  placeholder?: string;
  className?: string;
}

const UserAssignmentDropdown: React.FC<UserAssignmentDropdownProps> = ({
  users,
  selectedUsers,
  onSelectionChange,
  onAddNewUser,
  placeholder = "Assign Users",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    onSelectionChange(newSelection);
  };

  const handleDeleteSelected = () => {
    onSelectionChange([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayText = () => {
    if (selectedUsers.length === 0) return placeholder;
    if (selectedUsers.length === 1) {
      const user = users.find(u => u.id === selectedUsers[0]);
      return user?.name || placeholder;
    }
    return `${selectedUsers.length} users selected`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center text-white bg-blue-600 box-border border border-transparent hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-sm font-medium leading-5 rounded-lg text-sm px-4 py-2.5 focus:outline-none w-full"
      >
        {getDisplayText()}
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
        <div className="absolute z-50 bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-lg w-full min-w-[250px]">
          {/* Search Input */}
          <div className="bg-white border-b border-gray-200 p-2 rounded-t-lg">
            <label htmlFor="user-search" className="sr-only">Search</label>
            <input
              type="text"
              id="user-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-2 shadow-sm placeholder:text-gray-500"
              placeholder="Search for users"
            />
          </div>

          {/* User List */}
          <ul className="h-48 p-2 text-sm text-gray-700 font-medium overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <li className="p-2 text-gray-500 text-center">No users found</li>
            ) : (
              filteredUsers.map((user) => (
                <li key={user.id} className="w-full flex items-center p-2 hover:bg-gray-100 hover:text-gray-900 rounded">
                  <label htmlFor={`user-${user.id}`} className="w-full flex items-center justify-between cursor-pointer">
                    <div className="inline-flex items-center font-medium">
                      {user.avatar ? (
                        <img 
                          className="w-5 h-5 me-2 rounded-full" 
                          src={user.avatar} 
                          alt={`${user.name} avatar`}
                        />
                      ) : (
                        <div className="w-5 h-5 me-2 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{user.name}</span>
                    </div>
                    <input
                      id={`user-${user.id}`}
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-blue-300"
                    />
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Action Buttons Below Dropdown */}
      <div className="flex gap-2 mt-2">
        {onAddNewUser && (
          <button
            type="button"
            onClick={onAddNewUser}
            className="flex-1 inline-flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 box-border border border-transparent focus:ring-4 focus:ring-blue-300 shadow-sm font-medium leading-5 rounded text-xs px-3 py-1.5 focus:outline-none"
          >
            <svg className="w-3.5 h-3.5 me-1.5 -ms-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12h4m-2 2v-4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
            Add user
          </button>
        )}
        {selectedUsers.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="flex-1 inline-flex items-center justify-center text-white bg-red-600 box-border border border-transparent hover:bg-red-700 focus:ring-4 focus:ring-red-300 shadow-sm font-medium leading-5 rounded text-xs px-3 py-1.5 focus:outline-none"
          >
            <svg className="w-3.5 h-3.5 me-1.5 -ms-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
            </svg>
            Delete user
          </button>
        )}
      </div>
    </div>
  );
};

export default UserAssignmentDropdown;