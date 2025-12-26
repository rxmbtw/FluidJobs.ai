import React, { createContext, useContext, useState, useEffect } from 'react';
import { accentColor, accentHover } from '../../styles/typography';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const getThemeColors = (theme: Theme) => ({
  bgMain: theme === 'dark' ? '#050505' : '#F0F0F0',
  bgCard: theme === 'dark' ? '#1a1a1a' : '#FFFFFF',
  bgSidebar: theme === 'dark' ? '#1a1a1a' : '#FFFFFF',
  textPrimary: theme === 'dark' ? '#f9fafb' : '#000000',
  textSecondary: theme === 'dark' ? '#9ca3af' : '#6E6E6E',
  border: theme === 'dark' ? '#374151' : '#D9D9D9',
  accent: '#4285F4', // Blue for both themes - consistent branding
  accentHover: '#3367D6', // Darker blue for hover
  iconColor: theme === 'dark' ? '#9ca3af' : '#6E6E6E',
  activeItemBg: theme === 'dark' ? 'rgba(66, 133, 244, 0.15)' : '#E3F2FD', // Blue tint for both
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
});
