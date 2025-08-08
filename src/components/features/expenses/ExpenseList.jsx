import ExpenseItem from "./ExpenseItem";

const ExpenseList = ({ expenses, onEditExpense }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense, index) => (
        <div key={expense.id} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
          <ExpenseItem expense={expense} onEdit={onEditExpense} />
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
