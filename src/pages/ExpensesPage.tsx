import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  PieChart as PieChartIcon,
  Plus,
  Filter,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { calculateCategoryExpenses } from '../utils/calculations';
import { formatCurrency, formatDate, formatMonthName } from '../utils/formatters';
import { MetricCard } from '../components/common/MetricCard';
import { EmptyState } from '../components/common/EmptyState';
import { ExpenseDonutChart } from '../components/charts/FinanceCharts';

export const ExpensesPage: React.FC = () => {
  const {
    transactions,
    accounts,
    selectedMonth,
    openQuickAdd,
  } = useFinance();

  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');

  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  // Expenses for the selected month (including emi)
  const monthExpenseTxs = useMemo(() => {
    return transactions
      .filter(
        (tx) =>
          (tx.type === 'expense' || tx.type === 'emi') &&
          tx.date.startsWith(selectedMonth)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth]);

  const monthTotalExpense = useMemo(() => {
    return monthExpenseTxs.reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthExpenseTxs]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryExpenses(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Filtered by selected category pill
  const displayedTxs = useMemo(() => {
    if (selectedCatFilter === 'all') return monthExpenseTxs;
    return monthExpenseTxs.filter((tx) => tx.category === selectedCatFilter);
  }, [monthExpenseTxs, selectedCatFilter]);

  // Highest spending category
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  return (
    <div id="expenses-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Expense Analysis
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Breakdown of all spending, bills, EMI, and living expenses for {formatMonthName(selectedMonth)}
          </p>
        </div>

        <button
          id="add-expense-btn"
          onClick={() => openQuickAdd('expense')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title={`Total Outflow: ${formatMonthName(selectedMonth)}`}
          amount={formatCurrency(monthTotalExpense)}
          subtitle={`${monthExpenseTxs.length} expense entries`}
          badge={{ text: 'Monthly Outflow', variant: 'negative' }}
          icon={<ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/60"
        />

        <MetricCard
          title="Top Expense Category"
          amount={topCategory ? topCategory.name : 'None'}
          subtitle={topCategory ? `${formatCurrency(topCategory.value)} spent` : 'No expenses recorded'}
          icon={<PieChartIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
        />

        <MetricCard
          title="Active Categories"
          amount={`${categoryBreakdown.length} Categories`}
          subtitle="Expense classifications"
          icon={<Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
        />
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Category Share
          </h3>
          <ExpenseDonutChart data={categoryBreakdown} />
        </div>

        {/* Detailed Category Bars */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Spending by Category
              </h3>
              <p className="text-xs text-zinc-400">
                Sorted by highest spend
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Total: {formatCurrency(monthTotalExpense)}
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-zinc-400 py-8 text-center">
              No expenses recorded for {formatMonthName(selectedMonth)}.
            </p>
          ) : (
            <div className="space-y-3.5">
              {categoryBreakdown.map((cat) => {
                const isSelected = selectedCatFilter === cat.name;
                return (
                  <div
                    key={cat.name}
                    onClick={() =>
                      setSelectedCatFilter((prev) => (prev === cat.name ? 'all' : cat.name))
                    }
                    className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
                        : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-zinc-900 dark:text-zinc-100">
                        {cat.name}
                      </span>
                      <span className="font-extrabold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(cat.value)}{' '}
                        <span className="text-[11px] font-normal text-zinc-400">
                          ({cat.percentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>

                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Expense Transactions List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Expense Records ({formatMonthName(selectedMonth)})
            </h3>
            <p className="text-xs text-zinc-400">
              {selectedCatFilter === 'all'
                ? 'All spending transactions'
                : `Filtered by "${selectedCatFilter}"`}
            </p>
          </div>

          {selectedCatFilter !== 'all' && (
            <button
              onClick={() => setSelectedCatFilter('all')}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        {displayedTxs.length === 0 ? (
          <EmptyState
            title="No expense entries"
            description="Record payments for food, rent, shopping, and everyday bills."
            actionLabel="Add Expense"
            onAction={() => openQuickAdd('expense')}
          />
        ) : (
          <div className="space-y-2">
            {displayedTxs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      {tx.note || tx.subcategory || tx.category || 'Expense'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {tx.category}
                      </span>
                      {tx.subcategory && <span>• {tx.subcategory}</span>}
                      <span>•</span>
                      <span>{accountMap.get(tx.accountId)}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
