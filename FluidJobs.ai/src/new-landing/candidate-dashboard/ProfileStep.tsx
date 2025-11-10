import React from 'react';
import { FileUp, Image, MapPin, CheckCircle, Circle, PlusSquare, CheckSquare } from 'lucide-react';
import { useTheme, getThemeColors } from './ThemeContext';

interface ProfileStepProps {
  field: string;
  label: string;
  icon: string;
  isComplete: boolean;
  onClick: () => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ label, icon, isComplete, onClick }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const getIcon = () => {
    switch (icon) {
      case 'file-up': return FileUp;
      case 'image': return Image;
      case 'map-pin': return MapPin;
      default: return Circle;
    }
  };

  const IconComponent = getIcon();
  const StatusIcon = isComplete ? CheckCircle : Circle;
  const ActionIcon = isComplete ? CheckSquare : PlusSquare;

  return (
    <div 
      onClick={onClick}
      className="border rounded-xl p-3 flex items-center justify-between transition duration-150 cursor-pointer group"
      style={isComplete 
        ? { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }
        : { borderColor: colors.border }
      }
    >
      <div className="flex items-center space-x-3">
        <StatusIcon className="w-5 h-5 flex-shrink-0" style={{ color: isComplete ? '#10B981' : colors.textSecondary }} />
        <span className="font-semibold text-sm" style={{ color: isComplete ? '#10B981' : colors.textSecondary }}>
          {label}
        </span>
      </div>
      <ActionIcon className="w-5 h-5 flex-shrink-0" style={{ color: isComplete ? '#10B981' : colors.accent }} />
    </div>
  );
};

export default ProfileStep;
