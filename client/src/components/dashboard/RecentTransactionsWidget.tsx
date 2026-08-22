import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt } from 'lucide-react';
import { Transaction } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  currency?: string;
  isLoading?: boolean;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  currency = 'INR',
  isLoading = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest activity across accounts</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-slate-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-5 h-5 text-slate-400" />}
            title="No transactions yet"
            description="Start recording income or expenses to see them appear here."
          />
        ) : (
          <div className="divide-y divide-slate-800/60">
            {transactions.slice(0, 6).map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-800/20 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon
                      name={tx.category?.icon}
                      color={tx.category?.color}
                      withContainer
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{tx.category?.name || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-semibold font-mono ${
                        isIncome ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {formatCurrency(tx.amount, currency, { showSign: true })}
                    </p>
                    {tx.isRecurring && (
                      <span className="text-[10px] text-slate-400">Recurring</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
