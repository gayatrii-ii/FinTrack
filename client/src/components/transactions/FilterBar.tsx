import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Category, TransactionType } from '../../types';
import { DateRangePicker } from '../common/DateRangePicker';
import { DateFilterPreset, DateRange } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  type?: TransactionType;
  onTypeChange: (type?: TransactionType) => void;
  categoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
  categories: Category[];
  preset: DateFilterPreset;
  range: DateRange;
  onRangeChange: (preset: DateFilterPreset, range: DateRange) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  type,
  onTypeChange,
  categoryId,
  onCategoryChange,
  categories,
  preset,
  range,
  onRangeChange,
  onReset,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, merchant, or notes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onTypeChange(undefined)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              type === undefined
                ? 'bg-slate-800 text-slate-100 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('EXPENSE')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              type === 'EXPENSE'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('INCOME')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              type === 'INCOME'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Income
          </button>
        </div>

        <div className="w-full lg:w-48 shrink-0">
          <select
            value={categoryId || ''}
            onChange={(e) => onCategoryChange(e.target.value || undefined)}
            className="w-full py-2 px-3 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        <DateRangePicker preset={preset} range={range} onRangeChange={onRangeChange} />

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 px-2.5 rounded-md hover:bg-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
};
