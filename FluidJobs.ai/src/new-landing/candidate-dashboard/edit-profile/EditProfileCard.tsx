import React from 'react';
import { User, Edit } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

const EditProfileCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <section className="rounded-xl shadow-xl p-4 relative overflow-hidden flex-shrink-0" style={{ backgroundColor: colors.bgCard }}>
      <div className="absolute top-0 left-0 w-full h-28 rounded-t-xl z-0" style={{ background: 'linear-gradient(to right, #0400FF, #8800FF, #D100FF)' }}></div>

      <div className="flex flex-col items-center pt-8 pb-4 relative z-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: colors.accent, border: `4px solid ${colors.bgCard}` }}>
            <User className="w-10 h-10 text-white" />
          </div>
          <button title="Edit Avatar" className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition hover:bg-[#7245d9]" style={{ backgroundColor: colors.accent, border: `2px solid ${colors.bgCard}` }}>
            <Edit className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      <button className="w-full mt-4 py-2 bg-[#10B981] text-white font-semibold rounded-lg text-sm shadow-lg hover:bg-[#0c9d6d] transition">
        Save Changes
      </button>
    </section>
  );
};

export default EditProfileCard;
