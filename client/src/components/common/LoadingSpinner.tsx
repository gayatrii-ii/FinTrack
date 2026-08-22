import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading...',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 gap-3 text-slate-400', className)}>
      <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
};
