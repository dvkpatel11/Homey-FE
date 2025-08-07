import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';

export const useTasks = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || 
                           (filter === 'completed' && task.completed) ||
                           (filter === 'incomplete' && !task.completed);
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchQuery, filter]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, pending, completionRate };
  }, [tasks]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    taskStats,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  };
};