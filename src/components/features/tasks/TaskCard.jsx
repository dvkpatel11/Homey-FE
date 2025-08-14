import { motion } from "framer-motion";
import { 
  Check, 
  Clock, 
  User, 
  RefreshCcw, 
  AlertTriangle, 
  Calendar,
  MoreVertical,
  ArrowRightLeft
} from "lucide-react";
import { useState } from "react";
import { format, isToday, isPast } from "date-fns";
import GlassContainer from "../../ui/GlassContainer.jsx";
import GlassText from "../../ui/GlassText.jsx";
import IconButton from "../../ui/IconButton.jsx";
import GlassButton from "../../ui/GlassButton.jsx";

const TaskCard = ({ 
  task, 
  onComplete, 
  onSwapRequest, 
  currentUserId, 
  urgent = false,
  index = 0 
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isAssignedToMe = task.assigned_to === currentUserId;
  const isOverdue = isPast(new Date(task.due_date)) && task.status !== 'completed';
  const isDueToday = isToday(new Date(task.due_date));
  const isCompleted = task.status === 'completed';

  const priorityColors = {
    low: 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30',
    medium: 'text-amber-400 bg-amber-400/20 border-amber-400/30',
    high: 'text-red-400 bg-red-400/20 border-red-400/30'
  };

  const categoryIcons = {
    cleaning: '🧹',
    cooking: '👨‍🍳',
    shopping: '🛒',
    maintenance: '🔧',
    pets: '🐕',
    yard: '🌱',
    bills: '💰',
    other: '📋'
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(task.id);
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSwapRequest = () => {
    onSwapRequest(task);
    setShowActions(false);
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    if (isToday(date)) return 'Due today';
    if (isPast(date) && !isCompleted) return 'Overdue';
    return `Due ${format(date, 'MMM d')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
    >
      <GlassContainer 
        variant={urgent ? "violet" : "default"} 
        padding="none"
        className={`relative overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}
      >
        {/* Main Card Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Completion Checkbox */}
            <motion.button
              className={`
                flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-0.5
                transition-all duration-300
                ${isCompleted 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : isAssignedToMe 
                    ? 'border-primary hover:border-primary-bright hover:bg-primary/20' 
                    : 'border-glass-border cursor-not-allowed opacity-50'
                }
              `}
              onClick={isAssignedToMe && !isCompleted ? handleComplete : undefined}
              disabled={!isAssignedToMe || isCompleted || isCompleting}
              whileTap={isAssignedToMe && !isCompleted ? { scale: 0.95 } : {}}
            >
              {isCompleting ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : isCompleted ? (
                <Check className="w-4 h-4 text-white" />
              ) : null}
            </motion.button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${
                    isCompleted ? 'line-through text-glass-muted' : 'text-glass'
                  }`}>
                    {categoryIcons[task.category] || '📋'} {task.title}
                  </h3>
                  
                  {task.description && (
                    <GlassText variant="secondary" className="text-sm mt-1 line-clamp-2">
                      {task.description}
                    </GlassText>
                  )}
                </div>

                {/* Actions Menu */}
                <div className="flex items-center space-x-2 ml-3">
                  {isAssignedToMe && !isCompleted && (
                    <IconButton
                      icon={ArrowRightLeft}
                      size="sm"
                      variant="ghost"
                      onClick={handleSwapRequest}
                    />
                  )}
                  
                  <IconButton
                    icon={MoreVertical}
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowActions(!showActions)}
                  />
                </div>
              </div>

              {/* Task Meta Information */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-3 text-xs">
                  {/* Assignee */}
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-glass-muted" />
                    <span className={`${
                      isAssignedToMe ? 'text-primary-bright' : 'text-glass-muted'
                    }`}>
                      {task.assignee_name || 'Unassigned'}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className={`flex items-center space-x-1 ${
                    isOverdue ? 'text-red-400' : isDueToday ? 'text-amber-400' : 'text-glass-muted'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{formatDueDate(task.due_date)}</span>
                  </div>

                  {/* Recurring indicator */}
                  {task.is_recurring && (
                    <div className="flex items-center space-x-1 text-glass-muted">
                      <RefreshCcw className="w-3 h-3" />
                      <span>Recurring</span>
                    </div>
                  )}
                </div>

                {/* Priority Badge */}
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${priorityColors[task.priority] || priorityColors.medium}
                `}>
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent/Overdue Banner */}
        {(isOverdue || urgent) && (
          <div className={`
            absolute top-0 right-0 px-3 py-1 text-xs font-medium
            ${isOverdue ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}
            rounded-bl-glass border-l border-b border-current/30
          `}>
            {isOverdue ? (
              <>
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Overdue
              </>
            ) : (
              'Urgent'
            )}
          </div>
        )}

        {/* Expanded Actions */}
        {showActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-glass-border bg-surface-1/50"
          >
            <div className="p-3 space-y-2">
              <GlassButton variant="ghost" size="sm" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                View Details
              </GlassButton>
              
              {isAssignedToMe && !isCompleted && (
                <GlassButton 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleSwapRequest}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Request Swap
                </GlassButton>
              )}
            </div>
          </motion.div>
        )}
      </GlassContainer>
    </motion.div>
  );
};

export default TaskCard;
