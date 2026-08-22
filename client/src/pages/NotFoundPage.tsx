import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-xl">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <h1 className="text-3xl font-bold text-slate-100 tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-sm mt-2 mb-6">
        The page or report you are looking for does not exist or has been relocated.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};
