const TaskItem = ({ task, onToggleComplete, onEdit }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="h-5 w-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400"
        />
        <span
          className={`text-gray-800 dark:text-gray-100 ${
            task.completed ? "line-through text-gray-400 dark:text-gray-500" : ""
          }`}
        >
          {task.title}
        </span>
      </div>
      <button
        onClick={() => onEdit(task)}
        className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-150"
      >
        Edit
      </button>
    </div>
  );
};

export default TaskItem;
