import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { FinanceStoreState, Income, Expense, Subscription, Budget, BudgetStatus, Settings } from '../types';
import { formatISO, isAfter, isBefore, isWithinInterval } from 'date-fns';

// Default categories
const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Business', 'Investments', 'Freelance', 'Other'];
const DEFAULT_EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Travel', 'Other'];
const DEFAULT_SUBSCRIPTION_CATEGORIES = ['Streaming', 'Software', 'Membership', 'Service', 'Other'];

// Local storage keys
const INCOME_STORAGE_KEY = 'fintrack_incomes';
const EXPENSE_STORAGE_KEY = 'fintrack_expenses';
const SUBSCRIPTION_STORAGE_KEY = 'fintrack_subscriptions';
const BUDGET_STORAGE_KEY = 'fintrack_budgets';
const CATEGORIES_STORAGE_KEY = 'fintrack_categories';
const SETTINGS_STORAGE_KEY = 'fintrack_settings';

// Default settings
const DEFAULT_SETTINGS: Settings = {
  currency: 'USD'
};

export const useFinanceStore = create<FinanceStoreState>((set, get) => ({
  incomes: [],
  expenses: [],
  subscriptions: [],
  budgets: [],
  settings: DEFAULT_SETTINGS,
  categories: {
    income: DEFAULT_INCOME_CATEGORIES,
    expense: DEFAULT_EXPENSE_CATEGORIES,
    subscription: DEFAULT_SUBSCRIPTION_CATEGORIES
  },

  // Initialize the store from localStorage
  initializeStore: () => {
    try {
      // Load data from localStorage
      const storedIncomes = localStorage.getItem(INCOME_STORAGE_KEY);
      const storedExpenses = localStorage.getItem(EXPENSE_STORAGE_KEY);
      const storedSubscriptions = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      const storedBudgets = localStorage.getItem(BUDGET_STORAGE_KEY);
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

      // Parse and set the data
      const incomes = storedIncomes ? JSON.parse(storedIncomes) : [];
      const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      const subscriptions = storedSubscriptions ? JSON.parse(storedSubscriptions) : [];
      const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
      const categories = storedCategories 
        ? JSON.parse(storedCategories) 
        : {
            income: DEFAULT_INCOME_CATEGORIES,
            expense: DEFAULT_EXPENSE_CATEGORIES,
            subscription: DEFAULT_SUBSCRIPTION_CATEGORIES
          };
      const settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;

      // Initialize any missing fields for existing data
      const updatedIncomes = incomes.map((income: Income) => ({
        ...income,
        allocated: income.allocated ?? false,
        allocatedAmount: income.allocatedAmount ?? 0
      }));

      const updatedBudgets = budgets.map((budget: Budget) => ({
        ...budget,
        fundedAmount: budget.fundedAmount ?? 0,
        spentAmount: budget.spentAmount ?? 0,
        status: budget.status ?? 'unfunded',
        allocations: budget.allocations ?? []
      }));

      set({ 
        incomes: updatedIncomes, 
        expenses, 
        subscriptions, 
        budgets: updatedBudgets, 
        categories,
        settings
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      // Reset to defaults on error
      set({
        incomes: [],
        expenses: [],
        subscriptions: [],
        budgets: [],
        settings: DEFAULT_SETTINGS,
        categories: {
          income: DEFAULT_INCOME_CATEGORIES,
          expense: DEFAULT_EXPENSE_CATEGORIES,
          subscription: DEFAULT_SUBSCRIPTION_CATEGORIES
        }
      });
    }
  },

  // Import data
  importData: (data) => {
    try {
      const {
        incomes = [],
        expenses = [],
        subscriptions = [],
        budgets = [],
        categories = {
          income: DEFAULT_INCOME_CATEGORIES,
          expense: DEFAULT_EXPENSE_CATEGORIES,
          subscription: DEFAULT_SUBSCRIPTION_CATEGORIES
        },
        settings = DEFAULT_SETTINGS
      } = data;

      // Validate and update data
      const updatedIncomes = incomes.map((income: Income) => ({
        ...income,
        allocated: income.allocated ?? false,
        allocatedAmount: income.allocatedAmount ?? 0
      }));

      const updatedBudgets = budgets.map((budget: Budget) => ({
        ...budget,
        fundedAmount: budget.fundedAmount ?? 0,
        spentAmount: budget.spentAmount ?? 0,
        status: budget.status ?? 'unfunded',
        allocations: budget.allocations ?? []
      }));

      // Save to localStorage
      localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(updatedIncomes));
      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptions));
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

      // Update store
      set({
        incomes: updatedIncomes,
        expenses,
        subscriptions,
        budgets: updatedBudgets,
        categories,
        settings
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data. Invalid format.');
    }
  },

  // Settings operations
  updateSettings: (newSettings) => {
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      return { settings };
    });
  },

  // Income operations
  addIncome: (income) => {
    const newIncome: Income = {
      ...income,
      id: uuidv4(),
      type: 'income',
      date: income.date || formatISO(new Date()),
      allocated: false,
      allocatedAmount: 0
    };
    
    set((state) => {
      const updatedIncomes = [...state.incomes, newIncome];
      localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(updatedIncomes));
      return { incomes: updatedIncomes };
    });
  },

  updateIncome: (id, updates) => {
    set((state) => {
      const updatedIncomes = state.incomes.map((income) =>
        income.id === id ? { ...income, ...updates } : income
      );
      localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(updatedIncomes));
      return { incomes: updatedIncomes };
    });
  },

  deleteIncome: (id) => {
    set((state) => {
      // First, remove allocations from budgets that use this income
      const updatedBudgets = state.budgets.map(budget => ({
        ...budget,
        allocations: budget.allocations.filter(alloc => alloc.incomeId !== id),
        fundedAmount: budget.allocations.reduce((sum, alloc) => 
          alloc.incomeId !== id ? sum + alloc.amount : sum, 0)
      }));

      // Then remove the income
      const updatedIncomes = state.incomes.filter((income) => income.id !== id);
      
      // Update storage
      localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(updatedIncomes));
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      
      return { 
        incomes: updatedIncomes,
        budgets: updatedBudgets
      };
    });
  },

  // Expense operations
  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      type: 'expense',
      date: expense.date || formatISO(new Date())
    };
    
    set((state) => {
      const updatedExpenses = [...state.expenses, newExpense];
      
      // Update budget spent amount if expense is associated with a budget
      const updatedBudgets = state.budgets.map(budget => {
        if (budget.id === expense.budgetId) {
          const newSpentAmount = budget.spentAmount + expense.amount;
          const status: BudgetStatus = 
            newSpentAmount > budget.amount ? 'overspent' :
            budget.fundedAmount === 0 ? 'unfunded' :
            budget.fundedAmount < budget.amount ? 'partially_funded' :
            'fully_funded';
          
          return {
            ...budget,
            spentAmount: newSpentAmount,
            status
          };
        }
        return budget;
      });

      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(updatedExpenses));
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      
      return { 
        expenses: updatedExpenses,
        budgets: updatedBudgets
      };
    });
  },

  updateExpense: (id, updates) => {
    set((state) => {
      const oldExpense = state.expenses.find(e => e.id === id);
      const updatedExpenses = state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      );
      
      // Update budget spent amount if the expense amount changed
      const updatedBudgets = state.budgets.map(budget => {
        if (budget.id === oldExpense?.budgetId || budget.id === updates.budgetId) {
          let newSpentAmount = budget.spentAmount;
          
          // Remove old amount if this was previously associated with this budget
          if (budget.id === oldExpense?.budgetId) {
            newSpentAmount -= oldExpense.amount;
          }
          
          // Add new amount if this is now associated with this budget
          if (budget.id === updates.budgetId) {
            newSpentAmount += updates.amount || oldExpense?.amount || 0;
          }
          
          const status: BudgetStatus = 
            newSpentAmount > budget.amount ? 'overspent' :
            budget.fundedAmount === 0 ? 'unfunded' :
            budget.fundedAmount < budget.amount ? 'partially_funded' :
            'fully_funded';
          
          return {
            ...budget,
            spentAmount: newSpentAmount,
            status
          };
        }
        return budget;
      });

      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(updatedExpenses));
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      
      return { 
        expenses: updatedExpenses,
        budgets: updatedBudgets
      };
    });
  },

  deleteExpense: (id) => {
    set((state) => {
      const expense = state.expenses.find(e => e.id === id);
      const updatedExpenses = state.expenses.filter((expense) => expense.id !== id);
      
      // Update budget spent amount if expense was associated with a budget
      const updatedBudgets = state.budgets.map(budget => {
        if (budget.id === expense?.budgetId) {
          const newSpentAmount = budget.spentAmount - expense.amount;
          const status: BudgetStatus = 
            newSpentAmount > budget.amount ? 'overspent' :
            budget.fundedAmount === 0 ? 'unfunded' :
            budget.fundedAmount < budget.amount ? 'partially_funded' :
            'fully_funded';
          
          return {
            ...budget,
            spentAmount: newSpentAmount,
            status
          };
        }
        return budget;
      });

      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(updatedExpenses));
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      
      return { 
        expenses: updatedExpenses,
        budgets: updatedBudgets
      };
    });
  },

  // Get available budgets for expense allocation
  getAvailableBudgets: () => {
    const state = get();
    return state.budgets
      .filter(budget => budget.isActive && budget.fundedAmount > budget.spentAmount)
      .map(budget => ({
        id: budget.id,
        name: budget.name,
        category: budget.category,
        availableAmount: budget.fundedAmount - budget.spentAmount
      }));
  },

  // Subscription operations
  addSubscription: (subscription) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: uuidv4()
    };
    
    set((state) => {
      const updatedSubscriptions = [...state.subscriptions, newSubscription];
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updatedSubscriptions));
      return { subscriptions: updatedSubscriptions };
    });
  },

  updateSubscription: (id, updates) => {
    set((state) => {
      const updatedSubscriptions = state.subscriptions.map((subscription) =>
        subscription.id === id ? { ...subscription, ...updates } : subscription
      );
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updatedSubscriptions));
      return { subscriptions: updatedSubscriptions };
    });
  },

  deleteSubscription: (id) => {
    set((state) => {
      const updatedSubscriptions = state.subscriptions.filter((subscription) => subscription.id !== id);
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updatedSubscriptions));
      return { subscriptions: updatedSubscriptions };
    });
  },

  // Budget operations
  addBudget: (budget) => {
    const newBudget: Budget = {
      ...budget,
      id: uuidv4(),
      fundedAmount: 0,
      spentAmount: 0,
      status: 'unfunded',
      allocations: []
    };
    
    set((state) => {
      const updatedBudgets = [...state.budgets, newBudget];
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      return { budgets: updatedBudgets };
    });
  },

  updateBudget: (id, updates) => {
    set((state) => {
      const updatedBudgets = state.budgets.map((budget) => {
        if (budget.id === id) {
          const updatedBudget = { ...budget, ...updates };
          
          // Recalculate status if amount changed
          if (updates.amount !== undefined) {
            updatedBudget.status = 
              updatedBudget.spentAmount > updatedBudget.amount ? 'overspent' :
              updatedBudget.fundedAmount === 0 ? 'unfunded' :
              updatedBudget.fundedAmount < updatedBudget.amount ? 'partially_funded' :
              'fully_funded';
          }
          
          return updatedBudget;
        }
        return budget;
      });
      
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      return { budgets: updatedBudgets };
    });
  },

  deleteBudget: (id) => {
    set((state) => {
      // Remove budget allocations from incomes
      const updatedIncomes = state.incomes.map(income => {
        const removedAllocation = state.budgets
          .find(b => b.id === id)?.allocations
          .find(a => a.incomeId === income.id)?.amount || 0;
        
        return {
          ...income,
          allocatedAmount: income.allocatedAmount - removedAllocation
        };
      });

      // Remove budget
      const updatedBudgets = state.budgets.filter((budget) => budget.id !== id);
      
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(updatedIncomes));
      
      return { 
        budgets: updatedBudgets,
        incomes: updatedIncomes
      };
    });
  },

  // Budget allocation operations
  allocateToBudget: (budgetId, amount) => {
    set((state) => {
      const budget = state.budgets.find(b => b.id === budgetId);
      if (!budget) return state;

      // Find available income to allocate from
      const availableIncome = state.incomes
        .filter(income => income.amount > income.allocatedAmount)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let remainingToAllocate = amount;
      const newAllocations = [];
      const updatedIncomes = [...state.incomes];

      // Allocate from each available income source
      for (const income of availableIncome) {
        if (remainingToAllocate <= 0) break;

        const incomeIndex = updatedIncomes.findIndex(i => i.id === income.id);
        const availableAmount = income.amount - income.allocatedAmount;
        const allocationAmount = Math.min(availableAmount, remainingToAllocate);

        newAllocations.push({
          id: uuidv4(),
          incomeId: income.id,
          amount: allocationAmount,
          date: formatISO(new Date())
        });

        updatedIncomes[incomeIndex] = {
          ...income,
          allocatedAmount: income.allocatedAmount + allocationAmount
        };

        remainingToAllocate -= allocationAmount;
      }

      // Update budget with new allocations
      const updatedBudgets = state.budgets.map(b => {
        if (b.id === budgetId) {
          const newFundedAmount = b.fundedAmount + (amount - remainingToAllocate);
          const status: BudgetStatus = 
            b.spentAmount > b.amount ? 'overspent' :
            newFundedAmount === 0 ? 'unfunded' :
            newFundedAmount < b.amount ? 'partially_funded' :
            'fully_funded';

          return {
            ...b,
            fundedAmount: newFundedAmount,
            status,
            allocations: [...b.allocations, ...newAllocations]
          };
        }
        return b;
      });

      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(updatedIncomes));

      return {
        budgets: updatedBudgets,
        incomes: updatedIncomes
      };
    });
  },

  reallocateBudget: (fromBudgetId, toBudgetId, amount) => {
    set((state) => {
      const fromBudget = state.budgets.find(b => b.id === fromBudgetId);
      const toBudget = state.budgets.find(b => b.id === toBudgetId);
      if (!fromBudget || !toBudget || fromBudget.fundedAmount < amount) return state;

      // Create new allocation for target budget
      const newAllocation = {
        id: uuidv4(),
        incomeId: fromBudget.allocations[0].incomeId, // Use the same income source
        amount,
        date: formatISO(new Date())
      };

      // Update both budgets
      const updatedBudgets = state.budgets.map(budget => {
        if (budget.id === fromBudgetId) {
          const newFundedAmount = budget.fundedAmount - amount;
          const status: BudgetStatus = 
            budget.spentAmount > budget.amount ? 'overspent' :
            newFundedAmount === 0 ? 'unfunded' :
            newFundedAmount < budget.amount ? 'partially_funded' :
            'fully_funded';

          return {
            ...budget,
            fundedAmount: newFundedAmount,
            status,
            allocations: budget.allocations.map(alloc => ({
              ...alloc,
              amount: alloc.amount - amount
            }))
          };
        }
        if (budget.id === toBudgetId) {
          const newFundedAmount = budget.fundedAmount + amount;
          const status: BudgetStatus = 
            budget.spentAmount > budget.amount ? 'overspent' :
            newFundedAmount === 0 ? 'unfunded' :
            newFundedAmount < budget.amount ? 'partially_funded' :
            'fully_funded';

          return {
            ...budget,
            fundedAmount: newFundedAmount,
            status,
            allocations: [...budget.allocations, newAllocation]
          };
        }
        return budget;
      });

      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
      return { budgets: updatedBudgets };
    });
  },

  getUnallocatedIncome: () => {
    const state = get();
    return state.incomes.reduce((total, income) => 
      total + (income.amount - income.allocatedAmount), 0);
  },

  getAvailableIncomeForAllocation: () => {
    const state = get();
    return state.incomes
      .filter(income => income.amount > income.allocatedAmount)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  suggestBudgetAllocations: () => {
    const state = get();
    const unallocatedIncome = state.getUnallocatedIncome();
    const unfundedBudgets = state.budgets
      .filter(budget => budget.fundedAmount < budget.amount)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const suggestions: { budgetId: string; suggestedAmount: number }[] = [];
    let remainingIncome = unallocatedIncome;

    for (const budget of unfundedBudgets) {
      if (remainingIncome <= 0) break;
      
      const needed = budget.amount - budget.fundedAmount;
      const suggestedAmount = Math.min(needed, remainingIncome);
      
      suggestions.push({
        budgetId: budget.id,
        suggestedAmount
      });
      
      remainingIncome -= suggestedAmount;
    }

    return suggestions;
  },

  // Category operations
  addCategory: (type, category) => {
    set((state) => {
      const updatedCategories = {
        ...state.categories,
        [type]: [...state.categories[type], category]
      };
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
      return { categories: updatedCategories };
    });
  },

  deleteCategory: (type, categoryToDelete) => {
    set((state) => {
      const updatedCategories = {
        ...state.categories,
        [type]: state.categories[type].filter(category => category !== categoryToDelete)
      };
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
      return { categories: updatedCategories };
    });
  }
}));