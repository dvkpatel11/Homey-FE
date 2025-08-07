import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getThemeClasses = () => ({
    bgClasses: isDarkMode 
      ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950' 
      : 'bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100',
    
    primaryGlass: isDarkMode
      ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.08] backdrop-blur-3xl border border-white/[0.15] shadow-2xl shadow-black/60 ring-1 ring-inset ring-white/[0.1]'
      : 'bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-3xl border border-white/70 shadow-2xl shadow-black/20 ring-1 ring-inset ring-white/50',
    
    cardGlass: isDarkMode
      ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.04] backdrop-blur-2xl border border-white/[0.12] shadow-xl shadow-black/40 ring-1 ring-inset ring-white/[0.05]'
      : 'bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-2xl border border-white/60 shadow-xl shadow-black/10 ring-1 ring-inset ring-white/40',
    
    inputGlass: isDarkMode
      ? 'bg-gradient-to-br from-white/[0.06] to-white/[0.03] backdrop-blur-xl border border-white/[0.15] focus:border-white/30 focus:from-white/[0.1] focus:to-white/[0.06] focus:shadow-lg focus:shadow-black/30 focus:ring-2 focus:ring-white/[0.1]'
      : 'bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl border border-white/50 focus:border-gray-300 focus:from-white/80 focus:to-white/60 focus:ring-2 focus:ring-gray-200/50'
  });

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      themeClasses: getThemeClasses() 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};