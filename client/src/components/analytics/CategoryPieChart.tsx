import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CategoryBreakdownItem } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { EmptyState } from '../common/EmptyState';
import { PieChart as PieChartIcon } from 'lucide-react';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategoryPieChartProps {
  items: CategoryBreakdownItem[];
  totalAmount: number;
  currency?: string;
  isLoading?: boolean;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  items,
  totalAmount,
  currency = 'INR',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm h-80 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-slate-800/40 animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-100 mb-2">Category Breakdown</h3>
        <EmptyState
          icon={<PieChartIcon className="w-5 h-5 text-slate-400" />}
          title="No expense data in range"
          description="Record expenses under categories to see their breakdown distribution."
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-100">Expense Category Distribution</h3>
        <p className="text-xs text-slate-400">
          Total Spent: <span className="font-mono font-semibold text-slate-200">{formatCurrency(totalAmount, currency)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="h-60 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(value: any) => [
                  formatCurrency(Number(value) || 0, currency),
                  'Spent',
                ]}
              />
              <Pie
                data={items}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="#0F172A"
                strokeWidth={2}
              >
                {items.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || '#64748B'}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.categoryId}
              className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CategoryIcon name={item.icon} color={item.color} className="w-3.5 h-3.5" />
                <span className="text-slate-300 font-medium truncate">{item.name}</span>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="font-semibold text-slate-200">
                  {formatCurrency(item.amount, currency)}
                </span>
                <span className="text-slate-400 ml-1.5 font-normal">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
