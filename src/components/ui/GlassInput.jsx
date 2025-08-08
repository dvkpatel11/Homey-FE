import { useTheme } from 'contexts/ThemeContext';

const GlassInput = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  className = "",
  icon: Icon,
  error,
  ...props
}) => {
  const { themeClasses, isDarkMode } = useTheme();

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-12 pr-4" : "px-4"} py-4 ${themeClasses.inputGlass} rounded-2xl outline-none transition-all duration-300 ${isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"} font-light ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default GlassInput;
