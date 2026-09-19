import React, { useState } from 'react';
import { User } from '../types';
import { loginUserApi } from '../services/api';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Server,
  Fingerprint,
  Sparkles,
} from 'lucide-react';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter your administrator username and password');
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

  const handleQuickFillDemo = () => {
    setUsername('priceteller10');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0C1014] text-slate-100 flex flex-col justify-between selection:bg-[#0B8F68] selection:text-white relative overflow-hidden font-sans">
      {/* Subtle modern enterprise ambient backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(11, 143, 104, 0.15) 0%, transparent 60%),
                            radial-gradient(circle at 85% 90%, rgba(11, 143, 104, 0.08) 0%, transparent 50%),
                            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
        }}
      />

      {/* Top Header Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/[0.07] bg-[#0E1318]/70 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-3">
          <EnteBazaarLogo size="md" theme="dark" />
          <div className="h-5 w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#0B8F68]/15 text-[#34D399] border border-[#0B8F68]/30 tracking-wider">
              Control Center
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Platform Administration
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </button>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-4">
        <div className="w-full max-w-md bg-[#13181E]/95 backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          
          {/* Top Brand & Security Badge */}
          <div className="text-center space-y-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0B8F68]/20 to-[#0B8F68]/5 border border-[#0B8F68]/30 text-[#34D399] mx-auto flex items-center justify-center shadow-lg shadow-[#0B8F68]/10">
              <ShieldCheck className="w-7 h-7 text-[#10B981]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#0B8F68]/10 text-[#34D399] border border-[#0B8F68]/25 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider mb-2">
                <Fingerprint className="w-3 h-3 text-[#10B981]" />
                <span>Restricted Access · Level 1 Admin</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Admin Console
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Sign in with privileged credentials to manage catalog, merchant stores, pricing, and system operations.
              </p>
            </div>
          </div>

          {/* Active Non-Admin Session Warning */}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-amber-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-bold text-amber-300">Signed in:</span>{' '}
                <span className="truncate">{currentUser.name}</span> ({currentUser.role})
              </div>
              <span className="text-[10px] font-extrabold bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30 text-amber-300 shrink-0">
                Switching
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="flex-1">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin ID or Work Email
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@peediyacart.com or username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0D11] border border-white/[0.1] focus:border-[#0B8F68] focus:ring-2 focus:ring-[#0B8F68]/25 rounded-xl text-xs text-white placeholder-slate-500 font-medium transition-all outline-none"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="text-[11px] font-semibold text-[#34D399] hover:text-[#10B981] transition-colors cursor-pointer flex items-center gap-1"
                  title="Fill default credentials for testing"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Quick Credentials</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0A0D11] border border-white/[0.1] focus:border-[#0B8F68] focus:ring-2 focus:ring-[#0B8F68]/25 rounded-xl text-xs text-white placeholder-slate-500 font-medium transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-slate-900 text-[#0B8F68] focus:ring-[#0B8F68] focus:ring-offset-0 cursor-pointer accent-[#0B8F68]"
                />
                <span className="text-[11px] text-slate-300 font-medium">Remember this workstation</span>
              </label>
              <span className="text-[11px] text-slate-500">256-bit TLS</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0B8F68] hover:bg-[#097756] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#0B8F68]/20 transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Help Footer */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Server className="w-3 h-3 text-[#10B981]" />
              <span>Production Cluster</span>
            </span>
            <span className="text-slate-500">v2.4.0 (Enterprise)</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400 border-t border-white/[0.06] bg-[#0A0D11]/60 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>PeediyaCart Core Operations</span>
          <span className="text-slate-400">·</span>
          <span>Authorized Access Only</span>
          <span className="text-slate-400">·</span>
          <span>Audit Logging Active</span>
        </div>
      </footer>
    </div>
  );
};
