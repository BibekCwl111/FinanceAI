/**
 * Format numbers according to Indian numbering system (Lakhs, Crores)
 * e.g. 1000 -> ₹1,000, 100000 -> ₹1,00,000
 */
export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  // Format using Indian locale
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(absVal) ? 0 : 2,
  }).format(absVal);

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function formatCompactCurrency(amount: number, symbol: string = '₹'): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  if (absVal >= 10000000) {
    return `${isNegative ? '-' : ''}${symbol}${(absVal / 10000000).toFixed(1)} Cr`;
  }
  if (absVal >= 100000) {
    return `${isNegative ? '-' : ''}${symbol}${(absVal / 100000).toFixed(1)} L`;
  }
  if (absVal >= 1000) {
    return `${isNegative ? '-' : ''}${symbol}${(absVal / 1000).toFixed(1)}k`;
  }
  return `${isNegative ? '-' : ''}${symbol}${absVal.toFixed(0)}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  // Check if today or yesterday
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return 'Today';
  }
  if (date.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getCurrentMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatMonthName(monthKey: string): string {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
}

export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
