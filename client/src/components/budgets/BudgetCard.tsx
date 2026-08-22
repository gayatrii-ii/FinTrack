import React from 'react';
import { Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Budget } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/currency';
import { cn } from '../../utils/cn';

interface BudgetCardProps {
  budget: Budget;
  currency?: string;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  currency = 'INR',
  onEdit,
  onDelete,
}) => {
  const spent = budget.spent || 0;
  const remaining = budget.remaining !== undefined ? budget.remaining : Math.max(0, budget.amount - spent);
  const percentage = budget.percentage !== undefined ? budget.percentage : Math.round((spent / budget.amount) * 100);
  const isExceeded = budget.isExceeded ?? (spent > budget.amount);
  const isWarning = budget.isWarning ?? (percentage >= budget.alertThreshold && !isExceeded);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700/80 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <CategoryIcon
              name={budget.category?.icon}
              color={budget.category?.color}
              withContainer
            />
            <div>
              <h4 className="text-sm font-semibold text-slate-100">
                {budget.category?.name || 'Category'}
              </h4>
              <p className="text-xs text-slate-400">
                Alert threshold: {budget.alertThreshold}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(budget)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit Budget"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Delete Budget"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-400">Spent:</span>
            <span className="font-mono font-bold text-sm text-slate-100">
              {formatCurrency(spent, currency)}{' '}
              <span className="text-slate-500 font-normal text-xs">
                / {formatCurrency(budget.amount, currency)}
              </span>
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isExceeded
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
            <span>{percentage}% used</span>
            <span>
              {isExceeded
                ? `Exceeded by ${formatCurrency(spent - budget.amount, currency)}`
                : `${formatCurrency(remaining, currency)} left`}
            </span>
          </div>
        </div>
      </div>

      <div>
        {isExceeded ? (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Budget limit exceeded for this category!</span>
          </div>
        ) : isWarning ? (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Approaching target threshold ({percentage}% used).</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400">
            <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>On track within designated budget limit.</span>
          </div>
        )}
      </div>
    </div>
  );
};
