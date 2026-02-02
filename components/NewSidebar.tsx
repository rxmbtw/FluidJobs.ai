import React, { useState, useEffect } from 'react';

interface NewSidebarProps {
  onAddCandidate: () => void;
  onSidebarToggle: (expanded: boolean) => void;
}

const NewSidebar: React.FC<NewSidebarProps> = ({ onAddCandidate, onSidebarToggle }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);

  useEffect(() => {
    onSidebarToggle(isSidebarExpanded);
  }, [isSidebarExpanded, onSidebarToggle]);

  const handleMouseEnter = () => {
    setIsSidebarExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsSidebarExpanded(false);
  };

  return (
    <div
      className="fixed left-0 bottom-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40"
      style={{
        top: '73px',
        width: isSidebarExpanded ? '256px' : '80px'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <nav className="flex-1 px-4 overflow-hidden mt-4">
        {/* New Button with Dropdown */}
        <div className="relative mb-3 new-dropdown-container">
          <button
            onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            <i className="fa-solid fa-plus text-lg flex-shrink-0"></i>
            {isSidebarExpanded && <span className="text-sm font-semibold whitespace-nowrap">Create</span>}
          </button>
          {isSidebarExpanded && isNewDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg overflow-hidden z-50 border border-gray-200">
              <nav className="p-2">
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left">
                  <i className="fa-solid fa-briefcase text-lg"></i>
                  <span className="text-sm font-medium">Create Job</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left">
                  <i className="fa-solid fa-user-check text-lg"></i>
                  <span className="text-sm font-medium">Create User</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left">
                  <i className="fa-solid fa-users text-lg"></i>
                  <span className="text-sm font-medium">Create Account</span>
                </button>
                <button 
                  onClick={onAddCandidate}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition text-left"
                >
                  <i className="fa-solid fa-user text-lg"></i>
                  <span className="text-sm font-medium">Create Candidate</span>
                </button>
              </nav>
            </div>
          )}
        </div>
        
        {/* Separator line */}
        <div className="-mx-4 mb-3" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', paddingTop: '16px' }}></div>
        
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 text-left transition-all bg-blue-50 text-blue-600">
          <i className="fa-solid fa-chart-line text-lg flex-shrink-0"></i>
          {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
        </button>
        
        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 text-left transition-all text-gray-700 hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-check text-lg flex-shrink-0"></i>
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Approvals</span>}
          </div>
          {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">2</span>}
        </button>
        
        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 text-left transition-all text-gray-700 hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-users text-lg flex-shrink-0"></i>
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Accounts</span>}
          </div>
          {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">4</span>}
        </button>
        
        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 text-left transition-all text-gray-700 hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-briefcase text-lg flex-shrink-0"></i>
            {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Jobs</span>}
          </div>
          {isSidebarExpanded && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">17</span>}
        </button>
        
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 text-left transition-all text-gray-700 hover:bg-gray-50">
          <i className="fa-solid fa-users text-lg flex-shrink-0"></i>
          {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Candidates</span>}
        </button>
      </nav>
      
      {/* Settings Direct Navigation */}
      <div className="px-4 mb-4 settings-container" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)', paddingTop: '16px' }}>
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all text-gray-700 hover:bg-gray-50">
          <i className="fa-solid fa-gear text-lg flex-shrink-0"></i>
          {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
        </button>
      </div>
      
      {/* Profile Section */}
      <div className="p-4 overflow-visible relative profile-container" style={{ borderTop: '1px solid rgba(229, 231, 235, 0.8)' }}>
        <div className="flex items-center justify-between cursor-pointer hover:opacity-90 transition">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              D
            </div>
            {isSidebarExpanded && (
              <div>
                <p className="text-sm font-medium text-gray-900 whitespace-nowrap">D Sodhi</p>
                <p className="text-xs text-blue-600">Super Admin</p>
              </div>
            )}
          </div>
          {isSidebarExpanded && (
            <button className="text-red-600 hover:text-red-700">
              <i className="fa-solid fa-right-from-bracket text-lg"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewSidebar;