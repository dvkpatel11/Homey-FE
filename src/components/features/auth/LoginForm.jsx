import { Eye, EyeOff, Home, Moon, Sun } from "lucide-react";
import { useState } from "react";

const LoginForm = () => {
  const { toggleTheme, isDarkMode, themeClasses } = useTheme();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError("Login failed");
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className={`${themeClasses.cardGlass} rounded-3xl hover:scale-[1.01] hover:shadow-2xl transition-all duration-500 w-full max-w-lg relative`}
    >
      {/* Floating theme toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute -top-6 -right-6 p-4 ${themeClasses.primaryGlass} rounded-2xl hover:scale-110 transition-all duration-300 group z-10`}
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
        ) : (
          <Moon className="w-6 h-6 text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
        )}
      </button>

      <div className="p-12">
        <div className="text-center mb-12">
          <div
            className={`w-24 h-24 bg-gradient-to-br ${isDarkMode ? "from-slate-300 to-gray-500" : "from-slate-600 to-gray-800"} rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-all duration-500`}
          >
            <Home className="w-12 h-12 text-white" />
          </div>
          <h1 className={`text-5xl font-thin mb-4 ${isDarkMode ? "text-white" : "text-gray-900"} tracking-wide`}>
            Homey
          </h1>
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} text-lg font-light`}>
            Effortless home management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-6 py-5 ${themeClasses.inputGlass} rounded-2xl focus:outline-none transition-all duration-300 ${isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"} text-lg font-light`}
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-6 py-5 ${themeClasses.inputGlass} rounded-2xl focus:outline-none pr-14 transition-all duration-300 ${isDarkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"} text-lg font-light`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-5 top-1/2 transform -translate-y-1/2 ${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"} transition-colors duration-300`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-center text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-medium text-lg bg-gradient-to-r ${isDarkMode ? "from-slate-600 to-gray-700" : "from-slate-700 to-gray-800"} text-white hover:shadow-2xl hover:shadow-slate-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center pt-4">
            <span className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-light`}>
              Don't have an account?{" "}
            </span>
            <button
              type="button"
              className={`${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} font-medium hover:underline transition-all duration-300`}
            >
              Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
