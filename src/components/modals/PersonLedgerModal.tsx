import React from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Receipt,
  UserCheck,
  CreditCard,
  Phone,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PersonLedgerModal: React.FC = () => {
  const {
    selectedPersonId,
    setSelectedPersonId,
    peopleSummaries,
    transactions,
    openQuickAdd,
    deleteTransaction,
  } = useFinance();

  if (!selectedPersonId) return null;

  const summary = peopleSummaries.find((p) => p.person.id === selectedPersonId);
  if (!summary) return null;

  const { person, remainingReceivable, remainingPayable, netPosition } = summary;

  // Filter transactions with this person
  const personTransactions = transactions
    .filter((tx) => tx.personId === person.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div
      id="person-ledger-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="person-ledger-dialog"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {person.name}
              </h3>
              {person.phone && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {person.phone}
                </span>
              )}
            </div>
            {person.note && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {person.note}
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedPersonId(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ledger Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-4">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 p-3 rounded-xl">
            <p className="text-[10px] sm:text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
              You will receive
            </p>
            <p className="text-base sm:text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
              {formatCurrency(remainingReceivable)}
            </p>
          </div>

          <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 p-3 rounded-xl">
            <p className="text-[10px] sm:text-xs font-semibold uppercase text-rose-700 dark:text-rose-400">
              You need to pay
            </p>
            <p className="text-base sm:text-xl font-bold text-rose-800 dark:text-rose-200 mt-0.5">
              {formatCurrency(remainingPayable)}
            </p>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              netPosition > 0
                ? 'bg-emerald-100/50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700'
                : netPosition < 0
                ? 'bg-rose-100/50 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <p className="text-[10px] sm:text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">
              Net Balance
            </p>
            <p
              className={`text-base sm:text-xl font-bold mt-0.5 ${
                netPosition > 0
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : netPosition < 0
                  ? 'text-rose-700 dark:text-rose-300'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {netPosition > 0
                ? `+${formatCurrency(netPosition)} (Receivable)`
                : netPosition < 0
                ? `-${formatCurrency(Math.abs(netPosition))} (Payable)`
                : 'Settled (₹0)'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          {remainingReceivable > 0 && (
            <button
              onClick={() => {
                setSelectedPersonId(null);
                openQuickAdd('receive', { personId: person.id });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Receive Money
            </button>
          )}

          {remainingPayable > 0 && (
            <button
              onClick={() => {
                setSelectedPersonId(null);
                openQuickAdd('repay', { personId: person.id });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay Money
            </button>
          )}

          <button
            onClick={() => {
              setSelectedPersonId(null);
              openQuickAdd('lend', { personId: person.id });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <HandCoins className="w-3.5 h-3.5" />
            Lend More
          </button>

          <button
            onClick={() => {
              setSelectedPersonId(null);
              openQuickAdd('borrow', { personId: person.id });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            Borrow More
          </button>
        </div>

        {/* Transaction History Ledger */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Ledger History
          </h4>

          {personTransactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs">
              No transactions recorded with {person.name} yet.
            </div>
          ) : (
            <div className="space-y-2">
              {personTransactions.map((tx) => {
                let badgeText = tx.type.toUpperCase();
                let isCredit = tx.type === 'receive' || tx.type === 'borrow'; // Money came into your account
                let typeColor = 'text-zinc-700 dark:text-zinc-300';

                if (tx.type === 'lend') {
                  badgeText = 'Lent to Person';
                  typeColor = 'text-amber-600 dark:text-amber-400';
                } else if (tx.type === 'receive') {
                  badgeText = 'Received Payment';
                  typeColor = 'text-emerald-600 dark:text-emerald-400';
                } else if (tx.type === 'borrow') {
                  badgeText = 'Borrowed from Person';
                  typeColor = 'text-purple-600 dark:text-purple-400';
                } else if (tx.type === 'repay') {
                  badgeText = 'Repaid Debt';
                  typeColor = 'text-blue-600 dark:text-blue-400';
                }

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isCredit
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${typeColor}`}>
                            {badgeText}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {formatDate(tx.date)}
                          </span>
                        </div>
                        {tx.note && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {tx.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(tx.amount)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        title="Delete entry"
                        className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
