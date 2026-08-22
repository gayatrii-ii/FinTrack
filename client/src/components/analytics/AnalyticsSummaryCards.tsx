import React from 'react';
import { StatCard } from '../common/StatCard';
import { Percent, ArrowDownRight, ArrowUpRight, Flame } from 'lucide-react';
import { AnalyticsOverview } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateUtils';

interface AnalyticsSummaryCardsProps {
  overview: AnalyticsOverview | null;
  currency?: string;
  isLoading?: boolean;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({
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

  const { savingsRate, largestExpense, largestIncome, topExpenseCategory } = overview;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Savings Rate"
        value={`${savingsRate}%`}
        subtitle="Income retained as savings"
        icon={<Percent className="w-4 h-4 text-blue-400" />}
        trend={{
          value: savingsRate >= 20 ? 'Target Achieved (≥20%)' : 'Below 20% target',
          isPositive: savingsRate >= 20,
        }}
      />

      <StatCard
        title="Highest Spending Area"
        value={topExpenseCategory ? topExpenseCategory.name : 'N/A'}
        subtitle={
          topExpenseCategory
            ? `${formatCurrency(topExpenseCategory.amount, currency)} spent`
            : 'No expenses recorded'
        }
        icon={<Flame className="w-4 h-4 text-amber-400" />}
      />

      <StatCard
        title="Largest Outflow"
        value={largestExpense ? formatCurrency(largestExpense.amount, currency) : '₹0'}
        subtitle={
          largestExpense
            ? `${largestExpense.description} (${formatDate(largestExpense.date, 'MMM dd')})`
            : 'No transactions'
        }
        icon={<ArrowDownRight className="w-4 h-4 text-rose-400" />}
      />

      <StatCard
        title="Largest Inflow"
        value={largestIncome ? formatCurrency(largestIncome.amount, currency) : '₹0'}
        subtitle={
          largestIncome
            ? `${largestIncome.description} (${formatDate(largestIncome.date, 'MMM dd')})`
            : 'No income'
        }
        icon={<ArrowUpRight className="w-4 h-4 text-emerald-400" />}
      />
    </div>
  );
};
