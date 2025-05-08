import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { format, parseISO } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const RecentTransactions: React.FC = () => {
  const { incomes, expenses, settings } = useFinanceStore();
  
  // Combine incomes and expenses, sort by date (most recent first)
  const transactions: Transaction[] = [...incomes, ...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }).slice(0, 5); // Only show 5 most recent
  
  return (
    <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-700">Recent Transactions</h3>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, settings.currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(transaction.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentTransactions;