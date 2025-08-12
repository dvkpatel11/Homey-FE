// src/hooks/useExpenses.js - Enhanced Mobile-First Expense Management Hook
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { bills } from "../mock-data/expenses";
import { useLocalStorageArray } from "./useLocalStorage";

export function useExpenses(householdId) {
  // Use localStorage to persist expenses with household-specific key
  const storageKey = householdId ? `expenses-${householdId}` : "expenses-default";
  const [expenses, setExpenses] = useLocalStorageArray(storageKey, bills);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new expense with optimistic updates
  const addExpense = useCallback(
    async (expenseData) => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate required fields
        if (!expenseData.name?.trim()) {
          throw new Error("Expense name is required");
        }

        if (!expenseData.total_amount || expenseData.total_amount <= 0) {
          throw new Error("Amount must be greater than 0");
        }

        if (!expenseData.category) {
          throw new Error("Category is required");
        }

        // Create new expense with enhanced structure
        const newExpense = {
          id: `expense-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: expenseData.name.trim(),
          description: expenseData.description?.trim() || "",
          total_amount: parseFloat(expenseData.total_amount),
          category: expenseData.category,
          date: expenseData.date || new Date().toISOString().split("T")[0],
          paid_by: expenseData.paid_by || "current-user",
          status: expenseData.status || "pending",
          due_date: expenseData.due_date || null,
          currency: expenseData.currency || "USD",
          payment_method: expenseData.payment_method || "cash",
          receipt_url: expenseData.receipt_url || null,
          tags: expenseData.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          household_id: householdId,
          split_details: expenseData.split_details || null,
          recurring: expenseData.recurring || false,
          recurring_frequency: expenseData.recurring_frequency || null,
        };

        // Optimistic update
        setExpenses((prev) => [newExpense, ...prev]);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        const formattedAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: newExpense.currency,
        }).format(newExpense.total_amount);

        toast.success(`💰 Added "${newExpense.name}" - ${formattedAmount}`);
        return { success: true, expense: newExpense };
      } catch (error) {
        // Revert optimistic update
        setExpenses((prev) => prev.filter((e) => e.id !== newExpense?.id));
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [householdId, setExpenses]
  );

  // Update expense with optimistic updates
  const updateExpense = useCallback(
    async (expenseId, updates) => {
      try {
        setIsLoading(true);
        setError(null);

        const expense = expenses.find((e) => e.id === expenseId);
        if (!expense) {
          throw new Error("Expense not found");
        }

        // Validate updates
        if (updates.name !== undefined && !updates.name?.trim()) {
          throw new Error("Expense name cannot be empty");
        }

        if (updates.total_amount !== undefined && updates.total_amount <= 0) {
          throw new Error("Amount must be greater than 0");
        }

        const updatedExpense = {
          ...expense,
          ...updates,
          total_amount: updates.total_amount ? parseFloat(updates.total_amount) : expense.total_amount,
          updated_at: new Date().toISOString(),
        };

        // Optimistic update
        setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedExpense : e)));

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        toast.success("Expense updated successfully");
        return { success: true, expense: updatedExpense };
      } catch (error) {
        // Revert optimistic update
        const originalExpense = expenses.find((e) => e.id === expenseId);
        if (originalExpense) {
          setExpenses((prev) => prev.map((e) => (e.id === expenseId ? originalExpense : e)));
        }

        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [expenses, setExpenses]
  );

  // Mark expense as paid
  const markAsPaid = useCallback(
    async (expenseId) => {
      try {
        const expense = expenses.find((e) => e.id === expenseId);
        if (!expense) {
          throw new Error("Expense not found");
        }

        const updatedExpense = {
          ...expense,
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Optimistic update
        setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedExpense : e)));

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        const formattedAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: expense.currency || "USD",
        }).format(expense.total_amount);

        toast.success(`✅ Marked "${expense.name}" as paid (${formattedAmount})`);
        return { success: true, expense: updatedExpense };
      } catch (error) {
        // Revert optimistic update
        const originalExpense = expenses.find((e) => e.id === expenseId);
        if (originalExpense) {
          setExpenses((prev) => prev.map((e) => (e.id === expenseId ? originalExpense : e)));
        }

        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      }
    },
    [expenses, setExpenses]
  );

  // Delete expense
  const deleteExpense = useCallback(
    async (expenseId) => {
      try {
        const expense = expenses.find((e) => e.id === expenseId);
        if (!expense) {
          throw new Error("Expense not found");
        }

        // Optimistic update
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        toast.success(`🗑️ Deleted "${expense.name}"`);
        return { success: true };
      } catch (error) {
        // Revert optimistic update
        setExpenses((prev) => [...prev]); // Force re-render
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      }
    },
    [expenses, setExpenses]
  );

  // Computed values - memoized for performance
  const expenseStats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.total_amount, 0);
    const count = expenses.length;
    const paid = expenses.filter((e) => e.status === "paid").reduce((sum, e) => sum + e.total_amount, 0);
    const pending = expenses.filter((e) => e.status === "pending").reduce((sum, e) => sum + e.total_amount, 0);
    const overdue = expenses
      .filter((e) => {
        if (!e.due_date || e.status === "paid") return false;
        return new Date(e.due_date) < new Date();
      })
      .reduce((sum, e) => sum + e.total_amount, 0);

    // Calculate current month stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = expenses
      .filter((e) => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.total_amount, 0);

    return {
      total,
      count,
      paid,
      pending,
      overdue,
      thisMonth,
      average: count > 0 ? total / count : 0,
      paidPercentage: total > 0 ? Math.round((paid / total) * 100) : 0,
    };
  }, [expenses]);

  const expensesByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const category = expense.category || "uncategorized";
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          count: 0,
          expenses: [],
        };
      }
      acc[category].total += expense.total_amount;
      acc[category].count += 1;
      acc[category].expenses.push(expense);
      return acc;
    }, {});
  }, [expenses]);

  const filteredExpenses = useMemo(
    () => ({
      paid: expenses.filter((e) => e.status === "paid"),
      pending: expenses.filter((e) => e.status === "pending"),
      overdue: expenses.filter((e) => {
        if (!e.due_date || e.status === "paid") return false;
        return new Date(e.due_date) < new Date();
      }),
      dueThisWeek: expenses.filter((e) => {
        if (!e.due_date || e.status === "paid") return false;
        const dueDate = new Date(e.due_date);
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate >= today && dueDate <= nextWeek;
      }),
      thisMonth: expenses.filter((e) => {
        const expenseDate = new Date(e.date);
        const today = new Date();
        return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
      }),
      recurring: expenses.filter((e) => e.recurring),
      byCategory: expensesByCategory,
    }),
    [expenses, expensesByCategory]
  );

  // Filter and sort functions
  const getExpensesByStatus = useCallback(
    (status) => {
      return expenses.filter((expense) => expense.status === status);
    },
    [expenses]
  );

  const getExpensesByCategory = useCallback(
    (category) => {
      return expenses.filter((expense) => expense.category === category);
    },
    [expenses]
  );

  const getExpensesByDateRange = useCallback(
    (startDate, endDate) => {
      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
      });
    },
    [expenses]
  );

  const getExpensesByPaidBy = useCallback(
    (userId) => {
      return expenses.filter((expense) => expense.paid_by === userId);
    },
    [expenses]
  );

  return {
    // State
    expenses,
    isLoading,
    error,

    // Stats
    expenseStats,
    expensesByCategory,
    filteredExpenses,

    // Actions
    addExpense,
    updateExpense,
    deleteExpense,
    markAsPaid,

    // Filters
    getExpensesByStatus,
    getExpensesByCategory,
    getExpensesByDateRange,
    getExpensesByPaidBy,

    // Utilities
    clearError: () => setError(null),
  };
}
