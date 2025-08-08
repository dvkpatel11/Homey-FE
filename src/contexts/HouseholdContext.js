// src/contexts/HouseholdContext.js - PRODUCTION VERSION
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { householdApi } from 'lib/api';
import { useAuth } from "./AuthContext";

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

  // Core state
  const [households, setHouseholds] = useState([]);
  const [currentHousehold, setCurrentHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Load user's households on auth change
  useEffect(() => {
    if (isLoggedIn) {
      loadUserHouseholds();
    } else {
      resetHouseholdState();
    }
  }, [isLoggedIn]);

  // Load household details when current household changes
  useEffect(() => {
    if (currentHousehold?.id) {
      loadHouseholdMembers(currentHousehold.id);
      loadDashboardData(currentHousehold.id);
    }
  }, [currentHousehold?.id]);

  const resetHouseholdState = () => {
    setHouseholds([]);
    setCurrentHousehold(null);
    setMembers([]);
    setDashboardData(null);
  };

  const loadUserHouseholds = async () => {
    try {
      setIsLoading(true);
      const response = await householdApi.getUserHouseholds();
      setHouseholds(response.data);

      // Set first household as current if none selected
      if (response.data.length > 0 && !currentHousehold) {
        setCurrentHousehold(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to load households:", error);
      toast.error("Failed to load households");
    } finally {
      setIsLoading(false);
    }
  };

  const createHousehold = async (householdData) => {
    try {
      setIsLoading(true);
      const response = await householdApi.createHousehold(householdData);
      const newHousehold = response.data;

      setHouseholds((prev) => [...prev, newHousehold]);
      setCurrentHousehold(newHousehold);

      toast.success(`Created household: ${newHousehold.name}`);
      return { success: true, household: newHousehold };
    } catch (error) {
      console.error("Failed to create household:", error);
      toast.error(error.message || "Failed to create household");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateHousehold = async (householdId, updates) => {
    try {
      setIsLoading(true);
      const response = await householdApi.updateHousehold(householdId, updates);
      const updatedHousehold = response.data;

      setHouseholds((prev) => prev.map((h) => (h.id === householdId ? updatedHousehold : h)));

      if (currentHousehold?.id === householdId) {
        setCurrentHousehold(updatedHousehold);
      }

      toast.success("Household updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Failed to update household:", error);
      toast.error(error.message || "Failed to update household");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const switchHousehold = async (household) => {
    setCurrentHousehold(household);
    localStorage.setItem("currentHouseholdId", household.id);
  };

  const loadHouseholdMembers = async (householdId) => {
    try {
      setMembersLoading(true);
      const response = await householdApi.getHouseholdMembers(householdId);
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast.error("Failed to load household members");
    } finally {
      setMembersLoading(false);
    }
  };

  const generateInviteCode = async (householdId) => {
    try {
      const response = await householdApi.generateInviteCode(householdId);
      toast.success("New invite code generated!");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Failed to generate invite code:", error);
      toast.error("Failed to generate invite code");
      return { success: false, error: error.message };
    }
  };

  const removeMember = async (householdId, userId) => {
    try {
      await householdApi.removeMember(householdId, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      toast.success("Member removed successfully");
      return { success: true };
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
      return { success: false, error: error.message };
    }
  };

  const leaveHousehold = async (householdId) => {
    try {
      await householdApi.leaveHousehold(householdId);
      setHouseholds((prev) => prev.filter((h) => h.id !== householdId));

      if (currentHousehold?.id === householdId) {
        const remainingHouseholds = households.filter((h) => h.id !== householdId);
        setCurrentHousehold(remainingHouseholds[0] || null);
      }

      toast.success("Left household successfully");
      return { success: true };
    } catch (error) {
      console.error("Failed to leave household:", error);
      toast.error("Failed to leave household");
      return { success: false, error: error.message };
    }
  };

  const loadDashboardData = async (householdId) => {
    try {
      setDashboardLoading(true);
      const response = await householdApi.getDashboardData(householdId);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Don't show toast for dashboard errors - not critical
    } finally {
      setDashboardLoading(false);
    }
  };

  // Computed values
  const isAdmin = currentHousehold?.role === "admin";
  const hasHouseholds = households.length > 0;

  const value = {
    // State
    households,
    currentHousehold,
    members,
    dashboardData,

    // Loading states
    isLoading,
    membersLoading,
    dashboardLoading,

    // Computed
    isAdmin,
    hasHouseholds,

    // Actions
    loadUserHouseholds,
    createHousehold,
    updateHousehold,
    switchHousehold,
    loadHouseholdMembers,
    generateInviteCode,
    removeMember,
    leaveHousehold,
    loadDashboardData,
  };

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};
