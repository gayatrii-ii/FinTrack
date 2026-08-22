import React from 'react';
import { Calendar } from 'lucide-react';
import { DateFilterPreset, DateRange, getDateRangeFromPreset } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

export interface DateRangePickerProps {
  preset: DateFilterPreset;
  range: DateRange;
  onRangeChange: (preset: DateFilterPreset, range: DateRange) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  preset,
  range,
  onRangeChange,
  className,
}) => {
  const presets: { key: DateFilterPreset; label: string }[] = [
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'last_3_months', label: 'Last 3 Months' },
    { key: 'this_year', label: 'This Year' },
    { key: 'custom', label: 'Custom' },
  ];

  const handlePresetSelect = (selectedPreset: DateFilterPreset) => {
    if (selectedPreset === 'custom') {
      onRangeChange('custom', range);
    } else {
      const calculated = getDateRangeFromPreset(selectedPreset);
      onRangeChange(selectedPreset, calculated);
    }
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updated = { ...range, [field]: value };
    onRangeChange('custom', updated);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1">
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePresetSelect(p.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                preset === p.key
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {preset === 'custom' && (
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="date"
            value={range.startDate}
            onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
            className="bg-transparent border-none text-slate-200 text-xs focus:outline-none focus:ring-0 p-0"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={range.endDate}
            onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
            className="bg-transparent border-none text-slate-200 text-xs focus:outline-none focus:ring-0 p-0"
          />
        </div>
      )}
    </div>
  );
};
