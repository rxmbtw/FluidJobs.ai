import React, { useState } from 'react';
import { Home, Briefcase, Users, FileText, Phone, Settings, User, ChevronRight, ChevronUp } from 'lucide-react';
import AccountSettingsDropdown from './AccountSettingsDropdown';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, userName }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div onClick={onClose} className="absolute inset-0 opacity-70" style={{ backgroundColor: '#050505' }}></div>
      
      <nav className={`absolute left-0 top-0 bottom-0 p-3 flex flex-col justify-between shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ width: '297px', backgroundColor: '#1a1a1a' }}>
        <div className="flex flex-col h-full">
          <div className="space-y-1 mt-4 flex-1">
            <div className="flex items-center space-x-2 p-2 mb-6" style={{ borderBottom: '1px solid #374151' }}>
              <img src="/images/Fluid Live Icon.png" alt="FluidJobs.ai Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-extrabold brand-gradient-text">FluidJobs.ai</h1>
            </div>
            
            <a href="#" onClick={onClose} className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" style={{ borderRadius: '40px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
              <Home className="w-6 h-6" />
              <span>Home</span>
            </a>
            
            <a href="#" onClick={onClose} className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200 relative" style={{ borderRadius: '40px', color: '#9ca3af' }}>
              <Briefcase className="w-6 h-6" style={{ color: '#f9fafb' }} />
              <span>Job Openings</span>
              <span className="absolute right-3 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: '#374151', color: '#9ca3af' }}>10</span>
            </a>

            <a href="#" onClick={onClose} className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" style={{ borderRadius: '40px', color: '#9ca3af' }}>
              <Users className="w-6 h-6" style={{ color: '#f9fafb' }} />
              <span>My Applications</span>
            </a>

            <a href="#" onClick={onClose} className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" style={{ borderRadius: '40px', color: '#9ca3af' }}>
              <FileText className="w-6 h-6" style={{ color: '#f9fafb' }} />
              <span>Resume Reviewer</span>
            </a>

            <a href="#" onClick={onClose} className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200" style={{ borderRadius: '40px', color: '#9ca3af' }}>
              <Phone className="w-6 h-6" style={{ color: '#f9fafb' }} />
              <span>Contact Us</span>
            </a>

            <div className="my-6 mx-3" style={{ borderTop: '1px solid #374151' }}></div>

            <div className="relative">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setIsSettingsOpen(!isSettingsOpen); }}
                className="flex items-center space-x-4 p-3 font-semibold text-lg transition duration-200 justify-between"
                style={{ borderRadius: '40px', color: '#9ca3af' }}
              >
                <div className="flex items-center space-x-4">
                  <Settings className="w-6 h-6" style={{ color: '#f9fafb' }} />
                  <span>Account Settings</span>
                </div>
                <ChevronUp className={`w-5 h-5 transition duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} style={{ color: '#f9fafb' }} />
              </a>

              <AccountSettingsDropdown isOpen={isSettingsOpen} />
            </div>
          </div>
          
          <div className="p-2 flex items-center justify-between shadow-inner mt-auto" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', borderRadius: '40px' }}>
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B5CF6' }}>
                <User className="w-6 h-6" style={{ color: '#f9fafb' }} />
              </div>
              <span className="font-semibold text-sm md:text-lg truncate" style={{ color: '#8B5CF6' }}>{userName}</span>
            </div>
            <ChevronRight className="w-6 h-6 opacity-50" style={{ color: '#8B5CF6' }} />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MobileSidebar;
