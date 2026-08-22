import React from 'react';
import { StatCard } from '../common/StatCard';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { AnalyticsOverview } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface MetricCardsProps {
  overview: AnalyticsOverview | null;
  currency?: string;
  isLoading?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  overview,
  currency = 'INR',
  isLoading = false,
}) => {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const { currentBalance, totalIncome, totalExpenses, netSavings, savingsRate } = overview;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Balance"
        value={formatCurrency(currentBalance, currency)}
        subtitle="Current net financial position"
        icon={<Wallet className="w-4 h-4 text-emerald-400" />}
      />

      <StatCard
        title="Total Income"
        value={formatCurrency(totalIncome, currency)}
        subtitle="Earned in selected period"
        icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
        trend={{
          value: `${overview.transactionCount} transactions`,
          isPositive: true,
        }}
      />

      <StatCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses, currency)}
        subtitle="Spent in selected period"
        icon={<TrendingDown className="w-4 h-4 text-rose-400" />}
        trend={
          overview.topExpenseCategory
            ? {
                value: overview.topExpenseCategory.name,
                label: 'Top expense',
                isPositive: false,
              }
            : undefined
        }
      />

      <StatCard
        title="Net Savings"
        value={formatCurrency(netSavings, currency)}
        subtitle={`Savings Rate: ${savingsRate}%`}
        icon={<PiggyBank className="w-4 h-4 text-blue-400" />}
        trend={{
          value: `${savingsRate}% saved`,
          isPositive: savingsRate >= 20,
        }}
      />
    </div>
  );
};
