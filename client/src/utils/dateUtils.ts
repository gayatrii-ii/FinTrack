import { format, parseISO, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';

export type DateFilterPreset = 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all_time' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const getDateRangeFromPreset = (preset: DateFilterPreset): DateRange => {
  const now = new Date();
  const formatStr = 'yyyy-MM-dd';

  switch (preset) {
    case 'this_month':
      return {
        startDate: format(startOfMonth(now), formatStr),
        endDate: format(endOfMonth(now), formatStr),
      };
    case 'last_month': {
      const prevMonth = subMonths(now, 1);
      return {
        startDate: format(startOfMonth(prevMonth), formatStr),
        endDate: format(endOfMonth(prevMonth), formatStr),
      };
    }
    case 'last_3_months': {
      const threeMonthsAgo = subMonths(now, 3);
      return {
        startDate: format(startOfMonth(threeMonthsAgo), formatStr),
        endDate: format(now, formatStr),
      };
    }
    case 'this_year':
      return {
        startDate: format(startOfYear(now), formatStr),
        endDate: format(now, formatStr),
      };
    case 'all_time':
    default:
      return {
        startDate: '2020-01-01',
        endDate: format(now, formatStr),
      };
  }
};

export const formatDate = (dateString: string | Date, pattern = 'MMM dd, yyyy'): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, pattern);
};

export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy');
};
