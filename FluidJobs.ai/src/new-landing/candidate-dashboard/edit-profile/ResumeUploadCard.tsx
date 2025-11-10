import React from 'react';
import { Upload } from 'lucide-react';
import { useTheme, getThemeColors } from '../ThemeContext';

const ResumeUploadCard: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <section className="rounded-xl shadow-xl p-6" style={{ backgroundColor: colors.bgCard }}>
      <h3 className="text-xl font-bold mb-5" style={{ color: colors.textPrimary }}>Upload Your Resume</h3>

      <div className="border-2 border-dashed rounded-xl p-8 text-center transition duration-300 cursor-pointer" style={{ borderColor: colors.accent, backgroundColor: `${colors.bgCard}80` }}>
        <div className="flex justify-center mb-2">
          <Upload className="w-9 h-9" style={{ color: colors.textSecondary }} />
        </div>
        
        <p className="text-sm font-medium mb-1" style={{ color: colors.accent }}>Click to upload or drag and drop</p>
        <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>PDF, DOC (Max 5MB)</p>

        <label htmlFor="fileUpload" className="inline-flex items-center px-4 py-1.5 text-white rounded-lg font-medium text-xs shadow-md cursor-pointer hover:bg-[#7245d9] transition" style={{ backgroundColor: colors.accent }}>
          Choose File
          <input id="fileUpload" type="file" className="sr-only" accept=".pdf,.doc,.docx" />
        </label>
      </div>
    </section>
  );
};

export default ResumeUploadCard;
