import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Transaction, TransactionType, Category } from '../../types';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { success, error: toastError } = useToast();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setCategoryId(initialData.categoryId);
        setDescription(initialData.description);
        setDate(format(new Date(initialData.date), 'yyyy-MM-dd'));
        setIsRecurring(initialData.isRecurring || false);
      } else {
        setType('EXPENSE');
        setAmount('');
        setDescription('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setIsRecurring(false);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const list = await categoryService.getCategories();
      setCategories(list);
      if (!initialData && list.length > 0) {
        const defaultCat = list.find((c) => c.type === type) || list[0];
        setCategoryId(defaultCat.id);
      }
    } catch {
      toastError('Failed to fetch categories.');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matching = categories.find((c) => c.type === newType);
    if (matching) {
      setCategoryId(matching.id);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }
    if (!description.trim()) {
      errs.description = 'Description is required';
    }
    if (!categoryId) {
      errs.categoryId = 'Category is required';
    }
    if (!date) {
      errs.date = 'Date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        type,
        categoryId,
        description: description.trim(),
        date: new Date(date).toISOString(),
        isRecurring,
      };

      let result: Transaction;
      if (initialData) {
        result = await transactionService.updateTransaction(initialData.id, payload);
        success('Transaction updated successfully');
      } else {
        result = await transactionService.createTransaction(payload);
        success('Transaction added successfully');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save transaction';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Add New Transaction'}
      description="Record a financial entry to keep your balances and budgets synchronized."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Transaction Type</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={cn(
                'py-2 text-xs font-semibold rounded-md transition-colors',
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={cn(
                'py-2 text-xs font-semibold rounded-md transition-colors',
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Income
            </button>
          </div>
        </div>

        <Input
          label="Amount (₹)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          autoFocus
        />

        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          error={errors.categoryId}
          disabled={isLoadingCategories}
        >
          {filteredCategories.length === 0 ? (
            <option value="">No categories available</option>
          ) : (
            filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </Select>

        <Input
          label="Description"
          type="text"
          placeholder="e.g. Grocery shopping, Client invoice payment..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <Input
          label="Transaction Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            id="isRecurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-950"
          />
          <label htmlFor="isRecurring" className="text-xs text-slate-300 select-none cursor-pointer">
            Mark as part of a recurring bill / subscription
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Create Entry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
