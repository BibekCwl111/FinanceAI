import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface IncomeVsExpenseChartProps {
  data: {
    monthKey: string;
    monthName: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
}

const CATEGORY_PALETTE = [
  '#059669', // Emerald
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#eab308', // Yellow
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#64748b', // Slate
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-lg backdrop-blur-md text-xs">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const IncomeVsExpenseBarChart: React.FC<IncomeVsExpenseChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
          <XAxis
            dataKey="monthName"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#71717a' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#71717a' }}
            tickFormatter={(value) => (value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            name="Expenses"
            dataKey="expenses"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ExpenseDonutChartProps {
  data: { name: string; amount: number; percentage: number }[];
}

export const ExpenseDonutChart: React.FC<ExpenseDonutChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-xs">
        No expense data for this period
      </div>
    );
  }

  return (
    <div className="w-full h-72 flex flex-col items-center">
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Tooltip
            formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
            contentStyle={{
              backgroundColor: '#18181b',
              borderRadius: '0.75rem',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={54}
            outerRadius={80}
            paddingAngle={3}
            dataKey="amount"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center justify-center gap-2 max-h-16 overflow-y-auto px-2 mt-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length] }}
            />
            <span className="truncate max-w-[100px]">{item.name}</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SpendingTrendChartProps {
  data: { monthKey: string; monthName: string; expenses: number; income: number }[];
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
          <XAxis
            dataKey="monthName"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#71717a' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#71717a' }}
            tickFormatter={(value) => (value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f43f5e"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#expenseGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
