import { useState } from "react";
import { bills } from "../mock-data/expenses"; // adjust if your mock data is in a different file

export function useExpenses() {
  const [expenses, setExpenses] = useState(bills);

  const expenseSummary = {
    total: expenses.reduce((sum, e) => sum + e.total_amount, 0),
    count: expenses.length,
  };

  const addExpense = (expense) => {
    const newExpense = {
      id: `bill-${expenses.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...expense,
    };
    setExpenses((prev) => [...prev, newExpense]);
    console.log("Mock addExpense:", newExpense);
  };

  return { expenses, expenseSummary, addExpense };
}
