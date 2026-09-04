import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Download,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  UserCheck,
  CreditCard,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { EmptyState } from '../components/common/EmptyState';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    accounts,
    categories,
    people,
    updateTransaction,
    deleteTransaction,
    openQuickAdd,
    searchQuery,
    setSearchQuery,
    selectedMonth,
  } = useFinance();

  // Filter & Sort states
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // 'all', 'current_month', 'last_month'
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Editing transaction state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Map helpers
  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  const personMap = useMemo(() => {
    return new Map(people.map((p) => [p.id, p.name]));
  }, [people]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(q);
        const catMatch = tx.category?.toLowerCase().includes(q);
        const subMatch = tx.subcategory?.toLowerCase().includes(q);
        const accMatch = accountMap.get(tx.accountId)?.toLowerCase().includes(q);
        const toAccMatch = tx.toAccountId ? accountMap.get(tx.toAccountId)?.toLowerCase().includes(q) : false;
        const personMatch = tx.personId ? personMap.get(tx.personId)?.toLowerCase().includes(q) : false;
        const amtMatch = tx.amount.toString().includes(q);

        if (!noteMatch && !catMatch && !subMatch && !accMatch && !toAccMatch && !personMatch && !amtMatch) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Account filter
      if (selectedAccountId !== 'all' && tx.accountId !== selectedAccountId && tx.toAccountId !== selectedAccountId) {
        return false;
      }

      // Date Filter
      if (selectedDateFilter === 'current_month') {
        if (!tx.date.startsWith(selectedMonth)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const cmp = b.date.localeCompare(a.date);
        return sortDirection === 'desc' ? cmp : -cmp;
      } else {
        const cmp = b.amount - a.amount;
        return sortDirection === 'desc' ? cmp : -cmp;
      }
    });
  }, [
    transactions,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedAccountId,
    selectedDateFilter,
    sortField,
    sortDirection,
    selectedMonth,
    accountMap,
    personMap,
  ]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Subcategory', 'Account', 'To Account', 'Person', 'Note'];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.type,
      tx.amount,
      tx.category || '',
      tx.subcategory || '',
      accountMap.get(tx.accountId) || '',
      tx.toAccountId ? accountMap.get(tx.toAccountId) || '' : '',
      tx.personId ? personMap.get(tx.personId) || '' : '',
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="transactions-page" className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Fast Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Transaction History
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Showing {filteredTransactions.length} of {transactions.length} recorded events
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={() => openQuickAdd('expense')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Row 1: Search & Type Quick Pills */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by note, person, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Type Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full">
            {['all', 'expense', 'income', 'transfer', 'lend', 'receive', 'borrow', 'repay', 'emi'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold uppercase tracking-wider capitalize whitespace-nowrap cursor-pointer transition-colors ${
                  selectedType === t
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category, Account, Date, Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {/* Category */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Time Period
            </label>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Time</option>
              <option value="current_month">This Month ({selectedMonth})</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Sort
            </label>
            <div className="flex items-center gap-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-800 dark:text-zinc-200"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <button
                onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                title={`Sort ${sortDirection === 'desc' ? 'Ascending' : 'Descending'}`}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List / Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try clearing your filters or record a new transaction to start tracking."
          actionLabel="Record Transaction"
          onAction={() => openQuickAdd('expense')}
        />
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-200/70 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Note</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Account / Person</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense' || tx.type === 'emi';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400 font-medium">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-semibold text-zinc-900 dark:text-zinc-100">
                        {tx.note || tx.subcategory || tx.category || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : isExpense
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : isTransfer
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {tx.category ? (
                          <span>
                            {tx.category}
                            {tx.subcategory && (
                              <span className="text-[10px] text-zinc-400 block">
                                {tx.subcategory}
                              </span>
                            )}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">
                        {isTransfer ? (
                          <span>
                            {accountMap.get(tx.accountId)} → {accountMap.get(tx.toAccountId || '')}
                          </span>
                        ) : tx.personId ? (
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {personMap.get(tx.personId)}
                            <span className="text-[10px] font-normal text-zinc-400 block">
                              via {accountMap.get(tx.accountId)}
                            </span>
                          </span>
                        ) : (
                          <span>{accountMap.get(tx.accountId)}</span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-extrabold whitespace-nowrap text-sm ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isExpense
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingTx(tx)}
                            title="Edit transaction"
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(tx.id)}
                            title="Delete transaction"
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense' || tx.type === 'emi';
              const isTransfer = tx.type === 'transfer';

              return (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                          isIncome
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700'
                            : isExpense
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                        }`}
                      >
                        {tx.type}
                      </span>
                      <span className="text-xs text-zinc-400">{formatDate(tx.date)}</span>
                    </div>

                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                      {tx.note || tx.subcategory || tx.category || 'Transaction'}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                      {tx.category && <span>{tx.category}</span>}
                      <span>•</span>
                      <span>{accountMap.get(tx.accountId)}</span>
                      {tx.personId && (
                        <>
                          <span>•</span>
                          <span className="font-semibold">{personMap.get(tx.personId)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-extrabold ${
                        isIncome
                          ? 'text-emerald-600'
                          : isExpense
                          ? 'text-rose-600'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </p>

                    <div className="flex items-center justify-end gap-2 mt-1">
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="p-1 text-zinc-400 hover:text-zinc-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(tx.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? All related account balances, ledgers, and budget totals will be recalculated automatically."
        confirmLabel="Delete"
        isDestructive
        onConfirm={() => {
          if (deleteTargetId) {
            deleteTransaction(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Quick Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Edit Transaction
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTransaction(editingTx.id, {
                  amount: Number(editingTx.amount),
                  date: editingTx.date,
                  category: editingTx.category,
                  subcategory: editingTx.subcategory,
                  note: editingTx.note,
                  accountId: editingTx.accountId,
                });
                setEditingTx(null);
              }}
              className="space-y-3 mt-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  value={editingTx.amount}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })
                  }
                  required
                  className="w-full text-sm font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editingTx.date}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, date: e.target.value })
                  }
                  required
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Account
                </label>
                <select
                  value={editingTx.accountId}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, accountId: e.target.value })
                  }
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 text-zinc-900 dark:text-zinc-100"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Note / Description
                </label>
                <input
                  type="text"
                  value={editingTx.note || ''}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, note: e.target.value })
                  }
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
