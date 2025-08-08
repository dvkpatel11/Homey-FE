import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import FloatingElements from '../../layout/FloatingElements';

const AuthLayout = ({ children }) => {
  const { themeClasses } = useTheme();

  return (
    <div className={`min-h-screen ${themeClasses.bgClasses} flex items-center justify-center p-6 relative overflow-hidden`}>
      <FloatingElements />
      {children}
    </div>
  );
};

export default AuthLayout;