import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Tag,
  Moon,
  Sun,
  ShieldAlert,
  CheckCircle2,
  FileJson,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    toggleTheme,
    categories,
    addCategory,
    deleteCategory,
    exportDataJson,
    importDataJson,
    resetToDefaultData,
    clearAllData,
    addToast,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals for clear / reset
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // New Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatSubcategories, setNewCatSubcategories] = useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const subs = newCatSubcategories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      subcategories: subs.length > 0 ? subs : ['General'],
      color: '#6366f1',
      icon: 'Tag',
    });

    setNewCatName('');
    setNewCatSubcategories('');
  };

  const handleExport = () => {
    const jsonString = exportDataJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal-finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addToast({ title: 'Backup Exported', description: 'JSON file saved to your device', type: 'success' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJson(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="settings-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Application Settings & Data Control
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configure preferences, currency display, categories, and complete offline backup/restore
        </p>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-zinc-500" />
          General Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Theme */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Interface Theme
              </p>
              <p className="text-[11px] text-zinc-400">
                Current: {settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Light
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-700" /> Dark
                </>
              )}
            </button>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Currency Standard
              </p>
              <p className="text-[11px] text-zinc-400">
                Current: {settings.currency} ({settings.currencySymbol})
              </p>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => {
                const cur = e.target.value;
                const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
                updateSettings({ currency: cur, currencySymbol: symbols[cur] || '₹' });
              }}
              className="text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 text-zinc-800 dark:text-zinc-200"
            >
              <option value="INR">INR (₹ Indian Rupee)</option>
              <option value="USD">USD ($ US Dollar)</option>
              <option value="EUR">EUR (€ Euro)</option>
              <option value="GBP">GBP (£ British Pound)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Management Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Tag className="w-4 h-4 text-zinc-500" />
          Manage Categories
        </h3>

        {/* Add Category Form */}
        <form
          onSubmit={handleCreateCategory}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800"
        >
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Subscriptions"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
              Type
            </label>
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value as any)}
              className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
              Subcategories (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix, Spotify, iCloud"
              value={newCatSubcategories}
              onChange={(e) => setNewCatSubcategories(e.target.value)}
              className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Add Category
            </button>
          </div>
        </form>

        {/* Categories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-start justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {cat.name}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                      cat.type === 'expense'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {cat.type}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                  {cat.subcategories.join(', ')}
                </p>
              </div>

              {categories.length > 3 && (
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-zinc-400 hover:text-rose-600 p-1"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup, Export, Restore & Reset Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-zinc-500" />
          Data Backup & Persistence (Local Storage)
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          All financial data is saved locally on your browser. Download JSON backups to preserve your history or move data between devices.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-center"
          >
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Export Backup (JSON)
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              Save all records to file
            </span>
          </button>

          {/* Import JSON */}
          <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-center">
            <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Import Backup (JSON)
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              Restore from saved file
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 transition-colors cursor-pointer text-center"
          >
            <RotateCcw className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Reset Demo Data
            </span>
            <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">
              Restore sample transactions
            </span>
          </button>

          {/* Wipe All Data */}
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 transition-colors cursor-pointer text-center"
          >
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 mb-2" />
            <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Clear All Data
            </span>
            <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">
              Start fresh with blank slate
            </span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset to Sample Data"
        message="This will replace all existing transactions, accounts, and EMI plans with the realistic demonstration dataset. Are you sure?"
        confirmLabel="Reset Data"
        onConfirm={() => {
          resetToDefaultData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmationModal
        isOpen={isClearConfirmOpen}
        title="Wipe All Financial Records"
        message="This will delete ALL transactions, debt balances, EMI plans, and custom categories. This cannot be undone unless you have a JSON backup."
        confirmLabel="Delete Everything"
        isDestructive
        onConfirm={() => {
          clearAllData();
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
