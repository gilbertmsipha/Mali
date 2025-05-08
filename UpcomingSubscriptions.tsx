import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { formatCurrency } from '../../utils/formatters';
import { format, parseISO, differenceInDays } from 'date-fns';

const UpcomingSubscriptions: React.FC = () => {
  const { subscriptions, settings } = useFinanceStore();
  
  // Filter active subscriptions and sort by next payment date
  const upcomingSubscriptions = subscriptions
    .filter(sub => sub.isActive)
    .sort((a, b) => {
      return new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
    })
    .slice(0, 3); // Only show 3 upcoming subscriptions
  
  // Helper function to determine label and style based on days until payment
  const getPaymentStatus = (nextPaymentDate: string) => {
    const daysLeft = differenceInDays(parseISO(nextPaymentDate), new Date());
    
    if (daysLeft < 0) {
      return { label: 'Overdue', className: 'bg-red-100 text-red-800' };
    } else if (daysLeft === 0) {
      return { label: 'Today', className: 'bg-amber-100 text-amber-800' };
    } else if (daysLeft <= 3) {
      return { label: 'Soon', className: 'bg-amber-100 text-amber-800' };
    } else {
      return { 
        label: `${daysLeft} days`, 
        className: 'bg-green-100 text-green-800' 
      };
    }
  };
  
  return (
    <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-700">Upcoming Subscriptions</h3>
      </div>
      
      {upcomingSubscriptions.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No upcoming subscriptions</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {upcomingSubscriptions.map((subscription) => {
            const status = getPaymentStatus(subscription.nextPaymentDate);
            
            return (
              <li key={subscription.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{subscription.name}</p>
                    <p className="text-sm text-gray-500">{subscription.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(subscription.amount, settings.currency)}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UpcomingSubscriptions;