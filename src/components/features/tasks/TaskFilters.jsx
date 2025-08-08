import GlassCard from "components/ui/GlassCard";
import GlassInput from "components/ui/GlassInput";
import { useTheme } from "contexts/ThemeContext";
import { Search } from "lucide-react";

const TaskFilters = ({ searchQuery, setSearchQuery, filter, setFilter }) => {
  const { isDarkMode } = useTheme();

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <GlassInput
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`px-4 py-4 bg-gradient-to-br from-white/[0.06] to-white/[0.03] backdrop-blur-xl border border-white/[0.15] focus:border-white/30 rounded-2xl outline-none transition-all duration-300 ${isDarkMode ? "text-white" : "text-gray-900"} font-light`}
        >
          <option value="all" className={isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>
            All Tasks
          </option>
          <option value="completed" className={isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>
            Completed
          </option>
          <option value="incomplete" className={isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>
            Incomplete
          </option>
        </select>
      </div>
    </GlassCard>
  );
};

export default TaskFilters;
