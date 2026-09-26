import React, { useState, useEffect, useMemo } from 'react';
import { ClientPartner, ClientOnboardedShop, ClientPayout } from '../types';
import { fetchClientPortalDataApi } from '../services/api';
import {
  Briefcase,
  Store,
  Wallet,
  Check,
  CheckCheck,
  Copy,
  Share2,
  ExternalLink,
  QrCode,
  ShieldCheck,
  ArrowLeft,
  Search,
  Clock,
  Sparkles,
  Phone,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Target,
  Lock,
  Unlock,
  Award,
  ChevronRight,
  TrendingUp,
  Receipt,
  UserCheck,
  X,
  BadgeCheck,
  MapPin,
  Calendar,
  CreditCard,
  IndianRupee,
} from 'lucide-react';

interface PartnerPortalProps {
  onBackToApp: () => void;
  initialCode?: string;
}

export const PartnerPortal: React.FC<PartnerPortalProps> = ({ onBackToApp, initialCode }) => {
  const [partnerInput, setPartnerInput] = useState<string>(() => {
    if (initialCode) return initialCode;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('partner') || urlParams.get('code') || localStorage.getItem('priceteller_partner_login_code') || '';
    } catch {
      return '';
    }
  });

  const [partnerData, setPartnerData] = useState<{
    partner: ClientPartner;
    onboardedShops: ClientOnboardedShop[];
    payouts: ClientPayout[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shops' | 'payouts'>('shops');
  const [shopSearchQuery, setShopSearchQuery] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  useEffect(() => {
    if (partnerInput && partnerInput.trim().length >= 3) {
      loadPartnerDashboard(partnerInput.trim());
    }
  }, []);

  const loadPartnerDashboard = async (code: string, isRefresh: boolean = false) => {
    if (!code.trim()) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);
    try {
      const data = await fetchClientPortalDataApi(code.trim());
      if (data) {
        setPartnerData(data);
        localStorage.setItem('priceteller_partner_login_code', data.partner.clientCode);
      } else {
        setErrorMsg('ഈ കോഡിൽ Partner അക്കൗണ്ട് കണ്ടെത്താനായില്ല. ശരിയായ കോഡ് നൽകുക.');
        setPartnerData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.');
      setPartnerData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerInput.trim()) {
      loadPartnerDashboard(partnerInput.trim());
    }
  };

  const handleQuickDemoClick = (code: string) => {
    setPartnerInput(code);
    loadPartnerDashboard(code);
  };

  const partner = partnerData?.partner;
  const shops = partnerData?.onboardedShops || [];
  const payouts = partnerData?.payouts || [];
  const inviteUrl = partner ? `${window.location.origin}/merchant?ref=${partner.clientCode}` : '';

  const handleShareWhatsApp = () => {
    if (!partner) return;
    const msg = `നമസ്കാരം, നിങ്ങളുടെ കടയിലെ ഉൽപന്നങ്ങളും ലൈവ് വിലകളും ഉപഭോക്താക്കളിലേക്ക് എത്തിക്കാൻ PeediyaCart Partner ആയി രജിസ്റ്റർ ചെയ്യൂ!\n\nഓൺബോർഡിംഗ് ലിങ്ക്: ${inviteUrl}\nPartner Code: ${partner.clientCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filtered shops based on search query
  const filteredShops = useMemo(() => {
    if (!shopSearchQuery.trim()) return shops;
    const q = shopSearchQuery.toLowerCase().trim();
    return shops.filter(
      (s) =>
        (s.shopName && s.shopName.toLowerCase().includes(q)) ||
        (s.merchantName && s.merchantName.toLowerCase().includes(q)) ||
        (s.merchantPhone && s.merchantPhone.includes(q)) ||
        (s.planName && s.planName.toLowerCase().includes(q))
    );
  }, [shops, shopSearchQuery]);

  return (
    <div className="min-h-screen bg-[#F0F4F2] text-[#15231C] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-[#0D4A36] selection:text-white pb-10">
      {/* 1. Header Bar */}
      <header className="bg-[#073827] text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Back Button & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToApp}
              className="p-1.5 sm:p-2 rounded-xl text-emerald-200/90 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="font-['Baloo_Chettan_2',sans-serif] text-sm">Home</span>
            </button>

            <div className="h-4 w-px bg-emerald-800/80 hidden sm:block" />

            <div className="flex items-center gap-2.5 min-w-0">
              {/* Official PeediyaCart Logo */}
              <div className="bg-white/95 backdrop-blur-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-xs border border-white/20 flex items-center shrink-0">
                <img
                  src="/logo.png"
                  alt="PeediyaCart"
                  className="h-5 sm:h-6.5 w-auto object-contain"
                />
              </div>

              {/* Partner Hub Title & Portal Badge */}
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 truncate text-white">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-sm sm:text-base leading-tight truncate tracking-tight text-white">
                    Partner Hub
                  </span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 tracking-wider hidden md:inline-block">
                    Field Partner Portal
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          {partner && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => loadPartnerDashboard(partner.clientCode, true)}
                disabled={refreshing}
                className="p-2 rounded-xl text-emerald-200/90 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer"
                title="Refresh Dashboard"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-white' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPartnerData(null);
                  localStorage.removeItem('priceteller_partner_login_code');
                }}
                className="text-xs text-emerald-200 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer font-bold border border-emerald-700/50 font-['Baloo_Chettan_2',sans-serif]"
              >
                Switch Account
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* ============================================================== */}
        {/* CASE A: No Partner Logged In -> Clean Landing & Code Entry     */}
        {/* ============================================================== */}
        {!partnerData || !partner ? (
          <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="text-center space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
                <img src="/logo.png" alt="PeediyaCart" className="h-5 w-auto object-contain" />
                <span className="h-3.5 w-px bg-emerald-200" />
                <span className="font-black text-xs text-[#0D4A36] font-['Plus_Jakarta_Sans',sans-serif]">Partner Hub</span>
                <span className="h-3.5 w-px bg-emerald-200" />
                <span className="text-[11px] text-emerald-700 font-bold font-['Baloo_Chettan_2',sans-serif]">Field Program</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A3022] tracking-tight leading-tight font-['Baloo_Chettan_2',sans-serif]">
                വ്യാപാര സ്ഥാപനങ്ങളെ പങ്കാളികളാക്കൂ,<br />
                <span className="bg-gradient-to-r from-[#0D593E] to-[#128C63] bg-clip-text text-transparent">
                  50% പ്രതിമാസ കമ്മീഷൻ
                </span> നേടൂ
              </h2>

              <p className="text-xs sm:text-sm text-[#4E6359] max-w-md mx-auto leading-relaxed font-['Anek_Malayalam',sans-serif]">
                നിങ്ങളുടെ പ്രദേശത്തെ കടകളെ PeediyaCart-ലേക്ക് കൊണ്ടുവരൂ. വ്യാപാരികൾ അടയ്ക്കുന്ന ഓരോ സബ്‌സ്‌ക്രിപ്ഷനും 50% വിഹിതം നേരിട്ട് നിങ്ങളുടെ UPI വഴി അക്കൗണ്ടിലേക്ക് എത്തും.
              </p>
            </div>

            {/* Portal Access Form Box */}
            <div className="bg-white border border-emerald-950/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_4px_24px_rgba(13,74,54,0.06)] space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0D4A36] border border-emerald-100 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A3022] leading-none font-['Plus_Jakarta_Sans',sans-serif]">
                    Partner Login
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    നിങ്ങളുടെ Partner Code നൽകുക (ഉദാ: <span className="font-mono font-bold text-emerald-700">CL-101</span>)
                  </p>
                </div>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Partner Code നൽകുക (ഉദാ: CL-101)"
                    value={partnerInput}
                    onChange={(e) => setPartnerInput(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 py-3 bg-[#F6FAF8] border border-emerald-900/15 focus:border-[#0D4A36] focus:bg-white rounded-2xl text-sm font-mono uppercase font-black text-[#0A3022] placeholder-gray-400 outline-none transition-all shadow-inner tracking-wider"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 text-left animate-in fade-in font-['Anek_Malayalam',sans-serif]">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !partnerInput.trim()}
                  className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#0D4A36] to-[#125841] hover:from-[#093527] hover:to-[#0D4A36] text-white font-bold rounded-2xl text-sm transition-all shadow-[0_4px_16px_rgba(13,74,54,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 font-['Baloo_Chettan_2',sans-serif]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-base leading-none">ഡാഷ്‌ബോർഡ് തുറക്കുക (Open Dashboard)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Access Pills */}
              <div className="pt-3 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 font-['Baloo_Chettan_2',sans-serif]">
                  പരീക്ഷണാർത്ഥം ലോഗിൻ ചെയ്യാം (Demo Accounts):
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('CL-101')}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <div className="text-left truncate">
                      <div className="font-mono leading-none">CL-101</div>
                      <div className="text-emerald-700 text-[10px] font-medium truncate font-['Baloo_Chettan_2',sans-serif]">ഷാഫി (Areacode)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick('CL-102')}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <div className="text-left truncate">
                      <div className="font-mono leading-none">CL-102</div>
                      <div className="text-emerald-700 text-[10px] font-medium truncate font-['Baloo_Chettan_2',sans-serif]">അനസ് (Kondotty)</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-emerald-900/10 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold text-xs">
                  50%
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0A3022] font-['Baloo_Chettan_2',sans-serif]">
                  ഉയർന്ന കമ്മീഷൻ (50% Cut)
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-['Anek_Malayalam',sans-serif]">
                  ഓരോ ₹119 പ്ലാനിനും ₹59.50 സ്ഥിര വിഹിതം. 50 കടകൾ ചേർത്താൽ മാസം ₹2,975 വരുമാനം.
                </p>
              </div>

              <div className="bg-white border border-emerald-900/10 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0A3022] font-['Baloo_Chettan_2',sans-serif]">
                  നേരിട്ട് UPI പേഔട്ട്
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-['Anek_Malayalam',sans-serif]">
                  ഇടനിലക്കാരില്ലാതെ Google Pay, PhonePe അല്ലെങ്കിൽ ബാങ്ക് UPI വഴി തുക നേരിട്ട് ലഭിക്കുന്നു.
                </p>
              </div>

              <div className="bg-white border border-emerald-900/10 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#0A3022] font-['Baloo_Chettan_2',sans-serif]">
                  ലൈവ് ട്രാക്കിംഗ് (Live Tracking)
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-['Anek_Malayalam',sans-serif]">
                  ചേർത്ത കടകളുടെ വിവരങ്ങളും പേയ്‌മെന്റും കമ്മീഷനും തത്സമയം നിരീക്ഷിക്കാം.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CASE B: Logged-in Partner Dashboard                            */
          /* ============================================================== */
          <>
            {/* 1. Partner Profile Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-emerald-950/10 shadow-sm animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                {/* Profile Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#073827] to-[#125841] text-white flex items-center justify-center text-lg sm:text-xl font-black shadow-sm ring-2 ring-emerald-500/20">
                      {partner.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"></span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h2 className="text-base sm:text-xl font-black text-[#0A3022] tracking-tight truncate">
                        {partner.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200/80 flex items-center gap-1 shrink-0">
                        <BadgeCheck className="w-3 h-3 text-emerald-600" />
                        <span>{partner.status === 'active' ? 'Active Partner' : 'Inactive'}</span>
                      </span>
                    </div>

                    <div className="text-[11px] sm:text-xs text-gray-500 flex flex-wrap items-center gap-1.5 sm:gap-2 font-medium">
                      <button
                        type="button"
                        onClick={() => handleCopy(partner.clientCode, 'partner-code')}
                        className="inline-flex items-center gap-1 font-mono font-bold text-[#0D4A36] bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-all cursor-pointer"
                        title="Click to copy partner code"
                      >
                        <span>{partner.clientCode}</span>
                        {copiedKey === 'partner-code' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-500" />}
                      </button>

                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{partner.phone}</span>
                      </span>

                      {partner.area && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-gray-400" />
                            <span>{partner.area}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Commission Pill */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r sm:bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-200/80 text-emerald-950 shrink-0">
                  <div className="text-[10px] sm:text-[11px] text-emerald-700 font-bold uppercase tracking-wider font-['Baloo_Chettan_2',sans-serif]">
                    കമ്മീഷൻ വിഹിതം (Share)
                  </div>
                  <div className="text-base sm:text-xl font-black text-emerald-800 flex items-center gap-1">
                    <span>{partner.commissionRatePercent}%</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Gamified Target & Milestone Section */}
            {(() => {
              const shopCount = partner.totalShopsCount || shops.length;
              const minGoal = partner.minShopsThreshold || 50;
              const isEligible = shopCount >= minGoal;
              const remainingTo50 = Math.max(0, minGoal - shopCount);
              const remainingTo100 = Math.max(0, 100 - shopCount);
              const progressPct = Math.min(100, Math.max(3, (shopCount / 100) * 100));

              return (
                <div className="bg-white border border-emerald-600/25 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-3.5 sm:space-y-4">
                  {/* Top Bar: Title + Status Pill + Counter */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight font-['Baloo_Chettan_2',sans-serif]">
                            Partner ലക്ഷ്യം: കുറഞ്ഞത് 50 കടകൾ (50% Share)
                          </h3>
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 font-['Baloo_Chettan_2',sans-serif]">
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>പേഔട്ട് അൺലോക്ക് ആയി! 🎉</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 font-['Baloo_Chettan_2',sans-serif]">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>പേഔട്ട് ലോക്ക്ഡ് (ബാക്കി: {remainingTo50} കടകൾ)</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-['Anek_Malayalam',sans-serif]">
                          ഓരോ കടയും ₹119 അടയ്ക്കുമ്പോൾ 50% (₹59.50) Partner-ക്ക് ലഭിക്കുന്നു.
                        </p>
                      </div>
                    </div>

                    {/* Shop Count Badge */}
                    <div className="self-end sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-right shrink-0">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mr-1.5 font-['Baloo_Chettan_2',sans-serif]">
                        നിലവിലെ പുരോഗതി:
                      </span>
                      <span className="text-base sm:text-lg font-black text-emerald-800">
                        {shopCount}
                      </span>
                      <span className="text-xs text-gray-400 font-normal"> / {minGoal} കടകൾ</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          shopCount >= 100
                            ? 'bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500'
                            : shopCount >= 50
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : 'bg-gradient-to-r from-amber-400 to-emerald-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Clean responsive milestone indicators below bar */}
                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-500 pt-0.5 font-['Baloo_Chettan_2',sans-serif]">
                      <span>0 കടകൾ</span>
                      <span className={shopCount >= 50 ? 'text-emerald-700 font-black' : 'text-slate-600'}>
                        🏁 ലക്ഷ്യം 1: 50 കടകൾ (₹2,975/mo) {shopCount >= 50 ? '✓' : ''}
                      </span>
                      <span className={shopCount >= 100 ? 'text-indigo-700 font-black' : 'text-slate-400'}>
                        🏆 ലക്ഷ്യം 2: 100 കടകൾ (₹5,950/mo) {shopCount >= 100 ? '✓' : ''}
                      </span>
                    </div>
                  </div>

                  {/* 2 Target Badges / Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-0.5">
                    {/* Milestone 1 */}
                    <div
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all ${
                        shopCount >= 50
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50/50 border-amber-200/80 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs sm:text-sm font-black truncate font-['Baloo_Chettan_2',sans-serif]">
                            മൈൽസ്റ്റോൺ 1 (50 കടകൾ)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                          ₹2,975/മാസം
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-['Anek_Malayalam',sans-serif]">
                        {shopCount >= 50 ? (
                          <span className="text-emerald-800 font-bold">
                            🎉 50 കടകൾ പൂർത്തിയായി! നിങ്ങൾക്ക് 50% കമ്മീഷൻ തുക അക്കൗണ്ടിലേക്ക് ലഭിക്കാൻ യോഗ്യതയുണ്ട്.
                          </span>
                        ) : (
                          <span>
                            50 കടകൾ പൂർത്തിയായാൽ മാസം <b>₹2,975</b> (50 × ₹59.50) ലഭിക്കും. ബാക്കി വേണ്ടത്: <b>{remainingTo50} കടകൾ</b>.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Milestone 2 */}
                    <div
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all ${
                        shopCount >= 100
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                          <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-xs sm:text-sm font-black truncate font-['Baloo_Chettan_2',sans-serif]">
                            മൈൽസ്റ്റോൺ 2 (100 കടകൾ)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                          ₹5,950/മാസം
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-['Anek_Malayalam',sans-serif]">
                        {shopCount >= 100 ? (
                          <span className="text-indigo-800 font-bold">
                            🏆 Super Partner Achievement! 100 കടകൾ പൂർത്തിയായി.
                          </span>
                        ) : (
                          <span>
                            100 കടകൾ പൂർത്തിയാക്കുമ്പോൾ 50% വിഹിതമായി <b>₹5,950</b> ലഭിക്കും. ബാക്കി: <b>{remainingTo100} കടകൾ</b>.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. Metrics Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {/* Metric 1 */}
              <div className="bg-white border border-emerald-950/10 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-gray-500 truncate font-['Baloo_Chettan_2',sans-serif]">
                    ചേർത്ത കടകൾ (Stores)
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 text-[#0D4A36] flex items-center justify-center shrink-0">
                    <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#0A3022]">
                  {partner.totalShopsCount || shops.length}
                </div>
                <div className="text-[10px] sm:text-[11px] text-emerald-700 font-medium truncate font-['Baloo_Chettan_2',sans-serif]">
                  സജീവ സ്റ്റോറുകൾ
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white border border-emerald-950/10 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-gray-500 truncate font-['Baloo_Chettan_2',sans-serif]">
                    ആകെ കമ്മീഷൻ (Earnings)
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-800">
                  ₹{Math.round((partner.totalEarningsPaise || 0) / 100).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] sm:text-[11px] text-emerald-600 font-bold truncate font-['Baloo_Chettan_2',sans-serif]">
                  50% സബ്‌സ്‌ക്രിപ്ഷൻ വിഹിതം
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white border border-emerald-950/10 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-gray-500 truncate font-['Baloo_Chettan_2',sans-serif]">
                    കൈപ്പറ്റിയ തുക (Paid)
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 text-[#0D4A36] flex items-center justify-center shrink-0">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#0A3022]">
                  ₹{Math.round((partner.totalPaidPaise || 0) / 100).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate font-['Baloo_Chettan_2',sans-serif]">
                  UPI വഴി അക്കൗണ്ടിൽ എത്തിയത്
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-white border border-emerald-950/10 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-gray-500 truncate font-['Baloo_Chettan_2',sans-serif]">
                    ലഭിക്കാനുള്ള ബാക്കി (Pending)
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-700">
                  ₹{Math.round((partner.pendingPayoutPaise || 0) / 100).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] sm:text-[11px] text-amber-600 font-bold truncate font-['Baloo_Chettan_2',sans-serif]">
                  അടുത്ത പേഔട്ടിൽ ലഭിക്കും
                </div>
              </div>
            </div>

            {/* 4. Referral & Direct Merchant Invite Hub */}
            <div className="bg-gradient-to-br from-[#073827] via-[#0D4A36] to-[#125841] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(13,74,54,0.18)] relative overflow-hidden">
              <div className="max-w-2xl space-y-2.5 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold text-emerald-100 backdrop-blur-xs font-['Baloo_Chettan_2',sans-serif]">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>കടക്കാരെ ചേർക്കാനുള്ള റഫറൽ ലിങ്ക് (Referral Link)</span>
                </div>

                <h3 className="text-base sm:text-xl font-black leading-snug font-['Baloo_Chettan_2',sans-serif]">
                  കട ഉടമകളെ നേരിട്ട് ബന്ധപ്പെടാം, കമ്മീഷൻ സ്വന്തമാക്കാം
                </h3>

                <p className="text-xs text-emerald-100/90 leading-relaxed font-['Anek_Malayalam',sans-serif]">
                  ഈ ലിങ്ക് വഴി കടക്കാർ രജിസ്റ്റർ ചെയ്യുമ്പോൾ ഓരോ തവണയും <b className="text-white">{partner.commissionRatePercent}% കമ്മീഷൻ</b> നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് എത്തും.
                </p>

                {/* Link & Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono truncate text-white/95 backdrop-blur-xs select-all">
                    {inviteUrl}
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(inviteUrl, 'invite-url')}
                      className="py-2.5 px-3 bg-white text-[#073827] hover:bg-emerald-50 active:bg-emerald-100 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 font-['Baloo_Chettan_2',sans-serif]"
                    >
                      {copiedKey === 'invite-url' ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span className="text-xs sm:text-sm">
                        {copiedKey === 'invite-url' ? 'കോപ്പി ചെയ്തു!' : 'ലിങ്ക് കോപ്പി (Copy)'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1ca64f] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 font-['Baloo_Chettan_2',sans-serif]"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">WhatsApp-ൽ അയക്കൂ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="col-span-2 sm:col-span-1 py-2.5 px-3.5 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 font-['Baloo_Chettan_2',sans-serif]"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">QR കോഡ് കാണിക്കുക</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Registered Settlement UPI Details Card */}
            <div className="bg-white border border-emerald-950/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D4A36] border border-emerald-100 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-gray-500 font-['Baloo_Chettan_2',sans-serif]">
                    കമ്മീഷൻ സ്വീകരിക്കുന്ന രജിസ്റ്റർ ചെയ്ത UPI വിലാസം
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-black text-[#0A3022] mt-0.5 truncate">
                    {partner.upiId || 'UPI വിവരങ്ങൾ നൽകിയിട്ടില്ല'}
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-medium shrink-0 self-start sm:self-auto font-['Baloo_Chettan_2',sans-serif]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>UPI വഴി അഡ്മിൻ നേരിട്ട് തുക അയക്കും</span>
              </div>
            </div>

            {/* 6. Tabs Section: Onboarded Shops vs Payouts */}
            <div className="bg-white border border-emerald-950/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
              {/* Tab Header */}
              <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('shops')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 font-['Baloo_Chettan_2',sans-serif] ${
                      activeTab === 'shops'
                        ? 'bg-[#0D4A36] text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>ചേർത്ത കടകൾ ({shops.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('payouts')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 font-['Baloo_Chettan_2',sans-serif] ${
                      activeTab === 'payouts'
                        ? 'bg-[#0D4A36] text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>പേഔട്ട് ചരിത്രം ({payouts.length})</span>
                  </button>
                </div>

                {/* Search bar inside Onboarded Shops */}
                {activeTab === 'shops' && shops.length > 0 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="കടയുടെ പേര് തിരയുക..."
                      value={shopSearchQuery}
                      onChange={(e) => setShopSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-[#F6FAF8] border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0D4A36] w-full sm:w-52 font-medium font-['Anek_Malayalam',sans-serif]"
                    />
                  </div>
                )}
              </div>

              {/* Tab 1: Onboarded Shops */}
              {activeTab === 'shops' && (
                <div>
                  {shops.length === 0 ? (
                    <div className="py-10 sm:py-14 text-center text-gray-500 space-y-2 px-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 font-['Baloo_Chettan_2',sans-serif]">
                        ഇതുവരെ കടകൾ ചേർത്തിട്ടില്ല
                      </p>
                      <p className="text-[11px] sm:text-xs max-w-sm mx-auto text-gray-500 leading-relaxed font-['Anek_Malayalam',sans-serif]">
                        നിങ്ങളുടെ റഫറൽ കോഡ് <b className="font-mono text-[#0D4A36]">{partner.clientCode}</b> ഉപയോഗിച്ച് പ്രദേശത്തെ കടക്കാരെ ചേർക്കൂ.
                      </p>
                    </div>
                  ) : filteredShops.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-xs font-['Anek_Malayalam',sans-serif]">
                      "{shopSearchQuery}" എന്ന പേരിൽ കടകൾ കണ്ടെത്താനായില്ല.
                    </div>
                  ) : (
                    <>
                      {/* Mobile Card List View (sm:hidden) */}
                      <div className="sm:hidden divide-y divide-gray-100">
                        {filteredShops.map((shop, idx) => (
                          <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-emerald-50/30 transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0D4A36] flex items-center justify-center font-black text-xs shrink-0">
                                {(shop.shopName || shop.merchantName || 'S').charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-[#0A3022] truncate">
                                  {shop.shopName || shop.merchantName}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5">
                                  <span>{shop.merchantPhone || '—'}</span>
                                  <span>•</span>
                                  <span>{new Date(shop.subscribedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xs font-black text-emerald-700 font-mono">
                                + ₹{Math.round((shop.commissionPaise || 0) / 100).toLocaleString('en-IN')}
                              </div>
                              <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full font-bold text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {shop.planName || 'Plan'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View (hidden sm:block) */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#2A3D34]">
                          <thead className="bg-[#F8FAF9] border-b border-gray-100 text-gray-500 uppercase text-[10px] font-bold font-['Baloo_Chettan_2',sans-serif]">
                            <tr>
                              <th className="px-4 py-3">സ്റ്റോർ പേര് (Store)</th>
                              <th className="px-4 py-3">പ്ലാൻ (Plan)</th>
                              <th className="px-4 py-3 text-right">അടച്ച തുക (Amount)</th>
                              <th className="px-4 py-3 text-right">നിങ്ങളുടെ കമ്മീഷൻ</th>
                              <th className="px-4 py-3 text-right">തീയതി (Date)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredShops.map((shop, idx) => (
                              <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-bold text-gray-900 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-[#0D4A36] flex items-center justify-center font-black text-xs shrink-0">
                                      {(shop.shopName || shop.merchantName || 'S').charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-bold text-[#0A3022]">{shop.shopName || shop.merchantName}</div>
                                      {shop.merchantPhone && (
                                        <div className="text-[11px] text-gray-400 font-mono">{shop.merchantPhone}</div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {shop.planName || 'Plan'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-700">
                                  ₹{Math.round(shop.amountPaise / 100).toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 text-right font-black text-emerald-700">
                                  + ₹{Math.round((shop.commissionPaise || 0) / 100).toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-400 font-medium">
                                  {new Date(shop.subscribedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: Payout History */}
              {activeTab === 'payouts' && (
                <div>
                  {payouts.length === 0 ? (
                    <div className="py-10 sm:py-14 text-center text-gray-500 space-y-2 px-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800 font-['Baloo_Chettan_2',sans-serif]">
                        ഇതുവരെ പേഔട്ട് രേഖപ്പെടുത്തിയിട്ടില്ല
                      </p>
                      <p className="text-[11px] sm:text-xs max-w-sm mx-auto text-gray-500 leading-relaxed font-['Anek_Malayalam',sans-serif]">
                        നിങ്ങൾ 50 കടകൾ പൂർത്തിയാക്കുമ്പോൾ ആദ്യ ബാച്ച് പേഔട്ട് നേരിട്ട് UPI വഴി അഡ്മിൻ അയയ്ക്കും.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Card List View for Payouts */}
                      <div className="sm:hidden divide-y divide-gray-100">
                        {payouts.map((p, idx) => (
                          <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-emerald-50/30 transition-colors">
                            <div className="min-w-0">
                              <div className="text-xs font-mono font-bold text-[#0A3022] truncate">
                                {p.paidToUpi}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                Ref: {p.upiRefId || '—'} • {new Date(p.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-black text-emerald-800 font-mono">
                                ₹{Math.round(p.amountPaise / 100).toLocaleString('en-IN')}
                              </div>
                              <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full font-bold text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {p.status || 'Paid'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View for Payouts */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#2A3D34]">
                          <thead className="bg-[#F8FAF9] border-b border-gray-100 text-gray-500 uppercase text-[10px] font-bold font-['Baloo_Chettan_2',sans-serif]">
                            <tr>
                              <th className="px-4 py-3">തീയതി (Date)</th>
                              <th className="px-4 py-3">UPI ID</th>
                              <th className="px-4 py-3">റെഫറൻസ് ID</th>
                              <th className="px-4 py-3 text-right">അയച്ച തുക (Amount)</th>
                              <th className="px-4 py-3 text-right">സ്റ്റാറ്റസ് (Status)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {payouts.map((p, idx) => (
                              <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-700">
                                  {new Date(p.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-[#0A3022]">
                                  {p.paidToUpi}
                                </td>
                                <td className="px-4 py-3 font-mono text-gray-500">
                                  {p.upiRefId || '—'}
                                </td>
                                <td className="px-4 py-3 text-right font-black text-emerald-800 text-sm">
                                  ₹{Math.round(p.amountPaise / 100).toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {p.status || 'Paid'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 3. QR Code Dialog Modal */}
      {showQrModal && partner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xs sm:max-w-sm w-full text-center space-y-3.5 shadow-2xl relative border border-emerald-100">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-[#0A3022] font-['Baloo_Chettan_2',sans-serif]">
                കടക്കാർക്ക് സ്കാൻ ചെയ്യാം (Scan to Onboard)
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-['Anek_Malayalam',sans-serif]">
                ഈ QR കോഡ് സ്കാൻ ചെയ്ത് വ്യാപാരികൾക്ക് നേരിട്ട് രജിസ്റ്റർ ചെയ്യാം.
              </p>
            </div>

            {/* Dynamic QR Code */}
            <div className="bg-white p-3 rounded-2xl border-2 border-emerald-500/20 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}`}
                alt="Partner Referral QR Code"
                className="w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-lg"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2">
              <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-['Baloo_Chettan_2',sans-serif]">
                നിങ്ങളുടെ റഫറൽ കോഡ് (Referral Code)
              </div>
              <div className="text-sm sm:text-base font-mono font-black text-emerald-900">
                {partner.clientCode}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer font-['Baloo_Chettan_2',sans-serif]"
            >
              ക്ലോസ് ചെയ്യുക (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
