import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileNav } from './MobileNav';
import { useFinance } from '../../context/FinanceContext';
import { DashboardPage } from '../../pages/DashboardPage';
import { TransactionsPage } from '../../pages/TransactionsPage';
import { IncomePage } from '../../pages/IncomePage';
import { ExpensesPage } from '../../pages/ExpensesPage';
import { GroceryPage } from '../../pages/GroceryPage';
import { EmiPage } from '../../pages/EmiPage';
import { PeoplePage } from '../../pages/PeoplePage';
import { AccountsPage } from '../../pages/AccountsPage';
import { BudgetPage } from '../../pages/BudgetPage';
import { ReportsPage } from '../../pages/ReportsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { QuickAddModal } from '../modals/QuickAddModal';
import { TransferModal } from '../modals/TransferModal';
import { ToastContainer } from '../common/Toast';

export const Layout: React.FC = () => {
  const { currentPage, toasts, removeToast } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'income':
        return <IncomePage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'grocery':
        return <GroceryPage />;
      case 'emi':
        return <EmiPage />;
      case 'people':
        return <PeoplePage />;
      case 'accounts':
        return <AccountsPage />;
      case 'budget':
        return <BudgetPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <TopNav onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Modals & Portals */}
      <QuickAddModal />
      <TransferModal />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
