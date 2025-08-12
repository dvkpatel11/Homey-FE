// src/hooks/useTasks.js - Enhanced Mobile-First Task Management Hook
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { tasks as mockTasks } from "../mock-data/tasks";
import { useLocalStorageArray } from "./useLocalStorage";

export function useTasks(householdId) {
  // Use localStorage to persist tasks with household-specific key
  const storageKey = householdId ? `tasks-${householdId}` : "tasks-default";
  const [tasks, setTasks] = useLocalStorageArray(storageKey, mockTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new task with optimistic updates
  const addTask = useCallback(
    async (taskData) => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate required fields
        if (!taskData.title?.trim()) {
          throw new Error("Task title is required");
        }

        if (!taskData.assigned_to) {
          throw new Error("Task must be assigned to someone");
        }

        // Create new task with enhanced structure
        const newTask = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: taskData.title.trim(),
          description: taskData.description?.trim() || "",
          status: "pending",
          priority: taskData.priority || "medium",
          category: taskData.category || "general",
          assigned_to: taskData.assigned_to,
          created_by: taskData.created_by || "current-user",
          due_date: taskData.due_date || null,
          estimated_duration: taskData.estimated_duration || null,
          difficulty: taskData.difficulty || "medium",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
          household_id: householdId,
          tags: taskData.tags || [],
          subtasks: [],
          notes: [],
        };

        // Optimistic update
        setTasks((prev) => [newTask, ...prev]);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        toast.success(`📝 Task "${newTask.title}" created!`);
        return { success: true, task: newTask };
      } catch (error) {
        // Revert optimistic update
        setTasks((prev) => prev.filter((t) => t.id !== newTask?.id));
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [householdId, setTasks]
  );

  // Toggle task completion with optimistic updates
  const toggleTaskCompletion = useCallback(
    async (taskId) => {
      try {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error("Task not found");
        }

        const isCompleting = task.status !== "completed";
        const now = new Date().toISOString();

        // Optimistic update
        const updatedTask = {
          ...task,
          status: isCompleting ? "completed" : "pending",
          completed_at: isCompleting ? now : null,
          updated_at: now,
        };

        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        const message = isCompleting
          ? `✅ Great job completing "${task.title}"!`
          : `🔄 "${task.title}" marked as pending`;

        toast.success(message);
        return { success: true, task: updatedTask };
      } catch (error) {
        // Revert optimistic update
        const originalTask = tasks.find((t) => t.id === taskId);
        if (originalTask) {
          setTasks((prev) => prev.map((t) => (t.id === taskId ? originalTask : t)));
        }

        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      }
    },
    [tasks, setTasks]
  );

  // Update task with optimistic updates
  const updateTask = useCallback(
    async (taskId, updates) => {
      try {
        setIsLoading(true);
        setError(null);

        const task = tasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error("Task not found");
        }

        // Validate updates
        if (updates.title !== undefined && !updates.title?.trim()) {
          throw new Error("Task title cannot be empty");
        }

        const updatedTask = {
          ...task,
          ...updates,
          updated_at: new Date().toISOString(),
        };

        // Optimistic update
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        toast.success("Task updated successfully");
        return { success: true, task: updatedTask };
      } catch (error) {
        // Revert optimistic update
        const originalTask = tasks.find((t) => t.id === taskId);
        if (originalTask) {
          setTasks((prev) => prev.map((t) => (t.id === taskId ? originalTask : t)));
        }

        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [tasks, setTasks]
  );

  // Delete task with confirmation
  const deleteTask = useCallback(
    async (taskId) => {
      try {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error("Task not found");
        }

        // Optimistic update
        setTasks((prev) => prev.filter((t) => t.id !== taskId));

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        toast.success(`🗑️ Deleted "${task.title}"`);
        return { success: true };
      } catch (error) {
        // Revert optimistic update
        setTasks((prev) => [...prev]); // Force re-render
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      }
    },
    [tasks, setTasks]
  );

  // Add subtask
  const addSubtask = useCallback(
    async (taskId, subtaskData) => {
      try {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error("Task not found");
        }

        if (!subtaskData.title?.trim()) {
          throw new Error("Subtask title is required");
        }

        const newSubtask = {
          id: `subtask-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: subtaskData.title.trim(),
          completed: false,
          created_at: new Date().toISOString(),
        };

        const updatedTask = {
          ...task,
          subtasks: [...(task.subtasks || []), newSubtask],
          updated_at: new Date().toISOString(),
        };

        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

        await new Promise((resolve) => setTimeout(resolve, 200));

        toast.success("Subtask added");
        return { success: true, subtask: newSubtask };
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      }
    },
    [tasks, setTasks]
  );

  // Computed values - memoized for performance
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const overdue = tasks.filter((t) => {
      if (!t.due_date || t.status === "completed") return false;
      return new Date(t.due_date) < new Date();
    }).length;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const filteredTasks = useMemo(
    () => ({
      completed: tasks.filter((t) => t.status === "completed"),
      pending: tasks.filter((t) => t.status === "pending"),
      overdue: tasks.filter((t) => {
        if (!t.due_date || t.status === "completed") return false;
        return new Date(t.due_date) < new Date();
      }),
      dueToday: tasks.filter((t) => {
        if (!t.due_date || t.status === "completed") return false;
        const today = new Date().toDateString();
        return new Date(t.due_date).toDateString() === today;
      }),
      highPriority: tasks.filter((t) => t.priority === "high" && t.status !== "completed"),
      byCategory: tasks.reduce((acc, task) => {
        acc[task.category] = acc[task.category] || [];
        acc[task.category].push(task);
        return acc;
      }, {}),
    }),
    [tasks]
  );

  // Filter and sort functions
  const getTasksByStatus = useCallback(
    (status) => {
      return tasks.filter((task) => task.status === status);
    },
    [tasks]
  );

  const getTasksByAssignee = useCallback(
    (userId) => {
      return tasks.filter((task) => task.assigned_to === userId);
    },
    [tasks]
  );

  const getTasksByPriority = useCallback(
    (priority) => {
      return tasks.filter((task) => task.priority === priority);
    },
    [tasks]
  );

  return {
    // State
    tasks,
    isLoading,
    error,

    // Stats
    taskStats,
    filteredTasks,

    // Actions
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    addSubtask,

    // Filters
    getTasksByStatus,
    getTasksByAssignee,
    getTasksByPriority,

    // Utilities
    clearError: () => setError(null),
  };
}
