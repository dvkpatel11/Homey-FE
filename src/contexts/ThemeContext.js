import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark" || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // apply root class so .dark CSS block works
    document.documentElement.classList.toggle("dark", isDarkMode);
    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch {}
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((v) => !v);

  // use semantic class names that map to CSS utilities defined in index.css
  const themeClasses = {
    bgClasses: isDarkMode
      ? "bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950"
      : "bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100",
    primaryGlass: "glass glass-hoverable glass-strong",
    cardGlass: "glass glass-inset",
    inputGlass: "glass", // layer focus styles in component-level classes
  };

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeClasses }}>{children}</ThemeContext.Provider>;
};
