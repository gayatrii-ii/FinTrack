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

interface SpendingTrendChartProps {
  data: SpendingTrendPoint[];
  currency?: string;
  isLoading?: boolean;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  currency = 'INR',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm h-80 flex items-center justify-center">
        <div className="w-full h-64 bg-slate-800/40 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-100 mb-2">Spending Trend Over Time</h3>
        <EmptyState
          icon={<LineChartIcon className="w-5 h-5 text-slate-400" />}
          title="No trend data recorded"
          description="Add transactions across different dates to observe spending trajectory."
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-100">Daily Cashflow Trend</h3>
        <p className="text-xs text-slate-400">Daily income credits vs. expense debits over time</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="trendIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="trendExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
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
              fill="url(#trendIncome)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#trendExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
