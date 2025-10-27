import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Grid3x3, 
  Calendar, 
  Bell, 
  Bookmark,
  ChevronDown,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useProfile } from '../contexts/ProfileContext';

const TopNavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { profileData } = useProfile();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left - Logo Section */}
      <div className="flex items-center space-x-3 w-[260px]">
        <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden">
          <img 
            src="/images/2024-04-04.webp" 
            alt="FluidJobs.ai Logo" 
            className="w-full h-full object-cover"
            style={{ transform: 'scale(1.5)' }}
          />
        </div>
        <span className="font-semibold text-[#283593] text-xl">FluidJobs.ai</span>
      </div>

      {/* Center - Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F0F2F5] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      {/* Right - Icons and Profile */}
      <div className="flex items-center space-x-4">
        {/* Apps Icon */}
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Apps"
        >
          <Grid3x3 className="w-6 h-6 text-gray-600" />
        </button>

        {/* Calendar Icon */}
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Calendar"
          onClick={() => navigate('/calendar')}
        >
          <Calendar className="w-6 h-6 text-gray-600" />
        </button>

        {/* Notifications Icon with Badge */}
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          title="Notifications"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-6 h-6 text-[#EF5350]" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF5350] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            2
          </span>
        </button>

        {/* Bookmark Icon */}
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Saved"
          onClick={() => navigate('/saved')}
        >
          <Bookmark className="w-6 h-6 text-gray-600" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 bg-[#F0F2F5] rounded-full py-1.5 pl-1.5 pr-4 hover:bg-gray-200 transition-colors shadow-sm"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white overflow-hidden">
              {(profileData.profileImageThumb || profileData.profileImage) ? (
                <img 
                  src={(profileData.profileImageThumb || profileData.profileImage) as string} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">{profileData.fullName || user?.name || 'User'}</span>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-[200px] bg-white rounded-lg shadow-xl py-2.5 z-20">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-5 py-3 text-left text-base text-gray-900 hover:bg-[#F0F2F5] transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/change-password');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-5 py-3 text-left text-base text-gray-900 hover:bg-[#F0F2F5] transition-colors"
                >
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left text-base text-gray-900 hover:bg-[#F0F2F5] transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;
