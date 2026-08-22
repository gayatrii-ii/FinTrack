import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        <div className="w-12 h-12 rounded-full bg-rose-950/70 border border-rose-800/80 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
        <div className="flex items-center justify-center gap-3 w-full pt-3 border-t border-slate-800/80">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="w-1/2">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading} className="w-1/2">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
