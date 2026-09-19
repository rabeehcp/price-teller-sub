import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUserApi } from '../services/api';
import {
  ShieldAlert,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Fingerprint,
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
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Security: Failed attempts rate-limit / brute-force lockout
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutSeconds > 0) {
      setError(`Access temporarily locked due to repeated failed attempts. Please wait ${lockoutSeconds}s.`);
      return;
    }

    if (!username.trim() || !password) {
      setError('Please provide valid administrator credentials');
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

      setFailedAttempts(0);
      setSuccessMsg(res.message || 'Administrator verified successfully!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err: any) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 5) {
        setLockoutSeconds(30);
        setError('Too many failed authorization attempts. Form locked for 30 seconds for security.');
      } else {
        const remaining = 5 - nextFailures;
        setError(
          err.message ||
            `Access Denied: Invalid administrator credentials. (${remaining} attempts remaining before security lockout)`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-slate-800 flex flex-col justify-between selection:bg-[#0B8F68] selection:text-white relative overflow-hidden font-sans">
      {/* Light subtle enterprise background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(11, 143, 104, 0.08) 0%, transparent 60%),
                            radial-gradient(circle at 80% 90%, rgba(11, 143, 104, 0.04) 0%, transparent 50%),
                            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* Top Header Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#E2ECE6] bg-white/80 backdrop-blur-md relative z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <EnteBazaarLogo size="md" theme="light" />
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#E8F8F0] text-[#0B8F68] border border-[#C3EEDC] tracking-wider">
              Control Center
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              Restricted Operations
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </button>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-6">
        <div className="w-full max-w-md bg-white border border-[#DCE8E1] rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/[0.04] space-y-6">
          
          {/* Top Brand & Security Badge */}
          <div className="text-center space-y-2.5">
            <div className="w-13 h-13 rounded-2xl bg-[#E8F8F0] border border-[#C3EEDC] text-[#0B8F68] mx-auto flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-6.5 h-6.5 text-[#0B8F68]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider mb-2">
                <Fingerprint className="w-3 h-3 text-rose-600" />
                <span>Restricted Access · Authorized Personnel Only</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Admin Console
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Secure administrative gateway for platform governance, merchant compliance, and catalog control.
              </p>
            </div>
          </div>

          {/* Active Non-Admin Session Warning */}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold">Access Blocked:</span> You are currently signed in as{' '}
                <span className="font-semibold text-slate-900">{currentUser.name}</span> ({currentUser.role}). This account does not possess administrative privileges.
              </div>
            </div>
          )}

          {/* Lockout Notice */}
          {lockoutSeconds > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600 shrink-0 animate-spin" />
              <span>Authentication locked. Try again in {lockoutSeconds}s.</span>
            </div>
          )}

          {/* Error Message */}
          {error && lockoutSeconds <= 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="flex-1">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Administrator Identifier
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator ID"
                  disabled={lockoutSeconds > 0 || isLoading}
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] border border-[#D5E2DA] focus:bg-white focus:border-[#0B8F68] focus:ring-4 focus:ring-[#0B8F68]/10 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium transition-all outline-none disabled:opacity-50"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Master Security Key
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password"
                  disabled={lockoutSeconds > 0 || isLoading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F9FBFA] border border-[#D5E2DA] focus:bg-white focus:border-[#0B8F68] focus:ring-4 focus:ring-[#0B8F68]/10 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium transition-all outline-none disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0B8F68] focus:ring-[#0B8F68] cursor-pointer accent-[#0B8F68]"
                />
                <span className="text-[11px] text-slate-600 font-medium">Remember this workstation</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>TLS 1.3 Encrypted</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full py-3 bg-[#0B8F68] hover:bg-[#087353] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-[#0B8F68]/20 transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Credentials & Enter</span>
                </>
              )}
            </button>
          </form>

          {/* Notice */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All unauthorized access attempts are recorded. Access is strictly audited under Role-Based Access Control (RBAC).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-500 border-t border-[#E2ECE6] bg-white/70 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>PeediyaCart Administrative Subsystem</span>
          <span className="text-slate-300">·</span>
          <span>Zero Trust Environment</span>
          <span className="text-slate-300">·</span>
          <span>v2.4.0</span>
        </div>
      </footer>
    </div>
  );
};
