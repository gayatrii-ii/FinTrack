import React from 'react';
import {
  BarChart,
  Bar,
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
import { BarChart3 } from 'lucide-react';

interface IncomeVsExpenseChartProps {
  data: MonthlyComparisonPoint[];
  currency?: string;
  isLoading?: boolean;
}

export const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({
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
        <h3 className="text-sm font-semibold text-slate-100 mb-2">Income vs Expenses</h3>
        <EmptyState
          icon={<BarChart3 className="w-5 h-5 text-slate-400" />}
          title="No comparison data"
          description="Record income and expenses across consecutive months to compare."
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-100">Income vs Expenses Comparison</h3>
        <p className="text-xs text-slate-400">Monthly breakdown of inflows vs. outflows</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                name === 'income' ? 'Income' : name === 'expense' ? 'Expenses' : 'Savings',
              ]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
            />
            <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
