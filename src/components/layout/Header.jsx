import { Home, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const Header = () => {
  const { isDarkMode, toggleTheme, themeClasses } = useTheme();
  const { logout } = useAuth();

  return (
    <div
      className={`${themeClasses.primaryGlass} mx-6 mt-6 rounded-3xl p-6 flex justify-between items-center sticky top-6 z-40`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${isDarkMode ? "from-slate-300 to-gray-500" : "from-slate-600 to-gray-800"} rounded-2xl flex items-center justify-center shadow-lg`}
        >
          <Home className="w-5 h-5 text-white" />
        </div>
        <h1 className={`text-2xl font-thin ${isDarkMode ? "text-white" : "text-gray-900"} tracking-wide`}>Homey</h1>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className={`p-3 ${themeClasses.cardGlass} rounded-xl hover:scale-110 transition-all duration-300`}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        <button className={`p-3 ${themeClasses.cardGlass} rounded-xl hover:scale-110 transition-all duration-300`}>
          <Settings className={`w-5 h-5 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`} />
        </button>
        <button
          onClick={logout}
          className={`p-3 ${themeClasses.cardGlass} rounded-xl hover:scale-110 transition-all duration-300 hover:bg-red-500/10`}
        >
          <LogOut className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default Header;
