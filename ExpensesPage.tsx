import React, { useState, useCallback } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Expense, RecurrenceType, Attachment } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowUpCircle, Plus, Edit, Trash, Tag, Calendar, X, Upload, File, Image } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useDropzone } from 'react-dropzone';

const ExpensesPage: React.FC = () => {
  const { expenses, categories, addExpense, updateExpense, deleteExpense, settings } = useFinanceStore();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: categories.expense[0] || 'Other',
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    notes: '',
    type: 'expense',
    attachments: []
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      category: categories.expense[0] || 'Other',
      date: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      notes: '',
      type: 'expense',
      attachments: []
    });
    setIsAddingExpense(false);
    setEditingExpenseId(null);
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
  
  // Handle file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const newAttachment: Attachment = {
          id: `attachment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string
        };
        
        setFormData((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment]
        }));
      };
      
      reader.readAsDataURL(file);
    });
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 3
  });
  
  // Remove attachment
  const removeAttachment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments?.filter((attachment) => attachment.id !== id)
    }));
  };
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format date to ISO string
    const formattedDate = formData.date 
      ? new Date(formData.date).toISOString() 
      : new Date().toISOString();
    
    if (editingExpenseId) {
      updateExpense(editingExpenseId, { ...formData, date: formattedDate });
    } else {
      addExpense({ 
        ...formData as Omit<Expense, 'id'>, 
        date: formattedDate 
      });
    }
    
    resetForm();
  };
  
  // Edit expense
  const handleEdit = (expense: Expense) => {
    // Convert ISO date to YYYY-MM-DD for input field
    const inputDate = expense.date 
      ? format(parseISO(expense.date), 'yyyy-MM-dd') 
      : format(new Date(), 'yyyy-MM-dd');
    
    setFormData({
      ...expense,
      date: inputDate
    });
    setEditingExpenseId(expense.id);
    setIsAddingExpense(true);
  };
  
  // Delete expense with confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
    }
  };
  
  // Sort expenses by date
  const sortedExpenses = [...expenses].sort((a, b) => {
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
  
  // Function to get file icon based on mimetype
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };
  
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-6 py-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <ArrowUpCircle className="h-8 w-8 text-red-500 bg-red-100 rounded-full p-1 shadow-inner" />
            Expenses
          </h2>
          <p className="text-gray-500 text-sm mt-1">Track your spending and recurring expenses</p>
        </div>
        <button 
          className={`btn btn-primary flex items-center gap-2 px-5 py-2 rounded-lg shadow transition-all duration-150 ${
            isAddingExpense ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700'
          }`}
          onClick={() => setIsAddingExpense(!isAddingExpense)}
        >
          {isAddingExpense ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {isAddingExpense ? 'Cancel' : 'Add Expense'}
        </button>
      </div>
      
      {isAddingExpense && (
        <div className="bg-gradient-to-br from-red-50 via-white to-white rounded-2xl shadow-xl p-8 animate-slide-up border border-red-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {editingExpenseId ? <Edit className="h-5 w-5 text-blue-500" /> : <Plus className="h-5 w-5 text-red-500" />}
            {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="description" className="label font-semibold text-gray-700">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-red-400 focus:border-red-400"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Groceries"
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
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-red-400 focus:border-red-400"
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
                  className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-red-400 focus:border-red-400"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.expense.map((category) => (
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
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-red-400 focus:border-red-400"
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
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    This is a recurring expense
                  </label>
                </div>
                
                {formData.isRecurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="recurrenceType" className="label font-semibold text-gray-700">Recurrence</label>
                      <select
                        id="recurrenceType"
                        name="recurrenceType"
                        className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-red-400 focus:border-red-400"
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
                        className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-red-400 focus:border-red-400"
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
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-red-400 focus:border-red-400"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Add any additional details here..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="label font-semibold text-gray-700">Attachments (Optional)</label>
                <div 
                  {...getRootProps()} 
                  className={`mt-1 border-2 border-dashed rounded-lg p-6 cursor-pointer
                    ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop files here, or click to select files
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Supported formats: JPG, PNG, PDF (max 3 files)
                    </p>
                  </div>
                </div>
                
                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                    {formData.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center">
                          {getFileIcon(attachment.type)}
                          <span className="ml-2 text-sm truncate">{attachment.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shadow" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 py-2 rounded-lg bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 shadow">
                {editingExpenseId ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 via-white to-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-red-400" />
            Expense History
          </h3>
        </div>
        
        {sortedExpenses.length === 0 ? (
          <div className="p-10 text-center">
            <ArrowUpCircle className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No expense entries yet</p>
            <button 
              className="btn btn-primary mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700 shadow"
              onClick={() => setIsAddingExpense(true)}
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-red-50">
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Recurring</th>
                  <th className="p-4 font-semibold">Attachments</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                    <td className="p-4">{expense.description}</td>
                    <td className="p-4">{formatDate(expense.date)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        <Tag className="h-3 w-3 mr-1" />
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-red-600">{formatCurrency(expense.amount, settings.currency)}</td>
                    <td className="p-4">
                      {expense.isRecurring ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Calendar className="h-3 w-3 mr-1" />
                          {getRecurrenceLabel(expense.recurrenceType)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No</span>
                      )}
                    </td>
                    <td className="p-4">
                      {expense.attachments && expense.attachments.length > 0 ? (
                        <span className="text-sm text-gray-700">
                          {expense.attachments.length} file(s)
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700 transition"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
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

export default ExpensesPage;