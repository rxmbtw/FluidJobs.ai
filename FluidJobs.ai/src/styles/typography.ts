// Typography System - Harmonized with Admin Dashboard
// Font sizes match admin dashboard for consistency

export const typography = {
  // Page-level headers
  pageTitle: "text-2xl font-semibold font-['Poppins']", // 24px - Changed to semibold
  
  // Section headers
  sectionTitle: "text-xl font-semibold font-['Poppins']", // 20px - Changed to semibold
  subsectionTitle: "text-lg font-semibold font-['Poppins']", // 18px
  
  // Body text
  bodyLarge: "text-base font-medium font-['Poppins']", // 16px
  bodyNormal: "text-sm font-medium font-['Poppins']", // 14px
  bodySmall: "text-xs font-normal font-['Poppins']", // 12px
  
  // Labels
  label: "text-sm font-medium font-['Poppins']", // 14px
  labelBold: "text-sm font-semibold font-['Poppins']", // 14px
  
  // Buttons
  button: "text-sm font-semibold font-['Poppins']", // 14px
  buttonLarge: "text-base font-semibold font-['Poppins']", // 16px
  
  // Navigation
  navItem: "text-sm font-medium font-['Poppins']", // 14px
  
  // Helper text
  caption: "text-xs font-normal font-['Poppins']", // 12px
  hint: "text-xs font-medium font-['Poppins']", // 12px
};

// Theme-aware text colors
export const getTextColor = (theme: 'light' | 'dark', variant: 'primary' | 'secondary' | 'accent') => {
  const colors = {
    light: {
      primary: '#000000',
      secondary: '#6E6E6E',
      accent: '#4285F4', // Google Blue - consistent across all themes
    },
    dark: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
      accent: '#4285F4', // Changed from purple to blue for consistency
    },
  };
  return colors[theme][variant];
};

// Theme-aware background colors
export const getBgColor = (theme: 'light' | 'dark', variant: 'main' | 'card' | 'hover') => {
  const colors = {
    light: {
      main: '#F0F0F0',
      card: '#FFFFFF',
      hover: '#EFF6FF', // Blue tint
    },
    dark: {
      main: '#050505',
      card: '#1a1a1a',
      hover: 'rgba(66, 133, 244, 0.15)', // Blue tint instead of purple
    },
  };
  return colors[theme][variant];
};

// Theme-aware border colors
export const getBorderColor = (theme: 'light' | 'dark') => {
  return theme === 'light' ? '#D9D9D9' : '#374151';
};

// Accent color (always blue)
export const accentColor = '#4285F4';
export const accentHover = '#3367D6';
