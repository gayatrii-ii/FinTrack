import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, PieChart } from 'lucide-react';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { cn } from '../../utils/cn';
import { EmptyState } from '../common/EmptyState';

interface BudgetOverviewWidgetProps {
  budgets: Budget[];
  currency?: string;
  isLoading?: boolean;
}

export const BudgetOverviewWidget: React.FC<BudgetOverviewWidgetProps> = ({
  budgets,
  currency = 'INR',
  isLoading = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Budget Utilization</h3>
          <p className="text-xs text-slate-400">Monthly category spending targets</p>
        </div>
        <Link
          to="/budgets"
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={<PieChart className="w-5 h-5 text-slate-400" />}
          title="No budgets set"
          description="Create category budgets to track spending targets and receive alerts."
        />
      ) : (
        <div className="space-y-4">
          {budgets.slice(0, 4).map((b) => {
            const percentage = b.percentage || 0;
            const spent = b.spent || 0;
            const isExceeded = b.isExceeded;
            const isWarning = b.isWarning;

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-200">
                      {b.category?.name || 'Category'}
                    </span>
                    {isExceeded && (
                      <span className="text-[10px] text-rose-400 flex items-center gap-0.5 bg-rose-950/60 border border-rose-800 px-1.5 py-0.2 rounded font-semibold">
                        <AlertTriangle className="w-2.5 h-2.5" /> Over budget
                      </span>
                    )}
                    {isWarning && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5 bg-amber-950/60 border border-amber-800 px-1.5 py-0.2 rounded font-semibold">
                        {percentage}% used
                      </span>
                    )}
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-semibold text-slate-200">
                      {formatCurrency(spent, currency)}
                    </span>
                    <span className="text-slate-500"> / {formatCurrency(b.amount, currency)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isExceeded
                        ? 'bg-rose-500'
                        : percentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    )}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
