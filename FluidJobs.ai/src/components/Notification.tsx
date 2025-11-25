import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  themeState: 'light' | 'dark';
}

const Notification: React.FC<NotificationProps> = ({ message, isVisible, onClose, themeState }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div className={`fixed top-20 right-8 z-50 transform transition-all duration-300 ease-in-out ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] ${
        themeState === 'light' 
          ? 'bg-white border border-gray-200' 
          : 'bg-gray-800 border border-gray-600'
      }`}>
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        <span className={`text-sm font-medium ${
          themeState === 'light' ? 'text-gray-800' : 'text-gray-200'
        }`}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default Notification;