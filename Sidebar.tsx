import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  PieChart, 
  Settings,
  User
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Income', href: '/income', icon: ArrowUpCircle },
    { name: 'Expenses', href: '/expenses', icon: ArrowDownCircle },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-green-50 via-white to-white border-r border-gray-200 flex-shrink-0 shadow-lg flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-2xl font-extrabold text-green-600 tracking-tight flex items-center gap-2">
            <span className="bg-green-100 rounded-full p-1">
              <LayoutDashboard className="h-6 w-6 text-green-500" />
            </span>
            WealthWise
          </h1>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all relative ${
                  isActive
                    ? 'bg-green-100 text-green-700 shadow-inner'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-r-lg transition-all ${
                      isActive ? 'bg-green-500' : 'bg-transparent'
                    }`}
                  />
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <User className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <div className="font-semibold text-gray-800 text-sm">Welcome!</div>
          <div className="text-xs text-gray-500">Your Finance Hub</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;