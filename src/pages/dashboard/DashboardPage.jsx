import GlassCard from "components/ui/GlassCard"; // ← FIXED: Now uses GlassCard
import { useHousehold } from "contexts/HouseholdContext";
import { useTheme } from "contexts/ThemeContext";
import { getCurrentWeekDates } from "lib/utils/dateHelpers";
import { CheckSquare, DollarSign, MessageSquare } from "lucide-react";

const DashboardPage = () => {
  const { isDarkMode, themeClasses } = useTheme();
  const { dashboardData, dashboardLoading, currentHousehold } = useHousehold();

  const weekDates = getCurrentWeekDates();

  // Show loading state
  if (dashboardLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="p-8 animate-pulse">
            <div className="h-8 bg-white/10 rounded-xl mb-4"></div>
            <div className="h-32 bg-white/5 rounded-xl"></div>
          </GlassCard>
        ))}
      </div>
    );
  }

  // Show message if no household selected
  if (!currentHousehold) {
    return (
      <div className="space-y-8">
        <GlassCard className="p-8 text-center">
          <h2 className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-gray-900"} mb-4`}>
            Welcome to Homey!
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-light`}>
            Create or join a household to get started.
          </p>
        </GlassCard>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {
    outstanding_tasks: 0,
    total_balance_owed: 0,
    upcoming_deadlines: 0,
    recent_activity_count: 0,
  };

  return (
    <div className="space-y-8">
      {/* Integrated Calendar */}
      <GlassCard className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {currentHousehold.name} - August 2025
          </h2>
          <div className="flex space-x-3">
            <button
              className={`px-4 py-2 ${themeClasses.cardGlass} rounded-xl hover:scale-105 transition-all duration-300`}
            >
              <span className={`${isDarkMode ? "text-gray-200" : "text-gray-600"} font-light`}>Previous</span>
            </button>
            <button
              className={`px-4 py-2 ${themeClasses.cardGlass} rounded-xl hover:scale-105 transition-all duration-300`}
            >
              <span className={`${isDarkMode ? "text-gray-200" : "text-gray-600"} font-light`}>Next</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div key={day} className="text-center">
              <div className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-3`}>{day}</div>
              <div
                className={`aspect-square flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-110 cursor-pointer ${
                  index === 3
                    ? `bg-gradient-to-br ${isDarkMode ? "from-slate-500 to-gray-600" : "from-slate-600 to-gray-700"} text-white shadow-lg`
                    : index === 5 || index === 1
                      ? `bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg`
                      : `${themeClasses.cardGlass} ${isDarkMode ? "hover:bg-white/20 text-gray-200" : "hover:bg-gray-100 text-gray-700"}`
                }`}
              >
                {weekDates[index]}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full" />
            <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"} font-light`}>Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"} font-light`}>Expenses</span>
          </div>
        </div>
      </GlassCard>

      {/* Today's Schedule */}
      <GlassCard className="p-8">
        <h3 className={`text-xl font-light ${isDarkMode ? "text-white" : "text-gray-900"} mb-6`}>Today's Schedule</h3>
        <div className="space-y-4">
          {dashboardData?.calendar_events?.length > 0 ? (
            dashboardData.calendar_events.map((event, index) => (
              <div
                key={index}
                className={`${themeClasses.cardGlass} rounded-2xl p-4 border-l-4 ${
                  event.type === "task" ? "border-orange-400" : "border-green-400"
                } hover:scale-[1.01] transition-all duration-300`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{event.title}</h4>
                    <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} font-light`}>
                      {event.assigned_to || `$${event.amount?.toFixed(2)}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      event.type === "task"
                        ? `${isDarkMode ? "bg-orange-400/20 text-orange-300" : "bg-orange-400/20 text-orange-600"}`
                        : `${isDarkMode ? "bg-green-400/20 text-green-300" : "bg-green-400/20 text-green-600"}`
                    }`}
                  >
                    {event.type === "task" ? "Due Today" : "Added Today"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-light text-center py-8`}>
              No events scheduled for today
            </p>
          )}
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                ${kpis.total_balance_owed?.toFixed(2) || "0.00"}
              </p>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-light`}>Balance Owed</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className={`w-full ${isDarkMode ? "bg-gray-800/50" : "bg-gray-200/50"} rounded-full h-2`}>
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-3/4" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {kpis.outstanding_tasks || 0}
              </p>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-light`}>Outstanding Tasks</p>
            </div>
            <div
              className={`p-3 bg-gradient-to-br ${isDarkMode ? "from-slate-400 to-gray-500" : "from-slate-500 to-gray-600"} rounded-xl shadow-lg`}
            >
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className={`w-full ${isDarkMode ? "bg-gray-800/50" : "bg-gray-200/50"} rounded-full h-2`}>
            <div
              className={`bg-gradient-to-r ${isDarkMode ? "from-slate-400 to-gray-500" : "from-slate-500 to-gray-600"} h-2 rounded-full w-2/3`}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-3xl font-light ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {kpis.recent_activity_count || 0}
              </p>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-light`}>Recent Activity</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className={`w-full ${isDarkMode ? "bg-gray-800/50" : "bg-gray-200/50"} rounded-full h-2`}>
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full w-1/2" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default DashboardPage;
