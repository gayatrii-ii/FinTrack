import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsSummaryCards } from '../components/analytics/AnalyticsSummaryCards';
import { SpendingTrendChart } from '../components/analytics/SpendingTrendChart';
import { IncomeVsExpenseChart } from '../components/analytics/IncomeVsExpenseChart';
import { CategoryPieChart } from '../components/analytics/CategoryPieChart';
import { MonthlyComparisonChart } from '../components/analytics/MonthlyComparisonChart';
import { DateRangePicker } from '../components/common/DateRangePicker';
import {
  AnalyticsOverview,
  SpendingTrendPoint,
  CategoryBreakdownResponse,
  MonthlyComparisonPoint,
} from '../types';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { DateFilterPreset, DateRange, getDateRangeFromPreset } from '../utils/dateUtils';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [datePreset, setDatePreset] = useState<DateFilterPreset>('this_month');
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('this_month'));

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<SpendingTrendPoint[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownResponse | null>(null);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparisonPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewData, trendData, breakdownData, comparisonData] = await Promise.all([
        analyticsService.getOverview(dateRange.startDate, dateRange.endDate),
        analyticsService.getSpendingTrend(dateRange.startDate, dateRange.endDate),
        analyticsService.getCategoryBreakdown(dateRange.startDate, dateRange.endDate, 'EXPENSE'),
        analyticsService.getMonthlyComparison(6),
      ]);

      setOverview(overviewData);
      setTrend(trendData);
      setBreakdown(breakdownData);
      setMonthlyComparison(comparisonData);
    } catch {
      toastError('Failed to load financial analytics.');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, toastError]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Financial Analytics & Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep dive into spending behavior, category distributions, and historical trends.
          </p>
        </div>

        <DateRangePicker
          preset={datePreset}
          range={dateRange}
          onRangeChange={(p, r) => {
            setDatePreset(p);
            setDateRange(r);
          }}
        />
      </div>

      <AnalyticsSummaryCards
        overview={overview}
        currency={user?.currency}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          items={breakdown?.breakdown || []}
          totalAmount={breakdown?.totalAmount || 0}
          currency={user?.currency}
          isLoading={isLoading}
        />
        <SpendingTrendChart
          data={trend}
          currency={user?.currency}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeVsExpenseChart
          data={monthlyComparison}
          currency={user?.currency}
          isLoading={isLoading}
        />
        <MonthlyComparisonChart
          data={monthlyComparison}
          currency={user?.currency}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
