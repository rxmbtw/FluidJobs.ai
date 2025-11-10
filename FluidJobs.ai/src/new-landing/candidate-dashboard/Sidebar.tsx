import React, { useState } from 'react';
import { Home, Briefcase, Users, FileText, Phone, Settings, User, ChevronRight, ChevronUp, LogOut } from 'lucide-react';
import AccountSettingsDropdown from './AccountSettingsDropdown';
import { useTheme, getThemeColors } from './ThemeContext';

interface SidebarProps {
  userName: string;
  onNavigate?: (view: string) => void;
  currentView?: string;
  onChangePassword?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onNavigate, currentView = 'home', onChangePassword }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleMouseEnter = () => setIsCollapsed(false);
  const handleMouseLeave = () => setIsCollapsed(true);

  return (
    <aside 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="hidden md:block sticky p-3 flex flex-col justify-between shadow-lg transition-all duration-300" 
      style={{ width: isCollapsed ? '80px' : '297px', top: '6rem', height: 'calc(100vh - 6rem)', backgroundColor: colors.bgSidebar, borderRight: `1px solid ${colors.border}`, borderBottomRightRadius: '16px', overflow: 'hidden' }}
    >
      <div className="flex flex-col h-full">
        <nav className="space-y-1 mt-4 flex-1">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate?.('home'); }}
            className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" 
            style={{ 
              borderRadius: '40px', 
              backgroundColor: currentView === 'home' ? colors.activeItemBg : 'transparent', 
              color: currentView === 'home' ? colors.accent : colors.iconColor
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'home') {
                e.currentTarget.style.backgroundColor = colors.activeItemBg;
                e.currentTarget.style.color = colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'home') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.iconColor;
              }
            }}
          >
            <Home className="w-6 h-6" />
            {!isCollapsed && <span>Home</span>}
          </a>
          
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate?.('jobs'); }} 
            className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200 relative" 
            style={{ 
              borderRadius: '40px', 
              backgroundColor: currentView === 'jobs' ? colors.activeItemBg : 'transparent',
              color: currentView === 'jobs' ? colors.accent : colors.iconColor
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'jobs') {
                e.currentTarget.style.backgroundColor = colors.activeItemBg;
                e.currentTarget.style.color = colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'jobs') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.iconColor;
              }
            }}
          >
            <Briefcase className="w-6 h-6" />
            {!isCollapsed && <span>Job Openings</span>}
            {!isCollapsed && <span className="absolute right-3 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: colors.border, color: colors.iconColor }}>6</span>}
          </a>

          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate?.('applications'); }} 
            className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" 
            style={{ 
              borderRadius: '40px', 
              backgroundColor: currentView === 'applications' ? colors.activeItemBg : 'transparent',
              color: currentView === 'applications' ? colors.accent : colors.iconColor
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'applications') {
                e.currentTarget.style.backgroundColor = colors.activeItemBg;
                e.currentTarget.style.color = colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'applications') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.iconColor;
              }
            }}
          >
            <Users className="w-6 h-6" />
            {!isCollapsed && <span>My Applications</span>}
          </a>

          <a 
            href="#" 
            className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" 
            style={{ borderRadius: '40px', color: colors.iconColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.activeItemBg;
              e.currentTarget.style.color = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.iconColor;
            }}
          >
            <FileText className="w-6 h-6" />
            {!isCollapsed && <span>Resume Reviewer</span>}
          </a>

          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate?.('contact'); }} 
            className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" 
            style={{ 
              borderRadius: '40px', 
              backgroundColor: currentView === 'contact' ? colors.activeItemBg : 'transparent',
              color: currentView === 'contact' ? colors.accent : colors.iconColor
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'contact') {
                e.currentTarget.style.backgroundColor = colors.activeItemBg;
                e.currentTarget.style.color = colors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'contact') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.iconColor;
              }
            }}
          >
            <Phone className="w-6 h-6" />
            {!isCollapsed && <span>Contact Us</span>}
          </a>
        </nav>

        <div className="my-6 mx-3" style={{ borderTop: `1px solid ${colors.border}` }}></div>

        <div className="relative mb-4">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setIsSettingsOpen(!isSettingsOpen); }}
            className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200 justify-between"
            style={{ borderRadius: '40px', color: colors.iconColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.activeItemBg;
              e.currentTarget.style.color = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.iconColor;
            }}
          >
            <div className="flex items-center space-x-4">
              <Settings className="w-6 h-6" style={{ color: colors.textPrimary }} />
              {!isCollapsed && <span>Account Settings</span>}
            </div>
            {!isCollapsed && <ChevronUp className={`w-5 h-5 transition duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} style={{ color: colors.textPrimary }} />}
          </a>

          {!isCollapsed && <AccountSettingsDropdown isOpen={isSettingsOpen} onNavigate={onNavigate} onChangePassword={onChangePassword} />}
        </div>

        <div className="relative">
          <div className="p-2 flex items-center justify-center shadow-inner" style={{ backgroundColor: isCollapsed ? 'transparent' : colors.activeItemBg, borderRadius: '40px' }}>
            {isCollapsed ? (
              <div onClick={() => onNavigate?.('profile')} className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:opacity-80 transition" style={{ backgroundColor: colors.accent }}>
                <User className="w-6 h-6" style={{ color: '#FFFFFF' }} />
              </div>
            ) : (
              <>
                <div onClick={() => onNavigate?.('profile')} className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.accent }}>
                    <User className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                  <span className="font-semibold text-sm md:text-lg truncate" style={{ color: colors.accent }}>{userName}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setIsLogoutOpen(!isLogoutOpen); }} className="cursor-pointer hover:opacity-80 transition">
                  <ChevronRight className="w-6 h-6 opacity-50" style={{ color: colors.accent }} />
                </button>
              </>
            )}
          </div>

          {!isCollapsed && isLogoutOpen && (
            <div className="absolute bottom-full left-0 w-full mb-1 rounded-xl shadow-2xl overflow-hidden z-20" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
              <nav className="p-2">
                <a href="#" onClick={(e) => { e.preventDefault(); console.log('Logout clicked'); }} className="flex items-center space-x-3 p-3 rounded-lg transition duration-150" style={{ color: '#EF4444' }}>
                  <LogOut className="w-5 h-5" style={{ color: '#EF4444' }} />
                  <span className="font-semibold text-base">Logout</span>
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
