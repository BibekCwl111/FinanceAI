import {
  Account,
  AccountWithBalance,
  Budget,
  EmiPlan,
  EmiWithStatus,
  Person,
  PersonLedgerSummary,
  Transaction,
} from '../types/finance';
import { getCurrentMonthKey } from './formatters';

/**
 * Calculates current balances for all accounts dynamically from transactions
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): AccountWithBalance[] {
  return accounts.map((account) => {
    let currentBalance = account.openingBalance;
    let totalIn = 0;
    let totalOut = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;

      // When this account is the primary account
      if (tx.accountId === account.id) {
        switch (tx.type) {
          case 'income':
          case 'receive': // Someone returned money you lent
          case 'borrow':  // You borrowed money from someone
            currentBalance += amt;
            totalIn += amt;
            break;

          case 'expense':
          case 'emi':
          case 'lend':   // You gave money to someone
          case 'repay':  // You repaid debt to someone
            currentBalance -= amt;
            totalOut += amt;
            break;

          case 'transfer': // Outflow from this account
            currentBalance -= amt;
            totalOut += amt;
            break;
        }
      }

      // When this account is the recipient of an inter-account transfer
      if (tx.type === 'transfer' && tx.toAccountId === account.id) {
        currentBalance += amt;
        totalIn += amt;
      }
    });

    return {
      ...account,
      currentBalance,
      totalIn,
      totalOut,
    };
  });
}

/**
 * Total liquid balance across all accounts
 */
export function calculateTotalBalance(accountsWithBalances: AccountWithBalance[]): number {
  return accountsWithBalances.reduce((sum, acc) => sum + acc.currentBalance, 0);
}

/**
 * Calculate dynamic ledger for each person
 */
export function calculatePeopleSummaries(
  people: Person[],
  transactions: Transaction[]
): PersonLedgerSummary[] {
  return people.map((person) => {
    let totalLent = 0;
    let totalReceived = 0;
    let totalBorrowed = 0;
    let totalRepaid = 0;
    let lastActivityDate: string | undefined;

    const personTxs = transactions
      .filter((tx) => tx.personId === person.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (personTxs.length > 0) {
      lastActivityDate = personTxs[0].date;
    }

    personTxs.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      switch (tx.type) {
        case 'lend':
          totalLent += amt;
          break;
        case 'receive':
          totalReceived += amt;
          break;
        case 'borrow':
          totalBorrowed += amt;
          break;
        case 'repay':
          totalRepaid += amt;
          break;
      }
    });

    const openingRec = Number(person.openingReceivable) || 0;
    const openingPay = Number(person.openingPayable) || 0;

    const remainingReceivable = Math.max(0, (openingRec + totalLent) - totalReceived);
    const remainingPayable = Math.max(0, (openingPay + totalBorrowed) - totalRepaid);
    const netPosition = remainingReceivable - remainingPayable;

    return {
      person,
      totalLent,
      totalReceived,
      remainingReceivable,
      totalBorrowed,
      totalRepaid,
      remainingPayable,
      netPosition,
      lastActivityDate,
    };
  });
}

/**
 * Compute total receivables and payables across all people
 */
export function calculateDebtTotals(peopleSummaries: PersonLedgerSummary[]) {
  const totalReceivable = peopleSummaries.reduce(
    (sum, p) => sum + p.remainingReceivable,
    0
  );
  const totalPayable = peopleSummaries.reduce(
    (sum, p) => sum + p.remainingPayable,
    0
  );
  return {
    totalReceivable,
    totalPayable,
    netDebtPosition: totalReceivable - totalPayable,
  };
}

/**
 * Calculates status of EMIs for the specified month (e.g. 2026-09)
 */
export function calculateEmiStatuses(
  emis: EmiPlan[],
  transactions: Transaction[],
  monthKey: string = getCurrentMonthKey()
): EmiWithStatus[] {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = getCurrentMonthKey();
  const isCurrentMonth = monthKey === currentMonth;

  return emis.map((emi) => {
    // Find transaction for this EMI in this month
    const paidTx = transactions.find(
      (tx) =>
        tx.emiId === emi.id &&
        tx.date.startsWith(monthKey) &&
        (tx.type === 'emi' || tx.type === 'expense')
    );

    const isPaidThisMonth = Boolean(paidTx);

    // Calculate all paid transactions for this EMI across all time
    const allPaidTxs = transactions.filter(
      (tx) => tx.emiId === emi.id && (tx.type === 'emi' || tx.type === 'expense')
    );
    const totalPaidAmount = allPaidTxs.reduce((sum, t) => sum + t.amount, 0);

    // Days until due calculation
    let daysUntilDue = 0;
    let isOverdue = false;

    if (isCurrentMonth) {
      if (currentDay > emi.dueDay && !isPaidThisMonth) {
        isOverdue = true;
        daysUntilDue = currentDay - emi.dueDay;
      } else {
        daysUntilDue = Math.max(0, emi.dueDay - currentDay);
      }
    }

    // Months remaining based on end date
    const [endYear, endMonth] = emi.endDate.split('-').map(Number);
    const [startYear, startMonth] = monthKey.split('-').map(Number);
    const monthsRemaining = Math.max(
      0,
      (endYear - startYear) * 12 + (endMonth - startMonth)
    );

    return {
      ...emi,
      isPaidThisMonth,
      paidTransactionId: paidTx?.id,
      paidDate: paidTx?.date,
      daysUntilDue,
      isOverdue,
      monthsRemaining,
      totalPaidAmount,
    };
  });
}

/**
 * Filter transactions by month or custom date range
 */
export function getMonthlyTransactions(
  transactions: Transaction[],
  monthKey: string = getCurrentMonthKey()
): Transaction[] {
  return transactions.filter((tx) => tx.date.startsWith(monthKey));
}

/**
 * Calculate income, expenses, savings for a given transaction list
 */
export function calculateSummaryMetrics(transactions: Transaction[]) {
  let income = 0;
  let expenses = 0;

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      income += amt;
    } else if (tx.type === 'expense' || tx.type === 'emi') {
      expenses += amt;
    }
  });

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return {
    income,
    expenses,
    savings,
    savingsRate,
  };
}

/**
 * Calculate grocery-specific metrics strictly from transactions where category === 'Grocery'
 */
export function calculateGroceryMetrics(
  transactions: Transaction[],
  selectedMonthKey: string = getCurrentMonthKey()
) {
  const allGroceryTxs = transactions.filter(
    (tx) =>
      tx.category?.toLowerCase() === 'grocery' &&
      (tx.type === 'expense' || tx.type === 'emi')
  );

  const thisMonthGroceryTxs = allGroceryTxs.filter((tx) =>
    tx.date.startsWith(selectedMonthKey)
  );

  const totalGrocerySpending = allGroceryTxs.reduce(
    (sum, tx) => sum + (Number(tx.amount) || 0),
    0
  );
  const thisMonthGrocerySpending = thisMonthGroceryTxs.reduce(
    (sum, tx) => sum + (Number(tx.amount) || 0),
    0
  );

  // Group by months to find average
  const monthlyTotals: Record<string, number> = {};
  allGroceryTxs.forEach((tx) => {
    const m = tx.date.substring(0, 7);
    monthlyTotals[m] = (monthlyTotals[m] || 0) + tx.amount;
  });

  const monthCount = Object.keys(monthlyTotals).length || 1;
  const averageMonthlyGrocery = totalGrocerySpending / monthCount;

  // Subcategory breakdown (or description if subcategory is empty)
  const itemBreakdown: Record<string, number> = {};
  thisMonthGroceryTxs.forEach((tx) => {
    const key = tx.subcategory || tx.note || 'Other';
    itemBreakdown[key] = (itemBreakdown[key] || 0) + tx.amount;
  });

  return {
    totalGrocerySpending,
    thisMonthGrocerySpending,
    averageMonthlyGrocery,
    recentGroceryTxs: thisMonthGroceryTxs.sort((a, b) => b.date.localeCompare(a.date)),
    allGroceryTxs: allGroceryTxs.sort((a, b) => b.date.localeCompare(a.date)),
    itemBreakdown,
  };
}

/**
 * Category breakdown for expenses
 */
export function calculateCategoryExpenses(
  transactions: Transaction[],
  monthKey?: string
): { name: string; amount: number; percentage: number; color?: string }[] {
  const filtered = monthKey
    ? transactions.filter(
        (tx) =>
          tx.date.startsWith(monthKey) &&
          (tx.type === 'expense' || tx.type === 'emi')
      )
    : transactions.filter((tx) => tx.type === 'expense' || tx.type === 'emi');

  const totals: Record<string, number> = {};
  let totalExpense = 0;

  filtered.forEach((tx) => {
    const cat = tx.category || 'Other';
    const amt = Number(tx.amount) || 0;
    totals[cat] = (totals[cat] || 0) + amt;
    totalExpense += amt;
  });

  const result = Object.entries(totals).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
  }));

  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * Income sources breakdown
 */
export function calculateIncomeSources(
  transactions: Transaction[],
  monthKey?: string
): { name: string; amount: number; percentage: number }[] {
  const filtered = monthKey
    ? transactions.filter((tx) => tx.date.startsWith(monthKey) && tx.type === 'income')
    : transactions.filter((tx) => tx.type === 'income');

  const totals: Record<string, number> = {};
  let totalIncome = 0;

  filtered.forEach((tx) => {
    const source = tx.category || tx.subcategory || 'Other';
    const amt = Number(tx.amount) || 0;
    totals[source] = (totals[source] || 0) + amt;
    totalIncome += amt;
  });

  return Object.entries(totals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Monthly trend data (last 6 months)
 */
export function calculateMonthlyTrends(
  transactions: Transaction[],
  numMonths: number = 6
): { monthKey: string; monthName: string; income: number; expenses: number; savings: number }[] {
  const result: { monthKey: string; monthName: string; income: number; expenses: number; savings: number }[] = [];
  const now = new Date();

  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mName = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(d);

    let income = 0;
    let expenses = 0;

    transactions.forEach((tx) => {
      if (tx.date.startsWith(mKey)) {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense' || tx.type === 'emi') expenses += tx.amount;
      }
    });

    result.push({
      monthKey: mKey,
      monthName: mName,
      income,
      expenses,
      savings: income - expenses,
    });
  }

  return result;
}

/**
 * Budget usage calculation
 */
export interface BudgetUsage {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  percentage: number;
  isOverBudget: boolean;
  status: 'good' | 'warning' | 'exceeded'; // warning if >= 80%, exceeded if > 100%
}

export function calculateBudgetUsage(
  budgets: Budget[],
  transactions: Transaction[],
  monthKey: string = getCurrentMonthKey()
): BudgetUsage[] {
  const monthTxs = transactions.filter(
    (tx) => tx.date.startsWith(monthKey) && (tx.type === 'expense' || tx.type === 'emi')
  );

  const spentByCategory: Record<string, number> = {};
  monthTxs.forEach((tx) => {
    const cat = tx.category || 'Other';
    spentByCategory[cat] = (spentByCategory[cat] || 0) + tx.amount;
  });

  return budgets.map((b) => {
    const spent = spentByCategory[b.category] || 0;
    const percentageUsed = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    const remainingAmount = b.amount - spent;
    const isOverBudget = spent > b.amount;

    let status: 'good' | 'warning' | 'exceeded' = 'good';
    if (percentageUsed >= 100) {
      status = 'exceeded';
    } else if (percentageUsed >= 80) {
      status = 'warning';
    }

    return {
      category: b.category,
      budgetAmount: b.amount,
      spentAmount: spent,
      remainingAmount,
      percentageUsed,
      percentage: percentageUsed,
      isOverBudget,
      status,
    };
  });
}
