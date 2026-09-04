import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  ArrowDownRight,
  ArrowUpRight,
  ShoppingBag,
  CreditCard,
  Users2,
  Wallet2,
  PieChart,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PageView } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface NavItem {
  id: PageView;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, debtTotals, emiStatuses, totalBalance } = useFinance();

  // Count pending EMIs
  const pendingEmis = emiStatuses.filter((e) => !e.isPaidThisMonth).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'income', label: 'Income', icon: <ArrowUpRight className="w-4 h-4 text-emerald-500" /> },
    { id: 'expenses', label: 'Expenses', icon: <ArrowDownRight className="w-4 h-4 text-rose-500" /> },
    { id: 'grocery', label: 'Grocery', icon: <ShoppingBag className="w-4 h-4 text-emerald-600" /> },
    {
      id: 'emi',
      label: 'EMI',
      icon: <CreditCard className="w-4 h-4 text-amber-500" />,
      badge: pendingEmis > 0 ? `${pendingEmis} due` : undefined,
    },
    {
      id: 'people',
      label: 'People',
      icon: <Users2 className="w-4 h-4 text-blue-500" />,
      badge: debtTotals.totalReceivable > 0 ? `+${formatCurrency(debtTotals.totalReceivable)}` : undefined,
    },
    { id: 'accounts', label: 'Accounts', icon: <Wallet2 className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', icon: <PieChart className="w-4 h-4 text-purple-500" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      id="app-sidebar"
      className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80 h-screen sticky top-0 overflow-y-auto select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-xs font-bold text-base tracking-tighter">
            ₹
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              Personal Finance
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">
              Smart Ledger & Tracker
            </p>
          </div>
        </div>

        {/* Mini Balance Banner */}
        <div className="mt-4 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50">
          <p className="text-[10px] font-semibold uppercase text-zinc-400">
            Total Net Balance
          </p>
          <p className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[80px] ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Offline-First • Local Storage</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </aside>
  );
};
