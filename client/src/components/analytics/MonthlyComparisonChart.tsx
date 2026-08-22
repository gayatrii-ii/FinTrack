import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MonthlyComparisonPoint } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { EmptyState } from '../common/EmptyState';
import { TrendingUp } from 'lucide-react';

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonPoint[];
  currency?: string;
  isLoading?: boolean;
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
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
        <h3 className="text-sm font-semibold text-slate-100 mb-2">Monthly Trajectory</h3>
        <EmptyState
          icon={<TrendingUp className="w-5 h-5 text-slate-400" />}
          title="No trajectory data"
          description="Build up monthly transactions to see your financial health curve."
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-100">Monthly Net Savings Trajectory</h3>
        <p className="text-xs text-slate-400">Monthly savings generated after all expenses</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
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
                name === 'savings' ? 'Net Savings' : name === 'income' ? 'Income' : 'Expense',
              ]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="savings"
              name="Net Savings"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#savingsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
