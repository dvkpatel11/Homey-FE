import { Suspense, lazy, useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { HouseholdProvider } from "./contexts/HouseholdContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.jsx";

// Layout Components
import FloatingElements from "./components/layout/FloatingElements";
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";

// Auth Components
import LoginForm from "./components/features/auth/LoginForm";
import AuthLayout from "./components/layout/AuthLayout";

// Lazy load pages for better performance
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const TasksPage = lazy(() => import("./pages/tasks/TasksPage"));
const ExpensesPage = lazy(() => import("./pages/expenses/ExpensesPage"));
const AnnouncementsPage = lazy(() => import("./pages/announcements/AnnouncementsPage"));

import "./index.css";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-primary"></div>
      <p className="text-glass-muted text-sm">Loading...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex items-center justify-center min-h-screen p-6">
    <div className="glass glass-strong p-8 max-w-md w-full text-center">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 mx-auto mb-3 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-glass mb-2">Something went wrong</h2>
        <p className="text-glass-muted mb-6 text-sm">{error.message}</p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="glass glass-hoverable glass-lift w-full px-6 py-3 rounded-lg text-glass font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
      >
        Try again
      </button>
    </div>
  </div>
);

// Auth loading component
const AuthLoader = () => {
  const { themeClasses } = useTheme();

  return (
    <div className={`min-h-screen ${themeClasses.bgClasses} flex items-center justify-center safe-area-inset`}>
      <div className="flex flex-col items-center space-y-6">
        <div className="glass glass-strong p-6 rounded-glass-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-glass font-medium mb-2">Welcome to Homey</h3>
          <p className="text-glass-muted text-sm">Setting up your household...</p>
        </div>
      </div>
    </div>
  );
};

// Main App Content Component
const AppContent = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const { themeClasses } = useTheme();
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Memoized page handler for better performance
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Show enhanced loading while checking auth
  if (isLoading) {
    return <AuthLoader />;
  }

  // If not logged in, show auth layout
  if (!isLoggedIn) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthLayout>
          <Suspense fallback={<PageLoader />}>
            <LoginForm />
          </Suspense>
        </AuthLayout>
      </ErrorBoundary>
    );
  }

  // Render the current page based on navigation
  const renderCurrentPage = () => {
    // Pass key directly, not through spread
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage key={currentPage} />;
      case "tasks":
        return <TasksPage key={currentPage} />;
      case "expenses":
        return <ExpensesPage key={currentPage} />;
      case "announcements":
        return <AnnouncementsPage key={currentPage} />;
      default:
        return <DashboardPage key={currentPage} />;
    }
  };

  // Main app layout for authenticated users
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className={`min-h-screen ${themeClasses.bgClasses} relative overflow-hidden safe-area-inset`}>
        {/* Background floating elements */}
        <FloatingElements />

        {/* Header with safe area */}
        <Header className="safe-area-top" />

        {/* Main content area */}
        <main className="p-4 sm:p-6 pb-24 sm:pb-32 relative z-10 min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <div className="animate-fade-in">{renderCurrentPage()}</div>
          </Suspense>
        </main>

        {/* Bottom navigation with safe area */}
        <Navigation currentPage={currentPage} setCurrentPage={handlePageChange} className="safe-area-bottom" />
      </div>
    </ErrorBoundary>
  );
};

// Root App Component with all providers
const App = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <AuthProvider>
          <HouseholdProvider>
            <NotificationProvider>
              <AppContent />

              {/* Enhanced Toast Notifications */}
              <Toaster
                position="top-center"
                containerClassName="safe-area-top"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                    maxWidth: "calc(100vw - 32px)", // Mobile-friendly width
                  },
                  success: {
                    style: {
                      borderColor: "rgba(16, 185, 129, 0.3)",
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",
                    },
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    style: {
                      borderColor: "rgba(239, 68, 68, 0.3)",
                      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))",
                    },
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                  loading: {
                    style: {
                      borderColor: "rgba(59, 130, 246, 0.3)",
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))",
                    },
                  },
                }}
              />
            </NotificationProvider>
          </HouseholdProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
