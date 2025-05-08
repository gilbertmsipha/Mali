import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Budget, BudgetStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { PieChart, Plus, Edit, Trash, X, ArrowRight, AlertCircle } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

const BudgetsPage: React.FC = () => {
  const { 
    budgets, 
    expenses, 
    categories, 
    addBudget, 
    updateBudget, 
    deleteBudget,
    allocateToBudget,
    reallocateBudget,
    getUnallocatedIncome,
    suggestBudgetAllocations,
    settings
  } = useFinanceStore();
  
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [allocationAmount, setAllocationAmount] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<{ budgetId: string; suggestedAmount: number }[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Budget>>({
    name: '',
    amount: 0,
    category: '', // Empty means general budget
    period: 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    isActive: true
  });

  // Get suggestions on mount and when budgets/income change
  useEffect(() => {
    const newSuggestions = suggestBudgetAllocations();
    setSuggestions(newSuggestions);
  }, [budgets, suggestBudgetAllocations]);
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      category: '',
      period: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      isActive: true
    });
    setIsAddingBudget(false);
    setEditingBudgetId(null);
  };
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'amount') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format dates to ISO string
    const formattedStartDate = formData.startDate 
      ? new Date(formData.startDate).toISOString() 
      : new Date().toISOString();
    
    const formattedEndDate = formData.endDate 
      ? new Date(formData.endDate).toISOString() 
      : undefined;
    
    if (editingBudgetId) {
      updateBudget(editingBudgetId, { 
        ...formData, 
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });
    } else {
      addBudget({ 
        ...formData as Omit<Budget, 'id' | 'fundedAmount' | 'spentAmount' | 'status' | 'allocations'>, 
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });
    }
    
    resetForm();
  };
  
  // Handle allocation submit
  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBudgetId && allocationAmount > 0) {
      allocateToBudget(selectedBudgetId, allocationAmount);
      setShowAllocationModal(false);
      setSelectedBudgetId(null);
      setAllocationAmount(0);
    }
  };
  
  // Handle reallocation
  const handleReallocation = (fromBudgetId: string, toBudgetId: string, amount: number) => {
    reallocateBudget(fromBudgetId, toBudgetId, amount);
  };
  
  // Edit budget
  const handleEdit = (budget: Budget) => {
    setFormData({
      ...budget,
      startDate: format(parseISO(budget.startDate), 'yyyy-MM-dd'),
      endDate: budget.endDate ? format(parseISO(budget.endDate), 'yyyy-MM-dd') : ''
    });
    setEditingBudgetId(budget.id);
    setIsAddingBudget(true);
  };
  
  // Delete budget with confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
    }
  };
  
  // Get status color
  const getStatusColor = (status: BudgetStatus) => {
    switch (status) {
      case 'overspent':
        return 'text-red-500 bg-red-50';
      case 'unfunded':
        return 'text-gray-500 bg-gray-50';
      case 'partially_funded':
        return 'text-amber-500 bg-amber-50';
      case 'fully_funded':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };
  
  // Get status label
  const getStatusLabel = (status: BudgetStatus) => {
    switch (status) {
      case 'overspent':
        return 'Overspent';
      case 'unfunded':
        return 'Unfunded';
      case 'partially_funded':
        return 'Partially Funded';
      case 'fully_funded':
        return 'Fully Funded';
      default:
        return 'Unknown';
    }
  };
  
  // Sort budgets by active status then name
  const sortedBudgets = [...budgets].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  
  // Calculate totals for the overview
  const activeBudgetsCount = budgets.filter(b => b.isActive).length;
  const totalBudgetAmount = budgets
    .filter(b => b.isActive)
    .reduce((sum, budget) => sum + budget.amount, 0);
  
  const totalFundedAmount = budgets
    .filter(b => b.isActive)
    .reduce((sum, budget) => sum + budget.fundedAmount, 0);
  
  const unallocatedIncome = getUnallocatedIncome();
  
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-6 py-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <PieChart className="h-8 w-8 text-green-600 bg-green-100 rounded-full p-1 shadow-inner" />
            Budgets
          </h2>
          <p className="text-gray-500 text-sm mt-1">Plan, allocate, and track your budgets</p>
        </div>
        <button 
          className={`btn btn-primary flex items-center gap-2 px-5 py-2 rounded-lg shadow transition-all duration-150 ${
            isAddingBudget ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700'
          }`}
          onClick={() => setIsAddingBudget(!isAddingBudget)}
        >
          {isAddingBudget ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {isAddingBudget ? 'Cancel' : 'Add Budget'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-staggered">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-700">Active Budgets</h3>
            <div className="p-2 bg-green-50 rounded-full">
              <PieChart className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{activeBudgetsCount}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-700">Total Budgeted</h3>
            <div className="p-2 bg-green-50 rounded-full">
              <PieChart className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalBudgetAmount, settings.currency)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-700">Total Funded</h3>
            <div className="p-2 bg-green-50 rounded-full">
              <PieChart className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalFundedAmount, settings.currency)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-700">Unallocated</h3>
            <div className="p-2 bg-blue-50 rounded-full">
              <PieChart className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-blue-600">{formatCurrency(unallocatedIncome, settings.currency)}</p>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-blue-900">Suggested Allocations</h3>
          </div>
          <div className="space-y-4">
            {suggestions.map(({ budgetId, suggestedAmount }) => {
              const budget = budgets.find(b => b.id === budgetId);
              if (!budget) return null;
              return (
                <div key={budgetId} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-900">{budget.name}</p>
                    <p className="text-sm text-gray-500">
                      Funded: {formatCurrency(budget.fundedAmount)} of {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary text-sm bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 rounded-lg px-4 py-2"
                    onClick={() => {
                      setSelectedBudgetId(budgetId);
                      setAllocationAmount(suggestedAmount);
                      setShowAllocationModal(true);
                    }}
                  >
                    Allocate {formatCurrency(suggestedAmount)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isAddingBudget && (
        <div className="bg-gradient-to-br from-green-50 via-white to-white rounded-2xl shadow-xl p-8 animate-slide-up border border-green-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {editingBudgetId ? <Edit className="h-5 w-5 text-blue-500" /> : <Plus className="h-5 w-5 text-green-500" />}
            {editingBudgetId ? 'Edit Budget' : 'Add New Budget'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="name" className="label font-semibold text-gray-700">Budget Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Groceries Budget"
                  required
                />
              </div>
              <div>
                <label htmlFor="amount" className="label font-semibold text-gray-700">Target Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  min="0"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="label font-semibold text-gray-700">Category (Optional)</label>
                <select
                  id="category"
                  name="category"
                  className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.category || ''}
                  onChange={handleChange}
                >
                  <option value="">All Categories</option>
                  {categories.expense.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for a general budget across all categories
                </p>
              </div>
              <div>
                <label htmlFor="period" className="label font-semibold text-gray-700">Budget Period</label>
                <select
                  id="period"
                  name="period"
                  className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.period}
                  onChange={handleChange}
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Period</option>
                </select>
              </div>
              <div>
                <label htmlFor="startDate" className="label font-semibold text-gray-700">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="label font-semibold text-gray-700">End Date (Optional)</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.endDate || ''}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for an ongoing budget
                </p>
              </div>
              <div className="flex items-center md:col-span-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Active Budget
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shadow" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow">
                {editingBudgetId ? 'Update Budget' : 'Add Budget'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 via-white to-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-green-400" />
            Budget List
          </h3>
        </div>
        {sortedBudgets.length === 0 ? (
          <div className="p-10 text-center">
            <PieChart className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No budgets added yet</p>
            <button 
              className="btn btn-primary mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow"
              onClick={() => setIsAddingBudget(true)}
            >
              <Plus className="h-5 w-5 mr-1" />
              Create Your First Budget
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedBudgets.map((budget) => {
              const fundingPercentage = Math.round((budget.fundedAmount / budget.amount) * 100);
              const spentPercentage = Math.round((budget.spentAmount / budget.amount) * 100);
              return (
                <div 
                  key={budget.id} 
                  className={`p-4 hover:bg-green-50 transition-colors ${!budget.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-800">{budget.name}</h4>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                          {getStatusLabel(budget.status)}
                        </span>
                        {!budget.isActive && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {budget.category || 'All Categories'} • 
                        {budget.period === 'monthly' ? ' Monthly' : budget.period === 'yearly' ? ' Yearly' : ' Custom Period'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {budget.isActive && unallocatedIncome > 0 && (
                        <button
                          onClick={() => {
                            setSelectedBudgetId(budget.id);
                            setAllocationAmount(Math.min(unallocatedIncome, budget.amount - budget.fundedAmount));
                            setShowAllocationModal(true);
                          }}
                          className="btn btn-primary bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 rounded-lg px-4 py-2"
                          disabled={budget.fundedAmount >= budget.amount}
                        >
                          Allocate Funds
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(budget)}
                        className="btn btn-outline border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg px-4 py-2"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="btn btn-outline border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-500 rounded-lg px-4 py-2"
                        title="Delete"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium">
                          Funded: {formatCurrency(budget.fundedAmount)} of {formatCurrency(budget.amount)}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {fundingPercentage}%
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div 
                          style={{ width: `${fundingPercentage}%` }} 
                          className="bg-green-500"
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium">
                          Spent: {formatCurrency(budget.spentAmount)} of {formatCurrency(budget.amount)}
                        </div>
                        <div className={`text-sm font-medium ${
                          spentPercentage >= 100 
                            ? 'text-red-500' 
                            : spentPercentage >= 75 
                              ? 'text-amber-500' 
                              : 'text-blue-600'
                        }`}>
                          {spentPercentage}%
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div 
                          style={{ width: `${spentPercentage}%` }} 
                          className={`${
                            spentPercentage >= 100 
                              ? 'bg-red-500' 
                              : spentPercentage >= 75 
                                ? 'bg-amber-500' 
                                : 'bg-blue-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Allocation modal and other modals remain unchanged */}
    </div>
  );
};

export default BudgetsPage;