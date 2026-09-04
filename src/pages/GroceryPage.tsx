import React, { useMemo } from 'react';
import {
  ShoppingBag,
  TrendingDown,
  Calendar,
  Plus,
  ArrowDownRight,
  Sparkles,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { calculateGroceryMetrics } from '../utils/calculations';
import { formatCurrency, formatDate, formatMonthName } from '../utils/formatters';
import { MetricCard } from '../components/common/MetricCard';
import { EmptyState } from '../components/common/EmptyState';

export const GroceryPage: React.FC = () => {
  const {
    transactions,
    accounts,
    selectedMonth,
    setSelectedMonth,
    openQuickAdd,
  } = useFinance();

  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  // Derived metrics strictly from transactions where category === 'Grocery'
  const groceryData = useMemo(() => {
    return calculateGroceryMetrics(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const {
    thisMonthGrocerySpending,
    totalGrocerySpending,
    averageMonthlyGrocery,
    recentGroceryTxs,
    itemBreakdown,
  } = groceryData;

  const itemBreakdownList = useMemo(() => {
    return Object.entries(itemBreakdown).sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
  }, [itemBreakdown]);

  return (
    <div id="grocery-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Grocery Expense Tracker
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              Live Aggregated
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Auto-derived from transactions with category "Grocery" (no duplicate database)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-grocery-btn"
            onClick={() => openQuickAdd('expense', { category: 'Grocery' })}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Grocery Purchase
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title={`Grocery: ${formatMonthName(selectedMonth)}`}
          amount={formatCurrency(thisMonthGrocerySpending)}
          subtitle="Total spent this month"
          icon={<ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
        />

        <MetricCard
          title="Average Monthly Grocery"
          amount={formatCurrency(averageMonthlyGrocery)}
          subtitle="Calculated over active months"
          icon={<TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
        />

        <MetricCard
          title="All-Time Grocery Total"
          amount={formatCurrency(totalGrocerySpending)}
          subtitle="Cumulative grocery spending"
          icon={<ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
        />
      </div>

      {/* Two Column Layout: Subcategory Breakdown & Recent Grocery Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subcategory Itemized Summary */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                Category Breakdown
              </h3>
              <p className="text-[11px] text-zinc-400">
                Itemized for {formatMonthName(selectedMonth)}
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {formatCurrency(thisMonthGrocerySpending)}
            </span>
          </div>

          {itemBreakdownList.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">
              No grocery expenses recorded for {formatMonthName(selectedMonth)}.
            </p>
          ) : (
            <div className="space-y-3">
              {itemBreakdownList.map(([item, amt]) => {
                const percentage = thisMonthGrocerySpending > 0 ? (amt / thisMonthGrocerySpending) * 100 : 0;
                return (
                  <div key={item} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {item}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(amt)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 text-right">
                      {percentage.toFixed(0)}% of month
                    </p>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-extrabold text-zinc-900 dark:text-zinc-50">
                <span>Total Month Grocery</span>
                <span>{formatCurrency(thisMonthGrocerySpending)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Purchases List */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Grocery Purchases ({formatMonthName(selectedMonth)})
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Transactions with category = Grocery
                </p>
              </div>
            </div>

            {recentGroceryTxs.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-6 h-6" />}
                title="No grocery expenses this month"
                description="Keep track of your vegetables, dairy, grains and supermarket purchases."
                actionLabel="Add Grocery Item"
                onAction={() => openQuickAdd('expense', { category: 'Grocery' })}
              />
            ) : (
              <div className="space-y-2.5">
                {recentGroceryTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          {tx.note || tx.subcategory || 'Grocery item'}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          {tx.subcategory && (
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {tx.subcategory}
                            </span>
                          )}
                          <span>•</span>
                          <span>{accountMap.get(tx.accountId)}</span>
                          <span>•</span>
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Any transaction marked with category "Grocery" appears here</span>
            <button
              onClick={() => openQuickAdd('expense', { category: 'Grocery' })}
              className="font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
