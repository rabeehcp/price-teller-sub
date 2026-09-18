import React, { useState } from 'react';
import { User } from '../types';
import { loginUserApi } from '../services/api';
import { ShieldCheck, ShieldAlert, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EnteBazaarLogo } from './EnteBazaarLogo';

interface AdminLoginPageProps {
  onLoginSuccess: (user: User) => void;
  onBackToHome: () => void;
  currentUser?: User | null;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
  currentUser,
}) => {
  const [username, setUsername] = useState('priceteller10');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both Admin username and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await loginUserApi({
        username: username.trim(),
        email: username.includes('@') ? username.trim() : undefined,
        password,
        expectedRole: 'admin',
      });
      setSuccessMsg(res.message || 'Administrator authenticated successfully!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/80 text-white flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-amber-500/15 bg-slate-950/60 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <EnteBazaarLogo size="md" theme="dark" />
          <div className="border-l border-slate-700 pl-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Operations
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Administrator Control Center</p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Site</span>
        </button>
      </header>

      {/* Main Login Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center text-2xl shadow-inner">
              <ShieldAlert className="w-7 h-7 text-amber-400" />
            </div>
            <div className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Privileged Operations Access
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Super Admin Portal</h1>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Authenticate with master administrator credentials to access platform controls, products, shops, and subscriptions.
            </p>
          </div>

          {/* Active Non-Admin Session Notice if present */}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-center justify-between gap-2">
              <div>
                <span className="font-bold text-amber-300">Signed in as:</span> {currentUser.name} ({currentUser.role})
              </div>
              <span className="text-[10px] font-extrabold bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30 text-amber-300">
                Switching to Admin
              </span>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Admin Username or Email *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-amber-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 rounded-xl text-xs text-white placeholder-gray-500 font-semibold focus:outline-none transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Admin Master Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-amber-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-amber-500 rounded-xl text-xs text-white placeholder-gray-500 font-semibold focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow-lg transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Launch Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToHome}
            className="w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 text-gray-400 hover:text-gray-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center block"
          >
            ← Back to Public Website
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-gray-500 border-t border-slate-800/60 bg-slate-950/40">
        <span>EnteBazaar Master Administrative System · Strict Authorization Enforced</span>
      </footer>
    </div>
  );
};
