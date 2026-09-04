import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  AccountWithBalance,
  AppSettings,
  Budget,
  Category,
  EmiPlan,
  EmiWithStatus,
  PageView,
  Person,
  PersonLedgerSummary,
  ToastMessage,
  Transaction,
  TransactionType,
} from '../types/finance';
import {
  calculateAccountBalances,
  calculateBudgetUsage,
  calculateDebtTotals,
  calculateEmiStatuses,
  calculatePeopleSummaries,
  calculateTotalBalance,
} from '../utils/calculations';
import { getCurrentMonthKey, getTodayDateString } from '../utils/formatters';
import {
  DEFAULT_SETTINGS,
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_EMIS,
  INITIAL_PEOPLE,
  getInitialBudgets,
  getInitialTransactions,
} from '../data/initialData';

interface FinanceContextType {
  // Navigation & View
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;

  // Raw State
  accounts: Account[];
  transactions: Transaction[];
  people: Person[];
  emis: EmiPlan[];
  budgets: Budget[];
  categories: Category[];
  settings: AppSettings;

  // Derived Values
  accountsWithBalances: AccountWithBalance[];
  totalBalance: number;
  peopleSummaries: PersonLedgerSummary[];
  debtTotals: { totalReceivable: number; totalPayable: number; netDebtPosition: number };
  emiStatuses: EmiWithStatus[];
  budgetUsages: ReturnType<typeof calculateBudgetUsage>;

  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;

  // Account CRUD
  addAccount: (account: Omit<Account, 'id'>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => boolean;

  // People CRUD
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => boolean;

  // EMI CRUD & Actions
  addEmiPlan: (emi: Omit<EmiPlan, 'id'>) => EmiPlan;
  updateEmiPlan: (id: string, updates: Partial<EmiPlan>) => void;
  deleteEmiPlan: (id: string) => void;
  payEmi: (emiId: string, accountId?: string, date?: string, note?: string) => boolean;

  // Budget Actions
  setCategoryBudget: (category: string, amount: number, month?: string) => void;
  deleteBudget: (budgetId: string) => void;
  deleteCategoryBudget: (category: string, month?: string) => void;

  // Category Actions
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  deleteCategory: (catId: string) => void;

  // Settings & Theme
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  // Modals & UI State
  isQuickAddOpen: boolean;
  quickAddInitialType: TransactionType;
  quickAddPrefill: { personId?: string; emiId?: string; accountId?: string; category?: string };
  openQuickAdd: (type?: TransactionType, prefill?: { personId?: string; emiId?: string; accountId?: string; category?: string }) => void;
  closeQuickAdd: () => void;

  // Transfer Modal
  isTransferOpen: boolean;
  openTransferModal: (fromAccountId?: string) => void;
  closeTransferModal: () => void;

  // Selected Person Ledger Detail View
  selectedPersonId: string | null;
  setSelectedPersonId: (id: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data Management
  resetToSampleData: () => void;
  resetToDefaultData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => void;
  exportDataJson: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; error?: string };
  importDataJson: (jsonString: string) => { success: boolean; error?: string };

  // Toasts
  toasts: ToastMessage[];
  addToast: (msg: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const STORAGE_KEY = 'pft_user_finance_data_v1';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary State initialized from localStorage or defaults
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : getInitialTransactions();
    } catch {
      return getInitialTransactions();
    }
  });

  const [people, setPeople] = useState<Person[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_people`);
      return saved ? JSON.parse(saved) : INITIAL_PEOPLE;
    } catch {
      return INITIAL_PEOPLE;
    }
  });

  const [emis, setEmis] = useState<EmiPlan[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_emis`);
      return saved ? JSON.parse(saved) : INITIAL_EMIS;
    } catch {
      return INITIAL_EMIS;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`);
      return saved ? JSON.parse(saved) : getInitialBudgets();
    } catch {
      return getInitialBudgets();
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // UI Modal States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<TransactionType>('expense');
  const [quickAddPrefill, setQuickAddPrefill] = useState<{ personId?: string; emiId?: string; accountId?: string; category?: string }>({});
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...msg, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_people`, JSON.stringify(people));
      localStorage.setItem(`${STORAGE_KEY}_emis`, JSON.stringify(emis));
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
      localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  }, [accounts, transactions, people, emis, budgets, categories, settings]);

  // Handle Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // DERIVED COMPUTATIONS
  // Accounts with dynamically calculated balances
  const accountsWithBalances = useMemo(() => {
    return calculateAccountBalances(accounts, transactions);
  }, [accounts, transactions]);

  // Total balance across all accounts
  const totalBalance = useMemo(() => {
    return calculateTotalBalance(accountsWithBalances);
  }, [accountsWithBalances]);

  // People ledger summaries
  const peopleSummaries = useMemo(() => {
    return calculatePeopleSummaries(people, transactions);
  }, [people, transactions]);

  // Total Receivables & Payables
  const debtTotals = useMemo(() => {
    return calculateDebtTotals(peopleSummaries);
  }, [peopleSummaries]);

  // EMI statuses for currently selected month
  const emiStatuses = useMemo(() => {
    return calculateEmiStatuses(emis, transactions, selectedMonth);
  }, [emis, transactions, selectedMonth]);

  // Budget usages for currently selected month
  const budgetUsages = useMemo(() => {
    // Filter budgets for selectedMonth (or default ones)
    const monthBudgets = budgets.filter((b) => b.month === selectedMonth);
    return calculateBudgetUsage(monthBudgets, transactions, selectedMonth);
  }, [budgets, transactions, selectedMonth]);

  // TRANSACTION ACTIONS
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    addToast({
      title: 'Transaction Recorded',
      description: `${txData.type.toUpperCase()}: ₹${Number(txData.amount).toLocaleString('en-IN')}`,
      type: 'success',
    });

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
    addToast({
      title: 'Transaction Updated',
      description: 'Changes saved and balances recalculated.',
      type: 'info',
    });
  };

  const deleteTransaction = (id: string) => {
    const existing = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    if (existing) {
      addToast({
        title: 'Transaction Deleted',
        description: `Removed ₹${existing.amount.toLocaleString('en-IN')} ${existing.category || existing.type}.`,
        type: 'warning',
      });
    }
  };

  // ACCOUNT ACTIONS
  const addAccount = (accountData: Omit<Account, 'id'>): Account => {
    const newAcc: Account = {
      ...accountData,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
    addToast({
      title: 'Account Created',
      description: `${accountData.name} added successfully.`,
      type: 'success',
    });
    return newAcc;
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    );
    addToast({
      title: 'Account Updated',
      description: 'Account settings have been updated.',
      type: 'info',
    });
  };

  const deleteAccount = (id: string): boolean => {
    // Prevent deleting if it has transactions
    const hasTxs = transactions.some((t) => t.accountId === id || t.toAccountId === id);
    if (hasTxs) {
      addToast({
        title: 'Cannot Delete Account',
        description: 'This account has transactions associated with it. Delete or reassign those first.',
        type: 'error',
      });
      return false;
    }
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    addToast({
      title: 'Account Removed',
      type: 'info',
    });
    return true;
  };

  // PEOPLE ACTIONS
  const addPerson = (personData: Omit<Person, 'id' | 'createdAt'>): Person => {
    const newPerson: Person = {
      ...personData,
      id: `person-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: Date.now(),
    };
    setPeople((prev) => [...prev, newPerson]);
    addToast({
      title: 'Person Added',
      description: `${personData.name} added to your ledger.`,
      type: 'success',
    });
    return newPerson;
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addToast({
      title: 'Person Updated',
      description: 'Contact details updated.',
      type: 'info',
    });
  };

  const deletePerson = (id: string): boolean => {
    const hasTxs = transactions.some((t) => t.personId === id);
    if (hasTxs) {
      addToast({
        title: 'Cannot Delete Person',
        description: 'This person has debt or settlement records in your transactions.',
        type: 'error',
      });
      return false;
    }
    setPeople((prev) => prev.filter((p) => p.id !== id));
    if (selectedPersonId === id) setSelectedPersonId(null);
    addToast({
      title: 'Person Removed',
      type: 'info',
    });
    return true;
  };

  // EMI ACTIONS
  const addEmiPlan = (emiData: Omit<EmiPlan, 'id'>): EmiPlan => {
    const newEmi: EmiPlan = {
      ...emiData,
      id: `emi-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setEmis((prev) => [...prev, newEmi]);
    addToast({
      title: 'EMI Plan Added',
      description: `${emiData.name} - ₹${emiData.amount.toLocaleString('en-IN')}/mo`,
      type: 'success',
    });
    return newEmi;
  };

  const updateEmiPlan = (id: string, updates: Partial<EmiPlan>) => {
    setEmis((prev) =>
      prev.map((emi) => (emi.id === id ? { ...emi, ...updates } : emi))
    );
    addToast({
      title: 'EMI Plan Updated',
      type: 'info',
    });
  };

  const deleteEmiPlan = (id: string) => {
    setEmis((prev) => prev.filter((emi) => emi.id !== id));
    addToast({
      title: 'EMI Plan Deleted',
      type: 'info',
    });
  };

  /**
   * Pay EMI:
   * 1. Create expense transaction
   * 2. Category = EMI
   * 3. Deduct amount from selected account
   * 4. Mark that month's EMI as paid
   * 5. Avoid duplicate EMI transactions
   */
  const payEmi = (emiId: string, accountId?: string, date?: string, note?: string): boolean => {
    const emi = emis.find((e) => e.id === emiId);
    if (!emi) {
      addToast({ title: 'EMI not found', type: 'error' });
      return false;
    }

    const paymentDate = date || getTodayDateString();
    const paymentMonth = paymentDate.substring(0, 7);

    // Check if already paid for this month
    const existing = transactions.find(
      (tx) =>
        tx.emiId === emiId &&
        tx.date.startsWith(paymentMonth) &&
        (tx.type === 'emi' || tx.type === 'expense')
    );

    if (existing) {
      addToast({
        title: 'Already Paid',
        description: `This EMI is already paid for ${paymentMonth} (Tx on ${existing.date}).`,
        type: 'warning',
      });
      return false;
    }

    const accId = accountId || emi.defaultAccountId || accounts[0]?.id;

    const newTx: Transaction = {
      id: `tx-emi-${Date.now()}`,
      type: 'emi',
      amount: emi.amount,
      date: paymentDate,
      category: 'EMI',
      subcategory: emi.name,
      accountId: accId,
      emiId: emi.id,
      note: note || `${emi.name} monthly payment`,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    addToast({
      title: 'EMI Payment Recorded',
      description: `₹${emi.amount.toLocaleString('en-IN')} paid for ${emi.name}.`,
      type: 'success',
    });

    return true;
  };

  // BUDGET ACTIONS
  const setCategoryBudget = (category: string, amount: number, month: string = selectedMonth) => {
    setBudgets((prev) => {
      const filtered = prev.filter((b) => !(b.category === category && b.month === month));
      if (amount <= 0) return filtered;
      return [
        ...filtered,
        {
          id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          category,
          amount,
          month,
        },
      ];
    });
    addToast({
      title: 'Budget Saved',
      description: `${category}: ₹${amount.toLocaleString('en-IN')} for ${month}`,
      type: 'success',
    });
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    addToast({ title: 'Budget Removed', type: 'info' });
  };

  const deleteCategoryBudget = (category: string, month: string = selectedMonth) => {
    setBudgets((prev) => prev.filter((b) => !(b.category === category && b.month === month)));
    addToast({
      title: 'Budget Target Removed',
      description: `Target for ${category} has been cleared.`,
      type: 'info',
    });
  };

  // CATEGORY ACTIONS
  const addCategory = (catData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
    addToast({
      title: 'Category Added',
      description: `${catData.name} created.`,
      type: 'success',
    });
    return newCat;
  };

  const deleteCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    addToast({ title: 'Category Removed', type: 'info' });
  };

  // SETTINGS
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast({ title: 'Settings Updated', type: 'info' });
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // MODAL CONTROLS
  const openQuickAdd = (
    type: TransactionType = 'expense',
    prefill: { personId?: string; emiId?: string; accountId?: string; category?: string } = {}
  ) => {
    setQuickAddInitialType(type);
    setQuickAddPrefill(prefill);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
    setQuickAddPrefill({});
  };

  const openTransferModal = (fromAccountId?: string) => {
    if (fromAccountId) {
      setQuickAddPrefill({ accountId: fromAccountId });
    }
    setIsTransferOpen(true);
  };

  const closeTransferModal = () => {
    setIsTransferOpen(false);
  };

  // DATA BACKUP & RESTORE
  const exportDataJSON = () => {
    const payload = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      accounts,
      transactions,
      people,
      emis,
      budgets,
      categories,
      settings,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `finance-backup-${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      title: 'Data Exported',
      description: 'Your complete financial backup has been downloaded as JSON.',
      type: 'success',
    });
  };

  const importDataJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.accounts || !Array.isArray(data.accounts) || !data.transactions || !Array.isArray(data.transactions)) {
        return { success: false, error: 'Invalid backup file format. Missing accounts or transactions data.' };
      }

      setAccounts(data.accounts);
      setTransactions(data.transactions);
      if (Array.isArray(data.people)) setPeople(data.people);
      if (Array.isArray(data.emis)) setEmis(data.emis);
      if (Array.isArray(data.budgets)) setBudgets(data.budgets);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (data.settings) setSettings(data.settings);

      addToast({
        title: 'Data Restored Successfully',
        description: `Imported ${data.transactions.length} transactions and ${data.accounts.length} accounts.`,
        type: 'success',
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse JSON file' };
    }
  };

  const resetToSampleData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(getInitialTransactions());
    setPeople(INITIAL_PEOPLE);
    setEmis(INITIAL_EMIS);
    setBudgets(getInitialBudgets());
    setCategories(INITIAL_CATEGORIES);
    setSettings(DEFAULT_SETTINGS);
    addToast({
      title: 'Sample Data Restored',
      description: 'The app has been reset to initial demo data.',
      type: 'info',
    });
  };

  const clearAllData = () => {
    // Keep 1 default account so app is usable immediately
    const cleanAccounts: Account[] = [
      { id: 'acc-cash', name: 'Cash', type: 'cash', openingBalance: 0, color: '#f59e0b', icon: 'Wallet' },
      { id: 'acc-bank', name: 'Main Bank Account', type: 'bank', openingBalance: 0, color: '#0284c7', icon: 'Building2' },
      { id: 'acc-upi', name: 'UPI', type: 'upi', openingBalance: 0, color: '#10b981', icon: 'Smartphone' },
    ];
    setAccounts(cleanAccounts);
    setTransactions([]);
    setPeople([]);
    setEmis([]);
    setBudgets([]);
    addToast({
      title: 'All Data Cleared',
      description: 'Your transactions and records have been wiped clean.',
      type: 'warning',
    });
  };

  return (
    <FinanceContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedMonth,
        setSelectedMonth,
        accounts,
        transactions,
        people,
        emis,
        budgets,
        categories,
        settings,
        accountsWithBalances,
        totalBalance,
        peopleSummaries,
        debtTotals,
        emiStatuses,
        budgetUsages,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addPerson,
        updatePerson,
        deletePerson,
        addEmiPlan,
        updateEmiPlan,
        deleteEmiPlan,
        payEmi,
        setCategoryBudget,
        deleteBudget,
        deleteCategoryBudget,
        addCategory,
        deleteCategory,
        updateSettings,
        toggleTheme,
        isQuickAddOpen,
        quickAddInitialType,
        quickAddPrefill,
        openQuickAdd,
        closeQuickAdd,
        isTransferOpen,
        openTransferModal,
        closeTransferModal,
        selectedPersonId,
        setSelectedPersonId,
        searchQuery,
        setSearchQuery,
        resetToSampleData,
        resetToDefaultData: resetToSampleData,
        clearAllData,
        exportDataJSON,
        exportDataJson: () => JSON.stringify({
          version: '1.0',
          exportDate: new Date().toISOString(),
          accounts,
          transactions,
          people,
          emis,
          budgets,
          categories,
          settings,
        }, null, 2),
        importDataJSON,
        importDataJson: importDataJSON,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
