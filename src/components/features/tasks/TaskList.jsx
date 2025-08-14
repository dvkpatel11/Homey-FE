import { AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import GlassContainer from "../../ui/GlassContainer.jsx";
import GlassText from "../../ui/GlassText.jsx";
import TaskCard from "./TaskCard.jsx";

const TaskList = ({ tasks, onComplete, onSwapRequest, isLoading, currentUserId }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <GlassContainer key={i} padding="md" className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-5 h-5 bg-surface-2 rounded-md shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-2 rounded w-3/4 shimmer"></div>
                <div className="h-3 bg-surface-1 rounded w-1/2 shimmer"></div>
              </div>
              <div className="w-16 h-6 bg-surface-2 rounded-full shimmer"></div>
            </div>
          </GlassContainer>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <GlassContainer variant="subtle" padding="lg" className="text-center">
        <Calendar className="w-12 h-12 text-glass-muted mx-auto mb-4" />
        <GlassText variant="muted">No tasks found matching your criteria</GlassText>
      </GlassContainer>
    );
  }

  // Group tasks by status for better organization
  const groupedTasks = {
    overdue: tasks.filter((task) => task.status === "overdue"),
    due_today: tasks.filter((task) => {
      const today = new Date().toDateString();
      const dueDate = new Date(task.due_date).toDateString();
      return dueDate === today && task.status === "pending";
    }),
    pending: tasks.filter(
      (task) => task.status === "pending" && new Date(task.due_date).toDateString() !== new Date().toDateString()
    ),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    completed: tasks.filter((task) => task.status === "completed"),
  };

  return (
    <div className="space-y-6">
      {/* Overdue Tasks */}
      {groupedTasks.overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <GlassText className="font-medium text-red-400">Overdue ({groupedTasks.overdue.length})</GlassText>
          </div>
          <AnimatePresence>
            {groupedTasks.overdue.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onComplete}
                onSwapRequest={onSwapRequest}
                currentUserId={currentUserId}
                urgent={true}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Due Today */}
      {groupedTasks.due_today.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            <GlassText className="font-medium text-amber-400">Due Today ({groupedTasks.due_today.length})</GlassText>
          </div>
          <AnimatePresence>
            {groupedTasks.due_today.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onComplete}
                onSwapRequest={onSwapRequest}
                currentUserId={currentUserId}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Other Tasks */}
      {["pending", "in_progress", "completed"].map((status) => {
        const statusTasks = groupedTasks[status];
        if (statusTasks.length === 0) return null;

        const statusConfig = {
          pending: { color: "text-glass-secondary", dot: "bg-glass-muted" },
          in_progress: { color: "text-blue-400", dot: "bg-blue-400" },
          completed: { color: "text-emerald-400", dot: "bg-emerald-400" },
        };

        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig[status].dot}`}></div>
              <GlassText className={`font-medium ${statusConfig[status].color}`}>
                {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} ({statusTasks.length})
              </GlassText>
            </div>
            <AnimatePresence>
              {statusTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onComplete}
                  onSwapRequest={onSwapRequest}
                  currentUserId={currentUserId}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
