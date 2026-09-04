import React from 'react';

interface MetricCardProps {
  id?: string;
  title: string;
  amount: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral' | 'warning' | 'info';
  };
  icon: React.ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  amount,
  subtitle,
  badge,
  icon,
  iconBgColor = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200',
  onClick,
}) => {
  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    negative: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
    neutral: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800/40',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/90 rounded-2xl p-5 shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1.5 tracking-tight truncate">
            {amount}
          </h3>
          {(subtitle || badge) && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {badge && (
                <span
                  className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badgeStyles[badge.variant]}`}
                >
                  {badge.text}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
