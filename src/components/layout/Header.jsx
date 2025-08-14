import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, Home, LogOut, Moon, Plus, Settings, Sun, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useHousehold } from "../../contexts/HouseholdContext.jsx";
import { useNotifications } from "../../contexts/NotificationContext.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import GlassText from "../ui/GlassText.jsx";

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { activeHousehold, households, switchHousehold, isAdmin } = useHousehold();
  const { unreadCount, hasUnread, markAllAsRead } = useNotifications();

  const [showHouseholdMenu, setShowHouseholdMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (hasUnread) {
      markAllAsRead();
    }
  };

  return (
    <>
      {/* Main Header */}
      <motion.div
        className="glass-card glass-card-violet mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-glass-xl p-4 sm:p-6 
                   flex justify-between items-center sticky top-4 sm:top-6 z-40 safe-area-top"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side - Brand + Household */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          {/* Homey Logo */}
          <motion.div
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark 
                       rounded-glass-lg flex items-center justify-center shadow-glass-violet flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.div>

          {/* Brand + Household Name */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-light text-glass tracking-wide truncate">Homey</h1>
            {activeHousehold && (
              <button
                onClick={() => setShowHouseholdMenu(!showHouseholdMenu)}
                className="flex items-center space-x-1 text-glass-secondary hover:text-glass 
                           transition-colors group"
              >
                <span className="text-sm truncate max-w-32 sm:max-w-48">{activeHousehold.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showHouseholdMenu ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Notifications */}
          <motion.button
            onClick={handleNotificationClick}
            className="p-2 sm:p-3 glass-input rounded-glass hover:glass-button transition-all duration-300 relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-glass-secondary" />
            {hasUnread && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full 
                           flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <span className="text-xs text-white font-medium">{unreadCount > 9 ? "9+" : unreadCount}</span>
              </motion.div>
            )}
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2 sm:p-3 glass-input rounded-glass hover:glass-button transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-glass-secondary" />
            )}
          </motion.button>

          {/* Settings */}
          <motion.button
            className="p-2 sm:p-3 glass-input rounded-glass hover:glass-button transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-glass-secondary" />
          </motion.button>

          {/* Logout */}
          <motion.button
            onClick={logout}
            className="p-2 sm:p-3 glass-input rounded-glass hover:bg-red-500/20 
                       hover:border-red-500/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          </motion.button>
        </div>
      </motion.div>

      {/* Household Switcher Dropdown */}
      <AnimatePresence>
        {showHouseholdMenu && (
          <motion.div
            className="absolute top-20 sm:top-24 left-4 sm:left-6 right-4 sm:right-auto sm:w-80 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass-card glass-card-strong rounded-glass-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <GlassText className="font-medium">Switch Household</GlassText>
                {isAdmin && (
                  <button className="p-1 glass-input rounded-md hover:glass-button transition-colors">
                    <Plus className="w-4 h-4 text-glass-secondary" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {households.map((household) => (
                  <button
                    key={household.id}
                    onClick={() => {
                      switchHousehold(household.id);
                      setShowHouseholdMenu(false);
                    }}
                    className={`w-full p-3 rounded-glass text-left transition-all duration-200 ${
                      activeHousehold?.id === household.id
                        ? "glass-button text-white"
                        : "glass-input hover:glass-button hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{household.name}</div>
                        <div className="text-xs opacity-75">
                          {household.member_count} member{household.member_count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdowns */}
      {(showHouseholdMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowHouseholdMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </>
  );
};

export default Header;
