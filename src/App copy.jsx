import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { HouseholdProvider } from "./contexts/HouseholdContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.jsx";

// Layout Components
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation.jsx";

// Auth Components (commented out for now)
// import LoginForm from "./components/features/auth/LoginForm";
// import AuthLayout from "./components/layout/AuthLayout";

// Lazy load pages for better performance
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const TasksPage = lazy(() => import("./pages/tasks/TasksPage"));
const ExpensesPage = lazy(() => import("./pages/expenses/ExpensesPage"));

import "./index.css";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

// Loading component with new glass styling
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <div className="glass-card p-8 flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-homey-violet-500/30 border-t-homey-violet-500"></div>
      <p className="text-glass-muted text-sm">Loading...</p>
    </div>
  </div>
);

// Error fallback component with new glass styling
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex items-center justify-center min-h-screen p-6">
    <div className="glass-card glass-card-strong p-8 max-w-md w-full text-center">
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
      <button onClick={resetErrorBoundary} className="glass-button w-full px-6 py-3 rounded-xl text-white font-medium">
        Try again
      </button>
    </div>
  </div>
);

// Development auth bypass loader
const DevLoader = () => {
  return (
    <div className="min-h-screen bg-homey-bg checkered-violet flex items-center justify-center safe-area-inset">
      <div className="flex flex-col items-center space-y-6">
        <div className="glass-card glass-card-violet p-6 rounded-glass-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-homey-violet-500 to-homey-violet-600 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-glass font-medium mb-2">Welcome to Homey</h3>
          <p className="text-glass-muted text-sm">Loading your household...</p>
        </div>
      </div>
    </div>
  );
};

// Main App Content Component
const AppContent = () => {
  // TEMPORARILY BYPASS AUTH FOR DEVELOPMENT
  const { isLoading } = useAuth();
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Mock auth state for development
  const isLoggedIn = true; // Force logged in for development

  // Memoized page handler for better performance
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Show enhanced loading while checking auth (shortened for dev)
  if (isLoading) {
    return <DevLoader />;
  }

  // COMMENTED OUT AUTH CHECK FOR DEVELOPMENT
  // if (!isLoggedIn) {
  //   return (
  //     <ErrorBoundary FallbackComponent={ErrorFallback}>
  //       <AuthLayout>
  //         <Suspense fallback={<PageLoader />}>
  //           <LoginForm />
  //         </Suspense>
  //       </AuthLayout>
  //     </ErrorBoundary>
  //   );
  // }

  // Render the current page based on navigation
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage key={currentPage} />;
      case "tasks":
        return <TasksPage key={currentPage} />;
      case "expenses":
        return <ExpensesPage key={currentPage} />;
      default:
        return <DashboardPage key={currentPage} />;
    }
  };

  // Main app layout for authenticated users (using new glass system)
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div
        className={`min-h-screen ${isDark ? "dark" : ""} bg-homey-bg checkered-violet relative overflow-hidden safe-area-inset`}
      >
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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <HouseholdProvider>
              <NotificationProvider>
                <AppContent />

                {/* Enhanced Toast Notifications with new glass styling */}
                <Toaster
                  position="top-center"
                  containerClassName="safe-area-top"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "var(--homey-glass-bg)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid var(--homey-glass-border)",
                      color: "var(--homey-text)",
                      borderRadius: "1rem",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "500",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                      maxWidth: "calc(100vw - 32px)",
                    },
                    success: {
                      style: {
                        borderColor: "rgba(16, 185, 129, 0.3)",
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), var(--homey-glass-bg))",
                      },
                      iconTheme: {
                        primary: "#10b981",
                        secondary: "#fff",
                      },
                    },
                    error: {
                      style: {
                        borderColor: "rgba(239, 68, 68, 0.3)",
                        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--homey-glass-bg))",
                      },
                      iconTheme: {
                        primary: "#ef4444",
                        secondary: "#fff",
                      },
                    },
                    loading: {
                      style: {
                        borderColor: "var(--homey-glass-violet)",
                        background: "linear-gradient(135deg, var(--homey-glass-violet), var(--homey-glass-bg))",
                      },
                    },
                  }}
                />
              </NotificationProvider>
            </HouseholdProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

// ==========================================
// DEVELOPMENT NOTES:
// ==========================================

/* 
🚀 AUTH BYPASS FOR DEVELOPMENT:

1. Set `isLoggedIn = true` to skip auth flow
2. Commented out auth check conditional
3. All context providers still active
4. Mock data will be used via your API layer
5. Full household/task/expense functionality available

🔧 QUERY CLIENT SETUP:

1. Added QueryClientProvider at the top level
2. Configured default options for queries
3. Auth error handling in place
4. 5-minute stale time for better performance

🎨 NEW GLASS STYLING INTEGRATED:

1. Updated all glass components to use new utilities
2. Toast notifications use CSS variables
3. Checkered background pattern applied
4. Violet accent colors throughout

🔧 TO RE-ENABLE AUTH LATER:

1. Uncomment the auth check conditional
2. Set `isLoggedIn` back to use `useAuth()` hook
3. Uncomment AuthLayout and LoginForm imports
4. Remove the mock `isLoggedIn = true` line

📱 READY FOR COMPONENT DEVELOPMENT:

- QueryClient properly configured
- All your hooks (useTasks, useExpenses, etc.) are active
- Mock data flows through your API layer
- TanStack Query caching works
- Real-time context updates work
- New violet glassmorphic styling applied
*/
