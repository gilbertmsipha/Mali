import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { useFinanceStore } from '../../store/financeStore';
import { formatCurrency } from '../../utils/formatters';

const BalanceSummary: React.FC = () => {
  const { incomes, expenses, settings } = useFinanceStore();
  
  const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const balance = totalIncome - totalExpenses;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-4 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-700">Total Balance</h3>
          <div className="p-2 bg-gray-100 rounded-full">
            <Wallet className="h-5 w-5 text-gray-600" />
          </div>
        </div>
        <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {formatCurrency(balance, settings.currency)}
        </p>
        <p className="text-sm text-gray-500 mt-1">Current Balance</p>
      </div>
      
      <div className="card p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-700">Income</h3>
          <div className="p-2 bg-green-50 rounded-full">
            <ArrowUpCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalIncome, settings.currency)}</p>
        <p className="text-sm text-gray-500 mt-1">Total Income</p>
      </div>
      
      <div className="card p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-700">Expenses</h3>
          <div className="p-2 bg-red-50 rounded-full">
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-red-500">{formatCurrency(totalExpenses, settings.currency)}</p>
        <p className="text-sm text-gray-500 mt-1">Total Expenses</p>
      </div>
    </div>
  );
};

export default BalanceSummary;