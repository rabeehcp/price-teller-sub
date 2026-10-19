import React, { useState, useEffect, useRef } from 'react';
import { User, Location } from '../types';
import {
  loginUserApi,
  loginWithGoogleApi,
  registerMerchantApi,
  registerConsumerApi,
} from '../services/api';
import { triggerGoogleSignIn, renderGoogleSignInButton } from '../services/googleAuth';
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
  ArrowLeft,
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
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form input refs for auto-focus on return to normal login
  const emailInputRef = useRef<HTMLInputElement>(null);
  const consumerEmailInputRef = useRef<HTMLInputElement>(null);

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
    { id: 'snacks', label: 'നാലുമണി പലഹാരം', icon: '🥟' },
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
    setIsGooglePending(false);

    if (initialMode === 'merchant-login' || initialMode === 'merchant-register') {
      setPersona('merchant');
      setSubTab(initialMode === 'merchant-register' ? 'register' : 'login');
    } else {
      setPersona('consumer');
      setSubTab(initialMode === 'consumer-register' ? 'register' : 'login');
    }
  }, [initialMode, isOpen]);

  // Window focus listener to detect if user closed the Google popup window
  useEffect(() => {
    const handleWindowFocus = () => {
      // If user comes back to the tab and Google auth is pending, normal login remains accessible
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [isGooglePending]);

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleRegBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialSuccess = async (authData: { credential?: string; accessToken?: string }) => {
    setIsLoading(true);
    setIsGooglePending(false);
    setError('');
    try {
      const res = await loginWithGoogleApi({
        credential: authData.credential,
        accessToken: authData.accessToken,
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

  const handleGoogleSignInClick = async () => {
    setIsGooglePending(true);
    setError('');
    try {
      await triggerGoogleSignIn(
        (authData) => handleGoogleCredentialSuccess(authData),
        (err) => {
          setIsGooglePending(false);
          setIsLoading(false);
          setError(err?.message || 'Google sign-in failed. Please allow popups in your browser.');
        }
      );
    } catch (err: any) {
      setIsGooglePending(false);
      setIsLoading(false);
      setError(err?.message || 'Failed to start Google sign-in.');
    }
  };

  const handleCancelGoogleAndReturnToNormalLogin = () => {
    setIsGooglePending(false);
    setIsLoading(false);
    setError('');
    setTimeout(() => {
      if (subTab === 'register') {
        consumerEmailInputRef.current?.focus();
      } else {
        emailInputRef.current?.focus();
      }
    }, 60);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl sm:rounded-[32px] shadow-2xl border border-emerald-950/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[94dvh]">

        {/* Left Visual Brand Column (Desktop) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#0D4A36] via-[#0A3D2C] to-[#06291D] text-white p-8 lg:p-9 flex-col justify-between relative overflow-hidden">
          {/* Ambient Lighting Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-0 text-emerald-800/20 text-9xl pointer-events-none select-none">
            🍃
          </div>

          <div className="relative z-10 space-y-6">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 inline-block">
              <EnteBazaarLogo size="md" theme="dark" withTagline={true} />
            </div>

            <div className="space-y-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-500/30 px-3 py-1 rounded-full font-malayalam">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>കേരളത്തിലെ മികച്ച വിലകൾ</span>
              </span>
              <h2 className="text-2xl lg:text-[26px] font-black leading-snug font-padmanabha tracking-tight text-white m-0">
                നിങ്ങളുടെ പ്രദേശത്തെ ഏറ്റവും കുറഞ്ഞ നിരക്കുകൾ കണ്ടെത്തൂ
              </h2>
              <p className="text-xs lg:text-[13px] text-emerald-100/80 font-malayalam leading-relaxed font-normal m-0">
                നിങ്ങളുടെ സമീപത്തുള്ള വിവിധ കടകളിലെ കൃത്യമായ വില വിവരങ്ങളും ഓഫറുകളും ഒരൊറ്റ സ്ഥലത്ത് താരതമ്യം ചെയ്യാം.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-6 border-t border-emerald-800/60 text-xs font-bold text-emerald-100">
            <div className="flex items-center gap-2.5 font-malayalam">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span>100% സുരക്ഷിതമായ അക്കൗണ്ട്</span>
            </div>
            <div className="flex items-center gap-2.5 font-malayalam">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span>തത്സമയ ലൈവ് വില വിവരങ്ങൾ</span>
            </div>
            <div className="flex items-center gap-2.5 font-malayalam">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span>കടകളുമായി നേരിട്ടുള്ള ചാറ്റ് സൗകര്യം</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-start overflow-y-auto max-h-[94dvh] relative bg-white">

          {/* Standard Modal Header Bar */}
          <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <img src="/logo.png" alt="PeediaCart" className="h-5 sm:h-6 w-auto object-contain md:hidden" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-sans">
                  {persona === 'merchant' ? 'Partner Portal' : 'Shopper'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-padmanabha tracking-tight m-0">
                {subTab === 'login' ? 'ലോഗിൻ ചെയ്യുക' : 'പുതിയ അക്കൗണ്ട്'}
              </h2>
              <p className="text-xs text-slate-500 font-malayalam mt-0.5 line-clamp-1">
                {persona === 'merchant'
                  ? 'നിങ്ങളുടെ കടയുടെ ഉൽപ്പന്നങ്ങളും വിലകളും നിയന്ത്രിക്കുക'
                  : 'സ്വാഗതം! മികച്ച ഓഫറുകളും കുറഞ്ഞ വിലകളും ആസ്വദിക്കൂ'}
              </p>
            </div>

            {/* Standard Well-spaced Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
              title="അടയ്ക്കുക (Close)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Top Back Action (if Google sign-in is pending) */}
          {isGooglePending && (
            <div className="mb-3">
              <button
                type="button"
                onClick={handleCancelGoogleAndReturnToNormalLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer font-malayalam shadow-2xs group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-emerald-700" />
                <span>
                  {subTab === 'register' ? '← സാധാരണ രജിസ്ട്രേഷൻ (Back)' : '← സാധാരണ ലോഗിൻ (Back)'}
                </span>
              </button>
            </div>
          )}

          <div className="w-full">
            {/* Primary Action Tabs: Login vs Register */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl mb-3.5 border border-slate-200/80 font-malayalam shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setSubTab('login');
                  setError('');
                }}
                className={`py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  subTab === 'login'
                    ? 'bg-white text-[#0D4A36] shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>ലോഗിൻ</span>
                <span className="text-[11px] font-sans opacity-75 font-semibold">(Sign In)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubTab('register');
                  setError('');
                }}
                className={`py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  subTab === 'register'
                    ? 'bg-white text-[#0D4A36] shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>രജിസ്റ്റർ</span>
                <span className="text-[11px] font-sans opacity-75 font-semibold">(Sign Up)</span>
              </button>
            </div>

            {/* Account Type Selector Strip */}
            <div className="mb-4 bg-emerald-50/40 border border-emerald-950/10 p-2 sm:p-2.5 rounded-2xl">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                  അക്കൗണ്ട് തരം (Account Type)
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-white border border-emerald-200/60 px-2 py-0.5 rounded-full font-sans shadow-2xs">
                  {persona === 'merchant' ? '🏪 Merchant' : '👤 Shopper'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPersona('consumer');
                    setError('');
                    setEmail('');
                    setPassword('');
                  }}
                  className={`py-2 sm:py-2.5 px-2.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-malayalam border ${
                    persona === 'consumer'
                      ? 'bg-white border-[#0D4A36] text-[#0D4A36] shadow-xs ring-1 ring-[#0D4A36]/15 font-black'
                      : 'bg-white/80 border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <UserIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${persona === 'consumer' ? 'text-[#0D4A36]' : 'text-slate-400'}`} />
                  <span>ഉപഭോക്താവ്</span>
                  <span className="text-[10px] font-sans opacity-70 font-normal hidden xs:inline">(Shopper)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPersona('merchant');
                    setError('');
                    setEmail('');
                    setPassword('');
                  }}
                  className={`py-2 sm:py-2.5 px-2.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-malayalam border ${
                    persona === 'merchant'
                      ? 'bg-[#0D4A36] border-[#0D4A36] text-white shadow-xs font-black'
                      : 'bg-white/80 border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Store className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${persona === 'merchant' ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span>വ്യാപാരി</span>
                  <span className={`text-[10px] font-sans font-normal hidden xs:inline ${persona === 'merchant' ? 'text-emerald-200' : 'opacity-70'}`}>(Merchant)</span>
                </button>
              </div>
            </div>

            {/* Error / Success Alerts */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl mb-4 flex items-center gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl mb-4 flex items-center gap-2.5 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* Google Sign-in In-Progress Alert Banner */}
            {isGooglePending && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl mb-4 text-xs shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 font-malayalam flex items-center gap-1.5">
                      <span>Google സൈൻ-ഇൻ വിൻഡോ തുറന്നിരിക്കുന്നു...</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-malayalam mt-0.5 leading-relaxed">
                      Google അക്കൗണ്ട് തിരഞ്ഞെടുക്കുക. അല്ലെങ്കിൽ സാധാരണ പാസ്‌വേഡ് ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യാൻ താഴെയുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleCancelGoogleAndReturnToNormalLogin}
                        className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-2xs inline-flex items-center gap-1.5 cursor-pointer font-malayalam transition-all active:scale-98"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          {subTab === 'register'
                            ? 'സാധാരണ രജിസ്ട്രേഷനിലേക്ക് മടങ്ങുക (Back to Sign Up)'
                            : 'സാധാരണ ലോഗിനിലേക്ക് മടങ്ങുക (Back to Normal Login)'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form: Consumer / Merchant Login */}
            {subTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                    Email Address <span className="text-emerald-700">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. shopper@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0D4A36] focus:ring-4 focus:ring-[#0D4A36]/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                    Password <span className="text-emerald-700">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0D4A36] focus:ring-4 focus:ring-[#0D4A36]/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 sm:py-3.5 text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer font-malayalam mt-2 tracking-wide ${persona === 'merchant'
                      ? 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 shadow-slate-900/20'
                      : 'bg-gradient-to-r from-[#0D4A36] via-[#11553F] to-[#0D4A36] hover:from-[#093627] hover:to-[#093627] shadow-[#0D4A36]/25'
                    }`}
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
                  <div className="pt-1.5 space-y-2.5">
                    <div className="relative flex items-center justify-center my-1">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-white px-3 text-[11px] text-slate-400 font-bold font-malayalam uppercase">അല്ലെങ്കിൽ</span>
                    </div>

                    <button
                      type="button"
                      onClick={isGooglePending ? handleCancelGoogleAndReturnToNormalLogin : handleGoogleSignInClick}
                      disabled={isLoading}
                      className={`w-full py-2.5 sm:py-3 px-4 border active:scale-[0.99] text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${isGooglePending
                          ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                    >
                      {isGooglePending ? (
                        <>
                          <ArrowLeft className="w-4 h-4 text-amber-700" />
                          <span className="font-malayalam">Google റദ്ദാക്കി സാധാരണ ലോഗിൻ ചെയ്യുക</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span className="font-malayalam font-bold text-slate-800">Google വഴി തുടരുക</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Form: Consumer Registration */}
            {persona === 'consumer' && subTab === 'register' && (
              <form onSubmit={handleConsumerRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-malayalam">
                    പേര് (Full Name) <span className="text-emerald-700">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={consumerName}
                      onChange={(e) => setConsumerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0D4A36] focus:ring-4 focus:ring-[#0D4A36]/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                    Email Address <span className="text-emerald-700">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      ref={consumerEmailInputRef}
                      type="email"
                      value={consumerEmail}
                      onChange={(e) => setConsumerEmail(e.target.value)}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0D4A36] focus:ring-4 focus:ring-[#0D4A36]/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                      Password <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        value={consumerPassword}
                        onChange={(e) => setConsumerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0D4A36] focus:ring-4 focus:ring-[#0D4A36]/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                      Phone <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={consumerPhone}
                        onChange={(e) => setConsumerPhone(e.target.value)}
                        placeholder="+91 98470..."
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0D4A36] focus:ring-4 focus:ring-[#0D4A36]/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-malayalam">
                    പ്രദേശം (Primary Location Hub) <span className="text-emerald-700">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={consumerLocationId}
                      onChange={(e) => setConsumerLocationId(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0D4A36] focus:ring-4 focus:ring-[#0D4A36]/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 outline-none cursor-pointer transition-all shadow-2xs appearance-none font-malayalam"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} {loc.subArea ? `(${loc.subArea})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#0D4A36] via-[#11553F] to-[#0D4A36] hover:from-[#093627] hover:to-[#093627] active:scale-[0.99] disabled:opacity-50 text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl shadow-md shadow-[#0D4A36]/25 flex items-center justify-center gap-2 transition-all cursor-pointer font-malayalam mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>അക്കൗണ്ട് സൃഷ്ടിക്കുക</span>
                  )}
                </button>

                <div className="pt-1.5 space-y-2.5">
                  <div className="relative flex items-center justify-center my-1">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[11px] text-slate-400 font-bold font-malayalam uppercase">അല്ലെങ്കിൽ</span>
                  </div>

                  <button
                    type="button"
                    onClick={isGooglePending ? handleCancelGoogleAndReturnToNormalLogin : handleGoogleSignInClick}
                    disabled={isLoading}
                    className={`w-full py-2.5 sm:py-3 px-4 border active:scale-[0.99] text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${isGooglePending
                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                  >
                    {isGooglePending ? (
                      <>
                        <ArrowLeft className="w-4 h-4 text-amber-700" />
                        <span className="font-malayalam">Google റദ്ദാക്കി സാധാരണ രജിസ്ട്രേഷൻ ചെയ്യുക</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span className="font-malayalam font-bold text-slate-800">Google വഴി അക്കൗണ്ട് തുടങ്ങുക</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Form: Merchant Registration */}
            {persona === 'merchant' && subTab === 'register' && (
              <form onSubmit={handleMerchantRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-malayalam">
                    കടയുടെ പേര് (Store Name) <span className="text-emerald-700">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={regShopName}
                      onChange={(e) => setRegShopName(e.target.value)}
                      placeholder="e.g. Malabar Supermarket"
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                      Email <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="store@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                      Password <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                      Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98470..."
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">
                      Location Hub <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        value={regLocationId}
                        onChange={(e) => setRegLocationId(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 sm:py-3 bg-[#F8FAFC] hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 outline-none cursor-pointer transition-all shadow-2xs appearance-none font-malayalam"
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-malayalam">
                    വിൽപ്പന വിഭാഗങ്ങൾ (Categories)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#F8FAFC] border border-slate-200 rounded-2xl">
                    {AVAILABLE_PROVIDER_CATEGORIES.map((cat) => {
                      const isSelected = regCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleRegCategory(cat.id)}
                          className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer border ${isSelected
                              ? 'bg-[#0D4A36] text-white border-[#0D4A36] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70'
                            }`}
                        >
                          <span className="text-sm">{cat.icon}</span>
                          <span className="truncate text-[11px] font-malayalam">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-3.5 bg-slate-900 hover:bg-black active:scale-[0.99] disabled:opacity-50 text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer font-malayalam mt-2"
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

          {/* Security & Trust Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium font-malayalam">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% സുരക്ഷിതം · എൻക്രിപ്റ്റഡ് കണക്ഷൻ</span>
          </div>

        </div>

      </div>
    </div>
  );
};
