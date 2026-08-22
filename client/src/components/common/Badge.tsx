import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className,
}) => {
  const variants = {
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    rose: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    blue: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md border',
    md: 'text-xs px-2.5 py-1 font-medium rounded-md border',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 shrink-0', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
