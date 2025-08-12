// src/contexts/HouseholdContext.js - Enhanced Mobile-First Version
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { households as mockHouseholds } from "../mock-data/households";
import { users as mockUsers } from "../mock-data/users";
import { useAuth } from "./AuthContext.jsx";

const HouseholdContext = createContext();

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return context;
};

export const HouseholdProvider = ({ children }) => {
  const { isLoggedIn, currentUser } = useAuth();

  // Core state - using mock data initially
  const [households, setHouseholds] = useState([]);
  const [currentHousehold, setCurrentHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  // Loading states - optimized for mobile
  const [isLoading, setIsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Error states
  const [error, setError] = useState(null);

  // Initialize with mock data when user logs in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      initializeHouseholdData();
    } else {
      resetHouseholdState();
    }
  }, [isLoggedIn, currentUser]);

  // Load household details when current household changes
  useEffect(() => {
    if (currentHousehold?.id) {
      loadHouseholdMembers(currentHousehold.id);
      loadDashboardData(currentHousehold.id);
    }
  }, [currentHousehold?.id]);

  const resetHouseholdState = useCallback(() => {
    setHouseholds([]);
    setCurrentHousehold(null);
    setMembers([]);
    setDashboardData(null);
    setError(null);
  }, []);

  const initializeHouseholdData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Use mock data
      setHouseholds(mockHouseholds);

      // Set first household as current or restore from localStorage
      const savedHouseholdId = localStorage.getItem("currentHouseholdId");
      const targetHousehold = savedHouseholdId
        ? mockHouseholds.find((h) => h.id === savedHouseholdId)
        : mockHouseholds[0];

      if (targetHousehold) {
        setCurrentHousehold(targetHousehold);
      }
    } catch (error) {
      console.error("Failed to initialize household data:", error);
      setError("Failed to load household data");
      toast.error("Failed to load households");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createHousehold = useCallback(async (householdData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate required fields
      if (!householdData.name?.trim()) {
        throw new Error("Household name is required");
      }

      // Create new household with mock data structure
      const newHousehold = {
        id: `household-${Date.now()}`,
        name: householdData.name.trim(),
        description: householdData.description || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 1,
        role: "admin",
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        settings: {
          currency: householdData.currency || "USD",
          timezone: householdData.timezone || "America/New_York",
          language: "en",
        },
      };

      setHouseholds((prev) => [newHousehold, ...prev]);
      setCurrentHousehold(newHousehold);
      localStorage.setItem("currentHouseholdId", newHousehold.id);

      toast.success(`🏠 Created "${newHousehold.name}" household!`);
      return { success: true, household: newHousehold };
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateHousehold = useCallback(
    async (householdId, updates) => {
      try {
        setIsLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!updates.name?.trim()) {
          throw new Error("Household name is required");
        }

        const updatedHousehold = {
          ...currentHousehold,
          ...updates,
          updated_at: new Date().toISOString(),
        };

        setHouseholds((prev) => prev.map((h) => (h.id === householdId ? updatedHousehold : h)));

        if (currentHousehold?.id === householdId) {
          setCurrentHousehold(updatedHousehold);
        }

        toast.success("Household updated successfully");
        return { success: true, household: updatedHousehold };
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [currentHousehold]
  );

  const switchHousehold = useCallback(async (household) => {
    try {
      setCurrentHousehold(household);
      localStorage.setItem("currentHouseholdId", household.id);
      toast.success(`Switched to ${household.name}`);
    } catch (error) {
      toast.error("Failed to switch household");
    }
  }, []);

  const loadHouseholdMembers = useCallback(async (householdId) => {
    try {
      setMembersLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 400));

      // Use mock users data
      setMembers(mockUsers);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast.error("Failed to load household members");
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const generateInviteCode = useCallback(
    async (householdId) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Update current household with new invite code
        if (currentHousehold?.id === householdId) {
          const updated = { ...currentHousehold, invite_code: newCode };
          setCurrentHousehold(updated);
          setHouseholds((prev) => prev.map((h) => (h.id === householdId ? updated : h)));
        }

        toast.success("New invite code generated!");
        return { success: true, data: { invite_code: newCode } };
      } catch (error) {
        toast.error("Failed to generate invite code");
        return { success: false, error: error.message };
      }
    },
    [currentHousehold]
  );

  const joinHousehold = useCallback(
    async (inviteCode) => {
      try {
        setIsLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!inviteCode?.trim()) {
          throw new Error("Invite code is required");
        }

        // Simulate finding household by invite code
        const foundHousehold = mockHouseholds.find((h) => h.invite_code?.toLowerCase() === inviteCode.toLowerCase());

        if (!foundHousehold) {
          throw new Error("Invalid invite code");
        }

        // Check if already a member
        if (households.some((h) => h.id === foundHousehold.id)) {
          throw new Error("You're already a member of this household");
        }

        const joinedHousehold = {
          ...foundHousehold,
          role: "member", // New members start as regular members
        };

        setHouseholds((prev) => [...prev, joinedHousehold]);
        setCurrentHousehold(joinedHousehold);
        localStorage.setItem("currentHouseholdId", joinedHousehold.id);

        toast.success(`🎉 Joined "${joinedHousehold.name}" household!`);
        return { success: true, household: joinedHousehold };
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [households]
  );

  const leaveHousehold = useCallback(
    async (householdId) => {
      try {
        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 800));

        const householdToLeave = households.find((h) => h.id === householdId);

        setHouseholds((prev) => prev.filter((h) => h.id !== householdId));

        if (currentHousehold?.id === householdId) {
          const remainingHouseholds = households.filter((h) => h.id !== householdId);
          const newCurrent = remainingHouseholds[0] || null;
          setCurrentHousehold(newCurrent);

          if (newCurrent) {
            localStorage.setItem("currentHouseholdId", newCurrent.id);
          } else {
            localStorage.removeItem("currentHouseholdId");
          }
        }

        toast.success(`Left "${householdToLeave?.name}" household`);
        return { success: true };
      } catch (error) {
        toast.error("Failed to leave household");
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [households, currentHousehold]
  );

  const loadDashboardData = useCallback(async (householdId) => {
    try {
      setDashboardLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock dashboard data
      const mockDashboard = {
        stats: {
          totalTasks: 12,
          completedTasks: 8,
          totalExpenses: 2450.75,
          monthlyBudget: 3000,
          activeMembers: 4,
        },
        recentActivity: [
          { type: "task_completed", message: "John completed 'Take out trash'", time: "2 hours ago" },
          { type: "expense_added", message: "Sarah added grocery expense $85.50", time: "4 hours ago" },
          { type: "member_joined", message: "Mike joined the household", time: "1 day ago" },
        ],
        upcomingTasks: 4,
        overdueExpenses: 1,
      };

      setDashboardData(mockDashboard);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // Computed values - memoized for performance
  const computedValues = useMemo(
    () => ({
      isAdmin: currentHousehold?.role === "admin",
      hasHouseholds: households.length > 0,
      canInviteMembers: currentHousehold?.role === "admin",
      householdStats: {
        totalHouseholds: households.length,
        adminHouseholds: households.filter((h) => h.role === "admin").length,
        memberHouseholds: households.filter((h) => h.role === "member").length,
      },
    }),
    [currentHousehold, households]
  );

  // Memoized context value
  const value = useMemo(
    () => ({
      // State
      households,
      currentHousehold,
      members,
      dashboardData,
      error,

      // Loading states
      isLoading,
      membersLoading,
      dashboardLoading,

      // Computed values
      ...computedValues,

      // Actions
      initializeHouseholdData,
      createHousehold,
      updateHousehold,
      switchHousehold,
      loadHouseholdMembers,
      generateInviteCode,
      joinHousehold,
      leaveHousehold,
      loadDashboardData,
      clearError: () => setError(null),
    }),
    [
      households,
      currentHousehold,
      members,
      dashboardData,
      error,
      isLoading,
      membersLoading,
      dashboardLoading,
      computedValues,
      initializeHouseholdData,
      createHousehold,
      updateHousehold,
      switchHousehold,
      loadHouseholdMembers,
      generateInviteCode,
      joinHousehold,
      leaveHousehold,
      loadDashboardData,
    ]
  );

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};
