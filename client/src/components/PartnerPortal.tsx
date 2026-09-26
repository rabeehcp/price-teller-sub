import React, { useState, useEffect } from 'react';
import { ClientPartner, ClientOnboardedShop, ClientPayout } from '../types';
import { fetchClientPortalDataApi } from '../services/api';
import {
  Briefcase,
  Store,
  DollarSign,
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
} from 'lucide-react';
import { EnteBazaarLogo } from './EnteBazaarLogo';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (partnerInput && partnerInput.trim().length >= 3) {
      loadPartnerDashboard(partnerInput.trim());
    }
  }, []);

  const loadPartnerDashboard = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchClientPortalDataApi(code.trim());
      if (data) {
        setPartnerData(data);
        localStorage.setItem('priceteller_partner_login_code', data.partner.clientCode);
      } else {
        setErrorMsg('ഈ കോഡ് അല്ലെങ്കിൽ നമ്പറിൽ പാർട്ണറെ കണ്ടെത്താനായില്ല. ശരിയായ കോഡ് നൽകുക.');
        setPartnerData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.');
      setPartnerData(null);
    } finally {
      setLoading(false);
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

  const partner = partnerData?.partner;
  const shops = partnerData?.onboardedShops || [];
  const payouts = partnerData?.payouts || [];
  const inviteUrl = partner ? `${window.location.origin}/merchant?ref=${partner.clientCode}` : '';

  const handleShareWhatsApp = () => {
    if (!partner) return;
    const msg = `നമസ്കാരം, നിങ്ങളുടെ കടയിലെ ഉൽപന്നങ്ങളും ലൈവ് വിലകളും ഉപഭോക്താക്കളിലേക്ക് എത്തിക്കാൻ PriceTeller സ്റ്റോർ പാർട്ണറായി ഉടൻ രജിസ്റ്റർ ചെയ്യൂ!\n\nഓൺബോർഡിംഗ് ലിങ്ക്: ${inviteUrl}\nറഫറൽ കോഡ്: ${partner.clientCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F5F8F6] text-[#17221D] font-sans flex flex-col selection:bg-[#0B8F68] selection:text-white">
      {/* Header */}
      <header className="bg-[#063B2A] text-white border-b border-[#084D37] px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToApp}
              className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="തിരികെ പോകുക"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0B8F68] flex items-center justify-center text-white font-black text-sm shadow-xs">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <span>ഫീൽഡ് പാർട്ണർ ഹബ്ബ്</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#10A978]/20 text-[#10A978] border border-[#10A978]/30">
                    Client Partner Portal
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {partner && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPartnerData(null);
                  localStorage.removeItem('priceteller_partner_login_code');
                }}
                className="text-xs text-white/70 hover:text-white underline cursor-pointer font-malayalam"
              >
                മാറ്റുക (Switch)
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* If no partner loaded yet: show clean code input */}
        {!partnerData || !partner ? (
          <div className="max-w-md mx-auto py-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center mx-auto shadow-xs">
              <Briefcase className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#17221D] font-malayalam">
                പാർട്ണർ ഡാഷ്‌ബോർഡിലേക്ക് സ്വാഗതം
              </h2>
              <p className="text-xs sm:text-sm text-[#66756E] font-medium font-malayalam mt-1">
                നിങ്ങളുടെ പാർട്ണർ കോഡ് (ഉദാ: <b>CL-101</b>) അല്ലെങ്കിൽ ഫോൺ നമ്പർ നൽകുക
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3 bg-white p-5 rounded-3xl border border-[#E3ECE7] shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="പാർട്ണർ കോഡ് നൽകുക (ഉദാ: CL-101)"
                  value={partnerInput}
                  onChange={(e) => setPartnerInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-2xl text-sm font-mono uppercase font-bold text-[#17221D] placeholder-slate-400 outline-none text-center tracking-wider"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 text-left animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !partnerInput.trim()}
                className="w-full py-3 bg-[#0B8F68] hover:bg-[#087353] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-malayalam"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ഡാഷ്‌ബോർഡ് തുറക്കുക</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-[11px] text-[#66756E] font-malayalam">
              ഡെമോ അക്കൗണ്ടുകൾ പരീക്ഷിക്കാം: <b className="font-mono text-[#0B8F68]">CL-101</b> അല്ലെങ്കിൽ <b className="font-mono text-[#0B8F68]">CL-102</b>
            </div>
          </div>
        ) : (
          /* Partner Logged In Dashboard */
          <>
            {/* Top Partner Profile Banner */}
            <div className="bg-white border border-[#E3ECE7] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#063B2A] text-white flex items-center justify-center text-xl font-black shrink-0 shadow-xs">
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-[#17221D]">{partner.name}</h2>
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-[#DDF5EA] text-[#063B2A] border border-[#C3EEDC]">
                      {partner.status === 'active' ? 'Active Partner' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs text-[#66756E] flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-[#17221D]">{partner.clientCode}</span>
                    <span>•</span>
                    <span>{partner.phone}</span>
                    {partner.area && (
                      <>
                        <span>•</span>
                        <span>{partner.area}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Commission Rate Pill */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                  <span className="block text-[10px] text-emerald-600 uppercase font-bold">കമ്മീഷൻ വിഹിതം</span>
                  <span className="text-base font-black">{partner.commissionRatePercent}%</span>
                </div>
              </div>
            </div>

            {/* 🎯 Aim & Milestone Progress Section (50 Shops = 50% Commission / ₹119 Plan) */}
            {(() => {
              const shopCount = partner.totalShopsCount || shops.length;
              const minGoal = partner.minShopsThreshold || 50;
              const isEligible = shopCount >= minGoal;
              const remainingTo50 = Math.max(0, minGoal - shopCount);
              const remainingTo100 = Math.max(0, 100 - shopCount);

              return (
                <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-800 font-malayalam m-0">
                            പാർട്ണർ ലക്ഷ്യം: കുറഞ്ഞത് 50 കടകൾ (50% വിഹിതം)
                          </h3>
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>പേഔട്ട് അൺലോക്ക് ആയി!</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>പേഔട്ട് ലോക്ക്ഡ് (Min 50 കടകൾ)</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-malayalam mt-0.5">
                          ഓരോ കടയും ₹119 അടയ്ക്കുമ്പോൾ 50% (₹59.50) പാർട്ണർക്ക് ലഭിക്കുന്നു.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">നിലവിലെ പുരോഗതി</div>
                        <div className="text-lg font-black text-emerald-700">
                          {shopCount} <span className="text-xs text-slate-400 font-normal">/ {minGoal} കടകൾ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar towards 50 and 100 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600 font-malayalam">
                      <span>0 കടകൾ</span>
                      <span className={shopCount >= 50 ? 'text-emerald-700 font-black' : 'text-slate-500'}>
                        🏁 ലക്ഷ്യം 1: 50 കടകൾ (₹2,975) {shopCount >= 50 ? '✓' : ''}
                      </span>
                      <span className={shopCount >= 100 ? 'text-indigo-700 font-black' : 'text-slate-400'}>
                        🏆 സൂപ്പർ ടാർഗറ്റ്: 100 കടകൾ (₹5,950) {shopCount >= 100 ? '✓' : ''}
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          shopCount >= 100
                            ? 'bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500'
                            : shopCount >= 50
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : 'bg-gradient-to-r from-amber-400 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(4, (shopCount / 100) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* 2 Target Badges / Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className={`p-3.5 rounded-2xl border transition-all ${
                      shopCount >= 50
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50/50 border-amber-200/80 text-amber-950'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>മൈൽസ്റ്റോൺ 1 (കുറഞ്ഞത് 50 കടകൾ)</span>
                        </div>
                        <span className="text-xs font-mono font-black text-emerald-700">₹2,975</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-malayalam leading-relaxed">
                        {shopCount >= 50 ? (
                          <span className="text-emerald-700 font-bold">
                            🎉 50 കടകൾ പൂർത്തിയായി! നിങ്ങൾക്ക് 50% കമ്മീഷൻ തുക അക്കൗണ്ടിലേക്ക് ലഭിക്കാൻ യോഗ്യതയുണ്ട്.
                          </span>
                        ) : (
                          <span>
                            50 കടകൾ പൂർത്തിയായാൽ <b>₹2,975</b> (50 × ₹59.50) ലഭിക്കും. ബാക്കി വേണ്ടത്: <b>{remainingTo50} കടകൾ</b>.
                          </span>
                        )}
                      </p>
                    </div>

                    <div className={`p-3.5 rounded-2xl border transition-all ${
                      shopCount >= 100
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span>മൈൽസ്റ്റോൺ 2 (100 കടകൾ)</span>
                        </div>
                        <span className="text-xs font-mono font-black text-indigo-700">₹5,950</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-malayalam leading-relaxed">
                        {shopCount >= 100 ? (
                          <span className="text-indigo-700 font-bold">
                            🏆 സൂപ്പർ പാർട്ണർ അച്ചീവ്മെന്റ്! 100 കടകൾ പൂർത്തിയായി.
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

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-[#66756E] font-malayalam">ചേർത്ത കടകൾ</div>
                <div className="text-2xl font-black text-[#17221D] mt-1.5 flex items-center gap-1.5">
                  <Store className="w-5 h-5 text-[#0B8F68]" />
                  <span>{partner.totalShopsCount || shops.length}</span>
                </div>
                <div className="text-[10px] text-[#66756E] mt-1 font-malayalam">സജീവ സ്റ്റോറുകൾ</div>
              </div>

              <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-[#66756E] font-malayalam">ആകെ കമ്മീഷൻ നേടിയത്</div>
                <div className="text-2xl font-black text-[#17221D] mt-1.5">
                  ₹{Math.round((partner.totalEarningsPaise || 0) / 100).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-1 font-malayalam">സബ്‌സ്‌ക്രിപ്ഷൻ വിഹിതം</div>
              </div>

              <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-[#66756E] font-malayalam">കൈപ്പറ്റിയ തുക (Paid)</div>
                <div className="text-2xl font-black text-[#17221D] mt-1.5">
                  ₹{Math.round((partner.totalPaidPaise || 0) / 100).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#66756E] mt-1 font-malayalam">UPI വഴി അക്കൗണ്ടിൽ എത്തിയത്</div>
              </div>

              <div className="bg-white border border-[#E3ECE7] rounded-2xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-[#66756E] font-malayalam">ലഭിക്കാനുള്ള ബാക്കി (Pending)</div>
                <div className="text-2xl font-black text-amber-700 mt-1.5">
                  ₹{Math.round((partner.pendingPayoutPaise || 0) / 100).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-amber-600 font-bold mt-1 font-malayalam">അടുത്ത പേഔട്ടിൽ ലഭിക്കും</div>
              </div>
            </div>

            {/* Invite & Onboarding Card for the Field Agent */}
            <div className="bg-gradient-to-br from-[#063B2A] to-[#0B8F68] text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
              <div className="max-w-xl space-y-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4B740]" />
                  <span>കടക്കാരെ ചേർക്കാനുള്ള റഫറൽ ലിങ്ക്</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black">
                  കട ഉടമകളെ നേരിട്ട് ബന്ധപ്പെടാം, കമ്മീഷൻ സ്വന്തമാക്കാം
                </h3>
                <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed font-malayalam">
                  ഈ ലിങ്ക് വഴി കടക്കാർ PriceTeller പ്ലാൻ സബ്‌സ്‌ക്രൈബ് ചെയ്യുമ്പോൾ ഓരോ തവണയും <b className="text-white">{partner.commissionRatePercent}% കമ്മീഷൻ</b> നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് എത്തും.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono truncate text-white">
                    {inviteUrl}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(inviteUrl, 'invite-url')}
                    className="py-2 px-3.5 bg-white text-[#063B2A] hover:bg-slate-100 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedKey === 'invite-url' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'invite-url' ? 'കോപ്പി ചെയ്തു!' : 'ലിങ്ക് കോപ്പി ചെയ്യൂ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2 px-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp-ൽ പങ്കുവെക്കൂ</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Payout Receiving Account Details */}
            <div className="bg-white border border-[#E3ECE7] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#66756E] font-malayalam">
                    കമ്മീഷൻ സ്വീകരിക്കുന്ന രജിസ്റ്റർ ചെയ്ത UPI വിലാസം
                  </div>
                  <div className="text-sm font-mono font-bold text-[#063B2A] mt-0.5">
                    {partner.upiId}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#66756E] font-medium font-malayalam">
                UPI വഴി അഡ്മിൻ നേരിട്ട് തുക അയക്കും
              </div>
            </div>

            {/* Onboarded Shops Table */}
            <div className="bg-white border border-[#E3ECE7] rounded-3xl overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-[#E3ECE7]">
                <h3 className="text-base font-black text-[#17221D] font-malayalam">
                  നിങ്ങൾ ചേർത്ത കടകൾ ({shops.length})
                </h3>
                <p className="text-xs text-[#66756E] font-medium font-malayalam mt-0.5">
                  നിങ്ങളുടെ കോഡ് വഴി സബ്‌സ്‌ക്രൈബ് ചെയ്ത സ്റ്റോറുകളുടെ തൽസ്ഥിതി
                </p>
              </div>

              {shops.length === 0 ? (
                <div className="py-12 text-center text-[#66756E] space-y-2">
                  <Store className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-[#17221D] font-malayalam">ഇതുവരെ കടകൾ ചേർത്തിട്ടില്ല</p>
                  <p className="text-xs max-w-xs mx-auto font-malayalam">
                    നിങ്ങളുടെ റഫറൽ കോഡ് <b>{partner.clientCode}</b> ഉപയോഗിച്ച് കടക്കാരെ ചേർക്കൂ.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#3A4C43]">
                    <thead className="bg-[#F5F8F6] border-b border-[#E3ECE7] text-[#66756E] uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">സ്റ്റോർ പേര്</th>
                        <th className="px-4 py-3">പ്ലാൻ</th>
                        <th className="px-4 py-3 text-right">പണം അടച്ച തുക</th>
                        <th className="px-4 py-3 text-right">നിങ്ങൾക്ക് ലഭിച്ച കമ്മീഷൻ</th>
                        <th className="px-4 py-3 text-right">തീയതി</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3ECE7]">
                      {shops.map((shop, idx) => (
                        <tr key={idx} className="hover:bg-[#F5F8F6]/50">
                          <td className="px-4 py-3 font-bold text-[#17221D]">
                            {shop.shopName || shop.merchantName}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-[#DDF5EA] text-[#063B2A] border border-[#C3EEDC]">
                              {shop.planName || 'Plan'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            ₹{Math.round(shop.amountPaise / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-emerald-700">
                            + ₹{Math.round((shop.commissionPaise || 0) / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-right text-[#66756E]">
                            {new Date(shop.subscribedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
