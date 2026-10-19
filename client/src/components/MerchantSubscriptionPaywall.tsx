import React, { useState, useEffect } from 'react';
import {
  SubscriptionPlan,
  MerchantSubscription,
  SubscriptionStatusResponse,
  SubscriptionCheckoutOrder,
} from '../types';
import {
  fetchSubscriptionPlansApi,
  createSubscriptionCheckoutApi,
  verifySubscriptionPaymentApi,
  fetchMerchantSubscriptionHistoryApi,
  lookupClientByCodeApi,
} from '../services/api';
import {
  Crown,
  Check,
  CheckCheck,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Copy,
  Receipt,
  Search,
  Store,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  QrCode,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface MerchantSubscriptionPaywallProps {
  merchantName?: string;
  shopName?: string;
  token?: string;
  statusInfo?: SubscriptionStatusResponse | null;
  onSubscriptionSuccess: (sub: MerchantSubscription) => void;
  onLogout?: () => void;
  onBackToApp?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

const DEFAULT_FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter-119',
    name: 'മർച്ചന്റ് Partner പ്ലാൻ (Partner Onboarding Plan)',
    durationDays: 30,
    pricePaise: 11900,
    currency: 'INR',
    description: 'Field Partner വഴി ചേരുന്ന എല്ലാ കടകൾക്കുമുള്ള പ്രത്യേക പ്ലാൻ (₹119/Month)',
    badge: 'Official ₹119 Plan',
    features: [
      'തത്സമയ വില താരതമ്യ ലിസ്റ്റിംഗ് (Live Price Comparison)',
      'ഡിജിറ്റൽ സ്റ്റോർ പ്രൊഫൈലും മുഴുവൻ കാറ്റലോഗും',
      'നേരിട്ടുള്ള ഉപഭോക്തൃ ഇൻ-ആപ്പ് ചാറ്റുകൾ',
      'കൗണ്ടർ POS ബില്ലിംഗ് & തെർമൽ രസീതുകൾ',
      'Field Partner സപ്പോർട്ട് & പ്രയോറിറ്റി വെരിഫിക്കേഷൻ',
    ],
    isActive: true,
  },
  {
    id: 'plan-monthly',
    name: '1 മാസ പ്ലാൻ (Monthly Pro)',
    durationDays: 30,
    pricePaise: 49900,
    currency: 'INR',
    description: 'ചെറുകിട കടകൾക്ക് അനുയോജ്യമായ തുടക്ക പ്ലാൻ',
    badge: 'Standard',
    features: [
      'തത്സമയ വില താരതമ്യ ലിസ്റ്റിംഗ് (Live Price Comparison)',
      'കൗണ്ടർ POS ബില്ലിംഗ് & തെർമൽ രസീതുകൾ',
      'നേരിട്ടുള്ള ഉപഭോക്തൃ ഇൻ-ആപ്പ് ചാറ്റ്',
      'സ്റ്റോക്ക് അപ്‌ഡേറ്റുകൾ & കാറ്റലോഗ് മാനേജ്‌മെന്റ്',
      'പ്രതിദിന വിൽപന സംഗ്രഹം & കണക്കുകൾ',
    ],
    isActive: true,
  },
  {
    id: 'plan-6month',
    name: '6 മാസ പ്ലാൻ (Growth Partner)',
    durationDays: 180,
    pricePaise: 249900,
    currency: 'INR',
    description: 'കൂടുതൽ വിൽപനയും സ്ഥിരതയും ആഗ്രഹിക്കുന്ന കടകൾക്ക്',
    badge: 'ഏറ്റവും പ്രിയപ്പെട്ടത് • Most Popular',
    features: [
      'മുൻഗണനാ സ്റ്റോർ ലിസ്റ്റിംഗ് (Top Priority Placement)',
      'ഫ്ലാഷ് ഡീലുകൾ & പ്രത്യേക ഓഫർ ബാനറുകൾ',
      'കസ്റ്റമർ പ്രീ-ബുക്കിംഗ് & പിക്ക്അപ്പ് മാനേജ്‌മെന്റ്',
      'അൺലിമിറ്റഡ് POS ബില്ലിംഗ് & WhatsApp രസീതുകൾ',
      'ഔദ്യോഗിക Verified Partner ബാഡ്ജ്',
      'പ്രതിമാസം ₹416 മാത്രം (Save 17%)',
    ],
    isActive: true,
  },
  {
    id: 'plan-year',
    name: '1 വർഷ പ്ലാൻ (Annual VIP Partner)',
    durationDays: 365,
    pricePaise: 449900,
    currency: 'INR',
    description: 'സമ്പൂർണ്ണ റീട്ടെയിൽ ഡിജിറ്റൽ പരിഹാരം & പരമാവധി ലാഭം',
    badge: 'Best Value • Save 25%',
    features: [
      'എല്ലാ ഗ്രോത്ത് പ്ലാൻ ഫീച്ചറുകളും ഉൾപ്പെടുന്നു',
      'പ്രത്യേക ഹോംപേജ് ഫീച്ചേർഡ് സ്റ്റോർ സ്ഥാനം',
      'ഡെഡിക്കേറ്റഡ് സപ്പോർട്ട് & ഓൺബോർഡിംഗ്',
      'ഡിജിറ്റൽ സ്റ്റോർ ക്യുആർ & സ്റ്റാൻഡ് ഡിസൈൻ ഫ്രീ',
      'വാർഷിക ഫീസിൽ 25% പ്രത്യേക ലാഭം (₹375/മാസം)',
    ],
    isActive: true,
  },
];

export const MerchantSubscriptionPaywall: React.FC<MerchantSubscriptionPaywallProps> = ({
  merchantName,
  shopName,
  token,
  statusInfo,
  onSubscriptionSuccess,
  onLogout,
  onBackToApp,
  isModal = false,
  onClose,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_FALLBACK_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-starter-119');
  const [loading, setLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<MerchantSubscription[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [checkoutOrder, setCheckoutOrder] = useState<SubscriptionCheckoutOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [qrViewMode, setQrViewMode] = useState<'clean' | 'card' | 'poster'>('clean');
  const [clientCode, setClientCode] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('ref') || params.get('client') || params.get('agent');
      if (fromUrl) {
        localStorage.setItem('priceteller_client_ref', fromUrl.toUpperCase().trim());
        return fromUrl.toUpperCase().trim();
      }
      return localStorage.getItem('priceteller_client_ref') || '';
    } catch {
      return '';
    }
  });
  const [verifiedClientInfo, setVerifiedClientInfo] = useState<{ name: string; area?: string } | null>(null);
  const [isValidatingClient, setIsValidatingClient] = useState<boolean>(false);

  useEffect(() => {
    if (!clientCode || clientCode.trim().length < 3) {
      setVerifiedClientInfo(null);
      return;
    }
    let cancelled = false;
    setIsValidatingClient(true);
    const timer = setTimeout(async () => {
      try {
        const info = await lookupClientByCodeApi(clientCode.trim());
        if (!cancelled && info) {
          setVerifiedClientInfo({ name: info.name, area: info.area });
          localStorage.setItem('priceteller_client_ref', info.clientCode);
        } else if (!cancelled) {
          setVerifiedClientInfo(null);
        }
      } catch {
        if (!cancelled) setVerifiedClientInfo(null);
      } finally {
        if (!cancelled) setIsValidatingClient(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [clientCode]);

  useEffect(() => {
    loadPlansAndHistory();
  }, [token]);

  const loadPlansAndHistory = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [fetchedPlans, fetchedHistory] = await Promise.all([
        fetchSubscriptionPlansApi(false, token),
        fetchMerchantSubscriptionHistoryApi(token),
      ]);
      if (fetchedPlans && fetchedPlans.length > 0) {
        setPlans(fetchedPlans);
        if (!fetchedPlans.some((p) => p.id === selectedPlanId)) {
          setSelectedPlanId(fetchedPlans[0].id);
        }
      }
      setHistory(fetchedHistory || []);
    } catch (err: any) {
      console.warn('Using default partner plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCheckout = async (planId: string) => {
    setSelectedPlanId(planId);
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const order = await createSubscriptionCheckoutApi(planId, token);
      setCheckoutOrder(order);
    } catch (err: any) {
      console.warn('API checkout order creation failed, generating local real UPI order:', err);
      const plan = plans.find((p) => p.id === planId) || selectedPlan;
      const amountPaise = plan?.pricePaise || 49900;
      const amountInr = (amountPaise / 100).toFixed(2);
      const payeeVpa = '8075950428@fam';
      const payeeName = 'shoucky';
      const upiString = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInr}&cu=INR&tn=${encodeURIComponent(`PriceTeller ${plan?.name || 'Partner Plan'}`)}`;

      setCheckoutOrder({
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        amountPaise,
        currency: 'INR',
        planId: plan?.id || planId,
        planName: plan?.name || 'Partner Plan',
        upiString,
        upiQrUrl: '/payment-qr-clean.png',
        upiCardUrl: '/payment-qr-card.png',
        upiPosterUrl: '/payment-qr.jpg',
        upiId: payeeVpa,
        payeeName: payeeName,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async (simulated: boolean = false) => {
    if (!checkoutOrder) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const result = await verifySubscriptionPaymentApi(
        {
          orderId: checkoutOrder.orderId,
          upiRefId: simulated ? `SIM_${Date.now()}` : (transactionId.trim() || undefined),
          paymentId: simulated ? `pay_sim_${Date.now()}` : undefined,
          clientCode: clientCode.trim() || undefined,
        },
        token
      );

      if (result?.subscription) {
        const activatedSub = {
          ...result.subscription,
          daysRemaining: result.daysRemaining ?? result.subscription.daysRemaining ?? 30,
          plan: result.subscription.plan ?? {
            id: checkoutOrder.planId || checkoutOrder.plan?.id || selectedPlanId,
            name: checkoutOrder.plan?.name || checkoutOrder.planName || selectedPlan?.name || 'Active plan',
            durationDays: selectedPlan?.durationDays ?? 30,
            pricePaise: selectedPlan?.pricePaise ?? checkoutOrder.amountPaise,
            currency: checkoutOrder.currency || 'INR',
            description: selectedPlan?.description || '',
            features: selectedPlan?.features || [],
            isActive: true,
          },
        } as MerchantSubscription;

        setSuccessMsg('🎉 സബ്‌സ്‌ക്രിപ്‌ഷൻ വിജയകരമായി ആക്റ്റീവ് ചെയ്തു! സ്റ്റോർ പോർട്ടൽ തുറക്കുന്നു...');
        setTimeout(() => {
          onSubscriptionSuccess(activatedSub);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'പേയ്‌മെന്റ് വെരിഫിക്കേഷൻ പരാജയപ്പെട്ടു. ട്രാൻസാക്ഷൻ ഐഡി കൃത്യമാണോ എന്ന് പരിശോധിക്കുക.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyUpi = () => {
    try {
      const vpa = checkoutOrder?.upiId || '8075950428@fam';
      navigator.clipboard.writeText(vpa);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {}
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0] || DEFAULT_FALLBACK_PLANS[1];
  const checkoutPlanName = checkoutOrder?.plan?.name || checkoutOrder?.planName || selectedPlan?.name || 'Selected Plan';

  const isExpired = statusInfo?.subscription?.status === 'EXPIRED';

  return (
    <div
      className={`${
        isModal
          ? 'bg-[#F5F8F6] text-[#17221D] p-3 sm:p-6 lg:p-8 font-sans selection:bg-[#0B8F68] selection:text-white'
          : 'min-h-screen bg-[#F5F8F6] text-[#17221D] flex flex-col font-sans selection:bg-[#0B8F68] selection:text-white pb-16'
      }`}
    >
      {/* Top Header */}
      {isModal ? (
        <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-[#E3ECE7] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#063B2A] text-[#10A978] flex items-center justify-center shadow-xs shrink-0">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4B740]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#17221D] tracking-tight">
                  സ്റ്റോർ Partner പ്ലാനുകൾ
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#DDF5EA] text-[#063B2A] border border-[#C3EEDC]">
                  Partner Plans
                </span>
              </div>
              <p className="text-xs text-[#66756E] font-medium font-malayalam">
                കടയുടെ വിൽപന വർദ്ധിപ്പിക്കാനും കൂടുതൽ ഉപഭോക്താക്കളെ നേടാനും അനുയോജ്യമായ പ്ലാൻ തിരഞ്ഞെടുക്കൂ
              </p>
            </div>
          </div>

          <button
            onClick={onClose || onBackToApp}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <header className="border-b border-[#E3ECE7] bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#063B2A] text-[#10A978] flex items-center justify-center text-xl shadow-xs">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-[#17221D]">
                  PeediaCart <span className="text-[#0B8F68]">Merchant Portal</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Partner Access
                </span>
              </div>
              <p className="text-xs text-[#66756E]">
                ലോഗിൻ ചെയ്തിരിക്കുന്നത്: <span className="font-bold text-[#17221D]">{shopName || merchantName || 'Store Partner'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#3A4C43] hover:text-[#063B2A] hover:bg-[#DDF5EA]/50 border border-[#E3ECE7] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#0B8F68]" />
                <span className="hidden sm:inline">ഷോപ്പർ ആപ്പിലേക്ക് മടങ്ങുക</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all cursor-pointer"
              >
                ലോഗൗട്ട്
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className={`${isModal ? 'w-full' : 'max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 w-full'}`}>
        
        {/* Banner Headline (When not in modal) */}
        {!isModal && (
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF5EA] border border-[#C3EEDC] text-[#063B2A] text-xs font-black mb-3.5 shadow-2xs font-malayalam">
              <Sparkles className="w-3.5 h-3.5 text-[#0B8F68]" />
              കേരളത്തിലെ പ്രമുഖ വ്യാപാര Partner നെറ്റ്‌വർക്ക്
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#17221D] tracking-tight leading-tight font-malayalam">
              കടയുടെ വിൽപന ഉയർത്താൻ അനുയോജ്യമായ പ്ലാൻ തിരഞ്ഞെടുക്കൂ
            </h1>
            <p className="mt-2.5 text-[#66756E] text-xs sm:text-sm leading-relaxed font-malayalam max-w-xl mx-auto">
              തത്സമയ വില തിരച്ചിൽ, കൗണ്ടർ POS ബില്ലിംഗ്, ഫ്ലാഷ് ഓഫറുകൾ, ഉപഭോക്തൃ പ്രീ-ബുക്കിംഗ് എന്നിവ പൂർണ്ണമായി ആക്സസ് ചെയ്യാം.
            </p>
          </div>
        )}

        {/* Expired Warning Alert */}
        {isExpired && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-amber-900 text-sm">നിങ്ങളുടെ സബ്‌സ്‌ക്രിപ്‌ഷൻ കാലാവധി കഴിഞ്ഞിരിക്കുന്നു</p>
              <p className="text-amber-800/90 mt-0.5 font-malayalam">
                ഉപഭോക്താക്കളുടെ ലൈവ് സെർച്ച് റിസൾട്ടിൽ നിങ്ങളുടെ കട തുടരാനും POS ബില്ലിംഗ് തടസ്സമില്ലാതെ ഉപയോഗിക്കാനും താഴെ നൽകിയിരിക്കുന്ന പ്ലാനുകളിൽ ഒന്ന് പുതുക്കൂ.
              </p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in">
            <CheckCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between shadow-xs">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-800 text-xs font-bold underline ml-3 shrink-0 cursor-pointer"
            >
              ശരി
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#0B8F68] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#66756E] font-medium font-malayalam">പ്ലാനുകൾ ലോഡ് ചെയ്യുന്നു...</p>
          </div>
        ) : (
          <>
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const priceRs = Math.round(plan.pricePaise / 100);
                const perMonthRs = plan.durationDays > 30 ? Math.round(priceRs / (plan.durationDays / 30)) : priceRs;
                const isPopular =
                  plan.id.includes('6month') ||
                  plan.badge?.toLowerCase().includes('popular') ||
                  plan.badge?.toLowerCase().includes('പ്രിയപ്പെട്ടത്');

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#EDFAF3]/90 via-white to-white border-2 border-[#0B8F68] ring-4 ring-[#0B8F68]/15 shadow-xl scale-[1.01]'
                        : 'bg-white border border-[#E3ECE7] hover:border-[#0B8F68]/40 hover:shadow-md'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-xs whitespace-nowrap">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-start justify-between gap-2 mt-1">
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-[#17221D] tracking-tight">
                            {plan.name}
                          </h3>
                          <p className="text-xs text-[#66756E] mt-0.5 font-medium leading-relaxed font-malayalam">
                            {plan.description || `${plan.durationDays} ദിവസത്തേക്ക്`}
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'border-[#0B8F68] bg-[#0B8F68] text-white shadow-xs'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Pricing Tag */}
                      <div className="mt-5 p-3 rounded-2xl bg-[#F5F8F6] border border-[#E3ECE7]/60 flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl sm:text-3xl font-black text-[#17221D] tracking-tight">
                            ₹{priceRs.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-[#66756E] font-medium ml-1">
                            / {plan.durationDays} ദിവസം
                          </span>
                        </div>

                        {plan.durationDays > 30 && (
                          <span className="text-[10px] font-extrabold text-[#063B2A] bg-[#DDF5EA] px-2 py-0.5 rounded-full border border-[#C3EEDC]">
                            ≈ ₹{perMonthRs}/മാസം
                          </span>
                        )}
                      </div>

                      {/* Feature Checklist */}
                      <ul className="mt-5 space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-[#3A4C43]">
                            <div className="w-4 h-4 rounded-full bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="font-semibold leading-tight font-malayalam">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-4 border-t border-[#E3ECE7]/70">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCheckout(plan.id);
                        }}
                        disabled={isProcessing}
                        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B8F68] hover:bg-[#087353] active:scale-98 text-white shadow-md shadow-[#0B8F68]/20'
                            : 'bg-[#EDFAF3] hover:bg-[#DDF5EA] text-[#063B2A] border border-[#C3EEDC]'
                        }`}
                      >
                        {isProcessing && selectedPlanId === plan.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>തുടങ്ങുക (₹{priceRs})</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Value Proposition Showcase */}
            <div className="mt-8 sm:mt-10 rounded-3xl bg-white border border-[#E3ECE7] p-5 sm:p-7 shadow-xs font-malayalam">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#0B8F68]" />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#063B2A]">
                  PeediaCart Partner ആയാലുള്ള നേട്ടങ്ങൾ (Merchant Benefits)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#E3ECE7] space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center font-bold text-sm">
                    <Search className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-[#17221D]">തത്സമയ വില തിരച്ചിൽ (Live Price Search)</p>
                  <p className="text-[11px] text-[#66756E] leading-relaxed">
                    നിങ്ങളുടെ പ്രദേശത്തെ ഉപഭോക്താക്കൾ സാധനങ്ങൾ വാങ്ങുന്നതിന് മുൻപ് സ്റ്റോക്ക് പരിശോധിച്ച് നിങ്ങളുടെ കടയിലേക്ക് എത്തുന്നു.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#E3ECE7] space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center font-bold text-sm">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-[#17221D]">കൗണ്ടർ POS ബില്ലിംഗ് (Instant POS)</p>
                  <p className="text-[11px] text-[#66756E] leading-relaxed">
                    സെക്കൻഡുകൾക്കുള്ളിൽ കൗണ്ടർ ബില്ലുകൾ തയ്യാറാക്കാം. ഉപഭോക്താക്കൾക്ക് വാട്സാപ്പിൽ ഇൻവോയ്സ് പങ്കുവെക്കാം.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F8F6] border border-[#E3ECE7] space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center font-bold text-sm">
                    <Zap className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-[#17221D]">ഡീലുകൾ & പ്രീ-ബുക്കിംഗ് (Deals & Bookings)</p>
                  <p className="text-[11px] text-[#66756E] leading-relaxed">
                    നിത്യോപയോഗ സാധനങ്ങൾക്ക് ഫ്ലാഷ് ഡീലുകൾ പ്രഖ്യാപിക്കാം, ഉപഭോക്താക്കളുടെ നേരിട്ടുള്ള പ്രീ-ബുക്കിംഗ് ഓർഡറുകൾ സ്വീകരിക്കാം.
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription History Drawer */}
            {history.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#66756E] hover:text-[#0B8F68] font-bold transition-colors cursor-pointer"
                >
                  <span>കഴിഞ്ഞ ഇൻവോയ്‌സുകളും രസീതുകളും കാണുക ({history.length})</span>
                  {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHistory && (
                  <div className="mt-3 bg-white border border-[#E3ECE7] rounded-2xl overflow-hidden shadow-xs text-left max-w-3xl mx-auto animate-in fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-[#3A4C43]">
                        <thead className="bg-[#F5F8F6] border-b border-[#E3ECE7] text-[#66756E] uppercase text-[10px] font-bold">
                          <tr>
                            <th className="px-4 py-2.5">പ്ലാൻ</th>
                            <th className="px-4 py-2.5">സ്റ്റാറ്റസ്</th>
                            <th className="px-4 py-2.5">ആരംഭം</th>
                            <th className="px-4 py-2.5">കാലാവധി</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E3ECE7]">
                          {history.map((h) => (
                            <tr key={h.id} className="hover:bg-[#F5F8F6]/50">
                              <td className="px-4 py-3 font-bold text-[#17221D]">{h.plan?.name || h.planId}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                    h.status === 'ACTIVE'
                                      ? 'bg-[#DDF5EA] text-[#063B2A] border border-[#C3EEDC]'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {h.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[#66756E]">{new Date(h.startsAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-[#66756E]">{new Date(h.expiresAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Standardized UPI Payment Checkout Modal */}
      {checkoutOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E3ECE7] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            {/* Modal Close Button */}
            <button
              onClick={() => setCheckoutOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title & Price Pill */}
            <div className="text-center pt-1">
              <div className="w-11 h-11 rounded-2xl bg-[#DDF5EA] text-[#0B8F68] flex items-center justify-center text-xl mx-auto mb-2 shadow-2xs">
                <QrCode className="w-6 h-6 text-[#0B8F68]" />
              </div>
              <h3 className="text-lg font-black text-[#17221D]">Scan & Pay with Any UPI App</h3>
              <p className="text-xs text-[#66756E] font-medium mt-0.5 font-malayalam">
                ഗൂഗിൾ പേ, ഫോൺപേ, പേടിഎം അല്ലെങ്കിൽ ഏതെങ്കിലും UPI ആപ്പ് ഉപയോഗിച്ച് പണമടയ്ക്കാം
              </p>

              <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F8F6] border border-[#E3ECE7] text-xs font-bold text-[#17221D]">
                <span>തുക:</span>
                <span className="text-base font-black text-[#0B8F68]">
                  ₹{Math.round(checkoutOrder.amountPaise / 100).toLocaleString('en-IN')}
                </span>
                <span className="text-[#66756E] text-[10px]">({checkoutPlanName})</span>
              </div>
            </div>

            {/* Official Payee Details Card */}
            <div className="mt-3 bg-[#F0FAF5] border border-[#C5ECD9] rounded-2xl p-2.5 sm:p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#063B2A] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B8F68]" />
                <span>Verified Payee Account</span>
              </div>
              <div className="text-sm font-black text-[#17221D] mt-0.5">
                {checkoutOrder.payeeName || 'shoucky'}
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-white border border-[#C5ECD9] text-xs font-mono font-bold text-[#063B2A] shadow-2xs">
                  {checkoutOrder.upiId || '8075950428@fam'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-[#C5ECD9] text-[#063B2A] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Click to copy UPI ID"
                >
                  {copiedUpi ? (
                    <CheckCheck className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-500" />
                  )}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* QR View Mode Selector */}
            <div className="mt-3 flex items-center justify-center gap-1 p-1 bg-[#F5F8F6] rounded-xl border border-[#E3ECE7] max-w-[280px] mx-auto text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setQrViewMode('clean')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
                  qrViewMode === 'clean'
                    ? 'bg-white text-[#0B8F68] shadow-2xs border border-[#E3ECE7]'
                    : 'text-[#66756E] hover:text-[#17221D]'
                }`}
              >
                Clean QR
              </button>
              <button
                type="button"
                onClick={() => setQrViewMode('card')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
                  qrViewMode === 'card'
                    ? 'bg-white text-[#0B8F68] shadow-2xs border border-[#E3ECE7]'
                    : 'text-[#66756E] hover:text-[#17221D]'
                }`}
              >
                FamApp Card
              </button>
              <button
                type="button"
                onClick={() => setQrViewMode('poster')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer ${
                  qrViewMode === 'poster'
                    ? 'bg-white text-[#0B8F68] shadow-2xs border border-[#E3ECE7]'
                    : 'text-[#66756E] hover:text-[#17221D]'
                }`}
              >
                Full Poster
              </button>
            </div>

            {/* High Quality Real QR Frame */}
            <div className="mt-3 flex flex-col items-center justify-center bg-[#F5F8F6] p-3 rounded-2xl border border-[#E3ECE7] max-w-[280px] mx-auto shadow-inner">
              <img
                src={
                  qrViewMode === 'clean'
                    ? (checkoutOrder.upiQrUrl || '/payment-qr-clean.png')
                    : qrViewMode === 'card'
                    ? (checkoutOrder.upiCardUrl || '/payment-qr-card.png')
                    : (checkoutOrder.upiPosterUrl || '/payment-qr.jpg')
                }
                alt="shoucky 8075950428@fam UPI QR"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/payment-qr.jpg';
                }}
                className={`rounded-xl object-contain bg-white shadow-xs border border-slate-200 ${
                  qrViewMode === 'poster'
                    ? 'w-56 h-72 p-1'
                    : qrViewMode === 'card'
                    ? 'w-52 h-64 p-1.5'
                    : 'w-48 h-48 p-2'
                }`}
              />

              <p className="text-[10px] text-[#66756E] font-medium mt-2 text-center font-malayalam">
                FamApp, GPay, PhonePe അല്ലെങ്കിൽ മറ്റേതെങ്കിലും UPI ആപ്പിൽ സ്കാൻ ചെയ്യുക
              </p>
            </div>

            {/* Direct Intent Link */}
            <div className="mt-3.5 space-y-2.5">
              <a
                href={checkoutOrder.upiString}
                className="w-full py-2.5 px-3 rounded-xl bg-[#063B2A] hover:bg-[#04281C] text-white text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#10A978]" />
                <span>GPay / PhonePe / Paytm / FamApp വഴി അടയ്ക്കാം</span>
                <ExternalLink className="w-3 h-3 text-slate-300" />
              </a>

              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px bg-[#E3ECE7]" />
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-malayalam">
                  പേയ്‌മെന്റ് സ്ഥിരീകരിക്കൽ
                </span>
                <div className="flex-1 h-px bg-[#E3ECE7]" />
              </div>

              {/* UTR Input */}
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-[#17221D] font-malayalam">
                  UPI UTR / 12-അക്ക റഫറൻസ് നമ്പർ (Optional)
                </label>
                <input
                  type="text"
                  placeholder="ഉദാഹരണത്തിന്: 423987123456"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs text-[#17221D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B8F68]/15 font-mono"
                />
              </div>

              {/* Onboarding Client / Partner Code */}
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#17221D] font-malayalam">
                    പരിചയപ്പെടുത്തിയ ഏജന്റ് കോഡ് (Agent Code)
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ഉദാഹരണത്തിന്: CL-101"
                    value={clientCode}
                    onChange={(e) => setClientCode(e.target.value.toUpperCase().trim())}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#E3ECE7] focus:border-[#0B8F68] rounded-xl text-xs text-[#17221D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B8F68]/15 font-mono uppercase font-bold tracking-wider"
                  />
                  {isValidatingClient && (
                    <div className="absolute right-3 top-3 w-3 h-3 border-2 border-[#0B8F68] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {verifiedClientInfo ? (
                  <div className="text-[11px] text-[#063B2A] bg-[#EDFAF3] border border-[#C3EEDC] px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Agent: <b>{verifiedClientInfo.name}</b> {verifiedClientInfo.area ? `(${verifiedClientInfo.area})` : ''}
                    </span>
                  </div>
                ) : clientCode && clientCode.length >= 3 && !isValidatingClient ? (
                  <div className="text-[10px] text-slate-400 italic font-malayalam">
                    ഈ കോഡ് ഏജന്റ് കമ്മീഷനായി രേഖപ്പെടുത്തും
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleVerifyPayment(false)}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-[#0B8F68] hover:bg-[#087353] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                >
                  {isProcessing ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>ആക്റ്റീവ് ചെയ്യുക</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyPayment(true)}
                  disabled={isProcessing}
                  title="ടെസ്റ്റ് / ഡെമോ മോഡിൽ ഉടൻ ആക്റ്റീവ് ചെയ്യുക"
                  className="py-2.5 px-3 rounded-xl bg-[#EDFAF3] hover:bg-[#DDF5EA] border border-[#C3EEDC] text-[#063B2A] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#0B8F68]" />
                  <span>Instant Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
