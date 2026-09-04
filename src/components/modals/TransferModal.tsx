import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';

export const TransferModal: React.FC = () => {
  const { isTransferOpen, closeTransferModal, accountsWithBalances, addTransaction, addToast } = useFinance();

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isTransferOpen && accountsWithBalances.length >= 2) {
      setFromAccountId(accountsWithBalances[0].id);
      setToAccountId(accountsWithBalances[1].id);
      setAmount('');
      setDate(getTodayDateString());
      setNote('');
    }
  }, [isTransferOpen, accountsWithBalances]);

  if (!isTransferOpen) return null;

  const fromAcc = accountsWithBalances.find((a) => a.id === fromAccountId);
  const toAcc = accountsWithBalances.find((a) => a.id === toAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);

    if (isNaN(numAmt) || numAmt <= 0) {
      addToast({ title: 'Invalid Amount', description: 'Enter amount greater than 0', type: 'error' });
      return;
    }

    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) {
      addToast({ title: 'Invalid Accounts', description: 'Please choose two different accounts.', type: 'error' });
      return;
    }

    if (fromAcc && numAmt > fromAcc.currentBalance) {
      // Friendly warning if balance is lower, but allow if user intends to proceed
    }

    addTransaction({
      type: 'transfer',
      amount: numAmt,
      date,
      accountId: fromAccountId,
      toAccountId,
      note: note || `Transfer: ${fromAcc?.name} → ${toAcc?.name}`,
    });

    closeTransferModal();
  };

  return (
    <div
      id="transfer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="transfer-modal-card"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Transfer Between Accounts
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Internal movement (no expense or income counted)
              </p>
            </div>
          </div>
          <button
            onClick={closeTransferModal}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Visual Account Selector */}
          <div className="flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                From
              </label>
              <select
                id="transfer-from-account"
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
              >
                {accountsWithBalances.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.currentBalance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 text-zinc-400">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                To
              </label>
              <select
                id="transfer-to-account"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
              >
                {accountsWithBalances
                  .filter((a) => a.id !== fromAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.currentBalance)})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Transfer Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-400 font-bold text-sm">₹</span>
              <input
                id="transfer-amount-input"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-50 focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Bank to UPI wallet"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="transfer-submit-btn"
              type="submit"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Complete Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
