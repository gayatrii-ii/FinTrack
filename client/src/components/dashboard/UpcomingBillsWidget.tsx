import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Repeat } from 'lucide-react';
import { RecurringTransaction } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';

interface UpcomingBillsWidgetProps {
  recurringItems: RecurringTransaction[];
  currency?: string;
  isLoading?: boolean;
}

export const UpcomingBillsWidget: React.FC<UpcomingBillsWidgetProps> = ({
  recurringItems,
  currency = 'INR',
  isLoading = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Upcoming Recurring</h3>
          <p className="text-xs text-slate-400">Scheduled subscriptions and bills</p>
        </div>
        <Link
          to="/recurring"
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>View schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : recurringItems.length === 0 ? (
        <EmptyState
          icon={<Repeat className="w-5 h-5 text-slate-400" />}
          title="No scheduled recurring bills"
          description="Add monthly rent, utilities, or salary to automate tracking."
        />
      ) : (
        <div className="divide-y divide-slate-800/60">
          {recurringItems.slice(0, 4).map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon
                  name={item.category?.icon}
                  color={item.category?.color}
                  withContainer
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>Due {formatDate(item.nextOccurrence, 'MMM dd')}</span>
                    <span>•</span>
                    <span className="capitalize">{item.frequency.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold font-mono text-slate-200">
                  {formatCurrency(item.amount, currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
