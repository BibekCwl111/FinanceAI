import React, { useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  UserCheck,
  CreditCard,
  PieChart as PieChartIcon,
  ChevronRight,
  ArrowLeftRight,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { MetricCard } from '../components/common/MetricCard';
import {
  IncomeVsExpenseBarChart,
  ExpenseDonutChart,
  SpendingTrendChart,
} from '../components/charts/FinanceCharts';
import {
  calculateCategoryExpenses,
  calculateMonthlyTrends,
  calculateSummaryMetrics,
} from '../utils/calculations';
import {
  formatCurrency,
  formatDate,
  formatMonthName,
} from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const {
    totalBalance,
    transactions,
    selectedMonth,
    debtTotals,
    emiStatuses,
    budgetUsages,
    setCurrentPage,
    openQuickAdd,
    openTransferModal,
    setSelectedPersonId,
  } = useFinance();

  // Transactions for the selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Income, expense, savings metrics for the selected month
  const metrics = useMemo(() => {
    return calculateSummaryMetrics(monthTransactions);
  }, [monthTransactions]);

  // Overall monthly trends (last 6 months)
  const trendsData = useMemo(() => {
    return calculateMonthlyTrends(transactions, 6);
  }, [transactions]);

  // Expense breakdown for current month
  const categoryExpenses = useMemo(() => {
    return calculateCategoryExpenses(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Recent 6 transactions across all types
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
      .slice(0, 6);
  }, [transactions]);

  // Next upcoming EMI
  const nextEmi = emiStatuses.find((e) => !e.isPaidThisMonth);
  const totalEmiThisMonth = emiStatuses.reduce((s, e) => s + e.amount, 0);

  // Overall budget progress this month
  const totalBudgeted = budgetUsages.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpentInBudget = budgetUsages.reduce((sum, b) => sum + b.spentAmount, 0);
  const overallBudgetPercentage = totalBudgeted > 0 ? (totalSpentInBudget / totalBudgeted) * 100 : 0;

  return (
    <div id="dashboard-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Financial Overview
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Showing performance and ledger balances for {formatMonthName(selectedMonth)}
          </p>
        </div>

        {/* Fast Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openTransferModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Transfer
          </button>
          <button
            onClick={() => openQuickAdd('income')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            + Income
          </button>
          <button
            onClick={() => openQuickAdd('expense')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40 text-xs font-semibold rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            + Expense
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="metric-total-balance"
          title="Total Balance"
          amount={formatCurrency(totalBalance)}
          subtitle="Across all accounts"
          icon={<Wallet className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />}
          iconBgColor="bg-zinc-100 dark:bg-zinc-800"
          onClick={() => setCurrentPage('accounts')}
        />

        <MetricCard
          id="metric-monthly-income"
          title="Monthly Income"
          amount={formatCurrency(metrics.income)}
          subtitle={formatMonthName(selectedMonth)}
          badge={{ text: 'Incoming', variant: 'positive' }}
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          onClick={() => setCurrentPage('income')}
        />

        <MetricCard
          id="metric-monthly-expenses"
          title="Monthly Expenses"
          amount={formatCurrency(metrics.expenses)}
          subtitle={`${categoryExpenses.length} categories`}
          badge={{ text: 'Outflow', variant: 'negative' }}
          icon={<ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/50"
          onClick={() => setCurrentPage('expenses')}
        />

        <MetricCard
          id="metric-monthly-savings"
          title="Monthly Savings"
          amount={formatCurrency(metrics.savings)}
          subtitle={metrics.income > 0 ? `${metrics.savingsRate.toFixed(0)}% savings rate` : 'No income recorded'}
          badge={{
            text: metrics.savings >= 0 ? 'Surplus' : 'Deficit',
            variant: metrics.savings >= 0 ? 'positive' : 'negative',
          }}
          icon={<PiggyBank className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          iconBgColor="bg-indigo-50 dark:bg-indigo-950/50"
          onClick={() => setCurrentPage('reports')}
        />
      </div>

      {/* Secondary 4 Key Insights Cards (Receivables, Payables, EMI, Budget) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money I Will Receive */}
        <div
          onClick={() => setCurrentPage('people')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Money I Will Receive
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {formatCurrency(debtTotals.totalReceivable)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Lent to friends & family
          </p>
        </div>

        {/* Money I Need To Pay */}
        <div
          onClick={() => setCurrentPage('people')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Money I Need To Pay
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {formatCurrency(debtTotals.totalPayable)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Borrowed debts to settle
          </p>
        </div>

        {/* Upcoming EMI */}
        <div
          onClick={() => setCurrentPage('emi')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Upcoming EMI
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {nextEmi ? formatCurrency(nextEmi.amount) : 'All Paid'}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {nextEmi
              ? `${nextEmi.name} (Due ${nextEmi.dueDay}th)`
              : `Total ₹${totalEmiThisMonth.toLocaleString('en-IN')} paid this mo`}
          </p>
        </div>

        {/* Budget Usage */}
        <div
          onClick={() => setCurrentPage('budget')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span className="flex items-center gap-1.5">
              <PieChartIcon className="w-3.5 h-3.5" /> Monthly Budget Usage
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {overallBudgetPercentage.toFixed(0)}%
            </p>
            <span className="text-[11px] text-zinc-400">
              {formatCurrency(totalSpentInBudget)} / {formatCurrency(totalBudgeted)}
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full transition-all ${
                overallBudgetPercentage > 100
                  ? 'bg-rose-500'
                  : overallBudgetPercentage > 80
                  ? 'bg-amber-500'
                  : 'bg-purple-500'
              }`}
              style={{ width: `${Math.min(100, overallBudgetPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Income vs Expenses
              </h3>
              <p className="text-xs text-zinc-400">
                Comparison across recent months
              </p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
              Last 6 Months
            </span>
          </div>
          <IncomeVsExpenseBarChart data={trendsData} />
        </div>

        {/* Category Expense Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Expense Breakdown
              </h3>
              <p className="text-xs text-zinc-400">
                By category for {formatMonthName(selectedMonth)}
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('expenses')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Details
            </button>
          </div>
          <ExpenseDonutChart data={categoryExpenses} />
        </div>
      </div>

      {/* Spending Trend & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-500" /> Spending Trend
              </h3>
              <p className="text-xs text-zinc-400">
                Historical monthly outflow
              </p>
            </div>
          </div>
          <SpendingTrendChart data={trendsData} />
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Transactions
                </h3>
                <p className="text-xs text-zinc-400">
                  Latest recorded financial activity
                </p>
              </div>
              <button
                id="view-all-transactions-btn"
                onClick={() => setCurrentPage('transactions')}
                className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isExpense = tx.type === 'expense' || tx.type === 'emi';
                const isTransfer = tx.type === 'transfer';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-100 dark:border-zinc-800/80"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                            : isExpense
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                            : isTransfer
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : isExpense ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : isTransfer ? (
                          <ArrowLeftRight className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {tx.note || tx.subcategory || tx.category || tx.type.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="capitalize">{tx.category || tx.type}</span>
                          <span>•</span>
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-extrabold ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isExpense
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              onClick={() => openQuickAdd('expense')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              + Record another transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
