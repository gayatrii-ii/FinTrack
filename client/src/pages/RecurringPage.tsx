import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Play, Repeat } from 'lucide-react';
import { RecurringTable } from '../components/recurring/RecurringTable';
import { RecurringModal } from '../components/recurring/RecurringModal';
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal';
import { Button } from '../components/common/Button';
import { RecurringTransaction } from '../types';
import { recurringService } from '../services/recurringService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const RecurringPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchRecurring = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await recurringService.getRecurring();
      setRecurringItems(data);
    } catch {
      toastError('Failed to load recurring transactions');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  const handleToggleStatus = async (item: RecurringTransaction) => {
    const nextStatus = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await recurringService.updateRecurring(item.id, { status: nextStatus });
      success(`Schedule marked as ${nextStatus.toLowerCase()}`);
      fetchRecurring();
    } catch {
      toastError('Failed to update status');
    }
  };

  const handleProcessDue = async () => {
    setIsProcessing(true);
    try {
      const res = await recurringService.processDue();
      if (res.processedCount > 0) {
        success(`Successfully processed and posted ${res.processedCount} due transactions!`);
      } else {
        success('All recurring transactions are up to date. None currently due.');
      }
      fetchRecurring();
    } catch {
      toastError('Failed to process recurring transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await recurringService.deleteRecurring(deleteTarget.id);
      success('Recurring schedule deleted');
      setDeleteTarget(null);
      fetchRecurring();
    } catch {
      toastError('Failed to delete recurring schedule');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Recurring Incomes & Expenses
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automate routine obligations, subscriptions, payroll, and monthly utility bills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleProcessDue}
            isLoading={isProcessing}
            leftIcon={<Play className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Process Due Now
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Schedule
          </Button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shrink-0">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Automated Financial Engine</h4>
            <p className="text-xs text-slate-400">
              Transactions due on or before today can be processed into the ledger with 1 click.
            </p>
          </div>
        </div>
      </div>

      <RecurringTable
        items={recurringItems}
        currency={user?.currency}
        onEdit={(item) => {
          setEditingItem(item);
          setIsModalOpen(true);
        }}
        onDelete={(item) => setDeleteTarget(item)}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />

      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        onSuccess={() => fetchRecurring()}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recurring Schedule"
        description={`Are you sure you want to delete the schedule for "${deleteTarget?.title}"? Existing ledger transactions won't be deleted.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
