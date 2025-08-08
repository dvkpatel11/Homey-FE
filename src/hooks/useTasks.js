import { useState } from "react";
import { tasks as mockTasks } from "../mock-data/tasks"; // adjust if your mock data is in a different file

export function useTasks() {
  const [tasks, setTasks] = useState(mockTasks);

  const addTask = (task) => {
    const newTask = {
      id: `task-${tasks.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...task,
    };
    setTasks((prev) => [...prev, newTask]);
    console.log("Mock addTask:", newTask);
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "completed" ? "pending" : "completed",
              updated_at: new Date().toISOString(),
            }
          : task
      )
    );
    console.log("Mock toggle completion:", taskId);
  };

  return { tasks, addTask, toggleTaskCompletion };
}
