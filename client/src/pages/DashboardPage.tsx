import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MetricCards } from '../components/dashboard/MetricCards';
import { SpendingTrendWidget } from '../components/dashboard/SpendingTrendWidget';
import { BudgetOverviewWidget } from '../components/dashboard/BudgetOverviewWidget';
import { RecentTransactionsWidget } from '../components/dashboard/RecentTransactionsWidget';
import { UpcomingBillsWidget } from '../components/dashboard/UpcomingBillsWidget';
import { DateRangePicker } from '../components/common/DateRangePicker';
import { Button } from '../components/common/Button';
import { Plus } from 'lucide-react';
import {
  AnalyticsOverview,
  SpendingTrendPoint,
  Budget,
  Transaction,
  RecurringTransaction,
} from '../types';
import { analyticsService } from '../services/analyticsService';
import { budgetService } from '../services/budgetService';
import { transactionService } from '../services/transactionService';
import { recurringService } from '../services/recurringService';
import { useAuth } from '../hooks/useAuth';
import { DateFilterPreset, DateRange, getDateRangeFromPreset } from '../utils/dateUtils';
import { useToast } from '../hooks/useToast';

interface DashboardContext {
  openAddTransaction: () => void;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const { openAddTransaction } = useOutletContext<DashboardContext>();

  const [datePreset, setDatePreset] = useState<DateFilterPreset>('this_month');
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('this_month'));

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<SpendingTrendPoint[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<RecurringTransaction[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewData, trendData, budgetData, txData, recurringData] = await Promise.all([
        analyticsService.getOverview(dateRange.startDate, dateRange.endDate),
        analyticsService.getSpendingTrend(dateRange.startDate, dateRange.endDate),
        budgetService.getBudgets(),
        transactionService.getTransactions({ limit: 6, sortBy: 'date', sortOrder: 'desc' }),
        recurringService.getUpcoming(5),
      ]);

      setOverview(overviewData);
      setTrend(trendData);
      setBudgets(budgetData.budgets || []);
      setRecentTx(txData.transactions || []);
      setUpcomingBills(recurringData || []);
    } catch {
      toastError('Failed to refresh dashboard analytics.');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, toastError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const handleGlobalUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('fintrack:transaction-updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('fintrack:transaction-updated', handleGlobalUpdate);
    };
  }, [fetchDashboardData]);

  const handleRangeChange = (newPreset: DateFilterPreset, newRange: DateRange) => {
    setDatePreset(newPreset);
    setDateRange(newRange);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Here is your financial pulse and spending summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            preset={datePreset}
            range={dateRange}
            onRangeChange={handleRangeChange}
          />
          <Button
            size="sm"
            onClick={openAddTransaction}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      <MetricCards overview={overview} currency={user?.currency} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingTrendWidget data={trend} currency={user?.currency} isLoading={isLoading} />
        </div>
        <div>
          <BudgetOverviewWidget budgets={budgets} currency={user?.currency} isLoading={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactionsWidget
          transactions={recentTx}
          currency={user?.currency}
          isLoading={isLoading}
        />
        <UpcomingBillsWidget
          recurringItems={upcomingBills}
          currency={user?.currency}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
