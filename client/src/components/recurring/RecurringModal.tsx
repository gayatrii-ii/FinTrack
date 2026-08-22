import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { RecurringTransaction, TransactionType, Frequency, Category } from '../../types';
import { recurringService } from '../../services/recurringService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: RecurringTransaction) => void;
  initialData?: RecurringTransaction | null;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { success, error: toastError } = useToast();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>('MONTHLY');
  const [nextOccurrence, setNextOccurrence] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (initialData) {
        setType(initialData.type);
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setAmount(initialData.amount.toString());
        setCategoryId(initialData.categoryId);
        setFrequency(initialData.frequency);
        setNextOccurrence(format(new Date(initialData.nextOccurrence), 'yyyy-MM-dd'));
      } else {
        setType('EXPENSE');
        setTitle('');
        setDescription('');
        setAmount('');
        setFrequency('MONTHLY');
        setNextOccurrence(format(new Date(), 'yyyy-MM-dd'));
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
      toastError('Failed to load categories.');
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

    if (!title.trim()) {
      errs.title = 'Title is required';
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Please enter a valid amount';
    }
    if (!categoryId) {
      errs.categoryId = 'Category is required';
    }
    if (!nextOccurrence) {
      errs.nextOccurrence = 'Next due date is required';
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
        title: title.trim(),
        description: description.trim() || undefined,
        amount: parseFloat(amount),
        type,
        categoryId,
        frequency,
        nextOccurrence: new Date(nextOccurrence).toISOString(),
      };

      let result: RecurringTransaction;
      if (initialData) {
        result = await recurringService.updateRecurring(initialData.id, payload);
        success('Recurring commitment updated');
      } else {
        result = await recurringService.createRecurring(payload);
        success('Recurring commitment created');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save recurring transaction';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Recurring Schedule' : 'Schedule Recurring Transaction'}
      description="Automate monthly salary, subscriptions, rent, and utility tracking."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Type</label>
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
              Recurring Expense
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
              Recurring Income
            </button>
          </div>
        </div>

        <Input
          label="Title"
          placeholder="e.g. Monthly Salary, Indiranagar Rent, Netflix Plan..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <Input
          label="Amount (₹)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
        />

        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          error={errors.categoryId}
          disabled={isLoadingCategories}
        >
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="BIWEEKLY">Bi-Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </Select>

          <Input
            label="Next Due Date"
            type="date"
            value={nextOccurrence}
            onChange={(e) => setNextOccurrence(e.target.value)}
            error={errors.nextOccurrence}
          />
        </div>

        <Input
          label="Notes / Description (Optional)"
          placeholder="e.g. Payment deducted via AutoPay on 5th"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
