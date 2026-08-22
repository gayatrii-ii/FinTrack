import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await login({ email, password });
      success('Welcome back to FinTrack!');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to login. Please check your credentials.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@fintrack.app');
    setPassword('Password123!');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
          <Wallet className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">
          Sign in to FinTrack
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Personal finance & portfolio analytics platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-emerald-300 block">Want to try a demo?</span>
              <span className="text-emerald-400/80">Explore pre-seeded 6-month financial history.</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleFillDemo}
              className="border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/40 shrink-0"
              leftIcon={<Sparkles className="w-3 h-3 text-emerald-400" />}
            >
              Fill Demo
            </Button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
