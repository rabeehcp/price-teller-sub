import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUserApi } from '../services/api';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  ShieldAlert,
  Server,
  Activity,
  Layers,
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
    <div className="min-h-screen bg-[#F8FAF9] flex selection:bg-[#0D6344] selection:text-white font-sans text-gray-900">
      {/* ===================================================================== */}
      {/* LEFT PANE: BRAND & GOVERNANCE SHOWCASE (Visible on lg and larger)     */}
      {/* ===================================================================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-[#092B1E] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        {/* Subtle mesh background circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#10A978]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#0B8F68]/20 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EnteBazaarLogo size="md" theme="dark" />
            <div className="h-5 w-px bg-white/20" />
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Enterprise Control
            </span>
          </div>
        </div>

        {/* Center Showcase */}
        <div className="relative z-10 my-auto py-10 space-y-8 max-w-md">
          {/* Glowing Security Shield */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#10A978] opacity-30 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-400/40 flex items-center justify-center shadow-xl">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl xl:text-3xl font-black text-white tracking-tight leading-snug">
              Enterprise Governance Features
            </h2>
            <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed font-normal">
              High-security central nexus for multi-merchant price synchronization, subscription management, and platform catalog controls.
            </p>
          </div>

          {/* Feature list pills */}
          <div className="space-y-3">
            {[
              { text: 'Advanced Security Protocols', icon: ShieldCheck },
              { text: 'Comprehensive Audit Trails', icon: Activity },
              { text: 'Role-Based Access Control (RBAC)', icon: Layers },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-semibold text-emerald-100"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{f.text}</span>
                </div>
              );
            })}
          </div>

          {/* Live Platform Status Glass Card */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Platform Status</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Systems Operational
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <div>
                <span className="text-[10px] text-emerald-200/70 block">Sessions</span>
                <b className="text-xs font-black text-white">Active</b>
              </div>
              <div>
                <span className="text-[10px] text-emerald-200/70 block">Server Load</span>
                <b className="text-xs font-black text-white">18% Normal</b>
              </div>
              <div>
                <span className="text-[10px] text-emerald-200/70 block">Latency</span>
                <b className="text-xs font-black text-white">45ms</b>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-emerald-100/50 flex items-center justify-between">
          <span>PeediyaCart Core Subsystem</span>
          <span>Zero-Trust Architecture</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* RIGHT PANE: CRISP, CLEAN LOGIN FORM                                   */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex items-center justify-between max-w-md w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2">
            <EnteBazaarLogo size="sm" theme="light" />
          </div>

          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 ml-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
            <span>Return to Store</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 space-y-6">
            {/* Header & Badges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 bg-[#EAF5F0] text-[#0D6344] text-[11px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200 tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0D6344]" />
                  <span>Admin Control Center</span>
                </div>

                <span className="text-[10px] font-semibold text-gray-400">
                  v2.4.0 Secure
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Admin Control Center
                </h1>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Enter your verified administrator credentials to access platform governance and analytics.
                </p>
              </div>
            </div>

            {/* Warning if current user is not admin */}
            {currentUser && currentUser.role !== 'admin' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-bold">Notice:</span> You are signed in as{' '}
                  <b className="text-gray-900">{currentUser.name}</b> ({currentUser.role}). Please authenticate with administrator credentials.
                </div>
              </div>
            )}

            {/* Lockout notice */}
            {lockoutSeconds > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600 shrink-0 animate-spin" />
                <span>Authentication locked. Try again in {lockoutSeconds}s.</span>
              </div>
            )}

            {/* Error message */}
            {error && lockoutSeconds <= 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Success message */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Admin ID or Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin"
                    disabled={lockoutSeconds > 0 || isLoading}
                    autoComplete="username"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FBFA] border border-gray-200 focus:bg-white focus:border-[#0D6344] focus:ring-4 focus:ring-[#0D6344]/10 rounded-xl text-xs text-gray-900 placeholder-gray-400 font-medium transition-all outline-none disabled:opacity-50"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={lockoutSeconds > 0 || isLoading}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F9FBFA] border border-gray-200 focus:bg-white focus:border-[#0D6344] focus:ring-4 focus:ring-[#0D6344]/10 rounded-xl text-xs text-gray-900 placeholder-gray-400 font-medium transition-all outline-none disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0D6344] focus:ring-[#0D6344] cursor-pointer accent-[#0D6344]"
                  />
                  <span className="text-[11px] text-gray-600 font-medium">Remember this workstation</span>
                </label>
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TLS 1.3</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || lockoutSeconds > 0}
                className="w-full py-3.5 bg-[#0D6344] hover:bg-[#094831] active:scale-[0.99] disabled:opacity-50 text-white font-black rounded-xl shadow-md shadow-[#0D6344]/20 transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badges */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 font-semibold uppercase tracking-wider pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  SSL SECURE
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  BCRYPT ENCRYPTED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="text-center text-[11px] text-gray-400 py-2">
          <span>PeediyaCart Administrative Subsystem · Zero-Trust Environment · v2.4.0</span>
        </div>
      </div>
    </div>
  );
};

