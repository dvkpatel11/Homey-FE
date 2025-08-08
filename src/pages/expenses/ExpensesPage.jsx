import ExpenseList from "components/features/expenses/ExpenseList";
import ExpenseSummary from "components/features/expenses/ExpenseSummary";
import FloatingActionButton from "components/ui/FloatingActionButton";
import GlassButton from "components/ui/GlassButton";
import GlassInput from "components/ui/GlassInput";
import GlassModal from "components/ui/GlassModal";
import { useExpenses } from "hooks/useExpenses";
import { useState } from "react";

const ExpensesPage = () => {
  const { expenses, expenseSummary, addExpense } = useExpenses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: ["John", "Sarah", "Mike"],
  });

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.paidBy) {
      addExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      });
      setNewExpense({
        description: "",
        amount: "",
        paidBy: "",
        splitBetween: ["John", "Sarah", "Mike"],
      });
      setShowAddModal(false);
    }
  };

  const handleEditExpense = (expense) => {
    // TODO: Implement edit functionality
    console.log("Edit expense:", expense);
  };

  return (
    <div className="space-y-6">
      <ExpenseSummary summary={expenseSummary} />

      <ExpenseList expenses={expenses} onEditExpense={handleEditExpense} />

      <FloatingActionButton onClick={() => setShowAddModal(true)} color="from-green-500 to-emerald-600" />

      <GlassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Expense"
        footer={
          <GlassButton onClick={handleAddExpense} className="w-full">
            Create Expense
          </GlassButton>
        }
      >
        <GlassInput
          label="Description"
          value={newExpense.description}
          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          placeholder="Expense description"
        />

        <GlassInput
          label="Amount"
          type="number"
          value={newExpense.amount}
          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          placeholder="Amount ($)"
        />

        <select
          value={newExpense.paidBy}
          onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
          className="w-full p-4 bg-gradient-to-br from-white/[0.06] to-white/[0.03] backdrop-blur-xl border border-white/[0.15] rounded-2xl outline-none text-white font-light"
        >
          <option value="">Paid by...</option>
          <option value="John">John</option>
          <option value="Sarah">Sarah</option>
          <option value="Mike">Mike</option>
        </select>
      </GlassModal>
    </div>
  );
};

export default ExpensesPage;
