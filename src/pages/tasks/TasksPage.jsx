import { useState } from "react";
import TaskFilters from "../../components/features/tasks/TaskFilters.jsx";
import TaskList from "../../components/features/tasks/TaskList.jsx";
import FloatingActionButton from "../../components/ui/FloatingActionButton.jsx";
import GlassButton from "../../components/ui/GlassButton.jsx";
import GlassInput from "../../components/ui/GlassInput.jsx";
import GlassModal from "../../components/ui/GlassModal.jsx";
import { useTasks } from "../../hooks/useTasks.js";

const TasksPage = () => {
  const { tasks, searchQuery, setSearchQuery, filter, setFilter, addTask, toggleTaskCompletion } = useTasks();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    priority: "medium",
  });

  const handleAddTask = () => {
    if (newTask.title && newTask.assignee) {
      addTask(newTask);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        dueDate: "",
        priority: "medium",
      });
      setShowAddModal(false);
    }
  };

  const handleEditTask = (task) => {
    // TODO: Implement edit functionality
    console.log("Edit task:", task);
  };

  return (
    <div className="space-y-6">
      <TaskFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} filter={filter} setFilter={setFilter} />

      <TaskList tasks={tasks} onToggleComplete={toggleTaskCompletion} onEditTask={handleEditTask} />

      <FloatingActionButton onClick={() => setShowAddModal(true)} color="from-slate-500 to-gray-600" />

      <GlassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Task"
        footer={
          <GlassButton onClick={handleAddTask} className="w-full">
            Create Task
          </GlassButton>
        }
      >
        <GlassInput
          label="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Enter task title"
        />

        <textarea
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="w-full p-4 bg-gradient-to-br from-white/[0.06] to-white/[0.03] backdrop-blur-xl border border-white/[0.15] rounded-2xl outline-none h-24 text-white placeholder-gray-400 font-light resize-none"
        />

        <GlassInput
          label="Due Date"
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        />

        <select
          value={newTask.assignee}
          onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
          className="w-full p-4 bg-gradient-to-br from-white/[0.06] to-white/[0.03] backdrop-blur-xl border border-white/[0.15] rounded-2xl outline-none text-white font-light"
        >
          <option value="">Assign to...</option>
          <option value="John">John</option>
          <option value="Sarah">Sarah</option>
          <option value="Mike">Mike</option>
        </select>
      </GlassModal>
    </div>
  );
};

export default TasksPage;
