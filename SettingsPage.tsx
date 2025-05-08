import React, { useState, useRef } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Download, Plus, X, Tag, Trash, Upload, DollarSign, Settings, Database, Info } from 'lucide-react';
import { Currency } from '../types';

const SettingsPage: React.FC = () => {
  const { categories, settings, addCategory, deleteCategory, importData, updateSettings } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for new category inputs
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newSubscriptionCategory, setNewSubscriptionCategory] = useState('');
  
  // Handle adding a new category
  const handleAddCategory = (type: 'income' | 'expense' | 'subscription') => {
    let categoryName = '';
    
    if (type === 'income') {
      categoryName = newIncomeCategory.trim();
      setNewIncomeCategory('');
    } else if (type === 'expense') {
      categoryName = newExpenseCategory.trim();
      setNewExpenseCategory('');
    } else {
      categoryName = newSubscriptionCategory.trim();
      setNewSubscriptionCategory('');
    }
    
    if (categoryName && !categories[type].includes(categoryName)) {
      addCategory(type, categoryName);
    }
  };
  
  // Handle deleting a category
  const handleDeleteCategory = (type: 'income' | 'expense' | 'subscription', category: string) => {
    if (window.confirm(`Are you sure you want to delete the "${category}" category?`)) {
      deleteCategory(type, category);
    }
  };

  // Handle currency change
  const handleCurrencyChange = (currency: Currency) => {
    updateSettings({ currency });
  };
  
  // Export data as JSON
  const exportData = () => {
    try {
      const data = {
        incomes: JSON.parse(localStorage.getItem('fintrack_incomes') || '[]'),
        expenses: JSON.parse(localStorage.getItem('fintrack_expenses') || '[]'),
        subscriptions: JSON.parse(localStorage.getItem('fintrack_subscriptions') || '[]'),
        budgets: JSON.parse(localStorage.getItem('fintrack_budgets') || '[]'),
        categories: JSON.parse(localStorage.getItem('fintrack_categories') || '{}'),
        settings: JSON.parse(localStorage.getItem('fintrack_settings') || '{}'),
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileName = `fintrack_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (window.confirm('This will replace all your current data. Are you sure you want to continue?')) {
          importData(data);
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Failed to import data. Please check the file format and try again.');
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="space-y-10 max-w-4xl mx-auto px-2 sm:px-6 py-8 h-full">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-gray-700 bg-gray-100 rounded-full p-1 shadow-inner" />
          Settings
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Currency Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label font-semibold text-gray-700">Select Currency</label>
            <select
              className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
              value={settings.currency}
              onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="ZAR">South African Rand (ZAR)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-blue-500" />
          Categories
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Income Categories */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Income Categories</h4>
            <div className="space-y-2 mb-4">
              {categories.income.map((category) => (
                <div 
                  key={category} 
                  className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-100"
                >
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-green-600 mr-2" />
                    <span>{category}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory('income', category)}
                    className="text-gray-500 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                className="input flex-1 rounded-r-none bg-gray-50 border border-gray-200 focus:ring-green-400 focus:border-green-400"
                placeholder="New category..."
                value={newIncomeCategory}
                onChange={(e) => setNewIncomeCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory('income');
                  }
                }}
              />
              <button
                className="btn btn-primary rounded-l-none bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700"
                onClick={() => handleAddCategory('income')}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Expense Categories */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Expense Categories</h4>
            <div className="space-y-2 mb-4">
              {categories.expense.map((category) => (
                <div 
                  key={category} 
                  className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100"
                >
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-red-500 mr-2" />
                    <span>{category}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory('expense', category)}
                    className="text-gray-500 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                className="input flex-1 rounded-r-none bg-gray-50 border border-gray-200 focus:ring-red-400 focus:border-red-400"
                placeholder="New category..."
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory('expense');
                  }
                }}
              />
              <button
                className="btn btn-primary rounded-l-none bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700"
                onClick={() => handleAddCategory('expense')}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Subscription Categories */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Subscription Categories</h4>
            <div className="space-y-2 mb-4">
              {categories.subscription.map((category) => (
                <div 
                  key={category} 
                  className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100"
                >
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-blue-500 mr-2" />
                    <span>{category}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory('subscription', category)}
                    className="text-gray-500 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                className="input flex-1 rounded-r-none bg-gray-50 border border-gray-200 focus:ring-blue-400 focus:border-blue-400"
                placeholder="New category..."
                value={newSubscriptionCategory}
                onChange={(e) => setNewSubscriptionCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory('subscription');
                  }
                }}
              />
              <button
                className="btn btn-primary rounded-l-none bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
                onClick={() => handleAddCategory('subscription')}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-amber-500" />
          Data Management
        </h3>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h4 className="font-medium text-gray-700 mb-2">Export Data</h4>
              <p className="text-sm text-gray-500 mb-2">
                Export all your financial data as a JSON file. You can use this file to backup your data or import it to another device.
              </p>
              <button
                className="btn btn-primary bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700"
                onClick={exportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>

            <div className="flex-1">
              <h4 className="font-medium text-gray-700 mb-2">Import Data</h4>
              <p className="text-sm text-gray-500 mb-2">
                Import your previously exported data file to restore your financial data.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".json"
                className="hidden"
              />
              <button
                className="btn btn-primary bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Clear Data</h4>
            <p className="text-sm text-gray-500 mb-2">
              Warning: This will delete all your financial data. This action cannot be undone.
            </p>
            <button
              className="btn btn-danger bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-gray-500" />
          About
        </h3>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            <strong>FinTrack</strong> - Personal Finance Management
          </p>
          <p className="text-sm text-gray-500">
            Version 1.0.0
          </p>
          <p className="text-sm text-gray-500">
            Data is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;