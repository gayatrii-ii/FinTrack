import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Receipt,
  Repeat,
} from 'lucide-react';
import { Transaction, PaginationMeta } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';

interface TransactionTableProps {
  transactions: Transaction[];
  meta: PaginationMeta;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'date' | 'amount' | 'description') => void;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  currency?: string;
  isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  meta,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onEdit,
  onDelete,
  currency = 'INR',
  isLoading = false,
}) => {
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Recurring'];
    const rows = transactions.map((tx) => [
      formatDate(tx.date, 'yyyy-MM-dd'),
      tx.type,
      tx.category?.name || 'Uncategorized',
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      tx.isRecurring ? 'Yes' : 'No',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fintrack_transactions_${formatDate(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-emerald-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-400" />
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Results: <span className="text-slate-100 font-mono">{meta.total}</span>
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={exportToCSV}
          disabled={transactions.length === 0}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/40 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-200 select-none transition-colors"
                onClick={() => onSortChange('date')}
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'date' ? 'text-slate-200' : ''}>Date</span>
                  {renderSortIcon('date')}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-200 select-none transition-colors"
                onClick={() => onSortChange('description')}
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'description' ? 'text-slate-200' : ''}>Description</span>
                  {renderSortIcon('description')}
                </div>
              </th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Type</th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-200 select-none transition-colors"
                onClick={() => onSortChange('amount')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span className={sortBy === 'amount' ? 'text-slate-200' : ''}>Amount</span>
                  {renderSortIcon('amount')}
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                  Loading transactions from database...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <EmptyState
                    icon={<Receipt className="w-5 h-5 text-slate-400" />}
                    title="No transactions found"
                    description="No records match your selected filters. Try broadening the search criteria."
                  />
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {formatDate(tx.date, 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-100">{tx.description}</span>
                        {tx.isRecurring && (
                          <span
                            title="Recurring Transaction"
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CategoryIcon
                          name={tx.category?.icon}
                          color={tx.category?.color}
                          withContainer
                          className="w-7 h-7"
                        />
                        <span className="text-xs text-slate-300">
                          {tx.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={isIncome ? 'emerald' : 'rose'}>
                        {isIncome ? 'Income' : 'Expense'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-semibold">
                      <span className={isIncome ? 'text-emerald-400' : 'text-slate-100'}>
                        {formatCurrency(tx.amount, currency, { showSign: true })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(tx)}
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

      {meta.totalPages > 1 && (
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="font-semibold text-slate-200">{meta.page}</span> of{' '}
            <span className="font-semibold text-slate-200">{meta.totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(meta.page - 1)}
              disabled={meta.page <= 1 || isLoading}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages || isLoading}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
