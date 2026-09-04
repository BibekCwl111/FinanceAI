import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  X,
  History,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { EmiPlan } from '../types/finance';
import { formatCurrency, formatDate, formatMonthName, getTodayDateString } from '../utils/formatters';
import { MetricCard } from '../components/common/MetricCard';
import { EmptyState } from '../components/common/EmptyState';

export const EmiPage: React.FC = () => {
  const {
    emis,
    emiStatuses,
    transactions,
    accounts,
    selectedMonth,
    addEmiPlan,
    deleteEmiPlan,
    payEmi,
  } = useFinance();

  const [isAddEmiOpen, setIsAddEmiOpen] = useState(false);
  const [newEmiName, setNewEmiName] = useState('');
  const [newEmiAmount, setNewEmiAmount] = useState('');
  const [newEmiDueDay, setNewEmiDueDay] = useState('10');
  const [newEmiStartDate, setNewEmiStartDate] = useState(getTodayDateString());
  const [newEmiEndDate, setNewEmiEndDate] = useState('');
  const [newEmiAccountId, setNewEmiAccountId] = useState(accounts[0]?.id || '');
  const [newEmiNote, setNewEmiNote] = useState('');

  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  // Aggregate stats
  const totalEmiObligation = useMemo(() => {
    return emiStatuses.reduce((sum, e) => sum + e.amount, 0);
  }, [emiStatuses]);

  const paidEmisCount = useMemo(() => {
    return emiStatuses.filter((e) => e.isPaidThisMonth).length;
  }, [emiStatuses]);

  const pendingEmisCount = emiStatuses.length - paidEmisCount;

  // EMI Transaction History (all transactions where type === 'emi' or category === 'EMI')
  const emiHistory = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'emi' || tx.category?.toLowerCase() === 'emi')
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  const handleCreateEmi = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newEmiAmount);
    const dueDay = parseInt(newEmiDueDay, 10);
    if (!newEmiName.trim() || isNaN(amt) || amt <= 0 || isNaN(dueDay)) return;

    // Default 12 month tenure if end date not set
    let endDate = newEmiEndDate;
    if (!endDate) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      endDate = d.toISOString().slice(0, 10);
    }

    addEmiPlan({
      name: newEmiName.trim(),
      amount: amt,
      dueDay,
      startDate: newEmiStartDate,
      endDate,
      defaultAccountId: newEmiAccountId || accounts[0]?.id || '',
      category: 'EMI',
      note: newEmiNote.trim() || undefined,
    });

    setIsAddEmiOpen(false);
    setNewEmiName('');
    setNewEmiAmount('');
    setNewEmiNote('');
  };

  return (
    <div id="emi-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            EMI & Loan Management
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track installments, payment due dates, and mark monthly payments with 1-click
          </p>
        </div>

        <button
          id="add-emi-plan-btn"
          onClick={() => setIsAddEmiOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add EMI Plan
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Monthly EMI"
          amount={formatCurrency(totalEmiObligation)}
          subtitle={`Across ${emis.length} active plans`}
          icon={<CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
        />

        <MetricCard
          title="Pending This Month"
          amount={`${pendingEmisCount} Plan${pendingEmisCount === 1 ? '' : 's'}`}
          subtitle={formatMonthName(selectedMonth)}
          badge={{ text: pendingEmisCount > 0 ? 'Due' : 'All Settled', variant: pendingEmisCount > 0 ? 'warning' : 'positive' }}
          icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
        />

        <MetricCard
          title="Paid This Month"
          amount={`${paidEmisCount} Paid`}
          subtitle={formatMonthName(selectedMonth)}
          badge={{ text: 'Completed', variant: 'positive' }}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
        />

        <MetricCard
          title="Total Plans"
          amount={emis.length.toString()}
          subtitle="Configured plans"
          icon={<CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          iconBgColor="bg-indigo-50 dark:bg-indigo-950/60"
        />
      </div>

      {/* EMI Active Plans Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Monthly Installments ({formatMonthName(selectedMonth)})
        </h3>

        {emiStatuses.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-6 h-6" />}
            title="No EMI plans added yet"
            description="Add your device loans, credit card EMIs, or personal loan installment schedules."
            actionLabel="Add EMI Plan"
            onAction={() => setIsAddEmiOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emiStatuses.map((emi) => {
              return (
                <div
                  key={emi.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                    emi.isPaidThisMonth
                      ? 'border-emerald-200/80 dark:border-emerald-900/60'
                      : emi.isOverdue
                      ? 'border-rose-300 dark:border-rose-900/80'
                      : 'border-zinc-200/80 dark:border-zinc-800'
                  }`}
                >
                  <div>
                    {/* Top Row: Title & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {emi.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Due on {emi.dueDay}th of every month
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          emi.isPaidThisMonth
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : emi.isOverdue
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {emi.isPaidThisMonth
                          ? 'PAID'
                          : emi.isOverdue
                          ? 'OVERDUE'
                          : `DUE IN ${emi.daysUntilDue} DAYS`}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="mt-4">
                      <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(emi.amount)}
                        <span className="text-xs font-normal text-zinc-400">/month</span>
                      </p>
                    </div>

                    {/* Meta Details */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex justify-between">
                        <span>Account:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {accountMap.get(emi.defaultAccountId) || 'Default Account'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tenure / End:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          Until {emi.endDate}
                        </span>
                      </div>
                      {emi.note && (
                        <div className="text-[11px] text-zinc-400 pt-1">
                          {emi.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => deleteEmiPlan(emi.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {emi.isPaidThisMonth ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Paid on {formatDate(emi.paidDate || '')}
                      </span>
                    ) : (
                      <button
                        id={`pay-emi-btn-${emi.id}`}
                        onClick={() => payEmi(emi.id)}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        Pay EMI (₹{emi.amount.toLocaleString('en-IN')})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EMI Payment History */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-500" /> EMI Payment Records
            </h3>
            <p className="text-xs text-zinc-400">
              Historical ledger of EMI payments deducted from accounts
            </p>
          </div>
        </div>

        {emiHistory.length === 0 ? (
          <p className="text-xs text-zinc-400 py-4 text-center">
            No EMI payments recorded yet. Click "Pay EMI" on any active plan above.
          </p>
        ) : (
          <div className="space-y-2">
            {emiHistory.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      {tx.note || tx.subcategory || 'EMI Installment'}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {formatDate(tx.date)} • Deducted from {accountMap.get(tx.accountId)}
                    </p>
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

      {/* Add EMI Modal */}
      {isAddEmiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                New EMI Plan
              </h3>
              <button
                onClick={() => setIsAddEmiOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmi} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. MacBook EMI, Car Loan, Phone"
                  value={newEmiName}
                  onChange={(e) => setNewEmiName(e.target.value)}
                  required
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Monthly Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="2500"
                    value={newEmiAmount}
                    onChange={(e) => setNewEmiAmount(e.target.value)}
                    required
                    className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newEmiDueDay}
                    onChange={(e) => setNewEmiDueDay(e.target.value)}
                    required
                    className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Payment Account
                </label>
                <select
                  value={newEmiAccountId}
                  onChange={(e) => setNewEmiAccountId(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newEmiStartDate}
                    onChange={(e) => setNewEmiStartDate(e.target.value)}
                    required
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEmiEndDate}
                    onChange={(e) => setNewEmiEndDate(e.target.value)}
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12-month tenure with HDFC"
                  value={newEmiNote}
                  onChange={(e) => setNewEmiNote(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmiOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
