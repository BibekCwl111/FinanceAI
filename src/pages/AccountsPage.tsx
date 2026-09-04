import React, { useState, useMemo } from 'react';
import {
  Wallet2,
  Building2,
  Banknote,
  Smartphone,
  Plus,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Edit2,
  X,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Account, AccountType } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { MetricCard } from '../components/common/MetricCard';

export const AccountsPage: React.FC = () => {
  const {
    accountsWithBalances,
    totalBalance,
    transactions,
    addAccount,
    updateAccount,
    deleteAccount,
    openTransferModal,
  } = useFinance();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form states for new account
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('bank');
  const [newAccBalance, setNewAccBalance] = useState('0');
  const [newAccNote, setNewAccNote] = useState('');

  // Transactions for selected account
  const activeAccount = accountsWithBalances.find((a) => a.id === selectedAccountId) || accountsWithBalances[0];

  const accountTransactions = useMemo(() => {
    if (!activeAccount) return [];
    return transactions
      .filter((tx) => tx.accountId === activeAccount.id || tx.toAccountId === activeAccount.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, activeAccount]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    addAccount({
      name: newAccName.trim(),
      type: newAccType,
      openingBalance: parseFloat(newAccBalance) || 0,
      note: newAccNote.trim() || undefined,
    });

    setIsAddAccountOpen(false);
    setNewAccName('');
    setNewAccBalance('0');
    setNewAccNote('');
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'cash':
        return <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'upi':
        return <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'wallet':
        return <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'savings':
      default:
        return <Wallet2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <div id="accounts-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Accounts & Wallets
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your bank accounts, cash in hand, and UPI wallets in one unified dashboard
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="accounts-transfer-btn"
            onClick={() => openTransferModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer Funds
          </button>
          <button
            id="add-account-btn"
            onClick={() => setIsAddAccountOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Top Banner Total Net Balance */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-400">
            Consolidated Net Liquid Wealth
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 tracking-tight">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Across {accountsWithBalances.length} active financial accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Accounts Configured
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {accountsWithBalances.length} Connected
            </span>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountsWithBalances.map((acc) => {
          const isSelected = activeAccount?.id === acc.id;

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10'
                  : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {acc.name}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400">
                        {acc.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingAccount(acc)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      title="Edit account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {accountsWithBalances.length > 1 && (
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600"
                        title="Delete account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-semibold uppercase text-zinc-400 block">
                    Current Balance
                  </span>
                  <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {formatCurrency(acc.currentBalance)}
                  </p>
                </div>

                {/* Total In vs Total Out */}
                <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <ArrowDownLeft className="w-3 h-3" /> Inflow
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {formatCurrency(acc.totalIn)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Outflow
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {formatCurrency(acc.totalOut)}
                    </span>
                  </div>
                </div>
              </div>

              {acc.note && (
                <p className="text-[11px] text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 truncate">
                  {acc.note}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Account Ledger & History */}
      {activeAccount && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Transaction Ledger: {activeAccount.name}
              </h3>
              <p className="text-xs text-zinc-400">
                Showing all activity for this specific account
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
              Balance: {formatCurrency(activeAccount.currentBalance)}
            </span>
          </div>

          {accountTransactions.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">
              No transactions recorded for {activeAccount.name} yet.
            </p>
          ) : (
            <div className="space-y-2">
              {accountTransactions.map((tx) => {
                // Check if money entered or exited this specific account
                const isIncoming =
                  tx.type === 'income' ||
                  tx.type === 'receive' ||
                  tx.type === 'borrow' ||
                  (tx.type === 'transfer' && tx.toAccountId === activeAccount.id);

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isIncoming
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                        }`}
                      >
                        {isIncoming ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          {tx.note || tx.subcategory || tx.category || tx.type.toUpperCase()}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {formatDate(tx.date)} • {tx.type}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-sm font-extrabold ${
                        isIncoming
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncoming ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Add New Account
              </h3>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. ICICI Salary, Paytm Wallet, Cash"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  required
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Account Type
                </label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as AccountType)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash in Hand</option>
                  <option value="upi">UPI / Digital Wallet</option>
                  <option value="savings">Savings / Deposit</option>
                  <option value="wallet">Prepaid Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary salary account"
                  value={newAccNote}
                  onChange={(e) => setNewAccNote(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Edit Account
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateAccount(editingAccount.id, {
                  name: editingAccount.name,
                  type: editingAccount.type,
                  openingBalance: Number(editingAccount.openingBalance),
                  note: editingAccount.note,
                });
                setEditingAccount(null);
              }}
              className="space-y-3.5 mt-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={editingAccount.name}
                  onChange={(e) =>
                    setEditingAccount({ ...editingAccount, name: e.target.value })
                  }
                  required
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Opening Balance
                </label>
                <input
                  type="number"
                  step="any"
                  value={editingAccount.openingBalance}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      openingBalance: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3 py-2 text-xs font-medium text-zinc-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl"
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
