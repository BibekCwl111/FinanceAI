export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'lend'      // Lending money to someone (You gave money, they owe you)
  | 'receive'   // Receiving debt repayment (They paid you back)
  | 'borrow'    // Borrowing money from someone (You got money, you owe them)
  | 'repay'     // Repaying your debt to someone (You paid them back)
  | 'emi';      // EMI payment (Expense + marks EMI as paid)

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  category?: string;
  subcategory?: string;
  accountId: string; // Source account (or destination account for income/receive/borrow)
  toAccountId?: string; // For transfers
  personId?: string; // For lend, receive, borrow, repay
  emiId?: string; // For EMI payments
  note?: string;
  createdAt: number;
}

export type AccountType = 'bank' | 'cash' | 'upi' | 'wallet' | 'card' | 'savings' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  initialBalance?: number;
  accountNumberMask?: string;
  color?: string;
  icon?: string;
  note?: string;
}

export interface Person {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  openingReceivable?: number; // Pre-existing money they owe you
  openingPayable?: number;    // Pre-existing money you owe them
  createdAt: number;
}

export interface EmiPlan {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 - 31
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  defaultAccountId: string;
  category: string;
  note?: string;
  totalTenureMonths?: number;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  category: string;
  amount: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  subcategories: string[];
  isCustom?: boolean;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
}

export interface PersonLedgerSummary {
  person: Person;
  totalLent: number;
  totalReceived: number;
  remainingReceivable: number;
  totalBorrowed: number;
  totalRepaid: number;
  remainingPayable: number;
  netPosition: number; // Positive = they owe you, Negative = you owe them
  lastActivityDate?: string;
}

export interface AccountWithBalance extends Account {
  currentBalance: number;
  totalIn: number;
  totalOut: number;
}

export interface EmiWithStatus extends EmiPlan {
  isPaidThisMonth: boolean;
  paidTransactionId?: string;
  paidDate?: string;
  daysUntilDue: number;
  isOverdue: boolean;
  monthsRemaining: number;
  totalPaidAmount: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type PageView =
  | 'dashboard'
  | 'transactions'
  | 'income'
  | 'expenses'
  | 'grocery'
  | 'emi'
  | 'people'
  | 'accounts'
  | 'budget'
  | 'reports'
  | 'settings';
