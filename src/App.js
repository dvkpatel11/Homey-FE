import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Layout Components
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import FloatingElements from './components/layout/FloatingElements';

// Auth Components
import AuthLayout from './components/features/auth/AuthLayout';
import LoginForm from './components/features/auth/LoginForm';

// Page Components
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import ExpensesPage from './pages/ExpensesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

import './index.css';

// Main App Content Component
const AppContent = () => {
  const { isLoggedIn } = useAuth();
  const { themeClasses } = useTheme();
  const [currentPage, setCurrentPage] = useState('home');

  // If not logged in, show auth layout
  if (!isLoggedIn) {
    return (
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    );
  }

  // Render the current page based on navigation
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'tasks':
        return <TasksPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      default:
        return <HomePage />;
    }
  };

  // Main app layout for authenticated users
  return (
    <div className={`min-h-screen ${themeClasses.bgClasses} relative overflow-hidden`}>
      <FloatingElements />
      
      <Header />
      
      <div className="p-6 pb-32 relative z-10">
        {renderCurrentPage()}
      </div>

      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />
    </div>
  );
};

// Root App Component with all providers
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;