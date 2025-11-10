import React from 'react';
import { MapPin } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

const MapAddressSection: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div 
        className="flex-1 flex items-center justify-center rounded-xl relative overflow-hidden"
        style={{ 
          border: `2px solid ${colors.border}`, 
          backgroundColor: colors.bgMain,
          minHeight: '200px'
        }}
      >
        <p className="font-semibold" style={{ color: colors.textSecondary }}>Map Placeholder</p>
        <MapPin className="absolute w-8 h-8 top-1/2 left-1/2 -mt-4 -ml-4" style={{ color: colors.accent }} />
      </div>

      <div className="p-4 rounded-xl shadow-md flex-1 flex items-center" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: colors.accent }}>
          Address: Fluid.Live, Bungalow #2, Lane O, 81/1, Late Ganpat Dulaji Pingle Path, behind One Restaurant and Bar, Koregaon Park Annexe, Pune, Maharashtra 411036
        </p>
      </div>
    </div>
  );
};

export default MapAddressSection;
