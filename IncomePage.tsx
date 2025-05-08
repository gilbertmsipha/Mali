import React, { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Income, RecurrenceType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowDownCircle, Plus, Calendar, Tag, Edit, Trash, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const IncomePage: React.FC = () => {
  const { incomes, categories, addIncome, updateIncome, deleteIncome, settings } = useFinanceStore();
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Income>>({
    description: '',
    amount: 0,
    category: categories.income[0] || 'Other',
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    notes: '',
    type: 'income'
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      category: categories.income[0] || 'Other',
      date: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      notes: '',
      type: 'income'
    });
    setIsAddingIncome(false);
    setEditingIncomeId(null);
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
    
    // Format date to ISO string
    const formattedDate = formData.date 
      ? new Date(formData.date).toISOString() 
      : new Date().toISOString();
    
    if (editingIncomeId) {
      updateIncome(editingIncomeId, { ...formData, date: formattedDate });
    } else {
      addIncome({ 
        ...formData as Omit<Income, 'id'>, 
        date: formattedDate 
      });
    }
    
    resetForm();
  };
  
  // Edit income
  const handleEdit = (income: Income) => {
    // Convert ISO date to YYYY-MM-DD for input field
    const inputDate = income.date 
      ? format(parseISO(income.date), 'yyyy-MM-dd') 
      : format(new Date(), 'yyyy-MM-dd');
    
    setFormData({
      ...income,
      date: inputDate
    });
    setEditingIncomeId(income.id);
    setIsAddingIncome(true);
  };
  
  // Delete income with confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      deleteIncome(id);
    }
  };
  
  // Sort incomes by date
  const sortedIncomes = [...incomes].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Function to get recurrence label
  const getRecurrenceLabel = (type?: RecurrenceType) => {
    switch (type) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'One-time';
    }
  };
  
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-6 py-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <ArrowDownCircle className="h-8 w-8 text-green-500 bg-green-100 rounded-full p-1 shadow-inner" />
            Income
          </h2>
          <p className="text-gray-500 text-sm mt-1">Track your income streams and recurring payments</p>
        </div>
        <button 
          className={`btn btn-primary flex items-center gap-2 px-5 py-2 rounded-lg shadow transition-all duration-150 ${
            isAddingIncome ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700'
          }`}
          onClick={() => setIsAddingIncome(!isAddingIncome)}
        >
          {isAddingIncome ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {isAddingIncome ? 'Cancel' : 'Add Income'}
        </button>
      </div>
      
      {isAddingIncome && (
        <div className="bg-gradient-to-br from-green-50 via-white to-white rounded-2xl shadow-xl p-8 animate-slide-up border border-green-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {editingIncomeId ? <Edit className="h-5 w-5 text-blue-500" /> : <Plus className="h-5 w-5 text-green-500" />}
            {editingIncomeId ? 'Edit Income' : 'Add New Income'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="description" className="label font-semibold text-gray-700">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Salary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="label font-semibold text-gray-700">Amount</label>
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
                <label htmlFor="category" className="label font-semibold text-gray-700">Category</label>
                <select
                  id="category"
                  name="category"
                  className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.income.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="date" className="label font-semibold text-gray-700">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    This is a recurring income
                  </label>
                </div>
                
                {formData.isRecurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="recurrenceType" className="label font-semibold text-gray-700">Recurrence</label>
                      <select
                        id="recurrenceType"
                        name="recurrenceType"
                        className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                        value={formData.recurrenceType || 'monthly'}
                        onChange={handleChange}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="recurrenceEnd" className="label font-semibold text-gray-700">End Date (Optional)</label>
                      <input
                        type="date"
                        id="recurrenceEnd"
                        name="recurrenceEnd"
                        className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                        value={formData.recurrenceEnd?.split('T')[0] || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="label font-semibold text-gray-700">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-green-400 focus:border-green-400"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Add any additional details here..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shadow" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow">
                {editingIncomeId ? 'Update Income' : 'Add Income'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 via-white to-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-green-400" />
            Income History
          </h3>
        </div>
        
        {sortedIncomes.length === 0 ? (
          <div className="p-10 text-center">
            <ArrowDownCircle className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No income entries yet</p>
            <button 
              className="btn btn-primary mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow"
              onClick={() => setIsAddingIncome(true)}
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Your First Income
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-green-50">
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Recurring</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedIncomes.map((income) => (
                  <tr key={income.id} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                    <td className="p-4">{income.description}</td>
                    <td className="p-4">{formatDate(income.date)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        <Tag className="h-3 w-3 mr-1" />
                        {income.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-green-600">{formatCurrency(income.amount, settings.currency)}</td>
                    <td className="p-4">
                      {income.isRecurring ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Calendar className="h-3 w-3 mr-1" />
                          {getRecurrenceLabel(income.recurrenceType)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(income)}
                          className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700 transition"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomePage;