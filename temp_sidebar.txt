import React, { useState } from 'react';
import { Plus, Eye, Users, Upload, LogOut, ChevronRight, User } from 'lucide-react';
import { useTheme, getThemeColors } from '../candidate-dashboard/ThemeContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const menuItems = [
    { id: 'create_job', label: 'Create Job', icon: Plus },
    { id: 'view_opening', label: 'View Openings', icon: Eye },
    { id: 'manage_candidates', label: 'Manage Candidates', icon: Users },
    { id: 'bulk_import', label: 'Bulk Import', icon: Upload }
  ];

  return (
    <aside 
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className="hidden md:block sticky p-3 flex flex-col justify-between shadow-lg transition-all duration-300" 
      style={{ 
        width: isCollapsed ? '80px' : '297px', 
        top: '4rem', 
        height: 'calc(100vh - 4rem)', 
        backgroundColor: colors.bgSidebar, 
        borderRight: `1px solid ${colors.border}`, 
        overflow: 'hidden' 
      }}
    >
      <div className="flex flex-col h-full">
        <nav className="space-y-1 mt-4 flex-1">
          {menuItems.map((item) => (
            <a 
              key={item.id}
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
              className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" 
              style={{ 
                borderRadius: '40px', 
                backgroundColor: currentView === item.id ? colors.activeItemBg : 'transparent', 
                color: currentView === item.id ? colors.accent : colors.iconColor
              }}
              onMouseEnter={(e) => {
                if (currentView !== item.id) {
                  e.currentTarget.style.backgroundColor = colors.activeItemBg;
                  e.currentTarget.style.color = colors.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.iconColor;
                }
              }}
            >
              <item.icon className="w-6 h-6" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="my-6 mx-3" style={{ borderTop: `1px solid ${colors.border}` }}></div>

        <div className="relative mb-4">
          <div className="p-2 flex items-center justify-center shadow-inner" style={{ backgroundColor: isCollapsed ? 'transparent' : colors.activeItemBg, borderRadius: '40px' }}>
            {isCollapsed ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:opacity-80 transition" style={{ backgroundColor: colors.accent }}>
                <User className="w-6 h-6" style={{ color: '#FFFFFF' }} />
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.accent }}>
                    <User className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                  </div>
                  <span className="font-semibold text-sm md:text-lg truncate" style={{ color: colors.accent }}>HR Admin</span>
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
                <a href="#" onClick={(e) => { e.preventDefault(); onLogout?.(); }} className="flex items-center space-x-3 p-3 rounded-lg transition duration-150" style={{ color: '#EF4444' }}>
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
