import React, { useState } from 'react';
import { Location, User } from '../types';
import { loginUserApi, registerMerchantApi } from '../services/api';
import {
  Store,
  User as UserIcon,
  ShieldAlert,
  Lock,
  Mail,
  Building,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  TrendingDown,
  ShoppingBag,
  Zap,
  Check,
} from 'lucide-react';

interface OpeningPageProps {
  locations: Location[];
  onOpenConsumerLogin: () => void;
  onLoginSuccess: (user: User) => void;
  onBackToWelcome?: () => void;
}

export const OpeningPage: React.FC<OpeningPageProps> = ({
  locations,
  onOpenConsumerLogin,
  onLoginSuccess,
  onBackToWelcome,
}) => {
  const [activePortalTab, setActivePortalTab] = useState<'merchant-login' | 'merchant-register'>(
    'merchant-login'
  );

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register Form States
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
    { id: 'vegetables', label: 'Vegetables', icon: '🥬' },
    { id: 'fruits', label: 'Fruits', icon: '🍎' },
    { id: 'meats', label: 'Fresh Meats', icon: '🍗' },
    { id: 'fish', label: 'Fish & Seafood', icon: '🐟' },
    { id: 'dairy', label: 'Dairy & Eggs', icon: '🥛' },
    { id: 'staples', label: 'Staples & Grains', icon: '🍚' },
    { id: 'oils-spices', label: 'Oils & Spices', icon: '🫗' },
    { id: 'bakery-breakfast', label: 'Bakery', icon: '🍞' },
    { id: 'electronics', label: 'Electronics', icon: '🔌' },
    { id: 'utensils', label: 'Kitchen Utensils', icon: '🍳' },
    { id: 'household', label: 'Cleaning & Home', icon: '🧼' },
    { id: 'organic', label: 'Organic Produce', icon: '🌿' },
  ];

  const toggleRegCategory = (catId: string) => {
    setRegCategories((prev) =>
      prev.includes(catId) ? (prev.length > 1 ? prev.filter((c) => c !== catId) : prev) : [...prev, catId]
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await loginUserApi({ email, password, expectedRole: 'merchant' });
      setSuccessMsg(res.message || 'Login successful!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regShopName || !regEmail || !regPassword) {
      setError('Store Name, Email, and Password are required');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await registerMerchantApi({
        name: regOwnerName || `${regShopName} Manager`,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        shopName: regShopName,
        locationId: regLocationId,
        address: regAddress,
        shopType: regShopType,
        categories: regCategories,
      });
      setSuccessMsg(res.message || 'Store registered successfully!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f2] flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Navigation Bar on Opening Page */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#e2e7dd] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 border border-brand-200 flex items-center justify-center text-xl shadow-xs">
              🛒
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Ente<span className="text-brand-600">Bazaar</span>
              </span>
              <span className="ml-2 text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                Grocery Intelligence Platform
              </span>
            </div>
          </div>

          <button
            onClick={onOpenConsumerLogin}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer font-malayalam"
          >
            <span>ഷോപ്പർ ലോഗിൻ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-stretch">
          
          {/* Left Column: Consumer Portal & Highlights */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-900 text-xs font-bold mb-4 shadow-2xs">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="font-malayalam text-xs sm:text-sm font-semibold tracking-wide">
                  കേരളത്തിലെ വിശ്വസനീയമായ സൂപ്പർമാർക്കറ്റ് വില താരതമ്യം
                </span>
              </div>

              {/* Main Prominent Malayalam Hero Heading */}
              <h1 className="font-malayalam font-black text-3xl sm:text-5xl lg:text-[3.2rem] text-slate-900 tracking-tight leading-[1.25] sm:leading-[1.2] mb-4">
                വിലയറിയാം, <br />
                <span className="bg-gradient-to-r from-brand-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
                  വിവേകത്തോടെ വാങ്ങാം.
                </span>
              </h1>

              <p className="font-malayalam text-base sm:text-lg text-slate-700 font-medium leading-relaxed max-w-lg mb-2">
                നിങ്ങളുടെ പ്രദേശത്തെ കടകളിലെ നിത്യോപയോഗ സാധനങ്ങളുടെ വില തത്സമയം പരിശോധിച്ച് ഏറ്റവും കുറഞ്ഞ നിരക്കിൽ പർച്ചേസ് ചെയ്യാം.
              </p>

              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-lg">
                PriceTeller tracks and compares grocery item prices across local supermarkets in real time. Sign in to save your personal shopping baskets and unlock maximum savings.
              </p>
            </div>

            {/* Consumer Gateway Big Card */}
            <div className="p-6 bg-gradient-to-br from-white to-brand-50/60 border-2 border-brand-300/90 rounded-3xl shadow-lg relative overflow-hidden group hover:border-brand-500 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all" />
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                  🛍️
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 font-malayalam">
                      ഉപഭോക്താക്കൾക്കായി
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Verified Shoppers
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed font-malayalam">
                    സുരക്ഷിതമായി ലോഗിൻ ചെയ്ത് നിങ്ങളുടെ ഷോപ്പിംഗ് ലിസ്റ്റുകളും ഫേവറിറ്റുകളും സൂക്ഷിക്കാം.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-800">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-malayalam">സ്ഥിരമായി സൂക്ഷിക്കുന്ന സേവ്ഡ് ബാസ്ക്കറ്റ്</span>
                </div>

                <button
                  onClick={onOpenConsumerLogin}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer font-malayalam"
                >
                  <span className="text-sm font-bold">ലോഗിൻ / രജിസ്റ്റർ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-white border border-[#e2e7dd] rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-brand-600 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Verified Rates</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900">Direct Prices</div>
                <div className="text-[10px] text-gray-500 font-medium">From local stores</div>
              </div>

              <div className="p-3.5 bg-white border border-[#e2e7dd] rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                  <Store className="w-4 h-4" />
                  <span className="text-xs font-bold">Top Stores</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900">Verified</div>
                <div className="text-[10px] text-gray-500 font-medium">Local Supermarkets</div>
              </div>

              <div className="p-3.5 bg-white border border-[#e2e7dd] rounded-2xl shadow-xs">
                <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold">Live Rates</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900">Daily Updates</div>
                <div className="text-[10px] text-gray-500 font-medium">Verified by partners</div>
              </div>
            </div>

          </div>

          {/* Right Column: Merchant & Partner Authentication Card */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-white border border-[#dce2d7] rounded-3xl shadow-xl overflow-hidden flex flex-col flex-1">
              
              {/* Card Header & Navigation */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-lg">
                      🏪
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        Merchant & Store Partner Portal
                      </h2>
                      <p className="text-xs text-blue-200">
                        Secure credential authentication for supermarket owners
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => {
                      setActivePortalTab('merchant-login');
                      setError('');
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
                      activePortalTab === 'merchant-login'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Merchant Login
                  </button>

                  <button
                    onClick={() => {
                      setActivePortalTab('merchant-register');
                      setError('');
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
                      activePortalTab === 'merchant-register'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Register Store
                  </button>
                </div>
              </div>

              {/* Form Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Feedback Alerts */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl space-y-1.5 animate-shake">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{error}</span>
                    </div>
                    {error.includes('Role Mismatch') && (
                      <button
                        type="button"
                        onClick={() => onOpenConsumerLogin()}
                        className="w-full mt-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-all cursor-pointer text-center font-malayalam"
                      >
                        ഷോപ്പർ ലോഗിൻ പോർട്ടലിലേക്ക് മാറുക (Shopper Login) →
                      </button>
                    )}
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* TAB 1: MERCHANT SIGN IN */}
                {activePortalTab === 'merchant-login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5 flex-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Store Account Email / Username *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter store email address"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your store password"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Authenticate & Open Merchant Dashboard</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* TAB 2: REGISTER STORE */}
                {activePortalTab === 'merchant-register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                          Store Name *
                        </label>
                        <input
                          type="text"
                          value={regShopName}
                          onChange={(e) => setRegShopName(e.target.value)}
                          placeholder="e.g. Metro Mart"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                          Manager Name
                        </label>
                        <input
                          type="text"
                          value={regOwnerName}
                          onChange={(e) => setRegOwnerName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="manager@metromart.com"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create password"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98470 12345"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                          Location
                        </label>
                        <select
                          value={regLocationId}
                          onChange={(e) => setRegLocationId(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:outline-none"
                        >
                          {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name} ({l.subArea || l.state})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="e.g. Main Market Road, Near Town Hall"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>

                    {/* Category Specialization Multi-Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                        Store Categories Provided (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                        {AVAILABLE_PROVIDER_CATEGORIES.map((cat) => {
                          const isChecked = regCategories.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => toggleRegCategory(cat.id)}
                              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-left cursor-pointer border ${
                                isChecked
                                  ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span className="truncate">{cat.label}</span>
                              {isChecked && <Check className="w-3 h-3 ml-auto shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium block mt-1">
                        {regCategories.length} categories selected for inventory catalog
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Building className="w-4 h-4" />
                          <span>Register Store & Launch Merchant Portal</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>🔒 Verified SSL Session</span>
                  <span className="font-semibold text-slate-700">EnteBazaar v2.4</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#e2e7dd] py-4 px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 EnteBazaar Inc. All grocery prices indexed from verified local retail shops.</span>
          <div className="flex items-center gap-4 font-semibold text-gray-600">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
