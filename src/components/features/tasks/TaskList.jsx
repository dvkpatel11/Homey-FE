import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onToggleComplete, onEditTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div 
          key={task.id} 
          className="animate-fadeIn"
          style={{animationDelay: `${index * 100}ms`}}
        >
          <TaskItem 
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEditTask}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;