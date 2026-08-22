import React from 'react';
import { Edit2, Trash2, Calendar, Repeat, PlayCircle, PauseCircle } from 'lucide-react';
import { RecurringTransaction } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';

interface RecurringTableProps {
  items: RecurringTransaction[];
  currency?: string;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
  onToggleStatus: (item: RecurringTransaction) => void;
  isLoading?: boolean;
}

export const RecurringTable: React.FC<RecurringTableProps> = ({
  items,
  currency = 'INR',
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/40 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
              <th className="py-3.5 px-4">Title / Obligation</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Frequency</th>
              <th className="py-3.5 px-4">Next Due Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                  Loading recurring schedules...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12">
                  <EmptyState
                    icon={<Repeat className="w-5 h-5 text-slate-400" />}
                    title="No recurring transactions"
                    description="Set up automated schedules for recurring incomes like salary or expenses like rent and subscriptions."
                  />
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isIncome = item.type === 'INCOME';
                const isActive = item.status === 'ACTIVE';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-100">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-slate-400 truncate max-w-xs">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          name={item.category?.icon}
                          color={item.category?.color}
                          withContainer
                          className="w-7 h-7"
                        />
                        <span className="text-xs text-slate-300">
                          {item.category?.name || 'Category'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="purple" size="sm">
                        {item.frequency}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-300 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(item.nextOccurrence, 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={isActive ? 'emerald' : 'slate'} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-semibold">
                      <span className={isIncome ? 'text-emerald-400' : 'text-slate-100'}>
                        {formatCurrency(item.amount, currency, { showSign: true })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onToggleStatus(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title={isActive ? 'Pause Schedule' : 'Resume Schedule'}
                        >
                          {isActive ? (
                            <PauseCircle className="w-4 h-4 text-amber-400" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
