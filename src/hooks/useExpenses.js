import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export const useExpenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const { currentUser } = useAuth();

  const expenseSummary = useMemo(() => {
    if (!currentUser) return { owedToMe: 0, iOwe: 0, totalExpenses: 0 };

    let owedToMe = 0;
    let iOwe = 0;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitBetween.length;
      if (expense.paidBy === currentUser.name) {
        owedToMe += splitAmount * (expense.splitBetween.length - 1);
      } else if (expense.splitBetween.includes(currentUser.name)) {
        iOwe += splitAmount;
      }
    });

    return { owedToMe, iOwe, totalExpenses };
  }, [expenses, currentUser]);

  return {
    expenses,
    expenseSummary,
    addExpense,
    updateExpense,
    deleteExpense
  };
};