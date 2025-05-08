import React from 'react';
import { Menu, Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-gradient-to-r from-green-50 via-white to-white shadow-md z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="ml-2 md:ml-0 text-2xl font-extrabold text-green-700 tracking-tight">WealthWise</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn btn-outline p-2 rounded-full border border-green-100 hover:bg-green-50 transition">
              <Bell className="h-5 w-5 text-green-500" />
            </button>
            <Link to="/settings" className="btn btn-outline p-2 rounded-full border border-green-100 hover:bg-green-50 transition">
              <Settings className="h-5 w-5 text-green-500" />
            </Link>
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center ml-2 shadow">
              <span className="font-bold text-green-700">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;