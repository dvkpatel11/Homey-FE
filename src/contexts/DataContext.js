import React, { createContext, useContext, useState } from 'react';
import { mockTasks, mockExpenses, mockAnnouncements } from '../data/mockData';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [tasks, setTasks] = useState(mockTasks);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);

  // Task functions
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      progress: 0,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (taskId, updates) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, progress: task.completed ? 75 : 100 } 
        : task
    ));
  };

  // Expense functions
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (expenseId, updates) => {
    setExpenses(expenses.map(expense => 
      expense.id === expenseId ? { ...expense, ...updates } : expense
    ));
  };

  const deleteExpense = (expenseId) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
  };

  // Announcement functions
  const addAnnouncement = (announcement) => {
    const newAnnouncement = {
      ...announcement,
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      comments: [],
      votes: announcement.type === 'poll' ? { yes: 0, no: 0 } : undefined
    };
    setAnnouncements([newAnnouncement, ...announcements]);
  };

  const addComment = (announcementId, comment) => {
    setAnnouncements(announcements.map(announcement =>
      announcement.id === announcementId
        ? {
            ...announcement,
            comments: [...announcement.comments, {
              ...comment,
              timestamp: new Date().toLocaleString()
            }]
          }
        : announcement
    ));
  };

  const vote = (announcementId, voteType) => {
    setAnnouncements(announcements.map(announcement =>
      announcement.id === announcementId && announcement.type === 'poll'
        ? {
            ...announcement,
            votes: {
              ...announcement.votes,
              [voteType]: announcement.votes[voteType] + 1
            }
          }
        : announcement
    ));
  };

  return (
    <DataContext.Provider value={{
      tasks,
      expenses,
      announcements,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      addExpense,
      updateExpense,
      deleteExpense,
      addAnnouncement,
      addComment,
      vote
    }}>
      {children}
    </DataContext.Provider>
  );
};