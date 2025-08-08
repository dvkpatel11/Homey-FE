import { useTheme } from 'contexts/ThemeContext';

const GlassButton = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const baseClasses =
    "font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none";

  const variants = {
    primary: `bg-gradient-to-r ${isDarkMode ? "from-slate-600 to-gray-700" : "from-slate-700 to-gray-800"} text-white hover:shadow-2xl hover:shadow-slate-500/25`,
    secondary: `bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400`,
    success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl hover:shadow-green-500/25",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-2xl hover:shadow-red-500/25",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlassButton;
