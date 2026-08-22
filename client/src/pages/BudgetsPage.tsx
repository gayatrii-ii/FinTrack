import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, PieChart } from 'lucide-react';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Budget, BudgetSummary } from '../types';
import { budgetService } from '../services/budgetService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/currency';
import { formatMonthYear } from '../utils/dateUtils';

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({
    totalBudgeted: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentage: 0,
    isExceeded: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await budgetService.getBudgets(currentMonth, currentYear);
      setBudgets(data.budgets || []);
      setSummary(data.summary);
    } catch {
      toastError('Failed to load budgets for the selected month');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear, toastError]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await budgetService.deleteBudget(deleteTarget.id);
      success('Budget target deleted');
      setDeleteTarget(null);
      fetchBudgets();
    } catch {
      toastError('Failed to delete budget');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Monthly Category Budgets
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Plan, monitor, and enforce spending ceilings for individual categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-200">
              {formatMonthYear(currentMonth, currentYear)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Set Budget
          </Button>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Budgeted
            </span>
            <p className="text-xl font-bold font-mono text-slate-100 mt-1">
              {formatCurrency(summary.totalBudgeted, user?.currency)}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Spent
            </span>
            <p className="text-xl font-bold font-mono text-slate-100 mt-1">
              {formatCurrency(summary.totalSpent, user?.currency)}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Remaining Allowance
            </span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {formatCurrency(summary.totalRemaining, user?.currency)}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Overall Utilization</span>
              <span className="font-mono font-semibold text-slate-200">
                {summary.overallPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.isExceeded ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-pulse" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={<PieChart className="w-6 h-6 text-slate-400" />}
          title={`No budgets set for ${formatMonthYear(currentMonth, currentYear)}`}
          description="Create budgets for key expense categories to prevent overspending and track allowance."
          action={
            <Button
              size="sm"
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create First Budget
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              currency={user?.currency}
              onEdit={(target) => {
                setEditingBudget(target);
                setIsModalOpen(true);
              }}
              onDelete={(target) => setDeleteTarget(target)}
            />
          ))}
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        month={currentMonth}
        year={currentYear}
        initialData={editingBudget}
        onSuccess={() => fetchBudgets()}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget Target"
        description={`Are you sure you want to remove the budget ceiling for "${deleteTarget?.category?.name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};
