import React from 'react';
import { DollarSign, CheckSquare, MessageSquare } from 'lucide-react'; // Removed TrendingUp
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { getCurrentWeekDates } from '../utils/dateHelpers';
import Card from '../components/ui/Card';

const HomePage = () => {
  const { isDarkMode, themeClasses } = useTheme();
  const { tasks, expenses, announcements } = useData();
  
  const weekDates = getCurrentWeekDates();
  const pendingTasks = tasks.filter(task => !task.completed).length;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-8">
      {/* Integrated Calendar */}
      <Card className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>August 2025</h2>
          <div className="flex space-x-3">
            <button className={`px-4 py-2 ${themeClasses.cardGlass} rounded-xl hover:scale-105 transition-all duration-300`}>
              <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'} font-light`}>Previous</span>
            </button>
            <button className={`px-4 py-2 ${themeClasses.cardGlass} rounded-xl hover:scale-105 transition-all duration-300`}>
              <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-600'} font-light`}>Next</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>{day}</div>
              <div className={`aspect-square flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-110 cursor-pointer ${
                index === 3 ? 
                  `bg-gradient-to-br ${isDarkMode ? 'from-slate-500 to-gray-600' : 'from-slate-600 to-gray-700'} text-white shadow-lg` : 
                index === 5 || index === 1 ? 
                  `bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg` : 
                  `${themeClasses.cardGlass} ${isDarkMode ? 'hover:bg-white/20 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}`
              }`}>
                {weekDates[index]}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-light`}>Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-light`}>Expenses</span>
          </div>
        </div>
      </Card>

      {/* Today's Schedule */}
      <Card className="p-8">
        <h3 className={`text-xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Today's Schedule</h3>
        <div className="space-y-4">
          <div className={`${themeClasses.cardGlass} rounded-2xl p-4 border-l-4 border-orange-400 hover:scale-[1.01] transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Take out Trash</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-light`}>Sarah</p>
              </div>
              <span className={`text-xs ${isDarkMode ? 'bg-orange-400/20 text-orange-300' : 'bg-orange-400/20 text-orange-600'} px-3 py-1 rounded-full font-medium`}>Due Today</span>
            </div>
          </div>
          
          <div className={`${themeClasses.cardGlass} rounded-2xl p-4 border-l-4 border-green-400 hover:scale-[1.01] transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Groceries Payment</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-light`}>$85.50 split</p>
              </div>
              <span className={`text-xs ${isDarkMode ? 'bg-green-400/20 text-green-300' : 'bg-green-400/20 text-green-600'} px-3 py-1 rounded-full font-medium`}>Added Today</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-3xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${totalExpenses.toFixed(2)}
              </p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-light`}>Total Expenses</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'} rounded-full h-2`}>
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-3/4" />
          </div>
        </Card>
        
        <Card className="p-6 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-3xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {pendingTasks}
              </p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-light`}>Pending Tasks</p>
            </div>
            <div className={`p-3 bg-gradient-to-br ${isDarkMode ? 'from-slate-400 to-gray-500' : 'from-slate-500 to-gray-600'} rounded-xl shadow-lg`}>
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'} rounded-full h-2`}>
            <div className={`bg-gradient-to-r ${isDarkMode ? 'from-slate-400 to-gray-500' : 'from-slate-500 to-gray-600'} h-2 rounded-full w-2/3`} />
          </div>
        </Card>
        
        <Card className="p-6 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-3xl font-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {announcements.length}
              </p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-light`}>Announcements</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className={`w-full ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'} rounded-full h-2`}>
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full w-1/2" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;