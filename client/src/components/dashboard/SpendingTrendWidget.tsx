import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { SpendingTrendPoint } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';
import { LineChart as LineChartIcon } from 'lucide-react';

interface SpendingTrendWidgetProps {
  data: SpendingTrendPoint[];
  currency?: string;
  isLoading?: boolean;
}

export const SpendingTrendWidget: React.FC<SpendingTrendWidgetProps> = ({
  data,
  currency = 'INR',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm h-72 flex items-center justify-center">
        <div className="w-full h-48 bg-slate-800/40 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-100 mb-2">Spending Trend</h3>
        <EmptyState
          icon={<LineChartIcon className="w-5 h-5 text-slate-400" />}
          title="No trend data in range"
          description="Try changing the date filter or adding transactions to view trends."
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-100">Daily Cashflow Trend</h3>
        <p className="text-xs text-slate-400">Income vs. Expenses in selected period</p>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(d) => formatDate(d, 'MMM dd')}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v, currency, { compact: true })}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(value: any, name: any) => [
                formatCurrency(Number(value) || 0, currency),
                name === 'income' ? 'Income' : 'Expense',
              ]}
              labelFormatter={(label) => formatDate(label, 'MMMM dd, yyyy')}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#incomeGrad)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#expenseGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
