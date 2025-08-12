import { CheckSquare, DollarSign, Home, MessageSquare } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const Navigation = ({ currentPage, setCurrentPage }) => {
  const { themeClasses, isDarkMode } = useTheme();

  const tabs = [
    {
      id: "home",
      icon: Home,
      label: "Home",
      color: isDarkMode ? "from-slate-500 to-gray-600" : "from-slate-600 to-gray-700",
    },
    { id: "tasks", icon: CheckSquare, label: "Tasks", color: "from-indigo-500 to-purple-600" },
    { id: "expenses", icon: DollarSign, label: "Expenses", color: "from-green-500 to-emerald-600" },
    { id: "announcements", icon: MessageSquare, label: "Social", color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className={`fixed bottom-6 left-6 right-6 ${themeClasses.primaryGlass} rounded-3xl p-4 z-40`}>
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentPage(tab.id)}
            className={`flex flex-col items-center space-y-2 p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
              currentPage === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                : `${isDarkMode ? "text-gray-400 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"} hover:text-white`
            }`}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
