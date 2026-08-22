import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { Button } from '../common/Button';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAddTransaction?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenAddTransaction,
}) => {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-slate-200 tracking-tight hidden sm:block">
            FinTrack Financial Suite
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-md text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>PostgreSQL Active</span>
        </div>

        {onOpenAddTransaction && (
          <Button
            size="sm"
            onClick={onOpenAddTransaction}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Transaction
          </Button>
        )}
      </div>
    </header>
  );
};
