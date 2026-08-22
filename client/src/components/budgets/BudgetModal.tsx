import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Budget, Category } from '../../types';
import { budgetService } from '../../services/budgetService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../hooks/useToast';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (budget: Budget) => void;
  month: number;
  year: number;
  initialData?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  month,
  year,
  initialData,
}) => {
  const { success, error: toastError } = useToast();
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<string>('80');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (initialData) {
        setCategoryId(initialData.categoryId);
        setAmount(initialData.amount.toString());
        setAlertThreshold(initialData.alertThreshold.toString());
      } else {
        setAmount('');
        setAlertThreshold('80');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const list = await categoryService.getCategories('EXPENSE');
      setCategories(list);
      if (!initialData && list.length > 0) {
        setCategoryId(list[0].id);
      }
    } catch {
      toastError('Failed to load expense categories.');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);
    const parsedThreshold = parseInt(alertThreshold, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Please enter a valid budget amount';
    }
    if (!categoryId) {
      errs.categoryId = 'Category is required';
    }
    if (isNaN(parsedThreshold) || parsedThreshold < 1 || parsedThreshold > 100) {
      errs.alertThreshold = 'Threshold must be between 1% and 100%';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let result: Budget;
      if (initialData) {
        result = await budgetService.updateBudget(initialData.id, {
          amount: parseFloat(amount),
          alertThreshold: parseInt(alertThreshold, 10),
        });
        success('Budget updated successfully');
      } else {
        result = await budgetService.createBudget({
          categoryId,
          amount: parseFloat(amount),
          month,
          year,
          alertThreshold: parseInt(alertThreshold, 10),
        });
        success('Budget target created successfully');
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save budget';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget Target' : 'Create Category Budget'}
      description={`Set a monthly spending ceiling for ${month}/${year}.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Expense Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isLoadingCategories || !!initialData}
          error={errors.categoryId}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          label="Budget Limit (₹)"
          type="number"
          step="0.01"
          placeholder="e.g. 15000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          autoFocus
        />

        <Input
          label="Alert Threshold (%)"
          type="number"
          min="1"
          max="100"
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(e.target.value)}
          helperText="Display a visual warning when spending reaches this percentage."
          error={errors.alertThreshold}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
