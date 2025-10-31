import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home,
  Briefcase,
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  UsersRound,
  FileText,
  MessageCircle,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Edit,
  Key
} from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useProfile } from '../contexts/ProfileContext';
import ImageCropperModal from './ImageCropperModal';
import { generateImageSizes } from '../utils/imageUtils';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
      <button
        onClick={() => {
          navigate('/profile');
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        My Profile
      </button>
      <button
        onClick={() => {
          navigate('/settings');
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Settings
      </button>
      <button
        onClick={() => {
          navigate('/change-password');
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Key className="w-4 h-4" />
        Change Password
      </button>
      <hr className="my-1" />
      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
};

const EnhancedSidebar: React.FC = () => {
  const { user } = useAuth();
  const { profileData, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resumeCount = profileData.resumes?.length || 0;

  const handleQuickEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropperImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const sizes = await generateImageSizes(croppedBlob);
    updateProfile({
      ...profileData,
      profileImage: sizes.full,
      profileImageLarge: sizes.full,
      profileImageMedium: sizes.medium,
      profileImageThumb: sizes.thumbnail,
    });
    setCropperImage(null);
  };

  // Get navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    switch (user?.role) {
      case 'Candidate':
        return [
          { name: 'Home', path: '/dashboard', icon: Home },
          { name: 'Jobs', path: '/jobs', icon: Briefcase, badge: 21 },
          { name: 'Applications', path: '/applications', icon: Users },
          { name: 'Resumes', path: '/resumes', icon: FileText, badge: resumeCount },
        ];
      
      case 'HR':
      case 'Admin':
        return [
          { name: 'Home', path: '/dashboard', icon: Home },
          { name: 'Job Management', path: '/job-management', icon: Briefcase },
        ];
      
      case 'Client':
        return [
          { name: 'Home', path: '/dashboard', icon: Home },
          { name: 'Projects', path: '/projects', icon: Briefcase },
          { name: 'Candidates', path: '/candidates', icon: Users },
        ];
      
      default:
        return [
          { name: 'Home', path: '/dashboard', icon: Home },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleLogoClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavClick = () => {
    setIsCollapsed(true);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div 
      className={`${isCollapsed ? 'w-16' : 'w-[260px]'} bg-white h-full flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {/* User Profile Card */}
      {!isCollapsed && (
        <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white overflow-hidden">
              {(profileData.profileImageThumb || profileData.profileImage) ? (
                <img 
                  src={(profileData.profileImageThumb || profileData.profileImage) as string} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <h3 className="mt-3 text-base font-semibold text-gray-900">{profileData.fullName || user?.name || 'User'}</h3>
          <p className="text-xs text-gray-600 mt-1">{user?.role || 'User'}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 bg-green-50 text-green-600 text-[11px] font-medium rounded">
            Active
          </span>
          <button 
            onClick={() => navigate('/resumes')}
            className="mt-4 w-full bg-[#673AB7] hover:bg-[#5E35B1] text-white py-2 px-4 rounded-lg text-xs font-medium transition-colors"
          >
            Generate Resume
          </button>
        </div>
      </div>
      )}

      {/* Main Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center px-4' : 'justify-between px-5'} py-3 transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#EDE7F6] text-[#673AB7] border-l-4 border-[#673AB7]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
                title={isCollapsed ? item.name : ''}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium text-[13px]">{item.name}</span>}
                </div>
                {!isCollapsed && item.badge !== undefined && item.badge !== 0 && (
                  <span className="bg-gray-200 text-gray-700 text-[11px] font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="px-5 pb-5 space-y-4">
          <button 
            onClick={() => navigate('/contact')}
            className="w-full bg-[#EDE7F6] rounded-lg p-3 hover:bg-[#E1D5F6] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-[#673AB7] flex-shrink-0" />
              <p className="text-xs font-medium text-gray-900">Get in touch with FluidJobs.ai</p>
            </div>
          </button>
          <div className="flex justify-center">
            <img 
              src="/images/FLuid Live Icon.png" 
              alt="FluidJobs.ai Logo" 
              className="w-8 h-8 object-contain"
              style={{ background: 'transparent', mixBlendMode: 'multiply' }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">© FluidJobs.ai</p>
        </div>
      )}

      {cropperImage && (
        <ImageCropperModal
          imageSrc={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperImage(null)}
        />
      )}
    </div>
  );
};

export default EnhancedSidebar;