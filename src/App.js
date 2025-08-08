import { useState } from "react";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { HouseholdProvider } from "./contexts/HouseholdContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Layout Components
import FloatingElements from "./components/layout/FloatingElements";
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";

// Auth Components
import LoginForm from "./components/features/auth/LoginForm";
import AuthLayout from "./components/layout/AuthLayout";

// Page Components
import AnnouncementsPage from "./pages/announcements/AnnouncementsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import TasksPage from "./pages/tasks/TasksPage";

import "./index.css";

// Main App Content Component
const AppContent = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const { themeClasses } = useTheme();
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeClasses.bgClasses} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

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
      case "dashboard":
        return <DashboardPage />;
      case "tasks":
        return <TasksPage />;
      case "expenses":
        return <ExpensesPage />;
      case "announcements":
        return <AnnouncementsPage />;
      default:
        return <DashboardPage />;
    }
  };

  // Main app layout for authenticated users
  return (
    <div className={`min-h-screen ${themeClasses.bgClasses} relative overflow-hidden`}>
      <FloatingElements />
      <Header />

      <div className="p-6 pb-32 relative z-10">{renderCurrentPage()}</div>

      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

// Root App Component with all providers
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HouseholdProvider>
          <NotificationProvider>
            <AppContent />

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  borderRadius: "16px",
                },
              }}
            />
          </NotificationProvider>
        </HouseholdProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
