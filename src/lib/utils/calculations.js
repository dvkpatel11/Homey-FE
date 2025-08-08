export const calculateExpenseSplit = (amount, splitBetween) => {
  if (!splitBetween || splitBetween.length === 0) return 0;
  return amount / splitBetween.length;
};

export const calculateUserBalance = (expenses, userName) => {
  let owedToUser = 0;
  let userOwes = 0;

  expenses.forEach(expense => {
    const splitAmount = calculateExpenseSplit(expense.amount, expense.splitBetween);
    
    if (expense.paidBy === userName) {
      owedToUser += splitAmount * (expense.splitBetween.length - 1);
    } else if (expense.splitBetween.includes(userName)) {
      userOwes += splitAmount;
    }
  });

  return {
    owedToUser: parseFloat(owedToUser.toFixed(2)),
    userOwes: parseFloat(userOwes.toFixed(2)),
    netBalance: parseFloat((owedToUser - userOwes).toFixed(2))
  };
};

export const calculateTaskProgress = (tasks) => {
  if (tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(totalProgress / tasks.length);
};

export const getPriorityColor = (priority, isDarkMode = false) => {
  const colors = {
    high: isDarkMode ? 'text-red-300 bg-red-500/20' : 'text-red-600 bg-red-500/20',
    medium: isDarkMode ? 'text-yellow-300 bg-yellow-500/20' : 'text-yellow-600 bg-yellow-500/20',
    low: isDarkMode ? 'text-green-300 bg-green-500/20' : 'text-green-600 bg-green-500/20'
  };
  
  return colors[priority] || colors.low;
};