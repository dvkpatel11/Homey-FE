import React from 'react';
import { DollarSign } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import Card from '../../ui/Card';

const ExpenseSummary = ({ summary }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-8 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-green-300' : 'text-green-600'} mb-2`}>
              Owed to Me
            </h3>
            <p className={`text-4xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${summary.owedToMe.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className={`w-full ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'} rounded-full h-3`}>
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full w-3/4" />
        </div>
      </Card>
      
      <Card className="p-8 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-red-300' : 'text-red-600'} mb-2`}>
              I Owe
            </h3>
            <p className={`text-4xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${summary.iOwe.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl shadow-lg">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className={`w-full ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'} rounded-full h-3`}>
          <div className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full w-1/2" />
        </div>
      </Card>
    </div>
  );
};

export default ExpenseSummary;