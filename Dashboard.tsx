import React from 'react';
import BalanceSummary from '../components/dashboard/BalanceSummary';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import UpcomingSubscriptions from '../components/dashboard/UpcomingSubscriptions';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import { LayoutDashboard } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-6 py-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-green-600 bg-green-100 rounded-full p-1 shadow-inner" />
            Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-1">Your financial overview at a glance</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-slide-up">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-green-500" />
          Balance Summary
        </h3>
        <BalanceSummary />
      </div>

      <div className="bg-gradient-to-br from-green-50 via-white to-white rounded-2xl shadow-xl border border-green-100 p-8 animate-slide-up">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-blue-500" />
          Cash Flow Chart
        </h3>
        <CashFlowChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            Recent Transactions
          </h3>
          <RecentTransactions />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              Upcoming Subscriptions
            </h3>
            <UpcomingSubscriptions />
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              Budget Progress
            </h3>
            <BudgetProgress />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;