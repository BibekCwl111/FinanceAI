import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Plus,
  Calendar,
  Menu,
  ArrowLeftRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getCurrentMonthKey, formatMonthName } from '../../utils/formatters';

interface TopNavProps {
  onOpenMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileMenu }) => {
  const {
    settings,
    toggleTheme,
    openQuickAdd,
    openTransferModal,
    searchQuery,
    setSearchQuery,
    selectedMonth,
    setSelectedMonth,
    currentPage,
    setCurrentPage,
  } = useFinance();

  // Format today's human-readable date
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  // Available recent months for quick switching
  const getRecentMonths = () => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push(key);
    }
    return list;
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile trigger & Date */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              id="mobile-menu-btn"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Month selector */}
          <div className="flex items-center">
            <select
              id="global-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/70 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
            >
              {getRecentMonths().map((m) => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xs sm:max-w-sm relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search transactions, notes, categories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentPage !== 'transactions' && e.target.value.trim().length > 0) {
                setCurrentPage('transactions');
              }
            }}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all focus:outline-hidden"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Transfer Shortcut */}
          <button
            id="header-transfer-btn"
            onClick={() => openTransferModal()}
            title="Transfer between accounts"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Transfer</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Prominent Quick Add Button */}
          <button
            id="quick-add-header-btn"
            onClick={() => openQuickAdd('expense')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
};
