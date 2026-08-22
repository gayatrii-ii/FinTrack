import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { FilterBar } from '../components/transactions/FilterBar';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { DeleteConfirmModal } from '../components/transactions/DeleteConfirmModal';
import { Button } from '../components/common/Button';
import { Transaction, Category, TransactionType, PaginationMeta } from '../types';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useDebounce } from '../hooks/useDebounce';
import { DateFilterPreset, DateRange, getDateRangeFromPreset } from '../utils/dateUtils';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 0,
  });

  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 350);
  const [type, setType] = useState<TransactionType | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all_time');
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('all_time'));
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      toastError('Failed to load categories');
    }
  };

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await transactionService.getTransactions({
        search: debouncedSearch || undefined,
        type,
        categoryId,
        startDate: datePreset !== 'all_time' ? dateRange.startDate : undefined,
        endDate: datePreset !== 'all_time' ? dateRange.endDate : undefined,
        sortBy,
        sortOrder,
        page,
        limit: 15,
      });

      setTransactions(data.transactions);
      setMeta(data.meta);
    } catch {
      toastError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, type, categoryId, datePreset, dateRange, sortBy, sortOrder, page, toastError]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSortChange = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setType(undefined);
    setCategoryId(undefined);
    setDatePreset('all_time');
    setDateRange(getDateRangeFromPreset('all_time'));
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await transactionService.deleteTransaction(deleteTarget.id);
      success('Transaction deleted successfully');
      setDeleteTarget(null);
      fetchTransactions();
    } catch {
      toastError('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Transaction Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full ledger of historical inflows, expenses, and automated recurring entries.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Transaction
        </Button>
      </div>

      <FilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        type={type}
        onTypeChange={(t) => {
          setType(t);
          setPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(c) => {
          setCategoryId(c);
          setPage(1);
        }}
        categories={categories}
        preset={datePreset}
        range={dateRange}
        onRangeChange={(p, r) => {
          setDatePreset(p);
          setDateRange(r);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      <TransactionTable
        transactions={transactions}
        meta={meta}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={(newPage) => setPage(newPage)}
        onEdit={(tx) => {
          setEditingTransaction(tx);
          setIsModalOpen(true);
        }}
        onDelete={(tx) => setDeleteTarget(tx)}
        currency={user?.currency}
        isLoading={isLoading}
      />

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingTransaction}
        onSuccess={() => fetchTransactions()}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description={`Are you sure you want to permanently delete "${deleteTarget?.description}" (${deleteTarget?.amount})? This will update balance reports.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
