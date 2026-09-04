import React, { useState, useMemo } from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonthName } from '../utils/formatters';
import { MetricCard } from '../components/common/MetricCard';

export const BudgetPage: React.FC = () => {
  const {
    budgetUsages,
    budgets,
    categories,
    selectedMonth,
    setCategoryBudget,
    deleteCategoryBudget,
  } = useFinance();

  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || '');
  const [budgetAmount, setBudgetAmount] = useState('');

  // Overall totals
  const totalBudget = useMemo(() => {
    return budgetUsages.reduce((sum, b) => sum + b.budgetAmount, 0);
  }, [budgetUsages]);

  const totalSpent = useMemo(() => {
    return budgetUsages.reduce((sum, b) => sum + b.spentAmount, 0);
  }, [budgetUsages]);

  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const overBudgetCount = budgetUsages.filter((b) => b.isOverBudget).length;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(budgetAmount);
    if (!selectedCategory || isNaN(amt) || amt <= 0) return;

    setCategoryBudget(selectedCategory, amt, selectedMonth);
    setIsAddBudgetOpen(false);
    setBudgetAmount('');
  };

  return (
    <div id="budget-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Spending targets and variance for {formatMonthName(selectedMonth)}
          </p>
        </div>

        <button
          id="set-budget-btn"
          onClick={() => setIsAddBudgetOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Set Category Budget
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Planned Budget"
          amount={formatCurrency(totalBudget)}
          subtitle={`Across ${budgetUsages.length} categories`}
          icon={<PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          iconBgColor="bg-purple-50 dark:bg-purple-950/60"
        />

        <MetricCard
          title="Actual Total Spent"
          amount={formatCurrency(totalSpent)}
          subtitle={`${overallPercentage.toFixed(1)}% of allocated budget`}
          badge={{
            text: totalRemaining >= 0 ? 'Within Limits' : 'Exceeded',
            variant: totalRemaining >= 0 ? 'positive' : 'negative',
          }}
          icon={<TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/60"
        />

        <MetricCard
          title="Remaining Allowance"
          amount={formatCurrency(Math.max(0, totalRemaining))}
          subtitle={totalRemaining >= 0 ? 'Unspent capacity' : `Deficit: ${formatCurrency(Math.abs(totalRemaining))}`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
        />

        <MetricCard
          title="Over Budget"
          amount={`${overBudgetCount} Categories`}
          subtitle={overBudgetCount > 0 ? 'Action required' : 'All categories on track'}
          badge={{ text: overBudgetCount > 0 ? 'Alert' : 'Good', variant: overBudgetCount > 0 ? 'negative' : 'positive' }}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
        />
      </div>

      {/* Overall Progress Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Overall Budget Consumption ({formatMonthName(selectedMonth)})
            </h3>
            <p className="text-xs text-zinc-400">
              {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudget)} allocated
            </p>
          </div>
          <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
            {overallPercentage.toFixed(1)}% Used
          </span>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercentage > 100
                ? 'bg-rose-500'
                : overallPercentage > 85
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Category Allocations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetUsages.map((item) => {
            const pct = item.percentage;
            const isOver = item.isOverBudget;

            return (
              <div
                key={item.category}
                className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isOver
                    ? 'border-rose-300 dark:border-rose-900/80 ring-1 ring-rose-500/20'
                    : 'border-zinc-200/80 dark:border-zinc-800'
                }`}
              >
                <div>
                  {/* Top: Category Title & Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {item.category}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Target: {formatCurrency(item.budgetAmount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isOver
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : pct > 85
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {isOver ? 'OVER BUDGET' : `${pct.toFixed(0)}% USED`}
                      </span>

                      <button
                        onClick={() => deleteCategoryBudget(item.category, selectedMonth)}
                        className="p-1 text-zinc-400 hover:text-rose-600"
                        title="Remove budget target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                        Spent
                      </span>
                      <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(item.spentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                        Remaining
                      </span>
                      <p
                        className={`text-sm font-bold ${
                          item.remainingAmount >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {item.remainingAmount >= 0
                          ? formatCurrency(item.remainingAmount)
                          : `-${formatCurrency(Math.abs(item.remainingAmount))}`}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver
                          ? 'bg-rose-500'
                          : pct > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    {isOver
                      ? `Exceeded by ${formatCurrency(item.spentAmount - item.budgetAmount)}`
                      : `${formatCurrency(item.remainingAmount)} left`}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory(item.category);
                      setBudgetAmount(item.budgetAmount.toString());
                      setIsAddBudgetOpen(true);
                    }}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Adjust
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Budget Modal */}
      {isAddBudgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Set Category Budget
              </h3>
              <button
                onClick={() => setIsAddBudgetOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Monthly Budget Limit (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  min="100"
                  placeholder="e.g. 5000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
