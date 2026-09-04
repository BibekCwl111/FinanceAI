import React, { useMemo } from 'react';
import {
  ArrowUpRight,
  TrendingUp,
  Plus,
  Briefcase,
  Calendar,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, formatMonthName } from '../utils/formatters';
import { MetricCard } from '../components/common/MetricCard';
import { EmptyState } from '../components/common/EmptyState';

export const IncomePage: React.FC = () => {
  const {
    transactions,
    accounts,
    selectedMonth,
    openQuickAdd,
  } = useFinance();

  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  // Income transactions for selected month
  const monthIncomeTxs = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income' && tx.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth]);

  // All time income transactions
  const allIncomeTxs = useMemo(() => {
    return transactions.filter((tx) => tx.type === 'income');
  }, [transactions]);

  const monthTotalIncome = useMemo(() => {
    return monthIncomeTxs.reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthIncomeTxs]);

  const allTimeIncome = useMemo(() => {
    return allIncomeTxs.reduce((sum, tx) => sum + tx.amount, 0);
  }, [allIncomeTxs]);

  // Breakdown by category for selected month
  const sourceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthIncomeTxs.forEach((tx) => {
      const cat = tx.category || 'Other Income';
      map[cat] = (map[cat] || 0) + tx.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthIncomeTxs]);

  return (
    <div id="income-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Income Streams
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Monitor earnings, salary credit, freelancing, dividends, and other inflows
          </p>
        </div>

        <button
          id="add-income-btn"
          onClick={() => openQuickAdd('income')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title={`Income: ${formatMonthName(selectedMonth)}`}
          amount={formatCurrency(monthTotalIncome)}
          subtitle={`${monthIncomeTxs.length} income entries`}
          badge={{ text: 'Current Month', variant: 'positive' }}
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
        />

        <MetricCard
          title="All-Time Total Inflow"
          amount={formatCurrency(allTimeIncome)}
          subtitle="Cumulative tracked income"
          icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
        />

        <MetricCard
          title="Income Streams"
          amount={`${sourceBreakdown.length} Sources`}
          subtitle="Active streams this month"
          icon={<Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-50 dark:bg-purple-950/60"
        />
      </div>

      {/* Layout Grid: Source Breakdown & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Income Sources
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            For {formatMonthName(selectedMonth)}
          </p>

          {sourceBreakdown.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">
              No income entries recorded for this month.
            </p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map(([src, amt]) => {
                const pct = monthTotalIncome > 0 ? (amt / monthTotalIncome) * 100 : 0;
                return (
                  <div key={src} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-800 dark:text-zinc-200">{src}</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                        {formatCurrency(amt)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 text-right">
                      {pct.toFixed(1)}% of total income
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Income Records ({formatMonthName(selectedMonth)})
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            Direct deposits and credits into your accounts
          </p>

          {monthIncomeTxs.length === 0 ? (
            <EmptyState
              icon={<ArrowUpRight className="w-6 h-6" />}
              title="No income recorded this month"
              description="Record your monthly salary, interest, freelance payouts, or other gains."
              actionLabel="Add Income"
              onAction={() => openQuickAdd('income')}
            />
          ) : (
            <div className="space-y-2.5">
              {monthIncomeTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {tx.note || tx.category || 'Income'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {tx.category}
                        </span>
                        <span>•</span>
                        <span>Credited to {accountMap.get(tx.accountId)}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
