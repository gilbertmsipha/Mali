import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { formatCurrency } from '../../utils/formatters';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

const BudgetProgress: React.FC = () => {
  const { budgets, expenses, settings } = useFinanceStore();
  
  // Filter active budgets
  const activeBudgets = budgets.filter(budget => budget.isActive);
  
  // Function to calculate budget progress
  const calculateBudgetProgress = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return { spent: 0, percentage: 0 };
    
    // Current month range for monthly budgets
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    
    // Calculate total spent in this category within budget period
    const relevantExpenses = expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const matchesCategory = !budget.category || expense.category === budget.category;
      
      // Check if the expense falls within the budget period
      let isWithinPeriod = true;
      if (budget.period === 'monthly') {
        isWithinPeriod = isWithinInterval(expenseDate, {
          start: currentMonthStart,
          end: currentMonthEnd
        });
      } else if (budget.startDate && budget.endDate) {
        isWithinPeriod = isWithinInterval(expenseDate, {
          start: parseISO(budget.startDate),
          end: parseISO(budget.endDate)
        });
      }
      
      return matchesCategory && isWithinPeriod;
    });
    
    const totalSpent = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = Math.min(Math.round((totalSpent / budget.amount) * 100), 100);
    
    return { spent: totalSpent, percentage };
  };
  
  return (
    <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-700">Budget Progress</h3>
      </div>
      
      {activeBudgets.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No active budgets</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {activeBudgets.slice(0, 3).map((budget) => {
            const { spent, percentage } = calculateBudgetProgress(budget.id);
            
            return (
              <li key={budget.id} className="p-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium">{budget.name}</p>
                  <div className="text-sm font-medium">
                    {formatCurrency(spent, settings.currency)} / {formatCurrency(budget.amount, settings.currency)}
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div 
                      style={{ width: `${percentage}%` }} 
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        percentage >= 100 
                          ? 'bg-red-500' 
                          : percentage >= 75 
                            ? 'bg-amber-500' 
                            : 'bg-green-500'
                      }`}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {budget.category || 'All Categories'}
                  </span>
                  <span className={`text-xs font-medium ${
                    percentage >= 100 
                      ? 'text-red-500' 
                      : percentage >= 75 
                        ? 'text-amber-500' 
                        : 'text-green-600'
                  }`}>
                    {percentage}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BudgetProgress;