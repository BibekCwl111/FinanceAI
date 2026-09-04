import React, { useState } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  ShoppingBag,
  Menu,
  X,
  CreditCard,
  Users2,
  Wallet2,
  PieChart,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PageView } from '../../types/finance';

export const MobileNav: React.FC = () => {
  const { currentPage, setCurrentPage, openQuickAdd } = useFinance();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    setIsDrawerOpen(false);
  };

  const moreItems: { id: PageView; label: string; icon: React.ReactNode }[] = [
    { id: 'income', label: 'Income', icon: <ArrowUpRight className="w-5 h-5 text-emerald-500" /> },
    { id: 'expenses', label: 'Expenses', icon: <ArrowDownRight className="w-5 h-5 text-rose-500" /> },
    { id: 'emi', label: 'EMI Plans', icon: <CreditCard className="w-5 h-5 text-amber-500" /> },
    { id: 'people', label: 'People / Debts', icon: <Users2 className="w-5 h-5 text-blue-500" /> },
    { id: 'accounts', label: 'Accounts', icon: <Wallet2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" /> },
    { id: 'budget', label: 'Monthly Budget', icon: <PieChart className="w-5 h-5 text-purple-500" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-5 h-5 text-sky-500" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 text-zinc-500" /> },
  ];

  return (
    <>
      {/* Slide-over drawer for 'More' */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                All Sections
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    currentPage === item.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {item.icon}
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <nav
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-2 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => navigateTo('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            currentPage === 'dashboard'
              ? 'text-zinc-900 dark:text-zinc-50 font-bold'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => navigateTo('transactions')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            currentPage === 'transactions'
              ? 'text-zinc-900 dark:text-zinc-50 font-bold'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>History</span>
        </button>

        {/* Big Center Quick Add Button */}
        <button
          id="mobile-quick-add-btn"
          onClick={() => openQuickAdd('expense')}
          className="relative -top-4 w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          aria-label="Add transaction"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => navigateTo('grocery')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            currentPage === 'grocery'
              ? 'text-zinc-900 dark:text-zinc-50 font-bold'
              : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Grocery</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-medium text-zinc-400 hover:text-zinc-700"
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
