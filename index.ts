import { formatISO } from 'date-fns';

export type TransactionType = 'income' | 'expense';
export type RecurrenceType = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BudgetStatus = 'unfunded' | 'partially_funded' | 'fully_funded' | 'overspent';
export type BudgetPeriod = 'monthly' | 'yearly' | 'custom';
export type Currency = 'USD' | 'ZAR';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string
  notes?: string;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEnd?: string; // ISO string
  attachments?: Attachment[];
}

export interface Income extends Transaction {
  type: 'income';
  source?: string;
  allocated: boolean; // Track if this income has been allocated to budgets
  allocatedAmount: number; // Amount that has been allocated to budgets
}

export interface Expense extends Transaction {
  type: 'expense';
  vendor?: string;
  budgetId?: string; // Reference to the budget this expense belongs to
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded data
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  startDate: string; // ISO string
  billingCycle: RecurrenceType;
  nextPaymentDate: string; // ISO string
  description?: string;
  website?: string;
  isActive: boolean;
}

export interface Budget {
  id: string;
  name: string;
  category?: string; // If undefined, it's a general budget
  amount: number; // Target amount
  fundedAmount: number; // Current amount funded
  spentAmount: number; // Current amount spent
  period: BudgetPeriod;
  startDate: string; // ISO string
  endDate?: string; // ISO string
  isActive: boolean;
  status: BudgetStatus;
  allocations: BudgetAllocation[]; // Track which incomes fund this budget
}

export interface BudgetAllocation {
  id: string;
  incomeId: string;
  amount: number;
  date: string; // ISO string
}

export interface Settings {
  currency: Currency;
}

export interface FinanceStoreState {
  incomes: Income[];
  expenses: Expense[];
  subscriptions: Subscription[];
  budgets: Budget[];
  settings: Settings;
  categories: {
    income: string[];
    expense: string[];
    subscription: string[];
  };
  
  // Store operations
  initializeStore: () => void;
  importData: (data: any) => void;
  
  // Settings operations
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Income operations
  addIncome: (income: Omit<Income, 'id' | 'allocated' | 'allocatedAmount'>) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  
  // Expense operations
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Budget operations
  getAvailableBudgets: () => Array<{
    id: string;
    name: string;
    category?: string;
    availableAmount: number;
  }>;
  
  // Subscription operations
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  
  // Budget operations
  addBudget: (budget: Omit<Budget, 'id' | 'fundedAmount' | 'spentAmount' | 'status' | 'allocations'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  allocateToBudget: (budgetId: string, amount: number) => void;
  reallocateBudget: (fromBudgetId: string, toBudgetId: string, amount: number) => void;
  
  // Category operations
  addCategory: (type: 'income' | 'expense' | 'subscription', category: string) => void;
  deleteCategory: (type: 'income' | 'expense' | 'subscription', category: string) => void;
  
  // Budget allocation operations
  getUnallocatedIncome: () => number;
  getAvailableIncomeForAllocation: () => Income[];
  suggestBudgetAllocations: () => { budgetId: string; suggestedAmount: number }[];
}