import React, { useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { Subscription, RecurrenceType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CreditCard, Calendar, Edit, Trash, Plus, X, Link, ExternalLink } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

const SubscriptionsPage: React.FC = () => {
  const { subscriptions, categories, addSubscription, updateSubscription, deleteSubscription, settings } = useFinanceStore();
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    amount: 0,
    category: categories.subscription[0] || 'Other',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    billingCycle: 'monthly',
    nextPaymentDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    website: '',
    isActive: true
  });
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      category: categories.subscription[0] || 'Other',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      billingCycle: 'monthly',
      nextPaymentDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      website: '',
      isActive: true
    });
    setIsAddingSubscription(false);
    setEditingSubscriptionId(null);
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
    
    const formattedNextPaymentDate = formData.nextPaymentDate 
      ? new Date(formData.nextPaymentDate).toISOString() 
      : new Date().toISOString();
    
    if (editingSubscriptionId) {
      updateSubscription(editingSubscriptionId, { 
        ...formData, 
        startDate: formattedStartDate,
        nextPaymentDate: formattedNextPaymentDate
      });
    } else {
      addSubscription({ 
        ...formData as Omit<Subscription, 'id'>, 
        startDate: formattedStartDate,
        nextPaymentDate: formattedNextPaymentDate
      });
    }
    
    resetForm();
  };
  
  // Edit subscription
  const handleEdit = (subscription: Subscription) => {
    // Convert ISO date to YYYY-MM-DD for input field
    const inputStartDate = subscription.startDate 
      ? format(parseISO(subscription.startDate), 'yyyy-MM-dd') 
      : format(new Date(), 'yyyy-MM-dd');
    
    const inputNextPaymentDate = subscription.nextPaymentDate 
      ? format(parseISO(subscription.nextPaymentDate), 'yyyy-MM-dd') 
      : format(new Date(), 'yyyy-MM-dd');
    
    setFormData({
      ...subscription,
      startDate: inputStartDate,
      nextPaymentDate: inputNextPaymentDate
    });
    setEditingSubscriptionId(subscription.id);
    setIsAddingSubscription(true);
  };
  
  // Delete subscription with confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscription(id);
    }
  };
  
  // Sort subscriptions by next payment date
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    // Active subscriptions first, then by next payment date
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    return new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
  });
  
  // Function to get recurrence label
  const getBillingCycleLabel = (type: RecurrenceType) => {
    switch (type) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'One-time';
    }
  };
  
  // Helper function to determine label and style based on days until payment
  const getPaymentStatus = (nextPaymentDate: string, isActive: boolean) => {
    if (!isActive) {
      return { label: 'Inactive', className: 'bg-gray-100 text-gray-800' };
    }
    
    const daysLeft = differenceInDays(parseISO(nextPaymentDate), new Date());
    
    if (daysLeft < 0) {
      return { label: 'Overdue', className: 'bg-red-100 text-red-800' };
    } else if (daysLeft === 0) {
      return { label: 'Today', className: 'bg-amber-100 text-amber-800' };
    } else if (daysLeft <= 3) {
      return { label: 'Soon', className: 'bg-amber-100 text-amber-800' };
    } else {
      return { 
        label: `In ${daysLeft} days`, 
        className: 'bg-green-100 text-green-800' 
      };
    }
  };
  
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-6 py-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-blue-600 bg-blue-100 rounded-full p-1 shadow-inner" />
            Subscriptions
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage your recurring subscriptions and payments</p>
        </div>
        <button 
          className={`btn btn-primary flex items-center gap-2 px-5 py-2 rounded-lg shadow transition-all duration-150 ${
            isAddingSubscription ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700'
          }`}
          onClick={() => setIsAddingSubscription(!isAddingSubscription)}
        >
          {isAddingSubscription ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {isAddingSubscription ? 'Cancel' : 'Add Subscription'}
        </button>
      </div>
      
      {isAddingSubscription && (
        <div className="bg-gradient-to-br from-blue-50 via-white to-white rounded-2xl shadow-xl p-8 animate-slide-up border border-blue-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {editingSubscriptionId ? <Edit className="h-5 w-5 text-blue-500" /> : <Plus className="h-5 w-5 text-blue-500" />}
            {editingSubscriptionId ? 'Edit Subscription' : 'Add New Subscription'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="name" className="label font-semibold text-gray-700">Subscription Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-400 focus:border-blue-400"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Netflix"
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
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-400 focus:border-blue-400"
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
                  className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-400 focus:border-blue-400"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.subscription.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="billingCycle" className="label font-semibold text-gray-700">Billing Cycle</label>
                <select
                  id="billingCycle"
                  name="billingCycle"
                  className="select bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-400 focus:border-blue-400"
                  value={formData.billingCycle}
                  onChange={handleChange}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="startDate" className="label font-semibold text-gray-700">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-400 focus:border-blue-400"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="nextPaymentDate" className="label font-semibold text-gray-700">Next Payment Date</label>
                <input
                  type="date"
                  id="nextPaymentDate"
                  name="nextPaymentDate"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-400 focus:border-blue-400"
                  value={formData.nextPaymentDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="website" className="label font-semibold text-gray-700">Website (Optional)</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-400 focus:border-blue-400"
                  value={formData.website || ''}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Active Subscription
                </label>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="label font-semibold text-gray-700">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="input bg-gray-50 border border-gray-200 rounded-lg focus:ring-blue-400 focus:border-blue-400"
                  value={formData.description || ''}
                  onChange={handleChange}
                  placeholder="Add any additional details here..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button type="button" className="btn btn-secondary px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shadow" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 shadow">
                {editingSubscriptionId ? 'Update Subscription' : 'Add Subscription'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            Subscriptions
          </h3>
        </div>
        
        {sortedSubscriptions.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No subscriptions added yet</p>
            <button 
              className="btn btn-primary mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 shadow"
              onClick={() => setIsAddingSubscription(true)}
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Your First Subscription
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-blue-50">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Billing Cycle</th>
                  <th className="p-4 font-semibold">Next Payment</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubscriptions.map((subscription) => {
                  const status = getPaymentStatus(subscription.nextPaymentDate, subscription.isActive);
                  return (
                    <tr key={subscription.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${!subscription.isActive ? 'opacity-60' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center">
                          {subscription.name}
                          {subscription.website && (
                            <a 
                              href={subscription.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{subscription.category}</td>
                      <td className="p-4 font-medium text-gray-900">{formatCurrency(subscription.amount, settings.currency)}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          <Calendar className="h-3 w-3 mr-1" />
                          {getBillingCycleLabel(subscription.billingCycle)}
                        </span>
                      </td>
                      <td className="p-4">
                        {subscription.isActive ? formatDate(subscription.nextPaymentDate) : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(subscription)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-700 transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subscription.id)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition"
                            title="Delete"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;