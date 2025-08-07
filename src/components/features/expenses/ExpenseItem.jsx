import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Card from '../../ui/Card';

const ExpenseItem = ({ expense, onEdit }) => {
  const { isDarkMode, themeClasses } = useTheme();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {expense.description}
            </h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              expense.status === 'settled' ? 
                `bg-green-500/20 ${isDarkMode ? 'text-green-300' : 'text-green-600'}` :
                `bg-orange-500/20 ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`
            }`}>
              {expense.status}
            </div>
          </div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-light mb-3`}>
            Paid by {expense.paidBy} • {expense.date}
          </p>
          <div className="flex flex-wrap gap-2">
            {expense.splitBetween.map(person => (
              <span key={person} className={`px-3 py-1 ${themeClasses.cardGlass} rounded-full text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {person}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right ml-6">
          <p className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
            ${expense.amount.toFixed(2)}
          </p>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-light`}>
            ${(expense.amount / expense.splitBetween.length).toFixed(2)} each
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseItem;