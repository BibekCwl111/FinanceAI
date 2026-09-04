import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  AlertCircle,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Receipt,
  Search,
  ChevronRight,
  Trash2,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Person } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { MetricCard } from '../components/common/MetricCard';
import { EmptyState } from '../components/common/EmptyState';
import { PersonLedgerModal } from '../components/modals/PersonLedgerModal';

export const PeoplePage: React.FC = () => {
  const {
    people,
    peopleSummaries,
    debtTotals,
    addPerson,
    deletePerson,
    openQuickAdd,
    setSelectedPersonId,
  } = useFinance();

  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'receivable' | 'payable' | 'settled'>('all');
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [newPersonNote, setNewPersonNote] = useState('');

  // Filtered summaries
  const filteredPeople = useMemo(() => {
    return peopleSummaries.filter((summary) => {
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const nameMatch = summary.person.name.toLowerCase().includes(q);
        const phoneMatch = summary.person.phone?.toLowerCase().includes(q);
        const noteMatch = summary.person.note?.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !noteMatch) return false;
      }

      if (activeTab === 'receivable') {
        return summary.remainingReceivable > 0;
      }
      if (activeTab === 'payable') {
        return summary.remainingPayable > 0;
      }
      if (activeTab === 'settled') {
        return summary.remainingReceivable === 0 && summary.remainingPayable === 0;
      }

      return true;
    });
  }, [peopleSummaries, searchFilter, activeTab]);

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    addPerson({
      name: newPersonName.trim(),
      phone: newPersonPhone.trim() || undefined,
      note: newPersonNote.trim() || undefined,
      openingReceivable: 0,
      openingPayable: 0,
    });

    setIsAddPersonOpen(false);
    setNewPersonName('');
    setNewPersonPhone('');
    setNewPersonNote('');
  };

  return (
    <div id="people-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            People & Debt Management
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track receivables (money people owe you), payables (debts you owe), and full ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-person-btn"
            onClick={() => setIsAddPersonOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Money I Will Receive"
          amount={formatCurrency(debtTotals.totalReceivable)}
          subtitle="Total owed to you by others"
          badge={{ text: 'Receivable', variant: 'positive' }}
          icon={<UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
        />

        <MetricCard
          title="Money I Need To Pay"
          amount={formatCurrency(debtTotals.totalPayable)}
          subtitle="Total debts you owe to others"
          badge={{ text: 'Payable', variant: 'negative' }}
          icon={<AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/60"
        />

        <MetricCard
          title="Net Position"
          amount={formatCurrency(debtTotals.netDebtPosition)}
          subtitle={
            debtTotals.netDebtPosition >= 0
              ? 'You are in net surplus'
              : 'You have net liabilities'
          }
          badge={{
            text: debtTotals.netDebtPosition >= 0 ? 'Surplus' : 'Deficit',
            variant: debtTotals.netDebtPosition >= 0 ? 'positive' : 'negative',
          }}
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
        />
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              All ({peopleSummaries.length})
            </button>
            <button
              onClick={() => setActiveTab('receivable')}
              className={`flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'receivable'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Receivables
            </button>
            <button
              onClick={() => setActiveTab('payable')}
              className={`flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'payable'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Payables
            </button>
            <button
              onClick={() => setActiveTab('settled')}
              className={`flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'settled'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Settled
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search contact by name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* People Cards Grid */}
      {filteredPeople.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No contacts found"
          description="Add friends, family, or colleagues you lend to or borrow from."
          actionLabel="Add Contact"
          onAction={() => setIsAddPersonOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((summary) => {
            const { person, remainingReceivable, remainingPayable, netPosition, totalLent, totalReceived } = summary;

            return (
              <div
                key={person.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div>
                  {/* Top Row: Name & Click for Ledger */}
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => setSelectedPersonId(person.id)}
                      className="cursor-pointer group flex-1"
                    >
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1.5 transition-colors">
                        {person.name}
                        <ChevronRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      {person.phone && (
                        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {person.phone}
                        </p>
                      )}
                      {person.note && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                          {person.note}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deletePerson(person.id)}
                      className="text-zinc-400 hover:text-rose-600 p-1"
                      title="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ledger Figures */}
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
                        Receivable
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(remainingReceivable)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase text-rose-600 dark:text-rose-400 block">
                        Payable
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(remainingPayable)}
                      </span>
                    </div>
                  </div>

                  {/* Net Badge */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Net Position:</span>
                    <span
                      className={`font-extrabold ${
                        netPosition > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : netPosition < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-zinc-500'
                      }`}
                    >
                      {netPosition > 0
                        ? `+${formatCurrency(netPosition)} (Receivable)`
                        : netPosition < 0
                        ? `-${formatCurrency(Math.abs(netPosition))} (Payable)`
                        : 'Settled (₹0)'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Receive Money / Pay Money / View Ledger */}
                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPersonId(person.id)}
                    className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    View Ledger
                  </button>

                  <div className="flex items-center gap-1.5">
                    {remainingReceivable > 0 && (
                      <button
                        onClick={() => openQuickAdd('receive', { personId: person.id })}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Receive
                      </button>
                    )}

                    {remainingPayable > 0 && (
                      <button
                        onClick={() => openQuickAdd('repay', { personId: person.id })}
                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Pay
                      </button>
                    )}

                    {remainingReceivable === 0 && remainingPayable === 0 && (
                      <button
                        onClick={() => openQuickAdd('lend', { personId: person.id })}
                        className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Lend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Person Ledger Modal / Sheet */}
      <PersonLedgerModal />

      {/* Add Contact Modal */}
      {isAddPersonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Add Person / Contact
              </h3>
              <button
                onClick={() => setIsAddPersonOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  required
                  autoFocus
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newPersonPhone}
                  onChange={(e) => setNewPersonPhone(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Note / Relationship (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Roommate, Office colleague"
                  value={newPersonNote}
                  onChange={(e) => setNewPersonNote(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPersonOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-zinc-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
