import {
  Account,
  AppSettings,
  Budget,
  Category,
  EmiPlan,
  Person,
  Transaction,
} from '../types/finance';
import { getCurrentMonthKey, getTodayDateString } from '../utils/formatters';

export const DEFAULT_SETTINGS: AppSettings = {
  currency: '₹',
  currencySymbol: '₹',
  theme: 'light',
  dateFormat: 'DD/MM/YYYY',
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-bank',
    name: 'HDFC Bank',
    type: 'bank',
    openingBalance: 42000,
    accountNumberMask: '•••• 4892',
    color: '#0284c7', // Sky blue
    icon: 'Building2',
  },
  {
    id: 'acc-upi',
    name: 'UPI (GPay / PhonePe)',
    type: 'upi',
    openingBalance: 7500,
    color: '#10b981', // Emerald
    icon: 'Smartphone',
  },
  {
    id: 'acc-cash',
    name: 'Cash Wallet',
    type: 'cash',
    openingBalance: 3200,
    color: '#f59e0b', // Amber
    icon: 'Wallet',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-grocery',
    name: 'Grocery',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#059669',
    subcategories: ['Rice & Grains', 'Dal & Pulses', 'Vegetables', 'Fruits', 'Cooking Oil', 'Dairy & Milk', 'Spices & Staples', 'Snacks'],
  },
  {
    id: 'cat-food',
    name: 'Food',
    type: 'expense',
    icon: 'Utensils',
    color: '#f97316',
    subcategories: ['Restaurant', 'Coffee & Tea', 'Office Lunch', 'Takeout', 'Bakery'],
  },
  {
    id: 'cat-travel',
    name: 'Travel',
    type: 'expense',
    icon: 'Car',
    color: '#3b82f6',
    subcategories: ['Metro / Train', 'Cab / Auto', 'Fuel / Petrol', 'Flight', 'Bus'],
  },
  {
    id: 'cat-rent',
    name: 'Rent',
    type: 'expense',
    icon: 'Home',
    color: '#6366f1',
    subcategories: ['House Rent', 'Maintenance'],
  },
  {
    id: 'cat-education',
    name: 'Education',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#8b5cf6',
    subcategories: ['Books & Supplies', 'Courses', 'Tuition Fees', 'Certification'],
  },
  {
    id: 'cat-electricity',
    name: 'Electricity',
    type: 'expense',
    icon: 'Zap',
    color: '#eab308',
    subcategories: ['Electricity Bill', 'Inverter'],
  },
  {
    id: 'cat-internet',
    name: 'Internet',
    type: 'expense',
    icon: 'Wifi',
    color: '#06b6d4',
    subcategories: ['Broadband', 'Mobile Hotspot'],
  },
  {
    id: 'cat-mobile',
    name: 'Mobile',
    type: 'expense',
    icon: 'PhoneCall',
    color: '#14b8a6',
    subcategories: ['Recharge', 'Postpaid Bill'],
  },
  {
    id: 'cat-shopping',
    name: 'Shopping',
    type: 'expense',
    icon: 'ShoppingBasket',
    color: '#ec4899',
    subcategories: ['Clothing', 'Electronics', 'Footwear', 'Home Decor'],
  },
  {
    id: 'cat-medical',
    name: 'Medical',
    type: 'expense',
    icon: 'Stethoscope',
    color: '#ef4444',
    subcategories: ['Pharmacy / Medicines', 'Doctor Consultation', 'Lab Tests'],
  },
  {
    id: 'cat-emi',
    name: 'EMI',
    type: 'expense',
    icon: 'CreditCard',
    color: '#dc2626',
    subcategories: ['Laptop EMI', 'Smartphone EMI', 'Personal Loan', 'Vehicle EMI'],
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    type: 'expense',
    icon: 'Film',
    color: '#a855f7',
    subcategories: ['Streaming (Netflix/Hotstar)', 'Movie Tickets', 'Gaming'],
  },
  {
    id: 'cat-other-exp',
    name: 'Other',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#64748b',
    subcategories: ['General', 'Donation', 'Misc'],
  },
  // Income categories
  {
    id: 'cat-salary',
    name: 'Salary',
    type: 'income',
    icon: 'Briefcase',
    color: '#10b981',
    subcategories: ['Monthly Salary', 'Bonus', 'Incentive'],
  },
  {
    id: 'cat-tuition',
    name: 'Tuition',
    type: 'income',
    icon: 'BookOpen',
    color: '#0ea5e9',
    subcategories: ['Private Tutoring', 'Batch Coaching'],
  },
  {
    id: 'cat-freelance',
    name: 'Freelance',
    type: 'income',
    icon: 'Code',
    color: '#8b5cf6',
    subcategories: ['Web Design', 'Content Writing', 'Consulting'],
  },
  {
    id: 'cat-project',
    name: 'Project',
    type: 'income',
    icon: 'Layers',
    color: '#f59e0b',
    subcategories: ['Milestone 1', 'Milestone 2', 'Delivery'],
  },
  {
    id: 'cat-other-inc',
    name: 'Other',
    type: 'income',
    icon: 'DollarSign',
    color: '#10b981',
    subcategories: ['Cashback', 'Refund', 'Interest'],
  },
];

export const INITIAL_PEOPLE: Person[] = [
  {
    id: 'person-rahul',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    note: 'College classmate (owed for concert trip)',
    openingReceivable: 0,
    openingPayable: 0,
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'person-amit',
    name: 'Amit Patel',
    phone: '+91 98223 11445',
    note: 'Neighbour (borrowed for car repair)',
    openingReceivable: 0,
    openingPayable: 0,
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'person-priya',
    name: 'Priya Verma',
    phone: '+91 99887 76655',
    note: 'Coworker (team lunch split)',
    openingReceivable: 0,
    openingPayable: 0,
    createdAt: Date.now() - 15 * 86400000,
  },
];

export const INITIAL_EMIS: EmiPlan[] = [
  {
    id: 'emi-laptop',
    name: 'MacBook / Laptop EMI',
    amount: 2500,
    dueDay: 10,
    startDate: '2026-01-10',
    endDate: '2026-12-10',
    defaultAccountId: 'acc-bank',
    category: 'EMI',
    note: '12-month no-cost EMI from HDFC card',
    totalTenureMonths: 12,
  },
  {
    id: 'emi-phone',
    name: 'Smartphone EMI',
    amount: 1800,
    dueDay: 22,
    startDate: '2026-03-22',
    endDate: '2026-11-22',
    defaultAccountId: 'acc-upi',
    category: 'EMI',
    note: '9-month tenure via Bajaj Finance',
    totalTenureMonths: 9,
  },
];

export function getInitialBudgets(): Budget[] {
  const currentMonth = getCurrentMonthKey();
  return [
    { id: 'b-1', month: currentMonth, category: 'Grocery', amount: 5000 },
    { id: 'b-2', month: currentMonth, category: 'Food', amount: 3500 },
    { id: 'b-3', month: currentMonth, category: 'Travel', amount: 2000 },
    { id: 'b-4', month: currentMonth, category: 'Shopping', amount: 4000 },
    { id: 'b-5', month: currentMonth, category: 'Entertainment', amount: 1500 },
    { id: 'b-6', month: currentMonth, category: 'Electricity', amount: 1500 },
  ];
}

export function getInitialTransactions(): Transaction[] {
  const today = getTodayDateString();
  const [year, month] = today.split('-');
  const prevMonthNum = Number(month) === 1 ? 12 : Number(month) - 1;
  const prevYearNum = Number(month) === 1 ? Number(year) - 1 : Number(year);
  const prevMonth = `${prevYearNum}-${String(prevMonthNum).padStart(2, '0')}`;

  return [
    // Income
    {
      id: 'tx-1',
      type: 'income',
      amount: 45000,
      date: `${year}-${month}-01`,
      category: 'Salary',
      subcategory: 'Monthly Salary',
      accountId: 'acc-bank',
      note: 'Tech Corp monthly salary credited',
      createdAt: Date.now() - 10 * 86400000,
    },
    {
      id: 'tx-2',
      type: 'income',
      amount: 6000,
      date: `${year}-${month}-03`,
      category: 'Tuition',
      subcategory: 'Batch Coaching',
      accountId: 'acc-bank',
      note: 'Tuition fees from 3 physics students',
      createdAt: Date.now() - 8 * 86400000,
    },
    // Grocery
    {
      id: 'tx-3',
      type: 'expense',
      amount: 1150,
      date: `${year}-${month}-02`,
      category: 'Grocery',
      subcategory: 'Rice & Grains',
      accountId: 'acc-upi',
      note: 'Basmati Rice (5kg) & Toor Dal (2kg)',
      createdAt: Date.now() - 9 * 86400000,
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 480,
      date: `${year}-${month}-04`,
      category: 'Grocery',
      subcategory: 'Vegetables',
      accountId: 'acc-upi',
      note: 'Potatoes, Tomatoes, Spinach & Onions',
      createdAt: Date.now() - 7 * 86400000,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 650,
      date: `${year}-${month}-05`,
      category: 'Grocery',
      subcategory: 'Cooking Oil',
      accountId: 'acc-cash',
      note: 'Mustard oil (2L) & Spices pouch',
      createdAt: Date.now() - 6 * 86400000,
    },
    // General Expenses
    {
      id: 'tx-6',
      type: 'expense',
      amount: 850,
      date: `${year}-${month}-03`,
      category: 'Food',
      subcategory: 'Restaurant',
      accountId: 'acc-upi',
      note: 'Weekend dinner with collegues',
      createdAt: Date.now() - 8 * 86400000,
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 500,
      date: `${year}-${month}-02`,
      category: 'Travel',
      subcategory: 'Metro / Train',
      accountId: 'acc-upi',
      note: 'Monthly Metro Smart Card recharge',
      createdAt: Date.now() - 9 * 86400000,
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 799,
      date: `${year}-${month}-04`,
      category: 'Internet',
      subcategory: 'Broadband',
      accountId: 'acc-bank',
      note: 'Airtel Fiber 100Mbps bill',
      createdAt: Date.now() - 7 * 86400000,
    },
    // Inter-account transfer: Bank to UPI (₹3,000)
    {
      id: 'tx-9',
      type: 'transfer',
      amount: 3000,
      date: `${year}-${month}-02`,
      accountId: 'acc-bank',
      toAccountId: 'acc-upi',
      note: 'Transferred spending budget to UPI',
      createdAt: Date.now() - 9 * 86400000,
    },
    // Lending to Rahul: ₹3,000 from Bank
    {
      id: 'tx-10',
      type: 'lend',
      amount: 3000,
      date: `${prevMonth}-20`,
      accountId: 'acc-bank',
      personId: 'person-rahul',
      note: 'Lent for urgent medical emergency',
      createdAt: Date.now() - 25 * 86400000,
    },
    // Rahul returned: ₹1,000 back to UPI
    {
      id: 'tx-11',
      type: 'receive',
      amount: 1000,
      date: `${year}-${month}-04`,
      accountId: 'acc-upi',
      personId: 'person-rahul',
      note: 'Rahul partial repayment via Google Pay',
      createdAt: Date.now() - 7 * 86400000,
    },
    // Borrowed from Amit: ₹2,000 to Cash
    {
      id: 'tx-12',
      type: 'borrow',
      amount: 2000,
      date: `${prevMonth}-28`,
      accountId: 'acc-cash',
      personId: 'person-amit',
      note: 'Borrowed for car towing service',
      createdAt: Date.now() - 18 * 86400000,
    },
    // Repaid Amit: ₹500 from Bank
    {
      id: 'tx-13',
      type: 'repay',
      amount: 500,
      date: `${year}-${month}-03`,
      accountId: 'acc-bank',
      personId: 'person-amit',
      note: 'Repaid first installment to Amit',
      createdAt: Date.now() - 8 * 86400000,
    },
    // Priya split: Lent ₹450
    {
      id: 'tx-14',
      type: 'lend',
      amount: 450,
      date: `${year}-${month}-05`,
      accountId: 'acc-upi',
      personId: 'person-priya',
      note: 'Priya share of team coffee & snacks',
      createdAt: Date.now() - 6 * 86400000,
    },
    // EMI Payment for Laptop (₹2,500)
    {
      id: 'tx-15',
      type: 'emi',
      amount: 2500,
      date: `${year}-${month}-10`,
      category: 'EMI',
      subcategory: 'Laptop EMI',
      accountId: 'acc-bank',
      emiId: 'emi-laptop',
      note: 'MacBook / Laptop EMI auto-debit',
      createdAt: Date.now() - 5 * 86400000,
    },
  ];
}
