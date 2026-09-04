import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  HandCoins,
  Receipt,
  CreditCard,
  UserCheck,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types/finance';
import { getTodayDateString } from '../../utils/formatters';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    closeQuickAdd,
    quickAddInitialType,
    quickAddPrefill,
    accounts,
    categories,
    people,
    emis,
    addTransaction,
    addPerson,
    payEmi,
    addToast,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [category, setCategory] = useState<string>('Grocery');
  const [subcategory, setSubcategory] = useState<string>('');
  const [personId, setPersonId] = useState<string>('');
  const [emiId, setEmiId] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Quick person creation state inside modal
  const [isAddingNewPerson, setIsAddingNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  // Reset and prefill fields when opened
  useEffect(() => {
    if (isQuickAddOpen) {
      setType(quickAddInitialType || 'expense');
      setAmount('');
      setDate(getTodayDateString());
      setAccountId(quickAddPrefill.accountId || accounts[0]?.id || '');
      setToAccountId(accounts.length > 1 ? accounts[1]?.id : '');
      setCategory(quickAddPrefill.category || 'Grocery');
      setSubcategory('');
      setPersonId(quickAddPrefill.personId || people[0]?.id || '');
      setEmiId(quickAddPrefill.emiId || emis[0]?.id || '');
      setNote('');
      setIsAddingNewPerson(false);
      setNewPersonName('');
    }
  }, [isQuickAddOpen, quickAddInitialType, quickAddPrefill, accounts, people, emis]);

  if (!isQuickAddOpen) return null;

  // Filter categories by type
  const activeCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  const selectedCategoryObj = categories.find((c) => c.name === category);

  const handleCreatePersonInline = () => {
    if (!newPersonName.trim()) return;
    const created = addPerson({
      name: newPersonName.trim(),
      openingReceivable: 0,
      openingPayable: 0,
    });
    setPersonId(created.id);
    setIsAddingNewPerson(false);
    setNewPersonName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      addToast({
        title: 'Invalid Amount',
        description: 'Please enter an amount greater than 0.',
        type: 'error',
      });
      return;
    }

    if (!accountId) {
      addToast({
        title: 'Account Required',
        description: 'Please select an account.',
        type: 'error',
      });
      return;
    }

    if (type === 'transfer') {
      if (!toAccountId || toAccountId === accountId) {
        addToast({
          title: 'Invalid Transfer',
          description: 'Destination account must be different from source account.',
          type: 'error',
        });
        return;
      }

      addTransaction({
        type: 'transfer',
        amount: numAmount,
        date,
        accountId,
        toAccountId,
        note: note || 'Account Transfer',
      });
      closeQuickAdd();
      return;
    }

    if (type === 'emi') {
      if (!emiId) {
        addToast({ title: 'Select EMI Plan', type: 'error' });
        return;
      }
      const success = payEmi(emiId, accountId, date, note);
      if (success) {
        closeQuickAdd();
      }
      return;
    }

    if (['lend', 'receive', 'borrow', 'repay'].includes(type)) {
      if (!personId) {
        addToast({
          title: 'Person Required',
          description: 'Please select a person or add a new one.',
          type: 'error',
        });
        return;
      }

      const selectedPerson = people.find((p) => p.id === personId);
      addTransaction({
        type,
        amount: numAmount,
        date,
        accountId,
        personId,
        note: note || `${type.toUpperCase()} with ${selectedPerson?.name || 'Contact'}`,
      });
      closeQuickAdd();
      return;
    }

    // Regular Expense or Income
    addTransaction({
      type,
      amount: numAmount,
      date,
      accountId,
      category,
      subcategory: subcategory || undefined,
      note: note || undefined,
    });

    closeQuickAdd();
  };

  const TYPE_TABS: { id: TransactionType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'expense', label: 'Expense', icon: <ArrowDownRight className="w-3.5 h-3.5" />, color: 'hover:text-rose-600' },
    { id: 'income', label: 'Income', icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: 'hover:text-emerald-600' },
    { id: 'transfer', label: 'Transfer', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, color: 'hover:text-blue-600' },
    { id: 'lend', label: 'Lend', icon: <HandCoins className="w-3.5 h-3.5" />, color: 'hover:text-amber-600' },
    { id: 'receive', label: 'Receive', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'hover:text-emerald-600' },
    { id: 'borrow', label: 'Borrow', icon: <Receipt className="w-3.5 h-3.5" />, color: 'hover:text-purple-600' },
    { id: 'repay', label: 'Repay', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'hover:text-indigo-600' },
    { id: 'emi', label: 'EMI', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'hover:text-rose-600' },
  ];

  return (
    <div
      id="quick-add-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="quick-add-modal-card"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Record Transaction
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Updates balances, budgets, reports, and ledgers automatically
            </p>
          </div>
          <button
            id="quick-add-close-btn"
            onClick={closeQuickAdd}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Type Bar */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl my-4 overflow-x-auto no-scrollbar shrink-0">
          {TYPE_TABS.map((tab) => {
            const isSelected = type === tab.id;
            return (
              <button
                key={tab.id}
                id={`quick-add-type-${tab.id}`}
                type="button"
                onClick={() => setType(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Large Amount Input */}
          <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 text-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Amount
            </label>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-zinc-500">₹</span>
              <input
                id="quick-add-amount-input"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-48 text-3xl font-extrabold text-center bg-transparent border-none focus:outline-hidden text-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          {/* Date & Account row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Date
              </label>
              <input
                id="quick-add-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {type === 'transfer' ? 'From Account' : 'Account'}
              </label>
              <select
                id="quick-add-account-select"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional: Transfer Destination Account */}
          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                To Account
              </label>
              <select
                id="quick-add-to-account-select"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
                className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400"
              >
                <option value="">Select recipient account</option>
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Conditional: Category & Subcategory for Expense/Income */}
          {(type === 'expense' || type === 'income') && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  id="quick-add-category-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory('');
                  }}
                  className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400"
                >
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategories chips */}
              {selectedCategoryObj?.subcategories && selectedCategoryObj.subcategories.length > 0 && (
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Subcategory (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategoryObj.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubcategory(subcategory === sub ? '' : sub)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          subcategory === sub
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent font-semibold'
                            : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conditional: People Selection for Debt / Lending */}
          {['lend', 'receive', 'borrow', 'repay'].includes(type) && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {type === 'lend' || type === 'receive' ? 'Person (Debtor)' : 'Person (Creditor)'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewPerson(!isAddingNewPerson)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  New Contact
                </button>
              </div>

              {isAddingNewPerson ? (
                <div className="flex items-center gap-2 mb-2 animate-in fade-in">
                  <input
                    type="text"
                    placeholder="Enter person name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={handleCreatePersonInline}
                    className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewPerson(false)}
                    className="px-2 py-2 text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  id="quick-add-person-select"
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  required
                  className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="">Select contact</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Conditional: EMI Selection */}
          {type === 'emi' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Select EMI Plan
              </label>
              <select
                id="quick-add-emi-select"
                value={emiId}
                onChange={(e) => {
                  const selected = emis.find((em) => em.id === e.target.value);
                  setEmiId(e.target.value);
                  if (selected) {
                    setAmount(selected.amount.toString());
                    setNote(`${selected.name} monthly EMI`);
                  }
                }}
                required
                className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400"
              >
                {emis.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.name} (₹{em.amount.toLocaleString('en-IN')}/mo - Due {em.dueDay}th)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Note / Description
            </label>
            <input
              id="quick-add-note-input"
              type="text"
              placeholder="e.g. Rice & Dal from supermarket, Metro recharge, Dinner with friends"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="quick-add-submit-btn"
              type="submit"
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
