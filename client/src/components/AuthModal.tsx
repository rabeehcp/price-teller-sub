import React, { useState, useEffect, useRef } from 'react';
import { User, Location } from '../types';
import {
  loginUserApi,
  loginWithGoogleApi,
  registerMerchantApi,
  registerConsumerApi,
} from '../services/api';
import { renderGoogleSignInButton } from '../services/googleAuth';
import { EnteBazaarLogo } from './EnteBazaarLogo';
import {
  Store,
  User as UserIcon,
  Lock,
  Mail,
  Building,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'consumer-login' | 'consumer-register' | 'merchant-login' | 'merchant-register' | 'gateway';
  onLoginSuccess: (user: User) => void;
  locations: Location[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'consumer-login',
  onLoginSuccess,
  locations,
}) => {
  // Main Persona Switcher: 'consumer' | 'merchant'
  const [persona, setPersona] = useState<'consumer' | 'merchant'>('consumer');
  // Sub-tab: 'login' | 'register'
  const [subTab, setSubTab] = useState<'login' | 'register'>('login');

  // Common Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Consumer Registration Form State
  const [consumerName, setConsumerName] = useState('');
  const [consumerEmail, setConsumerEmail] = useState('');
  const [consumerPassword, setConsumerPassword] = useState('');
  const [consumerPhone, setConsumerPhone] = useState('');
  const [consumerLocationId, setConsumerLocationId] = useState(locations[0]?.id || 'tirur');

  // Merchant Register Form State
  const [regShopName, setRegShopName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLocationId, setRegLocationId] = useState(locations[0]?.id || 'tirur');
  const [regAddress, setRegAddress] = useState('');
  const [regShopType, setRegShopType] = useState('supermarket');
  const [regCategories, setRegCategories] = useState<string[]>(['vegetables', 'fruits', 'staples', 'dairy']);

  const AVAILABLE_PROVIDER_CATEGORIES = [
    { id: 'vegetables', label: 'പച്ചക്കറികൾ', icon: '🥬' },
    { id: 'fruits', label: 'പഴങ്ങൾ', icon: '🍎' },
    { id: 'meats', label: 'ഇറച്ചി', icon: '🍗' },
    { id: 'fish', label: 'മത്സ്യം', icon: '🐟' },
    { id: 'dairy', label: 'പാൽ & മുട്ട', icon: '🥛' },
    { id: 'staples', label: 'ധാന്യങ്ങൾ', icon: '🍚' },
    { id: 'oils-spices', label: 'എണ്ണ & മസാല', icon: '🫗' },
    { id: 'bakery-breakfast', label: 'ബേക്കറി', icon: '🍞' },
    { id: 'organic', label: 'ഓർഗാനിക്', icon: '🌿' },
  ];

  const toggleRegCategory = (catId: string) => {
    setRegCategories((prev) =>
      prev.includes(catId) ? (prev.length > 1 ? prev.filter((c) => c !== catId) : prev) : [...prev, catId]
    );
  };

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');

    if (initialMode === 'merchant-login' || initialMode === 'merchant-register') {
      setPersona('merchant');
      setSubTab(initialMode === 'merchant-register' ? 'register' : 'login');
    } else {
      setPersona('consumer');
      setSubTab(initialMode === 'consumer-register' ? 'register' : 'login');
    }
  }, [initialMode, isOpen]);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialSuccess = async (credential: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await loginWithGoogleApi({
        credential,
        expectedRole: persona,
      });
      setSuccessMsg(res.message || 'Google authentication successful!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && persona === 'consumer' && googleBtnRef.current) {
      renderGoogleSignInButton(
        googleBtnRef.current,
        handleGoogleCredentialSuccess,
        {
          theme: 'outline',
          size: 'large',
          text: subTab === 'register' ? 'signup_with' : 'continue_with',
        }
      );
    }
  }, [isOpen, persona, subTab]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await loginUserApi({
        email: email.trim(),
        password,
        expectedRole: persona,
      });
      setSuccessMsg(res.message || 'Authentication successful!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsumerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumerName || !consumerEmail || !consumerPassword) {
      setError('Name, email, and password are required');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await registerConsumerApi({
        name: consumerName.trim(),
        email: consumerEmail.trim(),
        password: consumerPassword,
        phone: consumerPhone.trim(),
        locationId: consumerLocationId,
      });
      setSuccessMsg(res.message || 'Account created successfully!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerchantRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regShopName || !regEmail || !regPassword) {
      setError('Store Name, Email, and Password are required');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await registerMerchantApi({
        name: regOwnerName.trim() || `${regShopName.trim()} Manager`,
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        shopName: regShopName.trim(),
        locationId: regLocationId,
        address: regAddress.trim(),
        shopType: regShopType,
        categories: regCategories,
      });
      setSuccessMsg(res.message || 'Store registered successfully!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-surface-border overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[92dvh]">
        
        {/* Left Visual Brand Column (Inspired by reference board) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-brand-950 via-brand-900 to-forest-900 text-white p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <EnteBazaarLogo size="md" theme="dark" withTagline={true} />

            <div className="pt-6 space-y-2">
              <span className="text-xs font-bold text-brand-300 uppercase tracking-wider font-malayalam">
                സ്വാഗതം
              </span>
              <h2 className="text-2xl font-black leading-snug font-malayalam text-white">
                നിങ്ങളുടെ EnteBazaar അക്കൗണ്ടിലേക്ക് സ്വാഗതം
              </h2>
              <p className="text-xs text-brand-100/80 font-malayalam leading-relaxed">
                കേരളത്തിലെ സൂപ്പർമാർക്കറ്റുകളിലെ കൃത്യമായ വില വിവരങ്ങളും ഓഫറുകളും ഇപ്പോൾ നിങ്ങളുടെ വിരൽത്തുമ്പിൽ.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-2 pt-6 border-t border-brand-800/60 text-xs font-bold text-brand-200">
            <div className="flex items-center gap-2 font-malayalam">
              <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
              <span>സുരക്ഷിതമായ അക്കൗണ്ട്</span>
            </div>
            <div className="flex items-center gap-2 font-malayalam">
              <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
              <span>സേവ് ചെയ്ത ഷോപ്പിംഗ് ലിസ്റ്റുകൾ</span>
            </div>
            <div className="flex items-center gap-2 font-malayalam">
              <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
              <span>തത്സമയ വില വിവരങ്ങൾ</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[92dvh] relative">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-subtle hover:bg-gray-200 text-slate-body flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            {/* Persona Switcher (Shopper vs Merchant) */}
            <div className="flex items-center bg-surface-subtle p-1 rounded-xl mb-5 max-w-xs gap-1 border border-surface-border">
              <button
                onClick={() => {
                  setPersona('consumer');
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-malayalam ${
                  persona === 'consumer'
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'text-slate-muted hover:text-slate-dark'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>ഉപഭോക്താവ്</span>
              </button>

              <button
                onClick={() => {
                  setPersona('merchant');
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-malayalam ${
                  persona === 'merchant'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-muted hover:text-slate-dark'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>വ്യാപാരി</span>
              </button>
            </div>

            {/* Sub-tab: Login vs Register */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSubTab('login');
                    setError('');
                  }}
                  className={`text-sm font-black transition-all cursor-pointer font-malayalam relative pb-1 ${
                    subTab === 'login'
                      ? 'text-brand-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                      : 'text-slate-muted hover:text-slate-dark'
                  }`}
                >
                  ലോഗിൻ (Sign In)
                </button>

                <button
                  onClick={() => {
                    setSubTab('register');
                    setError('');
                  }}
                  className={`text-sm font-black transition-all cursor-pointer font-malayalam relative pb-1 ${
                    subTab === 'register'
                      ? 'text-brand-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                      : 'text-slate-muted hover:text-slate-dark'
                  }`}
                >
                  പുതിയ അക്കൗണ്ട് (Register)
                </button>
              </div>
            </div>

            {/* Error / Success Alerts */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* Form: Consumer / Merchant Login */}
            {subTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-dark mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. shopper@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-xs text-slate-dark placeholder-gray-400 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-dark mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-surface-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-xs text-slate-dark placeholder-gray-400 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:scale-98 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-malayalam mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>ലോഗിൻ ചെയ്യുക</span>
                    </>
                  )}
                </button>

                {persona === 'consumer' && (
                  <div className="pt-2">
                    <div className="relative flex items-center justify-center mb-3">
                      <div className="border-t border-surface-border w-full" />
                      <span className="bg-white px-3 text-[11px] text-slate-muted font-bold">അല്ലെങ്കിൽ</span>
                    </div>
                    <div ref={googleBtnRef} className="flex justify-center w-full min-h-[40px]" />
                  </div>
                )}
              </form>
            )}

            {/* Form: Consumer Registration */}
            {persona === 'consumer' && subTab === 'register' && (
              <form onSubmit={handleConsumerRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-dark mb-1">പേര് (Full Name) *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={consumerName}
                      onChange={(e) => setConsumerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-dark mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="email"
                      value={consumerEmail}
                      onChange={(e) => setConsumerEmail(e.target.value)}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-dark mb-1">Password *</label>
                    <input
                      type="password"
                      value={consumerPassword}
                      onChange={(e) => setConsumerPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-dark mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={consumerPhone}
                      onChange={(e) => setConsumerPhone(e.target.value)}
                      placeholder="+91 98470..."
                      className="w-full px-3 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-dark mb-1">പ്രദേശം (Primary Location Hub)</label>
                  <select
                    value={consumerLocationId}
                    onChange={(e) => setConsumerLocationId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none cursor-pointer"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        📍 {loc.name} {loc.subArea ? `(${loc.subArea})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:scale-98 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-malayalam mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>അക്കൗണ്ട് സൃഷ്ടിക്കുക</span>
                  )}
                </button>
              </form>
            )}

            {/* Form: Merchant Registration */}
            {persona === 'merchant' && subTab === 'register' && (
              <form onSubmit={handleMerchantRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-dark mb-1">കടയുടെ പേര് (Store Name) *</label>
                  <input
                    type="text"
                    value={regShopName}
                    onChange={(e) => setRegShopName(e.target.value)}
                    placeholder="e.g. Malabar Supermarket"
                    className="w-full px-3 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-dark mb-1">Email *</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="store@gmail.com"
                      className="w-full px-3 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-dark mb-1">Password *</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-dark mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98470..."
                      className="w-full px-3 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-dark mb-1">Location Hub</label>
                    <select
                      value={regLocationId}
                      onChange={(e) => setRegLocationId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-surface-border focus:border-brand-500 rounded-xl text-xs text-slate-dark outline-none cursor-pointer"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-dark mb-1">വിൽപ്പന വിഭാഗങ്ങൾ (Categories)</label>
                  <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto p-1 border border-surface-border rounded-xl">
                    {AVAILABLE_PROVIDER_CATEGORIES.map((cat) => {
                      const isSelected = regCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleRegCategory(cat.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : 'bg-surface-subtle text-slate-body hover:bg-gray-200'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-malayalam mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>സ്റ്റോർ രജിസ്റ്റർ ചെയ്യുക</span>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
