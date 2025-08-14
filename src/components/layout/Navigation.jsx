import { motion } from "framer-motion";
import { CheckSquare, DollarSign, Home, MessageSquare } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext.jsx";
import { useExpenses } from "../../hooks/useExpenses.js";
import { useTasks } from "../../hooks/useTasks.js";

const Navigation = ({ currentPage, setCurrentPage }) => {
  const { pendingTasks, overdueTasks } = useTasks();
  const { getPendingBills, getOverdueBills } = useExpenses();
  const { unreadCount } = useNotifications();

  const tabs = [
    {
      id: "dashboard",
      icon: Home,
      label: "Home",
      color: "from-homey-violet-500 to-homey-violet-600",
      count: 0,
    },
    {
      id: "tasks",
      icon: CheckSquare,
      label: "Tasks",
      color: "from-amber-500 to-orange-500",
      count: pendingTasks?.length + overdueTasks?.length || 0,
    },
    {
      id: "expenses",
      icon: DollarSign,
      label: "Bills",
      color: "from-emerald-500 to-emerald-600",
      count: getPendingBills?.()?.length + getOverdueBills?.()?.length || 0,
    },
    {
      id: "announcements",
      icon: MessageSquare,
      label: "Chat",
      color: "from-blue-500 to-indigo-600",
      count: unreadCount || 0,
    },
  ];

  const handleTabClick = (tabId) => {
    setCurrentPage(tabId);
  };

  return (
    <motion.div
      className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 
                 glass-card glass-card-violet rounded-glass-xl p-3 sm:p-4 z-40 safe-area-bottom"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-around items-center">
        {tabs.map((tab, index) => {
          const isActive = currentPage === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                relative flex flex-col items-center space-y-1 sm:space-y-2 
                p-2 sm:p-3 rounded-glass transition-all duration-300
                ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-glass-lg`
                    : `text-glass-secondary hover:text-glass hover:bg-surface-1`
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* Icon with badge */}
              <div className="relative">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />

                {/* Badge for counts */}
                {tab.count > 0 && !isActive && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 
                               bg-red-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <span className="text-xs text-white font-medium">{tab.count > 9 ? "9+" : tab.count}</span>
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span className="text-xs font-medium hidden xs:block">{tab.label}</span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-1 h-1 bg-white rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Floating indicator line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
                   from-transparent via-white/20 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
    </motion.div>
  );
};

export default Navigation;
