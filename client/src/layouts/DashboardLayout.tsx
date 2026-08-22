import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { TransactionModal } from '../components/transactions/TransactionModal';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openAddTransaction: () => setIsAddTxOpen(true) }} />
        </main>
      </div>

      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('fintrack:transaction-updated'));
        }}
      />
    </div>
  );
};
