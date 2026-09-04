import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  PieChart as PieChartIcon,
  TrendingUp,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  calculateCategoryExpenses,
  calculateMonthlyTrends,
  calculateSummaryMetrics,
} from '../utils/calculations';
import {
  formatCurrency,
  formatMonthName,
} from '../utils/formatters';
import {
  IncomeVsExpenseBarChart,
  ExpenseDonutChart,
  SpendingTrendChart,
} from '../components/charts/FinanceCharts';
import { MetricCard } from '../components/common/MetricCard';

export const ReportsPage: React.FC = () => {
  const {
    transactions,
    selectedMonth,
    setSelectedMonth,
    debtTotals,
    peopleSummaries,
    totalBalance,
  } = useFinance();

  const [activeReportTab, setActiveReportTab] = useState<'monthly' | 'debt' | 'annual'>('monthly');

  // Month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const metrics = useMemo(() => {
    return calculateSummaryMetrics(monthTransactions);
  }, [monthTransactions]);

  const trends = useMemo(() => {
    return calculateMonthlyTrends(transactions, 12);
  }, [transactions]);

  const categoryExpenses = useMemo(() => {
    return calculateCategoryExpenses(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  // Annual Totals from 12-month trends
  const annualIncome = trends.reduce((s, t) => s + t.income, 0);
  const annualExpense = trends.reduce((s, t) => s + t.expense, 0);
  const annualSavings = annualIncome - annualExpense;
  const annualSavingsRate = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Financial Analytics & Reports
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Holistic breakdown of cashflow, debt ledgers, savings rates, and multi-month trends
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveReportTab('monthly')}
          className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeReportTab === 'monthly'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Monthly Breakdown
        </button>
        <button
          onClick={() => setActiveReportTab('annual')}
          className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeReportTab === 'annual'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Annual / Multi-Month
        </button>
        <button
          onClick={() => setActiveReportTab('debt')}
          className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            activeReportTab === 'debt'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Debt & Counterparty Ledger
        </button>
      </div>

      {/* Tab 1: Monthly Breakdown */}
      {activeReportTab === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <MetricCard
              title="Period Income"
              amount={formatCurrency(metrics.income)}
              subtitle={formatMonthName(selectedMonth)}
              icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
            />

            <MetricCard
              title="Period Expenses"
              amount={formatCurrency(metrics.expenses)}
              subtitle="All outflows"
              icon={<TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              iconBgColor="bg-rose-50 dark:bg-rose-950/60"
            />

            <MetricCard
              title="Net Period Savings"
              amount={formatCurrency(metrics.savings)}
              subtitle={`${metrics.savingsRate.toFixed(1)}% savings rate`}
              badge={{
                text: metrics.savings >= 0 ? 'Surplus' : 'Deficit',
                variant: metrics.savings >= 0 ? 'positive' : 'negative',
              }}
              icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              iconBgColor="bg-blue-50 dark:bg-blue-950/60"
            />

            <MetricCard
              title="Liquid Net Balance"
              amount={formatCurrency(totalBalance)}
              subtitle="Current total"
              icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
              iconBgColor="bg-purple-50 dark:bg-purple-950/60"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Expense Category Distribution
              </h3>
              <ExpenseDonutChart data={categoryExpenses} />
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Category Spending Table
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {categoryExpenses.map((c) => (
                      <tr key={c.name}>
                        <td className="py-2 px-3 font-semibold text-zinc-800 dark:text-zinc-200">
                          {c.name}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(c.value)}
                        </td>
                        <td className="py-2 px-3 text-right text-zinc-500">
                          {c.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Annual & Multi-Month */}
      {activeReportTab === 'annual' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <MetricCard
              title="12-Month Total Income"
              amount={formatCurrency(annualIncome)}
              subtitle="All registered inflows"
              icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
            />

            <MetricCard
              title="12-Month Total Outflow"
              amount={formatCurrency(annualExpense)}
              subtitle="All registered expenses"
              icon={<TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              iconBgColor="bg-rose-50 dark:bg-rose-950/60"
            />

            <MetricCard
              title="12-Month Net Savings"
              amount={formatCurrency(annualSavings)}
              subtitle={`${annualSavingsRate.toFixed(1)}% cumulative rate`}
              icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              iconBgColor="bg-blue-50 dark:bg-blue-950/60"
            />

            <MetricCard
              title="Average Monthly Spend"
              amount={formatCurrency(annualExpense / Math.max(1, trends.length))}
              subtitle="Normalized rate"
              icon={<TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              iconBgColor="bg-amber-50 dark:bg-amber-950/60"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Annual Income vs Expense History
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Monthly inflow and outflow comparison
            </p>
            <IncomeVsExpenseBarChart data={trends} />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Monthly Spending Trajectory
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Monthly expenditure progression
            </p>
            <SpendingTrendChart data={trends} />
          </div>
        </div>
      )}

      {/* Tab 3: Debt & Counterparty Ledger */}
      {activeReportTab === 'debt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Total Receivables"
              amount={formatCurrency(debtTotals.totalReceivable)}
              subtitle="Owed to you"
              badge={{ text: 'Incoming Asset', variant: 'positive' }}
              icon={<UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
            />

            <MetricCard
              title="Total Payables"
              amount={formatCurrency(debtTotals.totalPayable)}
              subtitle="Debts you owe"
              badge={{ text: 'Liability', variant: 'negative' }}
              icon={<AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              iconBgColor="bg-rose-50 dark:bg-rose-950/60"
            />

            <MetricCard
              title="Net Debt Balance"
              amount={formatCurrency(debtTotals.netDebtPosition)}
              subtitle={debtTotals.netDebtPosition >= 0 ? 'Net Receivable' : 'Net Payable'}
              icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              iconBgColor="bg-blue-50 dark:bg-blue-950/60"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Counterparty Breakdown Summary
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="py-2.5 px-3">Person</th>
                    <th className="py-2.5 px-3 text-right">Lent</th>
                    <th className="py-2.5 px-3 text-right">Received Back</th>
                    <th className="py-2.5 px-3 text-right">Remaining Receivable</th>
                    <th className="py-2.5 px-3 text-right">Borrowed</th>
                    <th className="py-2.5 px-3 text-right">Repaid</th>
                    <th className="py-2.5 px-3 text-right">Remaining Payable</th>
                    <th className="py-2.5 px-3 text-right">Net Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {peopleSummaries.map((p) => (
                    <tr key={p.person.id}>
                      <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                        {p.person.name}
                      </td>
                      <td className="py-2.5 px-3 text-right text-zinc-700 dark:text-zinc-300">
                        {formatCurrency(p.totalLent)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600">
                        {formatCurrency(p.totalReceived)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(p.remainingReceivable)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-zinc-700 dark:text-zinc-300">
                        {formatCurrency(p.totalBorrowed)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-600">
                        {formatCurrency(p.totalRepaid)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-rose-700 dark:text-rose-400">
                        {formatCurrency(p.remainingPayable)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-extrabold ${
                          p.netPosition > 0
                            ? 'text-emerald-600'
                            : p.netPosition < 0
                            ? 'text-rose-600'
                            : 'text-zinc-400'
                        }`}
                      >
                        {p.netPosition > 0
                          ? `+${formatCurrency(p.netPosition)}`
                          : p.netPosition < 0
                          ? `-${formatCurrency(Math.abs(p.netPosition))}`
                          : 'Settled'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
