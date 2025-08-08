import { useTheme } from 'contexts/ThemeContext';

const GlassCard = ({ children, className = "", hover = true }) => {
  const { themeClasses } = useTheme();

  return (
    <div
      className={`${themeClasses.cardGlass} rounded-3xl ${
        hover
          ? "hover:scale-[1.02] hover:shadow-3xl hover:shadow-black/60 dark:hover:shadow-black/80 hover:-translate-y-1 transition-all duration-500 transform-gpu"
          : ""
      } ${className}`}
      style={
        hover
          ? {
              filter: "drop-shadow(0 0 20px rgba(255,255,255,0.1))",
            }
          : {}
      }
    >
      {children}
    </div>
  );
};

export default GlassCard;
