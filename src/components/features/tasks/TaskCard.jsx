import { CheckSquare, MoreHorizontal } from "lucide-react";
import { getPriorityColor } from "../../../lib/utils/calculations";
import GlassCard from "../../ui/GlassCard.jsx";

const TaskItem = ({ task, onToggleComplete, onEdit }) => {
  const { isDarkMode } = useTheme();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
              className={`w-6 h-6 ${isDarkMode ? "text-blue-500" : "text-blue-600"} bg-transparent border-2 border-gray-300 rounded-lg focus:ring-blue-500 transition-all`}
            />
            {task.completed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckSquare className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
              </div>
            )}
          </div>
          <div>
            <h3
              className={`font-medium text-lg ${task.completed ? `line-through ${isDarkMode ? "text-gray-500" : "text-gray-400"}` : `${isDarkMode ? "text-white" : "text-gray-900"}`}`}
            >
              {task.title}
            </h3>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-light`}>
              {task.assignee} • Due {task.dueDate}
            </p>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getPriorityColor(task.priority, isDarkMode)}`}
            >
              {task.priority} priority
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className={`text-2xl font-light ${isDarkMode ? "text-white" : "text-gray-900"} mb-1`}>
              {task.progress}%
            </div>
            <div className={`w-24 ${isDarkMode ? "bg-gray-800/50" : "bg-gray-200/50"} rounded-full h-2`}>
              <div
                className={`bg-gradient-to-r ${isDarkMode ? "from-slate-400 to-gray-500" : "from-slate-500 to-gray-600"} h-2 rounded-full transition-all duration-1000`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => onEdit(task)}
            className={`p-2 ${isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100"} rounded-lg transition-all duration-300`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default TaskItem;
